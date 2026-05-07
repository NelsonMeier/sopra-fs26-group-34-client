"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";


type GameState = "idle" | "waiting" | "ready" | "active" | "result" | "waiting_others" | "scorecard";
type Mode      = "singleplayer" | "multiplayer";

export interface SingleplayerRounds {
  reactionTime: number;
  typingSpeed:  number;
  timeInterval: number;
  aimTest: number;
}

const GAME_ROUTES: Record<string, string> = {
  "reaction time": "reaction-time",
  "typing test":   "typing-speed",
  "time interval": "time-interval",
  "aim test":      "aim-test",
};

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const ROUND_DURATION = 15000;
const TARGET_SIZE = 70;
const AREA_WIDTH = 700;
const AREA_HEIGHT = 450;

const randomPos = () => ({
    x: TARGET_SIZE/2 + Math.random() * (AREA_WIDTH - TARGET_SIZE),
    y: TARGET_SIZE/2 + Math.random() * (AREA_HEIGHT - TARGET_SIZE),
})

const AimTestGame: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId") ?? "";
    const mode   = (roomId ? "multiplayer" : "singleplayer") as Mode;

    
    const [gameState, setGameState] = useState<GameState>("idle");
    const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [score, setScore] = useState<number | null>(null);
    const [totalRounds, setTotalRounds] = useState<number>(0);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [scores, setScores] = useState<number[]>([]);
    const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const [hits, setHits] = useState<number>(0);
    const [misses, setMisses] = useState<number>(0);
    const hitsRef   = React.useRef(0);
    const missesRef = React.useRef(0);
    const [flashRed, setFlashRed] = useState<boolean>(false);
    const addHit  = () => { hitsRef.current  += 1; setHits(hitsRef.current); };
    const addMiss = () => { 
        missesRef.current += 1; 
        setMisses(missesRef.current);
        setFlashRed(true);
        setTimeout(() => setFlashRed(false), 100);
     };
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION);

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
            const aimTest = clampRounds(Number(parsed?.aimTest ?? 0));

            setTotalRounds(aimTest);
            setCurrentRound(1);
            globalThis.sessionStorage.setItem("aimTestScores", JSON.stringify([]));
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

    const startRound = () => {
        setHits(0);
        setMisses(0);
        hitsRef.current = 0;
        missesRef.current = 0;
        setTimeLeft(ROUND_DURATION);
        setTargetPos(randomPos());
        setGameState("ready");
    };

    useEffect(() => {
        if (mode !== "singleplayer" || !sessionInitialized) return;
        startRound();
    }, [sessionInitialized]);

    useEffect(() => {
        if (gameState !== "active") return;
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 100) {
                    clearInterval(id);
                    finishRound(hitsRef.current, missesRef.current);
                    return 0;
                }
                return prev - 100;
            });
        }, 100);
        setIntervalId(id);
        return () => clearInterval(id);
    }, [gameState]);

    const getNextRoute = () => {
        try {
            const stored = globalThis.sessionStorage.getItem("singleplayerRounds");
            const parsed = stored ? JSON.parse(stored) : {};
            if (clampRounds(Number(parsed?.reactionTime)) > 0) return "/games/reaction-time";
            if (clampRounds(Number(parsed?.typingSpeed))  > 0) return "/games/typing-speed";
            if (clampRounds(Number(parsed?.timeInterval)) > 0) return "/games/time-interval";
        } catch { /**/ }
        return "/singleplayer/results";
        };

    const finishRound = (finalHits: number, finalMisses: number) => {
        if (intervalId) clearInterval(intervalId);
        const roundScore = Math.max(0, finalHits - finalMisses);
        setScore(roundScore);
        const nextScores = [...scores, roundScore];
        setScores(nextScores);
        setGameState("result");

        if (typeof window !== "undefined") {
            globalThis.sessionStorage.setItem("aimTestScores", JSON.stringify(nextScores));
        }

        setTimeout(() => {
            if (currentRound >= totalRounds) {
            router.push(getNextRoute());
            } else {
            setCurrentRound(r => r + 1);
            startRound();
            }
        }, 1500);

    };

        const handleHit = (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();  // disable miss detection for this click
            if (gameState !== "active" && gameState !== "ready") return;
            if (gameState === "ready") setGameState("active"); //starts timer once first target is clicked
            addHit();
            setTargetPos(randomPos());
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
        Aim Test
      </h1>

      { totalRounds > 0 && (
        <div 
        style={{ 
          fontFamily: "var(--font-chewy)", 
          fontSize: "1.5rem",
          color: "black" 
          }}
          >
          Round {currentRound} of {totalRounds}
        </div>
      )}

      {(gameState === "active" || gameState === "ready") && (
        <div 
        style={{ 
          fontSize: "20px",
          fontFamily: "var(--font-chewy)",
           textAlign: "center" 
           }}
           >
          Time: {timeLeft / 1000}s
        </div>
      )}

        <div
        onClick={() => { 
            if (gameState === "active" || gameState === "ready") addMiss();

         }}
        style={{ position: "relative", 
            width: AREA_WIDTH, 
            height: AREA_HEIGHT,
            background: "#86b6cf", 
            borderRadius: 16, 
            overflow: "hidden",
            cursor: "crosshair", 
            boxShadow: "0px 8px 10px rgba(0,0,0,0.3)" }}
        >
            <div style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: flashRed ? "rgba(255,0,0,0.5)" : "transparent",
                transition: "background-color 0.1s ease"

            }}>
        {(gameState === "active" || gameState === "ready") && (
            <div onClick={handleHit} style={{
            position: "absolute",
            left: targetPos.x, top: targetPos.y,
            width: TARGET_SIZE, height: TARGET_SIZE,
            borderRadius: "50%",
            background: "#E8956D",
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
            }} />
        )}
        {gameState === "result" && (
            <div style={{ 
                position: "absolute", 
                inset: 0, display: "flex",
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "var(--font-chewy)", 
                fontSize: "3rem", color: "white",
                flexDirection: "column"
                 }}>
            <span>Hits: {hits} | Misses: {misses} </span>
            <span>Score: {score}</span>
            </div>
        )}
        </div>
        </div>
    </div>
    );

};

export default AimTestGame;
