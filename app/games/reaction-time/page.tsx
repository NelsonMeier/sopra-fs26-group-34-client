"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal, message } from "antd";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";

type GameState = "idle" | "waiting" | "active" | "result" | "waiting_others" | "scorecard";
type Mode      = "singleplayer" | "multiplayer";

export interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed:  number;
  timeInterval: number;
  aimTest: number;
  clickSpeed: number;
}

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

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // intercept back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      if (mode !== "multiplayer") return;
      setShowLeaveModal(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [userId]);

  const handleLeaveConfirm = () => {
    if (mode === "multiplayer" && !gameCompletedRef.current) {
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      send("/app/playerLeft", { roomId: roomId, username, round: String(currentRound) });
    }
    gameCompletedRef.current = true;
    router.push(`/users/${userId}`);
  };

  const { send, roundComplete, roundStart, gameOver, sessionEnded, nextGame } =
    useWebSocket(roomId || "", userId, username);

  const mode   = (roomId ? "multiplayer" : "singleplayer") as Mode;
  const rounds = mode === "multiplayer" ? roundsFromUrl : 0;

// session ended (admin left)
  useEffect(() => {
    if (!sessionEnded) return;
    if (isAdmin) return;
    globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
    globalThis.sessionStorage.removeItem("disconnectedPlayers");
    setTimeout(() => router.push(`/users/${userId}`), 3000);
  }, [sessionEnded]);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [reactionRounds, setReactionRounds] = useState<number>(0);
  const [typingRounds, setTypingRounds] = useState<number>(0);
  const [timeIntervalRounds, setTimeIntervalRounds] = useState<number>(0);
  const [aimTestRounds, setAimTestRounds] = useState<number>(0);
  const [clickSpeedRounds, setClickSpeedRounds] = useState<number>(0);
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
  const [disconnectedPlayers, setDisconnectedPlayers] = useState<string[]>([]);
  const gameCompletedRef = React.useRef(false);

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
        setTimeIntervalRounds(0);
        setAimTestRounds(0);
        setClickSpeedRounds(0);
        setSessionInitialized(true);
        return;
      }
      const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
      const reaction = clampRounds(Number(parsed?.reactionTime ?? 0));
      const typing = clampRounds(Number(parsed?.typingSpeed ?? 0));
      const timeInterval = clampRounds(Number(parsed?.timeInterval ?? 0));
      const aimTest = clampRounds(Number(parsed?.aimTest ?? 0));
      const clickSpeed = clampRounds(Number(parsed?.clickSpeed ?? 0));
      setReactionRounds(reaction);
      setTypingRounds(typing);
      setTimeIntervalRounds(timeInterval);
      setAimTestRounds(aimTest);
      setClickSpeedRounds(clickSpeed);
      globalThis.sessionStorage.setItem("reactionScores", JSON.stringify([]));
      setScores([]);
      setCurrentRound(1);
      setSessionInitialized(true);
    } catch {
      setReactionRounds(0);
      setTypingRounds(0);
      setTimeIntervalRounds(0);
      setAimTestRounds(0);
      setClickSpeedRounds(0);
      setSessionInitialized(true);
    }
  }, [mode]);

  const getNextSingleplayerRoute = () => {
    if (typingRounds > 0) return "/games/typing-speed";
    if (timeIntervalRounds > 0) return "/games/time-interval";
    if (aimTestRounds > 0) return "/games/aim-test";
    if (clickSpeedRounds > 0) return "/games/click-speed";
    return "/singleplayer/results";
  };

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
      router.push(getNextSingleplayerRoute());
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
        router.push(getNextSingleplayerRoute());
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

  // playerLeft on unmount
  useEffect(() => {
    return () => {
      if (mode !== "multiplayer") return;
      if (gameCompletedRef.current) return;
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      send("/app/playerLeft", { roomId, username, round: String(currentRound) });
    };
  }, []);
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
    if (gameState !== "waiting_others") return;
    const pts = calcPointsForRound(roundComplete.scores, true, roundComplete.disconnected ?? []);
    setCumulativePoints((prev) => {
      const next = { ...prev };
      for (const [player, p] of Object.entries(pts)) {
        next[player] = (next[player] ?? 0) + p;
      }
      globalThis.sessionStorage.setItem("multiplayerCumulativePoints", JSON.stringify(next));
      return next;
    });
    setRoundScoresForCard(roundComplete.scores);
    setDisconnectedPlayers(roundComplete.disconnected ?? []);
    setGameState("scorecard");
  }, [roundComplete, mode]);



  useEffect(() => {
    if (mode !== "multiplayer" || !nextGame || isAdmin) return;
    const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
    if (!slug) return;
    const t = setTimeout(() => {
      gameCompletedRef.current = true;
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
          gameCompletedRef.current = true;
          router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=true`);
          return;
        }
      }
      globalThis.sessionStorage.setItem("multiplayerFinalPoints", JSON.stringify(cumulativePoints));
      globalThis.sessionStorage.setItem("disconnectedPlayers", JSON.stringify([...disconnectedPlayers]));
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      gameCompletedRef.current = true;
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
      <>
        <Scorecard
          round={currentRound}
          totalRounds={rounds}
          scores={roundScoresForCard}
          cumulativePoints={cumulativePoints}
          lowerIsBetter={true}
          scoreLabel="Reaction Time"
          isAdmin={isAdmin}
          hasNextGame={!!nextGame}
          disconnectedPlayers={disconnectedPlayers}
          onNext={handleScorecardNext}
        />
      {sessionEnded && !isAdmin && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "#B8D8E8",
            borderRadius: "20px",
            padding: "3rem",
            textAlign: "center",
            maxWidth: "420px",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.4)",
          }}>
            <h2 style={{ fontFamily: "var(--font-chewy)", fontSize: "2rem", marginBottom: "1rem" }}>
              Oh no!
            </h2>
            <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Seems like the admin has left the game.
            </p>
            <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", color: "#555" }}>
              Redirecting you to your profile...
            </p>
          </div>
        </div>
      )}
        <Modal
          open={showLeaveModal}
          onCancel={() => setShowLeaveModal(false)}
          footer={null}
          centered
        >
          <div style={{ fontFamily: "var(--font-chewy)", textAlign: "center", padding: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Leave Game?</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
              {isAdmin ? "You are the admin — leaving will end the session for all players." : "Are you sure you want to leave? This will end your game session."}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <Button onClick={() => setShowLeaveModal(false)} style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}>Stay</Button>
              <Button onClick={handleLeaveConfirm} style={{ backgroundColor: "#e55", border: "none", color: "white", fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}>Leave</Button>
            </div>
          </div>
        </Modal>
      </>
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

      <Modal
        open={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        footer={null}
        centered
      >
        <div style={{ fontFamily: "var(--font-chewy)", textAlign: "center", padding: "1rem" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Leave Game?</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
            {isAdmin ? "You are the admin — leaving will end the session for all players." : "Are you sure you want to leave? This will end your game session."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Button
              onClick={() => setShowLeaveModal(false)}
              style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}
            >
              Stay
            </Button>
            <Button
              onClick={handleLeaveConfirm}
              style={{ backgroundColor: "#e55", border: "none", color: "white", fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}
            >
              Leave
            </Button>
          </div>
        </div>
      </Modal>
  
      {sessionEnded && !isAdmin && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "#B8D8E8",
            borderRadius: "20px",
            padding: "3rem",
            textAlign: "center",
            maxWidth: "420px",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.4)",
          }}>
            <h2 style={{ fontFamily: "var(--font-chewy)", fontSize: "2rem", marginBottom: "1rem" }}>
              Oh no!
            </h2>
            <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Seems like the admin has left the game.
            </p>
            <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", color: "#555" }}>
              Redirecting you to your profile...
            </p>
          </div>
        </div>
      )}
  </div>
  );
}

const ReactionTime: React.FC = () => (
  <Suspense>
    <ReactionTimeInner />
  </Suspense>
);

export default ReactionTime;