"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SingleplayerRounds } from "../reaction-time/page";

type GameState = "waiting" | "active" | "result";

const ROUND_DURATION_SECONDS = 10;

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const ClickSpeedGame: React.FC = () => {
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>("waiting");
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION_SECONDS);
  const [startTime, setStartTime] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);
  const clickCountRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, []);

  useEffect(() => {
    if (!sessionInitialized) return;
    if (totalRounds <= 0) router.push("/singleplayer/results");
  }, [router, sessionInitialized, totalRounds]);

  useEffect(() => {
    if (gameState !== "active" || !startTime) return;

    const intervalId = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      setTimeLeft(Math.max(0, ROUND_DURATION_SECONDS - elapsedSeconds));
    }, 10);

    return () => clearInterval(intervalId);
  }, [gameState, startTime]);

  const resetRound = useCallback(() => {
    setTimeLeft(ROUND_DURATION_SECONDS);
    setStartTime(0);
    clickCountRef.current = 0;
    setScore(null);
    setGameState("waiting");
  }, []);

  const finishRound = useCallback(() => {
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

  useEffect(() => {
    if (gameState !== "active") return;

    const id = setTimeout(() => {
      finishRound();
    }, ROUND_DURATION_SECONDS * 1000);

    return () => clearTimeout(id);
  }, [finishRound, gameState]);

  const startRound = () => {
    const firstClickCount = 1;

    clickCountRef.current = firstClickCount;
    setStartTime(Date.now());
    setTimeLeft(ROUND_DURATION_SECONDS);
    setScore(null);
    setGameState("active");
  };

  const handleClick = () => {
    if (gameState === "waiting") {
      startRound();
      return;
    }

    if (gameState === "active") {
      clickCountRef.current += 1;
    }
  };

  const getButtonText = () => {
    if (gameState === "waiting") return "start clicking as fast as you can!";
    if (gameState === "active") return timeLeft.toFixed(2);
    return `${score?.toFixed(2)} clicks/s`;
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

      {totalRounds > 0 && (
        <div
          style={{
            fontFamily: "var(--font-chewy)",
            fontSize: "1.5rem",
            color: "black",
          }}
        >
          Round {currentRound} of {totalRounds}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        style={{
          width: "min(100%, 70%)",
          height: "65vh",
          backgroundColor: "#B8D8E8",
          border: "none",
          borderRadius: "20px",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          color: "black",
          cursor: "pointer",
          fontFamily: "var(--font-chewy)",
          fontSize: "3rem",
          padding: "2rem",
          textAlign: "center",
          whiteSpace: "normal",
        }}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default ClickSpeedGame;
