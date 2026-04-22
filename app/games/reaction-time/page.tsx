"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";

type GameState = "idle" | "waiting" | "active" | "result" | "waiting_others" | "scorecard";
type Mode      = "singleplayer" | "multiplayer";

export interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed:  number;
}

const GAME_ROUTES: Record<string, string> = {
  "reaction time": "reaction-time",
  "typing test":   "typing-speed",
};

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

function ReactionTimeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId = searchParams.get("roomId")  ?? "";
  const roundsFromUrl = parseInt(searchParams.get("rounds") ?? "0", 10);
  const isAdmin = searchParams.get("isAdmin") === "true";
  const username =typeof window !== "undefined"
    ? localStorage.getItem("username")?.replaceAll('"', "") ?? "" : "";
  const userId =typeof window !== "undefined"
    ? localStorage.getItem("userId")?.replaceAll('"', "") ?? "": "";

  const { send, roundComplete, roundStart, gameOver, nextGame } =
    useWebSocket(roomId || "", userId, username);

  const mode   = (roomId ? "multiplayer" : "singleplayer") as Mode;
  const rounds = mode === "multiplayer" ? roundsFromUrl : 0;

  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [reactionRounds, setReactionRounds] = useState<number>(0);
  const [typingRounds, setTypingRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [sessionInitialized, setSessionInitialized ] = useState<boolean>(false);
  const [cumulativePoints, setCumulativePoints] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const s = globalThis.sessionStorage.getItem("multiplayerCumulativePoints");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [roundScoresForCard, setRoundScoresForCard ] = useState<Record<string, number>>({});

  useEffect(() => {
    return () => {if (timeoutId) clearTimeout(timeoutId); };
  }, [timeoutId]);

  useEffect(() => {
    if (mode !== "singleplayer") {
      setSessionInitialized(true);
      return;
    }
    try {
      const storedRounds = globalThis.sessionStorage.getItem("singleplayerRounds");
      if (!storedRounds) {
        setReactionRounds(0);
        setTypingRounds(0);
        setSessionInitialized(true);
        return;
      }
      const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
      const reaction = clampRounds(Number(parsed?.reactionTime ?? 0));
      const typing = clampRounds(Number(parsed?.typingSpeed ?? 0));
      setReactionRounds(reaction);
      setTypingRounds(typing);
      globalThis.sessionStorage.setItem("reactionScores", JSON.stringify([]));
      setScores([]);
      setCurrentRound(1);
      setSessionInitialized(true);
    } catch {
      setReactionRounds(0);
      setTypingRounds(0);
      setSessionInitialized(true);
    }
  }, [mode]);

  const startSingleplayerRound = () => {
    setGameState("waiting");
    const delay = Math.random() * 4000 + 2000;
    const id = setTimeout(() => {
      setGameState("active");
      setStartTime(Date.now());
    }, delay);
    setTimeoutId(id);
  };

  useEffect(() => {
    if (mode !== "singleplayer" || !sessionInitialized) return;
    if (reactionRounds <= 0) {
      router.push(typingRounds > 0 ? "/games/typing-speed" : "/singleplayer/results");
      return;
    }
    startSingleplayerRound();
  }, [sessionInitialized, mode]);

  const finishSingleplayerRound = (score: number) => {
    if (mode !== "singleplayer") return;
    setReactionTime(score);
    setGameState("result");
    const nextScores = [...scores, score];
    setScores(nextScores);
    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("reactionScores", JSON.stringify(nextScores));
    }
    if (currentRound >= reactionRounds) {
      const t = setTimeout(() => {
        router.push(typingRounds > 0 ? "/games/typing-speed" : "/singleplayer/results");
      }, 1000);
      setTimeoutId(t);
      return;
    }
    const t = setTimeout(() => {
      setCurrentRound((prev) => prev + 1);
      startSingleplayerRound();
    }, 1000);
    setTimeoutId(t);
  };

  const sentFirstRound = React.useRef(false);
  const roundStartTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (mode !== "multiplayer" || !isAdmin || !roomId || sentFirstRound.current) return;
    const t = setTimeout(() => {
      send("/app/startRound", { roomId, round: String(currentRound) });
      sentFirstRound.current = true;
    }, 1000);
    return () => clearTimeout(t);
  }, [mode, isAdmin]);
  // multiplayer start game
  useEffect(() => {
    if (mode !== "multiplayer" || !roundStart) return;
    setCurrentRound(roundStart.round);
    setGameState("waiting");
    const delay = roundStart.startAt - Date.now();
    const t = setTimeout(() => {
      setGameState("active");
      setStartTime(roundStart.startAt);
      roundStartTimeoutRef.current = null;
    }, Math.max(0, delay));
    roundStartTimeoutRef.current = t;
    return () => { clearTimeout(t); roundStartTimeoutRef.current = null; };
  }, [roundStart, mode]);
  // multiplayer round complete
  useEffect(() => {
    if (mode !== "multiplayer" || !roundComplete) return;
    const pts = calcPointsForRound(roundComplete.scores, true);
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
    if (mode !== "multiplayer" || !nextGame || isAdmin) return;
    const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
    if (!slug) return;
    const t = setTimeout(() => {
      router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=false`);
    }, 2000);
    return () => clearTimeout(t);
  }, [nextGame, mode, isAdmin, router]);
  // scorecard next
  const handleScorecardNext = () => {
    const isLast = currentRound >= rounds;
    if (isLast) {
      if (nextGame && isAdmin) {
        const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
        if (slug) {
          router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=true`);
          return;
        }
      }
      globalThis.sessionStorage.setItem("multiplayerFinalPoints", JSON.stringify(cumulativePoints));
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      router.push(`/multiplayer/results?roomId=${roomId}`);
      return;
    }
    if (!isAdmin) return;
    const nextRound = currentRound + 1;
    send("/app/startRound", { roomId, round: String(nextRound) });
    setCurrentRound(nextRound);
    setGameState("idle");
  };

  const handleClick = () => {
    if (mode === "singleplayer") handleSingleplayerClick();
    else handleMultiplayerClick();
  };

  const handleSingleplayerClick = () => {
    if (gameState === "waiting") {
      if (timeoutId) clearTimeout(timeoutId);
      finishSingleplayerRound(-1);
    } else if (gameState === "active") {
      finishSingleplayerRound(Date.now() - startTime);
    }
  };

  const finishMultiplayerRound = (score: number) => {
    if (mode !== "multiplayer" || !roomId) return;
    if (roundStartTimeoutRef.current) {
      clearTimeout(roundStartTimeoutRef.current);
      roundStartTimeoutRef.current = null;
    }
    send("/app/submitScore", { roomId, username, round: String(currentRound), score });
    setReactionTime(score);
    setGameState("waiting_others");
  };

  const handleMultiplayerClick = () => {
    if (!roomId) return;
    if (gameState === "waiting") {
      finishMultiplayerRound(-1);
      return;
    }
    if (gameState === "active") { finishMultiplayerRound(Date.now() - startTime); return; }
  };

  if (gameState === "scorecard") {
    return (
      <Scorecard
        round={currentRound}
        totalRounds={rounds}
        scores={roundScoresForCard}
        cumulativePoints={cumulativePoints}
        lowerIsBetter={true}
        scoreLabel="Reaction Time"
        isAdmin={isAdmin}
        hasNextGame={!!nextGame}
        onNext={handleScorecardNext}
      />
    );
  }

  const getButtonText = () => {
    if (gameState === "idle") return "Get ready...";
    if (gameState === "waiting") return "Wait...";
    if (gameState === "active") return "CLICK!";
    if (gameState === "result" && reactionTime === -1) return "Too early!";
    return `${reactionTime}ms`;
  };

  const getButtonColor = () => {
    if (gameState === "waiting") return "#FF6B6B";
    if (gameState === "active") return "#51CF66";
    return "rgb(166, 199, 214)";
  };

  return (
    <div 
    style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2rem",
      padding: "2rem",
    }}>
      <h1
      style={{
        fontSize: "4rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        color: "black",
      }}
      >
        Reaction Time
      </h1>

      {mode === "singleplayer" && reactionRounds > 0 && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
          Round {currentRound} of {reactionRounds}
        </div>
      )}
      {mode === "multiplayer" && rounds > 0 && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
          Round {currentRound} of {rounds}
        </div>
      )}

      <button
        onClick={handleClick}
        style={{
          width: "calc(100% - 30rem)",
          height: "30rem",
          fontSize: "2rem",
          fontWeight: "bold",
          border: "none",
          borderRadius: "20px",
          backgroundColor: getButtonColor(),
          color: "black",
          cursor: "pointer",
          transition: "background-color 0.05s",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          whiteSpace: "pre-wrap",
        }}
      >
        <span style={{fontFamily: "var(--font-chewy)" }}>
          {getButtonText()}
          </span>
      </button>
    </div>
  );
}

const ReactionTime: React.FC = () => (
  <Suspense>
    <ReactionTimeInner />
  </Suspense>
);

export default ReactionTime;