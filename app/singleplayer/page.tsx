"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, message } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";

interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed: number;
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
      });
    } catch {
      setRounds({ reactionTime: 0, typingSpeed: 0 });
    }
  }, []);

  const reactionTimeRounds = clampRounds(rounds?.reactionTime ?? 0);
  const typingSpeedRounds = clampRounds(rounds?.typingSpeed ?? 0);

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
    if (reactionTimeRounds <= 0 && typingSpeedRounds <= 0) {
      message.error("Please enter rounds for at least one game.");
      return;
    }

    // Clear previous scores
    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("reactionScores", JSON.stringify([]));
      globalThis.sessionStorage.setItem("typingScores", JSON.stringify([]));
    }

    if (reactionTimeRounds > 0) {
      router.push("/games/reaction-time");
      return;
    }

    router.push("/games/typing-speed");
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

    <div style={{
      position: "absolute",
      right: "200px",
      top: "100px",
      display: "flex",
      gap: "1rem",
      alignItems: "center"
      }}>
      <Link href={`/users/${userId}`}>
        <Button
          style={{
            backgroundColor: "#E8956D",
            borderColor: "#E8956D",
            borderRadius: "15px",
            height: "55px",
            fontSize: "1.4rem",
            padding: "0 30px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"}}
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
        height: "400px"}}>
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