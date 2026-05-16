"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal, message } from "antd";
import type { SingleplayerRounds } from "../reaction-time/page";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";

type GameState = "idle" | "waiting" | "active" | "result" | "waiting_others" | "scorecard";
type Mode = "singleplayer" | "multiplayer";

const ROUND_DURATION_SECONDS = 10;

const GAME_ROUTES: Record<string, string> = {
  "reaction time": "reaction-time",
  "typing test": "typing-speed",
  "time interval": "time-interval",
  "aim test":      "aim-test",
  "click speed":   "click-speed",
};

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const getButtonColor = (gameState: GameState, clickColorStep: number): string => {
  if (gameState !== "active") return "rgb(166, 199, 214)";
  const progress = Math.min(clickColorStep / 120, 1);
  const hue = 199 - progress * 199;
  const saturation = 50 + progress * 40;
  const lightness = 82 - progress * 22;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

function ClickSpeedInner() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const roomId = searchParams.get("roomId") ?? "";
  const roundsFromUrl = parseInt(searchParams.get("rounds") ?? "0", 10);
  const isAdmin = searchParams.get("isAdmin") === "true";
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username")?.replaceAll('"', "") ?? "": "";
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId")?.replaceAll('"', "") ?? "" : "";

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

  const { send, roundComplete, roundStart, sessionEnded, nextGame } = useWebSocket(
    roomId || "",
    userId,
    username
  );

  const mode = (roomId ? "multiplayer" : "singleplayer") as Mode;
  const rounds = mode === "multiplayer" ? roundsFromUrl : 0;

  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION_SECONDS);
  const [startTime, setStartTime] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);
  const [clickColorStep, setClickColorStep] = useState<number>(0);
  const clickCountRef = useRef<number>(0);

  const [cumulativePoints, setCumulativePoints] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const s = globalThis.sessionStorage.getItem("multiplayerCumulativePoints");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [roundScoresForCard, setRoundScoresForCard] = useState<Record<string, number>>({});
  const [disconnectedPlayers, setDisconnectedPlayers] = useState<string[]>([]);

  const roundStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentFirstRound = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameCompletedRef = useRef(false);

  // cleanup
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (roundStartTimeoutRef.current) clearTimeout(roundStartTimeoutRef.current);
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [timeoutId]);

  // playerLeft on unmount
  useEffect(() => {
    return () => {
      if (mode !== "multiplayer") return;
      if (gameCompletedRef.current) return;
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      send("/app/playerLeft", { roomId, username, round: String(currentRound) });
    };
  }, []);
  // session ended (admin left)
  useEffect(() => {
    if (!sessionEnded) return;
    globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
    globalThis.sessionStorage.removeItem("disconnectedPlayers");
    setTimeout(() => router.push(`/users/${userId}`), 3000);
  }, [sessionEnded]);

  // singleplayer
  useEffect(() => {
    if (mode !== "singleplayer") {
      setSessionInitialized(true);
      return;
    }
    try {
      const storedRounds = globalThis.sessionStorage.getItem("singleplayerRounds");
      if (!storedRounds) {
        setTotalRounds(0);
        setSessionInitialized(true);
        return;
      }
      const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
      const clickSpeed = clampRounds(Number(parsed?.clickSpeed ?? 0));
      setTotalRounds(clickSpeed);
      setCurrentRound(1);
      globalThis.sessionStorage.setItem("clickSpeedScores", JSON.stringify([]));
      setScores([]);
      setSessionInitialized(true);
    } catch {
      setTotalRounds(0);
      setSessionInitialized(true);
    }
  }, [mode]);

  // singleplayer, redirect 
  useEffect(() => {
    if (mode !== "singleplayer" || !sessionInitialized) return;
    if (totalRounds <= 0) router.push("/singleplayer/results");
    else setGameState("waiting");
  }, [router, sessionInitialized, totalRounds, mode]);

  // countdown display during active round
  useEffect(() => {
    if (gameState !== "active" || !startTime) return;
    const intervalId = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      setTimeLeft(Math.max(0, ROUND_DURATION_SECONDS - elapsedSeconds));
    }, 10);
    return () => clearInterval(intervalId);
  }, [gameState, startTime]);

  // multiplayer
  useEffect(() => {
    if (mode !== "multiplayer" || !isAdmin || !roomId || sentFirstRound.current) return;
    const t = setTimeout(() => {
      send("/app/startRound", { roomId, round: String(currentRound) });
      sentFirstRound.current = true;
    }, 1000);
    return () => clearTimeout(t);
  }, [mode, isAdmin]);

  // multiplayer ROUND_START received
  useEffect(() => {
    if (mode !== "multiplayer" || !roundStart) return;
    setCurrentRound(roundStart.round);
    setClickColorStep(0);
    clickCountRef.current = 0;
    setTimeLeft(ROUND_DURATION_SECONDS);
    setScore(null);
    setGameState("waiting");

    const delay = roundStart.startAt - Date.now();
    const t = setTimeout(() => {
      setGameState("active");
      setStartTime(roundStart.startAt);
      roundStartTimeoutRef.current = null;
    }, Math.max(0, delay));
    roundStartTimeoutRef.current = t;
    return () => {
      clearTimeout(t);
      roundStartTimeoutRef.current = null;
    };
  }, [roundStart, mode]);

  //multiplayer ROUND_COMPLETE 
  useEffect(() => {
    if (mode !== "multiplayer" || !roundComplete) return;
    if (gameState !== "waiting_others") return;
    const pts = calcPointsForRound(roundComplete.scores, false, roundComplete.disconnected ?? []); // higher CPS = better
    setCumulativePoints((prev) => {
      const next = { ...prev };
      for (const [player, p] of Object.entries(pts)) {
        next[player] = (next[player] ?? 0) + p;
      }
      globalThis.sessionStorage.setItem("multiplayerCumulativePoints", JSON.stringify(next));
      return next;
    });
    const cpsScores = Object.fromEntries(
      Object.entries(roundComplete.scores).map(([p, clicks]) => [p, clicks / ROUND_DURATION_SECONDS])
    );
    setRoundScoresForCard(cpsScores);
    setDisconnectedPlayers(roundComplete.disconnected ?? []);
    setGameState("scorecard");
  }, [roundComplete, mode]);

  // multiplayer
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

  //singleplayer
  const resetRound = useCallback(() => {
    setTimeLeft(ROUND_DURATION_SECONDS);
    setStartTime(0);
    clickCountRef.current = 0;
    setClickColorStep(0);
    setScore(null);
    setGameState("waiting");
  }, []);

  const finishSingleplayerRound = useCallback(() => {
    const roundScore = clickCountRef.current / ROUND_DURATION_SECONDS;
    const nextScores = [...scores, roundScore];
    setTimeLeft(0);
    setScore(roundScore);
    setScores(nextScores);
    setGameState("result");
    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("clickSpeedScores", JSON.stringify(nextScores));
    }
    const id = setTimeout(() => {
      if (currentRound >= totalRounds) {
        router.push("/singleplayer/results");
        return;
      }
      setCurrentRound((prev) => prev + 1);
      resetRound();
    }, 2000);
    setTimeoutId(id);
  }, [currentRound, resetRound, router, scores, totalRounds]);

  // singleplayer
  useEffect(() => {
    if (mode !== "singleplayer" || gameState !== "active") return;
    const id = setTimeout(() => {
      finishSingleplayerRound();
    }, ROUND_DURATION_SECONDS * 1000);
    return () => clearTimeout(id);
  }, [finishSingleplayerRound, gameState, mode]);

  
  const finishMultiplayerRound = useCallback(() => {
    if (mode !== "multiplayer" || !roomId) return;
    if (roundStartTimeoutRef.current) {
      clearTimeout(roundStartTimeoutRef.current);
      roundStartTimeoutRef.current = null;
    }
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    const rawClicks = clickCountRef.current;            
    const displayCps = rawClicks / ROUND_DURATION_SECONDS;
    setScore(displayCps);
    send("/app/submitScore", {
      roomId,
      username,
      round: String(currentRound),
      score: rawClicks,                                 
    });
    setGameState("waiting_others");
  }, [mode, roomId, currentRound, send, username]);

  // multiplayer
  useEffect(() => {
    if (mode !== "multiplayer" || gameState !== "active" || !startTime) return;
    const elapsed = Date.now() - startTime;
    const remaining = ROUND_DURATION_SECONDS * 1000 - elapsed;
    const id = setTimeout(() => {
      finishMultiplayerRound();
    }, Math.max(0, remaining));
    roundTimerRef.current = id;
    return () => clearTimeout(id);
  }, [gameState, startTime, mode, finishMultiplayerRound]);

  // scorecard
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
    if (mode === "singleplayer") {
      if (gameState === "waiting" || gameState === "idle") {
        clickCountRef.current = 1;
        setClickColorStep(1);
        setStartTime(Date.now());
        setTimeLeft(ROUND_DURATION_SECONDS);
        setScore(null);
        setGameState("active");
        return;
      }
      if (gameState === "active") {
        clickCountRef.current += 1;
        setClickColorStep((prev) => prev + 1);
      }
      return;
    }
  
    if (gameState === "active") {
      clickCountRef.current += 1;
      setClickColorStep((prev) => prev + 1);
    }
  };

  const getButtonText = () => {
    if (gameState === "idle") return "Get ready...";
    if (gameState === "waiting")
      return mode === "singleplayer" ? "Start clicking as fast as you can!" : "Get ready...";
    if (gameState === "active") return timeLeft.toFixed(2);
    if (gameState === "waiting_others") return `${score?.toFixed(2)} CPS — waiting for others…`;
    if (gameState === "result") return `${score?.toFixed(2)} clicks/s`;
    return "";
  };

  const isClickable =
    gameState === "active" ||
    (mode === "singleplayer" && (gameState === "waiting" || gameState === "idle"));

  if (gameState === "scorecard") {
    return (
      <Scorecard
        round={currentRound}
        totalRounds={rounds}
        scores={roundScoresForCard}
        cumulativePoints={cumulativePoints}
        lowerIsBetter={false}
        scoreLabel="Click Speed"
        scoreUnit="cps"
        isAdmin={isAdmin}
        hasNextGame={!!nextGame}
        disconnectedPlayers={disconnectedPlayers}
        onNext={handleScorecardNext}
      />
    );
  }

  const effectiveRounds = mode === "multiplayer" ? rounds : totalRounds;

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
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "400",
          fontFamily: "var(--font-chewy)",
          margin: 0,
          color: "black",
          textAlign: "center",
        }}
      >
        Click Speed
      </h1>

      {effectiveRounds > 0 && (
        <div
          style={{
            fontFamily: "var(--font-chewy)",
            fontSize: "1.5rem",
            color: "black",
          }}
        >
          Round {currentRound} of {effectiveRounds}
        </div>
      )}

      <Button
        type="primary"
        onClick={handleClick}
        style={{
          width: "min(100%, 70%)",
          height: "65vh",
          backgroundColor: getButtonColor(gameState, clickColorStep),
          border: "none",
          borderRadius: "20px",
          borderColor: "transparent",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          color: "black",
          cursor: isClickable ? "pointer" : "default",
          fontFamily: "var(--font-chewy)",
          fontSize: "3rem",
          padding: "2rem",
          textAlign: "center",
          whiteSpace: "normal",
          transition: "background-color 0.05s linear",
          opacity: 1,
        }}
      >
        {getButtonText()}
      </Button>

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
  
      {sessionEnded && (
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

const ClickSpeedGame: React.FC = () => (
  <Suspense>
    <ClickSpeedInner />
  </Suspense>
);

export default ClickSpeedGame;