"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";

type GameState = "idle" | "waiting" | "active" | "result" | "waiting_others";

type Mode = "singleplayer" | "multiplayer"

export interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed: number;
}

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const ReactionTime: React.FC = () => {
  const router = useRouter();
  const params = useParams();

  const roomId = params?.roomID as string | undefined;
  const username =
    typeof window !== "undefined"
      ? sessionStorage.getItem("username") ?? ""
      : "";
  const userId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("userId") ?? ""
      : "";

  const {send, roundComplete, roundStart, rounds} = useWebSocket(roomId ?? "", userId, username);

  const mode: Mode = roomId ? "multiplayer" : "singleplayer";

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

  //initializing singleplayer
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

  // singleplayer round
  const startSingleplayerRound = () => {
    setGameState("waiting");

    const delay = Math.random() * 4000 + 2000;
    const id = setTimeout(() => {
      setGameState("active");
      setStartTime(Date.now());
    }, delay);

    setTimeoutId(id);
  };

  // singleplayer start game
  useEffect(() => {
    if (mode !== "singleplayer") return;
    if (!sessionInitialized) return;
    
    if (reactionRounds <= 0) {
      if (typingRounds > 0) {
        router.push("/games/typing-speed");
      } else {
        router.push("/singleplayer/results");
      }
      return;
    }
    startSingleplayerRound();
  }, [sessionInitialized, mode]);

  // multiplayer start game
  useEffect(() => {
    if (mode !== "multiplayer") return;
    if (!roundStart) return;

    setGameState("waiting");

    const delay = roundStart.startAt - Date.now();

    const t = setTimeout(() => {
      setGameState("active");
      setStartTime(roundStart.startAt);
    }, Math.max(0, delay));

    return () => clearTimeout(t);
  }, [roundStart, mode]);

  useEffect(() => {
    if (mode !== "multiplayer") return;
    if (!roundComplete || !rounds) return;

    const isGameFinished = roundComplete.round >= rounds;

    if (isGameFinished) {
      router.push("/multiplayer/results");
    }
  }, [roundComplete, rounds, mode, router]);

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
      startSingleplayerRound();
    }, 1000);
    setTimeoutId(nextRoundTimeout);
  };

  const handleClick = () => {
    if (mode === "singleplayer") {
      handleSingleplayerClick();
    } else {
      handleMultiplayerClick();
    }
  };

  const handleSingleplayerClick = () => {
    if (gameState === "waiting") {
      if (timeoutId) clearTimeout(timeoutId);
      finishSingleplayerRound(-1);
    } else if (gameState === "active") {
      const time = Date.now() - startTime;
      finishSingleplayerRound(time);
    }
  };

  const finishMultiplayerRound = (score: number) => {
    if (mode !== "multiplayer") return;
    if (!roomId) return;

    send("/app/submitScore", {
      roomId,
      username,
      round: String(currentRound),
      score,
    });

    setReactionTime(score);
    setGameState("waiting_others");
  };

  const handleMultiplayerClick = () => {
    if (!roomId) return;

    if (gameState === "waiting") {
      finishMultiplayerRound(-1);
      return;
    }

    if (gameState === "active") {
      const reaction = Date.now() - startTime;
      finishMultiplayerRound(reaction);
      return;
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

