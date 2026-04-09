"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";

type GameState = "idle" | "waiting" | "active" | "result";

const ReactionTime: React.FC = () => {
  const router = useRouter();
  const { value: userId } = useLocalStorage<string>("userId", "");

  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const startGame = () => {
    setGameState("waiting");

    // Random delay between 2-6 seconds
    const delay = Math.random() * 4000 + 2000;
    const id = setTimeout(() => {
      setGameState("active");
      setStartTime(Date.now());
    }, delay);

    setTimeoutId(id);
  };

  const handleClick = () => {
    if (gameState === "idle" || gameState === "result") {
      startGame();
    } 
    else if (gameState === "waiting") {
        setReactionTime(-1);
        setGameState("result");
    } else if (gameState === "active") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState("result");
    }

  };

  const getButtonText = () => {
    if (gameState === "idle") return "Click to start";
    if (gameState === "waiting") return "Wait...";
    if (gameState === "active") return "CLICK!";
    if (gameState === "result"){
        if (reactionTime === -1) return "Too early!\n\nTap to try again";
    } return `${reactionTime}ms\n\nTap to try again`;
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
      }}
    >
      <Link href={`/singleplayer`} style={{ position: "absolute", top: "3rem", left: "3rem" }}>
        <Button
          style={{
            backgroundColor: "#E8956D",
            borderColor: "#E8956D",
            borderRadius: "20px",
            height: "75px",
            fontSize: "1.8rem",
            padding: "0 30px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          }}
          type="primary"
        >
          Back to Games
        </Button>
      </Link>

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
        {getButtonText()}
      </button>
    </div>
  );
};

export default ReactionTime;

