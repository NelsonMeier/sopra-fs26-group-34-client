"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Button } from "antd";
import type { SingleplayerRounds } from "../reaction-time/page";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";

type GameState = "idle" | "waiting" | "active" | "result" | "waiting_others" | "scorecard";
type Mode = "singleplayer" | "multiplayer";

//mapping from game name to route slug for next game navigation from scorecard
const GAME_ROUTES: Record<string, string> = {
  "reaction time": "reaction-time",
  "typing test":   "typing-speed",
  "time interval": "time-interval",
};

// ensuring rounds from url
const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

// determine goal time for multiplayer
const goalTimeFromSeed = (startAt: number): number =>
  Number((5 + (startAt % 50) / 10).toFixed(1)); 

//main game
function TimeIntervalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

 // url params and localStorage retrieval
  const roomId = searchParams.get("roomId")  ?? "";
  const roundsFromUrl = parseInt(searchParams.get("rounds")  ?? "0", 10);
  const isAdmin = searchParams.get("isAdmin") === "true";

  // retrieve username and userId
  const username = typeof window !== "undefined" ? localStorage.getItem("username")?.replaceAll('"', "") ?? "" : "";
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId")?.replaceAll('"', "") ?? "" : "";

  // websocket hooks for multiplayer
  const { send, roundStart, roundComplete, nextGame } = useWebSocket(roomId || "", userId, username);

  // determine mode and rounds
  const mode   = (roomId ? "multiplayer" : "singleplayer") as Mode;
  const rounds = mode === "multiplayer" ? roundsFromUrl : 0;

 
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [goalTime, setGoalTime] = useState<number>(5.0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);


  // cumulative points for multiplayer, persisted in sessionStorage to survive page reloads during the game
  const [cumulativePoints, setCumulativePoints] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const s = globalThis.sessionStorage.getItem("multiplayerCumulativePoints");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }});

  const [roundScoresForCard, setRoundScoresForCard] = useState<Record<string, number>>({});

  // managing timeouts and current round in multiplayer
  const currentRoundRef = useRef(currentRound);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);


  useEffect(() => {
    return () => { if (timeoutId) clearTimeout(timeoutId); };}, 
    [timeoutId]);



    // Initialize singleplayer session from sessionStorage or start fresh if not present
  useEffect(() => {
    if (mode !== "singleplayer") {
      setSessionInitialized(true);
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const storedRounds = globalThis.sessionStorage.getItem("singleplayerRounds");
      if (!storedRounds) { setTotalRounds(0); setSessionInitialized(true); return; }
      const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
      const timeInterval = clampRounds(Number(parsed?.timeInterval ?? 0));
      setTotalRounds(timeInterval);
      setCurrentRound(1);
      globalThis.sessionStorage.setItem("timeIntervalScores", JSON.stringify([]));
      setScores([]);
      setSessionInitialized(true);
    } catch {
      setTotalRounds(0);
      setSessionInitialized(true);
    }
  }, [mode]);


  // Start each singleplayer round with a new random goal time once the session is initialized and rounds are set
  useEffect(() => {
    if (!sessionInitialized || mode !== "singleplayer") return;
    if (totalRounds <= 0) { router.push("/singleplayer/results"); return; }
    setGoalTime(Number((Math.random() * 5 + 5).toFixed(1)));
    setGameState("waiting");
  }, [sessionInitialized, totalRounds]);


  // For singleplayer, automatically start the round after a 10-second period
  useEffect(() => {
    if (mode !== "singleplayer" || !sessionInitialized || totalRounds <= 0 || gameState !== "waiting") return;
    const id = setTimeout(() => {
      setStartTime(Date.now());
      setElapsedTime(0);
      setScore(null);
      setGameState("active");
    }, 10000);
    setTimeoutId(id);
    return () => clearTimeout(id);
  }, [gameState, sessionInitialized, mode, totalRounds]);


  // starting round multiplayer
  const sentFirstRound = useRef(false);
  useEffect(() => {
    if (mode !== "multiplayer" || !isAdmin || !roomId || sentFirstRound.current) return;
    const t = setTimeout(() => {
      send("/app/startRound", { roomId, round: String(currentRound) });
      sentFirstRound.current = true;
    }, 1000);
    return () => clearTimeout(t);
  }, [mode, isAdmin]);

 
  // When a new round starts in multiplayer, set up the state and a timeout to automatically finish the round after 20 seconds if the player hasn't already submitted a score
  const roundStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (mode !== "multiplayer" || !roundStart) return;
    setCurrentRound(roundStart.round);
    setScore(null);
    setElapsedTime(0);
    setGoalTime(goalTimeFromSeed(roundStart.startAt));
    setGameState("waiting");

    const delay = roundStart.startAt - Date.now();
    const t = setTimeout(() => {
      setStartTime(Date.now());
      setElapsedTime(0);
      setGameState("active");
      roundStartTimeoutRef.current = null;
    }, Math.max(0, delay));
    roundStartTimeoutRef.current = t;
    return () => { clearTimeout(t); roundStartTimeoutRef.current = null; };
  }, [roundStart, mode]);

// round completion w scoring
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


  // after showing scorecard move on to next game/round
  useEffect(() => {
    if (mode !== "multiplayer" || !nextGame || isAdmin) return;
    if (gameState !== "scorecard" || currentRound < rounds) return;
    const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
    if (!slug) return;
    const t = setTimeout(() => {
      router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=false`);
    }, 2000);
    return () => clearTimeout(t);
  }, [nextGame, gameState, currentRound, rounds, mode, isAdmin, router]);


  // timer
  useEffect(() => {
    if (gameState !== "active" || !startTime) return;
    const intervalId = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 10);
    return () => clearInterval(intervalId);
  }, [gameState, startTime]);

// auto-finish round after 20 seconds in multiplayer if player hasn't submitted a score
  useEffect(() => {
    if (gameState !== "active") return;
    const id = setTimeout(() => {
      if (mode === "multiplayer") {
        if (roundStartTimeoutRef.current) {
          clearTimeout(roundStartTimeoutRef.current);
          roundStartTimeoutRef.current = null;
        }
        setScore(20000);
        setGameState("waiting_others");
        send("/app/submitScore", {
          roomId,
          username,
          round: String(currentRoundRef.current),
          score: 20000,
        });
      } else {
        finishSingleplayerRound(-1);
      }
    }, 20000);
    return () => clearTimeout(id);
  }, [gameState]); 

  // reset the state for the next singleplayer round
  const resetRound = useCallback(() => {
    setGoalTime(Number((Math.random() * 5 + 5).toFixed(1)));
    setElapsedTime(0);
    setStartTime(0);
    setScore(null);
    setGameState("waiting");
  }, []);

  // finish singleplayer round with optional forced score (used for auto-finishing after 20s)
  const finishSingleplayerRound = useCallback(
    (forcedScore?: number) => {
      const finalElapsedTime = (Date.now() - startTime) / 1000;
      const roundScore       = forcedScore ?? Math.abs(goalTime - finalElapsedTime);
      const nextScores       = [...scores, roundScore];

      setElapsedTime(forcedScore === -1 ? 20 : finalElapsedTime);
      setScore(roundScore);
      setScores(nextScores);
      setGameState("result");

      if (typeof window !== "undefined") {
        globalThis.sessionStorage.setItem("timeIntervalScores", JSON.stringify(nextScores));
      }

      // after showing result for 2 seconds, either move to next round or show final results if it was the last round
      const id = setTimeout(() => {
        if (currentRound >= totalRounds) { router.push("/singleplayer/results"); return; }
        setCurrentRound((prev) => prev + 1);
        resetRound();
      }, 2000);
      setTimeoutId(id);
    },
    [currentRound, goalTime, resetRound, router, scores, startTime, totalRounds]
  );

//finish mutliplayer round
  const finishMultiplayerRound = () => {
    if (mode !== "multiplayer" || !roomId) return;
    if (roundStartTimeoutRef.current) {
      clearTimeout(roundStartTimeoutRef.current);
      roundStartTimeoutRef.current = null;
    }
    const finalElapsed = (Date.now() - startTime) / 1000;
    const diffMs       = Math.round(Math.abs(goalTime - finalElapsed) * 1000); // int ms
    setElapsedTime(finalElapsed);
    setScore(diffMs);
    setGameState("waiting_others");
    send("/app/submitScore", {
      roomId,
      username,
      round: String(currentRound),
      score: diffMs,
    });
  };

  
// handling next on scorecard
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

  // button for rounds
  const handleButtonClick = () => {
    if (mode === "singleplayer") {
      if (gameState === "waiting") {
        if (timeoutId) clearTimeout(timeoutId);
        setStartTime(Date.now());
        setElapsedTime(0);
        setScore(null);
        setGameState("active");
      } else if (gameState === "active") {
        finishSingleplayerRound();
      }
    } else {
      
      if (gameState === "active") finishMultiplayerRound();
    }
  };

 //displaying scorecard
  if (gameState === "scorecard") {
    return (
      <Scorecard
        round={currentRound}
        totalRounds={rounds}
        scores={roundScoresForCard}
        cumulativePoints={cumulativePoints}
        lowerIsBetter={true}
        scoreLabel="Time Interval"
        scoreUnit="s"
        isAdmin={isAdmin}
        hasNextGame={!!nextGame}
        onNext={handleScorecardNext}
      />
    );
  }

  //displaying rounds
  const displayRounds = mode === "singleplayer" ? totalRounds : rounds;


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
        Time Interval
      </h1>

      {displayRounds > 0 && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
          Round {currentRound} of {displayRounds}
        </div>
      )}

      {gameState !== "idle" && (
        <div
          style={{
            fontFamily: "var(--font-chewy)",
            fontSize: "2rem",
            color: "black",
            textAlign: "center",
          }}
        >
          Stop the clock at {goalTime.toFixed(1)}s!
        </div>
      )}

      
      {gameState === "waiting_others" && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" }}>
          {score !== null
            ? `${(score / 1000).toFixed(3)}s off — waiting for other players...`
            : "Waiting for other players..."}
        </div>
      )}

      {/* Multiplayer "get ready" banner while waiting for startAt */}
      {mode === "multiplayer" && gameState === "waiting" && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" }}>
          Get ready…
        </div>
      )}

      <div
        style={{
          width: "min(100%, 32rem)",
          aspectRatio: "1 / 1",
          backgroundColor: "#B8D8E8",
          borderRadius: "20px",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4rem",
          padding: "2rem",
        }}
      >
     
        <div
          style={{
            fontFamily: "var(--font-chewy)",
            fontSize: "5rem",
            color: "black",
            lineHeight: 1,
            opacity: gameState === "active" ? 0 : 1,
            transition: gameState === "active" ? "opacity 3s linear" : "none",
          }}
        >
          {score === -1 ? "20.000s" : `${elapsedTime.toFixed(3)}s`}
        </div>

   
        {gameState === "result" ? (
          <div
            style={{
              width: "20rem",
              height: "6rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "black",
              fontFamily: "var(--font-chewy)",
              fontSize: "1.8rem",
              textAlign: "center",
            }}
          >
            {score === -1 ? "you're way off!" : `You were ${typeof score === "number" ? score.toFixed(3) : "?"}s off!`}
          </div>
        ) : gameState === "idle" || gameState === "waiting_others" || (mode === "multiplayer" && gameState === "waiting") ? (
          <div style={{ width: "20rem", height: "6rem" }} />
        ) : (
          <Button
            type="primary"
            onClick={handleButtonClick}
            style={{
              width: "20rem",
              height: "6rem",
              backgroundColor: gameState === "active" ? "#FF6B6B" : "#51CF66",
              borderRadius: "15px",
              border: "none",
              boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
              color: "black",
              fontFamily: "var(--font-chewy)",
              fontSize: "3rem",
              fontWeight: "bold",
              transition: "background-color 0.1s",
            }}
          >
            {gameState === "active" ? "Stop" : "Start"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TimeIntervalGame() {
  return (
    <Suspense>
      <TimeIntervalInner />
    </Suspense>
  );
}