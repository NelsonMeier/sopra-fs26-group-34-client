"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "antd";
import type { SingleplayerRounds } from "../reaction-time/page";
import { useRouter } from "next/navigation";

type GameState = "waiting" | "active" | "result";

const createGoalTime = (): number => Number((Math.random() * 5 + 5).toFixed(1));

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const TimeIntervalGame: React.FC = () => {
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>("waiting");
  const [goalTime, setGoalTime] = useState<number>(5.0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);

  useEffect(() => {
    setGoalTime(createGoalTime());
  }, []);

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
  }, []);

  useEffect(() => {
    if (!sessionInitialized) return;
    if (totalRounds <= 0) router.push("/singleplayer/results");
  }, [sessionInitialized, totalRounds, router]);

  useEffect(() => {
    if (gameState !== "active" || !startTime) return;

    const intervalId = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 10);

    return () => clearInterval(intervalId);
  }, [gameState, startTime]);

  const resetRound = useCallback(() => { //useCallback prevents the function from being reloaded every render, which would mess up the useEffect dependencies
    setGoalTime(createGoalTime());
    setElapsedTime(0);
    setStartTime(0);
    setScore(null);
    setGameState("waiting");
  }, []);

  const startRound = useCallback(() => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(null);
    setGameState("active");
  }, []);

  useEffect(() => {
    if (!sessionInitialized || totalRounds <= 0 || gameState !== "waiting") return;

    const id = setTimeout(() => {
      startRound();
    }, 10000);

    return () => clearTimeout(id);
  }, [gameState, sessionInitialized, startRound, totalRounds]);

  const finishRound = useCallback((forcedScore?: number) => { //forcedScore is set to -1 when the player doesn't click after 20s, if not it's undefined (by optional chaining)
    const finalElapsedTime = (Date.now() - startTime) / 1000;
    const roundScore = forcedScore ?? Math.abs(goalTime - finalElapsedTime);
    const nextScores = [...scores, roundScore];

    setElapsedTime(forcedScore === -1 ? 20 : finalElapsedTime);
    setScore(roundScore);
    setScores(nextScores);
    setGameState("result");

    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("timeIntervalScores", JSON.stringify(nextScores));
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
  }, [currentRound, goalTime, resetRound, router, scores, startTime, totalRounds]);

  useEffect(() => {
    if (gameState !== "active") return;

    const id = setTimeout(() => {
      finishRound(-1);
    }, 20000);

    return () => clearTimeout(id);
  }, [finishRound, gameState]);

  const handleButtonClick = () => {
    if (gameState === "waiting") {
      startRound();
      return;
    }

    if (gameState === "active") finishRound();
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
        Time Interval
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
            {score === -1 ? "you're way off!" : `You were ${score?.toFixed(3)}s off!`}
          </div>
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
};

export default TimeIntervalGame;
