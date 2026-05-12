"use client";
import { useApi } from "@/hooks/useApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";
import React, { Suspense, useEffect, useState, useRef } from "react";
import { Card, Row, Col, Statistic, Input } from "antd";
import { SingleplayerRounds } from "../reaction-time/page";

type GameState = "idle" | "waiting" | "waiting_quote" | "active" | "result" | "waiting_others" | "scorecard";
type Mode      = "singleplayer" | "multiplayer";

const GAME_ROUTES: Record<string, string> = {
  "reaction time": "reaction-time",
  "typing test":   "typing-speed",
  "time interval": "time-interval",
  "aim test":      "aim-test",
  "click speed":   "click-speed",
};

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const TypingSpeedGameInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const apiService = useApi();
  //read multiplayer info
  const roomIdParam   = searchParams.get("roomId")  ?? "";
  const roundsParam   = parseInt(searchParams.get("rounds") ?? "0", 10);
  const isAdminParam  = searchParams.get("isAdmin") === "true";
  const usernameParam = searchParams.get("username") ?? "";

  const mode = (roomIdParam ? "multiplayer" : "singleplayer") as Mode;

  const [username, setUsername] = useState(usernameParam);
  const [userId,   setUserId  ] = useState("");

  useEffect(() => { //load from local storage
    if (!username) {
      const stored = localStorage.getItem("username")?.replaceAll('"', "") ?? "";
      if (stored) setUsername(stored);
    }
    setUserId(localStorage.getItem("userId")?.replaceAll('"', "") ?? "");
  }, []);

  const { send, roundStart, roundComplete, gameOver, nextGame, sharedQuote, sharedQuoteRound } =
    useWebSocket(roomIdParam, userId, username);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [quote, setQuote] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [typingSpeed, setTypingSpeed] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [reactionRounds, setReactionRounds] = useState<number>(0);
  const [timeIntervalRounds, setTimeIntervalRounds] = useState<number>(0);
  const [aimTestRounds, setAimTestRounds] = useState<number>(0);
  const [clickSpeedRounds, setClickSpeedRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [cumulativePoints,   setCumulativePoints  ] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const s = globalThis.sessionStorage.getItem("multiplayerCumulativePoints");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [roundScoresForCard, setRoundScoresForCard] = useState<Record<string, number>>({});
  //cleanup timeouts on unmount
  useEffect(() => {
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [timeoutId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode !== "singleplayer") { setSessionInitialized(true); return; }
    try {
      const storedRounds = globalThis.sessionStorage.getItem("singleplayerRounds");
      if (!storedRounds) {setTotalRounds(0);setReactionRounds(0);setTimeIntervalRounds(0);setAimTestRounds(0);setClickSpeedRounds(0);setSessionInitialized(true); return; }
      const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
      const reaction = clampRounds(Number(parsed?.reactionTime ?? 0));
      const typing = clampRounds(Number(parsed?.typingSpeed ?? 0));
      const timeInterval = clampRounds(Number(parsed?.timeInterval ?? 0));
      const aimTest = clampRounds(Number(parsed?.aimTest ?? 0));
      const clickSpeed = clampRounds(Number(parsed?.clickSpeed ?? 0));
      setReactionRounds(reaction);
      setTotalRounds(typing);
      setTimeIntervalRounds(timeInterval);
      setAimTestRounds(aimTest);
      setClickSpeedRounds(clickSpeed);
      globalThis.sessionStorage.setItem("typingScores", JSON.stringify([]));
      setScores([]);
      setCurrentRound(1);
      setSessionInitialized(true);
    } catch {
      setTotalRounds(0);setReactionRounds(0);setTimeIntervalRounds(0);setAimTestRounds(0);setClickSpeedRounds(0);setSessionInitialized(true);
    }
  }, []);

  const getNextSingleplayerRoute = () => {
    if (timeIntervalRounds > 0) return "/games/time-interval";
    if (aimTestRounds > 0) return "/games/aim-test";
    if (clickSpeedRounds > 0) return "/games/click-speed";
    return "/singleplayer/results";
  };

  const fetchQuote = async () => {
    setTimedOut(false);
    try {
      const data = await apiService.get<{ content: string }>("/api/games/quote");
      setQuote(data.content);
      setUserInput("");
      setStartTime(0);
      setTimeElapsed(0);
      setGameState("active");
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
      alert("Failed to fetch quote. Please try again.");
    }
  };

  const startGame = () => {
    setGameState("waiting");
    const id = setTimeout(() => {fetchQuote();}, 500);
    setTimeoutId(id);
  };
  // auto start game (singleplayer only)
  useEffect(() => {
    if (mode !== "singleplayer" || !sessionInitialized) return;
    if (totalRounds <= 0) { router.push(getNextSingleplayerRoute()); return; }
    startGame();
  }, [sessionInitialized, totalRounds]);
  //start multiplayer game when admin starts first round
  const sentFirstRound = useRef(false);
  useEffect(() => {
    if (mode !== "multiplayer" || !isAdminParam || sentFirstRound.current) return;
    const id = setTimeout(() => {
      send("/app/startRound", { roomId: roomIdParam, round: "1" });
      sentFirstRound.current = true;
    }, 500);
    setTimeoutId(id);
  }, [mode, isAdminParam]);
  //round start (no quote yet,  waiting for quote)
  useEffect(() => {
    if (mode !== "multiplayer" || !roundStart) return;
    setCurrentRound(roundStart.round);
    setUserInput(""); setStartTime(0); setTimeElapsed(0);
    setGameState("waiting_quote");

    if (isAdminParam) {
      apiService
        .get<{ content: string }>("/api/games/quote")
        .then((data) => {
          send("/app/broadcastQuote", {
            roomId: roomIdParam, quote: data.content, round: String(roundStart.round),
          });
        })
        .catch(() => {
          send("/app/broadcastQuote", {
            roomId: roomIdParam,
            quote:  "The quick brown fox jumps over the lazy dog.",
            round:  String(roundStart.round),
          });
        });
    }
  }, [roundStart, mode]);
  //everyone receives quote, start round
  useEffect(() => {
    if (mode !== "multiplayer" || !sharedQuote || gameState !== "waiting_quote") return;
    setQuote(sharedQuote);
    setUserInput(""); setStartTime(0);
    setGameState("active");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [sharedQuote, sharedQuoteRound, mode]);
  //show scorecard
  useEffect(() => {
    if (mode !== "multiplayer" || !roundComplete) return;
    const pts = calcPointsForRound(roundComplete.scores, false);
    setCumulativePoints((prev) => {
      const next = { ...prev };
      for (const [player, p] of Object.entries(pts)) {
        next[player] = (next[player] ?? 0) + p;
      }
      globalThis.sessionStorage.setItem("multiplayerCumulativePoints", JSON.stringify(next));
      return next;
    });
    setRoundScoresForCard(roundComplete.scores);
    setGameState("scorecard");
  }, [roundComplete, mode]);



  useEffect(() => {
    if (mode !== "multiplayer" || !nextGame || isAdminParam) return;
    const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
    if (!slug) return;
    const id = setTimeout(() => {
      router.push(`/games/${slug}?roomId=${roomIdParam}&rounds=${nextGame.rounds}&isAdmin=false`);
    }, 2000);
    setTimeoutId(id);
  }, [nextGame, mode, isAdminParam]);
  // update timer while playing
  useEffect(() => {
    if (gameState !== "active" || !startTime) return;
    const interval = setInterval(() => {
      setTimeElapsed(Math.round((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  // timout after one minute
  useEffect(() => {
    if (gameState !== "active") return;
    const t = setTimeout(() => {
      setTimedOut(true);
      if(mode === "multiplayer") finishMultiplayerRound(0);
      else finishRound(0);
    }, 60000);
    return () => clearTimeout(t);
  }, [gameState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    if (userInput.length === 0 && newInput.length > 0 && startTime === 0) {
      setStartTime(Date.now());
    }
    if (newInput.length <= quote.length) {
      setUserInput(newInput);
      if (newInput === quote && quote.length > 0) {
        mode === "multiplayer" ? finishMultiplayerRound() : finishRound();
      }
    }
  };

  const finishRound = (timeoutWpm?: number) => {
    const elapsed   = (Date.now() - startTime) / 1000;
    const wordCount = quote.trim().split(/\s+/).length;
    const wpm = timeoutWpm ?? Math.round((wordCount / elapsed) * 60);
    setTypingSpeed(wpm);
    setGameState("result");
    const nextScores = [...scores, wpm];
    setScores(nextScores);
    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("typingScores", JSON.stringify(nextScores));
    }
    if (currentRound >= totalRounds) {
      const t = setTimeout(() => { router.push(getNextSingleplayerRoute()); }, 1000);
      setTimeoutId(t);
      return;
    }
    const t = setTimeout(() => { setCurrentRound((p) => p + 1); startGame(); }, 1000);
    setTimeoutId(t);
  };
  //submit WPM via websocket and wait for others
  const finishMultiplayerRound = (timeoutWpm?: number) => {
    const elapsed   = (Date.now() - startTime) / 1000;
    const wordCount  = quote.trim().split(/\s+/).length;
    const wpm       = timeoutWpm ?? Math.round((wordCount / elapsed) * 60);
    setTypingSpeed(wpm);
    setGameState("waiting_others");
    send("/app/submitScore", {
      roomId: roomIdParam, username,
      round:  String(currentRound), score: wpm,
    });
  };
  //admin scorecard button
  const handleScorecardNext = () => {
    const isLast = currentRound >= roundsParam;
    if (isLast) {
      if (nextGame && isAdminParam) {
        const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
        if (slug) {
          router.push(`/games/${slug}?roomId=${roomIdParam}&rounds=${nextGame.rounds}&isAdmin=true`);
          return;
        }
      }
      globalThis.sessionStorage.setItem("multiplayerFinalPoints", JSON.stringify(cumulativePoints));
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      router.push(`/multiplayer/results?roomId=${roomIdParam}`);
      return;
    }
    if (!isAdminParam) return;
    const nextRound = currentRound + 1;
    send("/app/startRound", { roomId: roomIdParam, round: String(nextRound) });
    setCurrentRound(nextRound);
    setGameState("idle");
  };

  const renderQuote = () => (
    <div style={{ fontSize: "18px", lineHeight: "1.8", wordBreak: "break-word" }}>
      {quote.split("").map((char, i) => {
      let color = "white";           // not yet typed
      if (i < userInput.length) {
        color = userInput[i] === char ? "black" : "red";  // correct vs. wrong
      }
      return <span key={i} style={{ color }}>{char}</span>;
    })}
    </div>
  );

  const rounds4Display = mode === "multiplayer" ? roundsParam : totalRounds;

  if (gameState === "scorecard") {
    return (
      <Scorecard
        round={currentRound}
        totalRounds={rounds4Display}
        scores={roundScoresForCard}
        cumulativePoints={cumulativePoints}
        lowerIsBetter={false}
        scoreLabel="Typing Speed"
        isAdmin={isAdminParam}
        hasNextGame={!!nextGame}
        onNext={handleScorecardNext}
      />
    );
  }

  return (
    <div 
    style={{
      minHeight: "100vh",
       backgroundColor: "#6BAED6",
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      gap: "1.5rem", 
      padding: "2rem",
    }}>
      <h1 style={{
        fontSize: "4rem", 
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
         margin: 0,
        color: "black", 
        textAlign: "center",
      }}>
        Typing Test
      </h1>

      {rounds4Display > 0 && (
        <div 
        style={{ 
          fontFamily: "var(--font-chewy)", 
          fontSize: "1.5rem",
          color: "black" 
          }}
          >
          Round {currentRound} of {rounds4Display}
        </div>
      )}

      {gameState === "active" && (
        <div 
        style={{ 
          fontSize: "20px",
          fontFamily: "var(--font-chewy)",
           textAlign: "center" 
           }}
           >
          Time: {timeElapsed}s
        </div>
      )}

      {gameState === "waiting_others" && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" }}>
          {typingSpeed} wpm — waiting for other players...
        </div>
      )}

      <Card
        style={{
          width: "100%", 
          maxWidth: "600px",
          backgroundColor: "#86b6cf",
           minHeight: "120px",
          display: "flex",
           alignItems: "center", 
           justifyContent: "center",
        }}
        variant="borderless"
      >
        {gameState === "waiting" || gameState === "waiting_quote" ? (
          <p style={{ textAlign: "center" }}>Loading quote...</p>
        ) : gameState === "result" || gameState === "waiting_others" ? (
          <p style={{ textAlign: "center" }}>{timedOut ? "You took too long!" : "Great job!"}</p>
        ) : (
          renderQuote()
        )}
      </Card>

      {gameState === "active" && (
        <Input.TextArea
          value={userInput}
          onChange={handleInputChange}
          onPaste={(e) => e.preventDefault()}
          placeholder="Start typing here..."
          autoFocus
          style={{
            width: "100%", 
            maxWidth: "600px",
            height: "120px",
             fontSize: "16px", 
             backgroundColor: "white",
          }}
        />
      )}

      {(gameState === "result" || gameState === "waiting_others") && (
        <Card style={{ width: "100%", maxWidth: "600px", textAlign: "center", backgroundColor: "white" }} bordered={false}>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={24}>
              <Statistic 
              title="WPM" 
              value={typingSpeed}
               valueStyle={{ color: "#22c55e", fontSize: "28px" }} />
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default function TypingSpeedGame() {
  return (
    <Suspense>
      <TypingSpeedGameInner />
    </Suspense>
  );
}
