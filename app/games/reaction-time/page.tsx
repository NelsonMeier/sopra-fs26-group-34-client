"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type GameState = "idle" | "waiting" | "active" | "result";

interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed: number;
}

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const ReactionTime: React.FC = () => {
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [reactionRounds, setReactionRounds] = useState<number>(0);
  const [typingRounds, setTypingRounds] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);

  // Cleanup timeouts on unmount
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
  }, []);

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

  useEffect(() => {
    if (!sessionInitialized) return;

    if (reactionRounds <= 0) {
      if (typingRounds > 0) {
        router.push("/games/typing-speed");
      } else {
        router.push("/singleplayer/results");
      }
      return;
    }

    startGame();
  }, [sessionInitialized, reactionRounds, typingRounds]);

  const finishRound = (score: number) => {
    setReactionTime(score);
    setGameState("result");

    const nextScores = [...scores, score];
    setScores(nextScores);
    if (typeof window !== "undefined") {
      globalThis.sessionStorage.setItem("reactionScores", JSON.stringify(nextScores));
    }

    if (currentRound >= reactionRounds) {
      const redirectTimeout = setTimeout(() => {
        if (typingRounds > 0) {
          router.push("/games/typing-speed");
        } else {
          router.push("/singleplayer/results");
        }
      }, 1000);
      setTimeoutId(redirectTimeout);
      return;
    }

    const nextRoundTimeout = setTimeout(() => {
      setCurrentRound((prev) => prev + 1);
      startGame();
    }, 1000);
    setTimeoutId(nextRoundTimeout);
  };

  const handleClick = () => {
    if (gameState === "waiting") {
      if (timeoutId) clearTimeout(timeoutId);
      finishRound(-1);
    } else if (gameState === "active") {
      const time = Date.now() - startTime;
      finishRound(time);
    }
  };

  const getButtonText = () => {
    if (gameState === "idle") return "Get ready...";
    if (gameState === "waiting") return "Wait...";
    if (gameState === "active") return "CLICK!";
    if (gameState === "result") {
      if (reactionTime === -1) return "Too early!";
    }
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
      }}
    >
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

      {reactionRounds > 0 && (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
          Round {currentRound} of {reactionRounds}
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
        {getButtonText()}
      </button>
    </div>
  );
};

export default ReactionTime;

