"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, message } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";

interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed: number;
  timeInterval: number;
  aimTest: number;
  clickSpeed: number;
  quickMath: number;
}

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const SingleplayerRoom: React.FC = () => {
  const router = useRouter();

  const { value: userId } = useLocalStorage<string>("userId", "");

  const [rounds, setRounds] = useState<SingleplayerRounds>({
    reactionTime: 0,
    typingSpeed: 0,
    timeInterval: 0,
    aimTest: 0,
    clickSpeed: 0,
    quickMath: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedRounds = globalThis.sessionStorage.getItem("singleplayerRounds");
      if (!storedRounds) return;

      const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
      setRounds({
        reactionTime: clampRounds(Number(parsed?.reactionTime ?? 0)),
        typingSpeed: clampRounds(Number(parsed?.typingSpeed ?? 0)),
        timeInterval: clampRounds(Number(parsed?.timeInterval ?? 0)),
        aimTest: clampRounds(Number(parsed?.aimTest ?? 0)),
        clickSpeed: clampRounds(Number(parsed?.clickSpeed ?? 0)),
        quickMath: clampRounds(Number(parsed?.quickMath ?? 0)),
      });
    } catch {
      setRounds({ reactionTime: 0, typingSpeed: 0, timeInterval: 0, aimTest: 0, clickSpeed: 0, quickMath: 0 });
    }
  }, []);

  const reactionTimeRounds = clampRounds(rounds?.reactionTime ?? 0);
  const typingSpeedRounds = clampRounds(rounds?.typingSpeed ?? 0);
  const timeIntervalRounds = clampRounds(rounds?.timeInterval ?? 0);
  const aimTestRounds = clampRounds(rounds?.aimTest ?? 0);
  const clickSpeedRounds = clampRounds(rounds?.clickSpeed ?? 0);
  const quickMathRounds = clampRounds(rounds?.quickMath ?? 0);

  const updateRounds = (key: keyof SingleplayerRounds, rawValue: string): void => {
    const nextValue = rawValue === "" ? 0 : clampRounds(Number(rawValue));
    const nextRounds = {
      ...rounds,
      [key]: nextValue,
    };
    setRounds(nextRounds);

    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("singleplayerRounds", JSON.stringify(nextRounds));
    }
  };

  const handleStart = (): void => {
    if (
      reactionTimeRounds <= 0 &&
      typingSpeedRounds <= 0 &&
      timeIntervalRounds <= 0 &&
      aimTestRounds <= 0 &&
      clickSpeedRounds <= 0 &&
      quickMathRounds <= 0
    ) {
      message.error("Please enter rounds for at least one game.");
      return;
    }

    // Clear previous scores
    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("reactionScores", JSON.stringify([]));
      globalThis.sessionStorage.setItem("typingScores", JSON.stringify([]));
      globalThis.sessionStorage.setItem("timeIntervalScores", JSON.stringify([]));
      globalThis.sessionStorage.setItem("aimTestScores", JSON.stringify([]));
      globalThis.sessionStorage.setItem("clickSpeedScores", JSON.stringify([]));
      globalThis.sessionStorage.setItem("quickMathScores", JSON.stringify([]));
    }

    if (reactionTimeRounds > 0) {
      router.push("/games/reaction-time");
      return;
    }

    if (typingSpeedRounds > 0) {
      router.push("/games/typing-speed");
      return;
    }

    if (timeIntervalRounds > 0) {
      router.push("/games/time-interval");
      return;
    }

    if (aimTestRounds > 0) {
      router.push("/games/aim-test");
      return;
    }

    if (clickSpeedRounds > 0) {
      router.push("/games/click-speed");
      return;
    }

    router.push("/games/quick-math");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      gap: "2rem"
    }}>
      
    <h1 style={{
      fontSize: "3.5rem",
      fontWeight: "400",
      fontFamily: "var(--font-chewy)",
      margin: 0,
      color: "black",
      marginBottom: "2rem"
    }}>
      Games (Singleplayer)
    </h1>

    <div className="back-button-anchor">
      <Link href={`/users/${userId}`}>
        <Button
          className="back-button"
          type="primary">
            Back
        </Button>
      </Link>
    </div>

    <div style={{
      display: "flex",
      justifyContent: "center",
      width: "100%"
    }}>
      <div style={{
        backgroundColor: "#B8D8E8",
        borderRadius: "15px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        width: "350px",
        height: "450px"}}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "#000000",
          fontFamily: "var(--font-chewy)"
        }}>
          Games:
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "2rem" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            fontFamily: "var(--font-chewy)" }}>
            <input
              type="number" 
              min="0" 
              max="99"
              value={reactionTimeRounds}
              style={{ width: "40px" }}
              onChange={(e) => updateRounds("reactionTime", e.target.value)}
            />
            Reaction Time
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            fontFamily: "var(--font-chewy)" }}>
            <input
              type="number" 
              min="0" 
              max="99"
              value={typingSpeedRounds}
              style={{ width: "40px" }}
              onChange={(e) => updateRounds("typingSpeed", e.target.value)}
            />
            Typing Speed
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-chewy)" }}>
            <input
              type="number"
              min="0"
              max="99"
              value={timeIntervalRounds}
              style={{ width: "40px" }}
              onChange={(e) => updateRounds("timeInterval", e.target.value)}
            />
            Time Interval
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-chewy)" }}>
            <input
              type="number"
              min="0"
              max="99"
              value={aimTestRounds}
              style={{ width: "40px" }}
              onChange={(e) => updateRounds("aimTest", e.target.value)}
            />
            Aim Test
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-chewy)" }}>
            <input
              type="number"
              min="0"
              max="99"
              value={clickSpeedRounds}
              style={{ width: "40px" }}
              onChange={(e) => updateRounds("clickSpeed", e.target.value)}
            />
            Click Speed
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-chewy)" }}>
            <input
              type="number"
              min="0"
              max="99"
              value={quickMathRounds}
              style={{ width: "40px" }}
              onChange={(e) => updateRounds("quickMath", e.target.value)}
            />
            Quick Math
          </div>
        </div>
      </div>
    </div>

  
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      marginTop: "2rem"
      }}>
        <Button
          onClick={handleStart}
          style={{
            marginTop: "2rem",
            backgroundColor: "#E8956D",
            borderRadius: "15px",
            height: "55px",
            width: "150px",
            fontSize: "1.4rem",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"
          }}>
          Start
        </Button>
    </div>
    </div>
  );
};

export default SingleplayerRoom;
