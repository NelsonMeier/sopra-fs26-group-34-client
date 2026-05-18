"use client";
import React, { useCallback, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SingleplayerRounds } from "../reaction-time/page";

type GameState = "waiting" | "active" | "result";
type Mode      = "singleplayer" | "multiplayer";

const clampRounds = (value: number): number => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(99, Math.trunc(value)));
};

const ROUND_DURATION = 30;

function GenerateMathProblem() {
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let result: number;
    if (operator !== "*") {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        const a = operator === "-" ? Math.max(x, y) : x;
        const b = operator === "-" ? Math.min(x, y) : y;
        result = operator === "+" ? a + b : a - b;
        return [`${a} ${operator} ${b}`, result];
    } else {
        const a = Math.floor(Math.random() * 12) + 1;
        const b = Math.floor(Math.random() * 12) + 1;
        result = a * b;
        return [`${a} ${operator} ${b}`, result];
    }
}

const QuickMathInner: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId") ?? "";
    const mode = (roomId ? "multiplayer" : "singleplayer") as Mode;

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const netScoreRef = useRef<number>(0);

    const [gameState, setGameState] = useState<GameState>("waiting");
    const [mathProblem, setMathProblem] = useState<string>("");
    const [correctAnswer, setCorrectAnswer] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>("");
    const [netScore, setNetScore] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION);

    const [totalRounds, setTotalRounds] = useState<number>(0);
    const [currentRound, setCurrentRound] = useState<number>(0);
    const [scores, setScores] = useState<number[]>([]);
    const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => { if (timeoutId) clearTimeout(timeoutId); };
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
            const quickMath = clampRounds(Number(parsed?.quickMath ?? 0));
            setTotalRounds(quickMath);
            setCurrentRound(1);
            globalThis.sessionStorage.setItem("quickMathScores", JSON.stringify([]));
            setScores([]);
            setSessionInitialized(true);
        } catch {
            setTotalRounds(0);
            setSessionInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (mode !== "singleplayer" || !sessionInitialized) return;
        if (totalRounds <= 0) router.push("/singleplayer/results");
    }, [router, sessionInitialized, totalRounds, mode]);

    const finishRound = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGameState("result");
        const roundScore = netScoreRef.current;
        const nextScores = [...scores, roundScore];
        setScores(nextScores);
        globalThis.sessionStorage.setItem("quickMathScores", JSON.stringify(nextScores));
        const id = setTimeout(() => {
            if (currentRound >= totalRounds) {
                router.push("/singleplayer/results");
                return;
            }
            setCurrentRound((prev) => prev + 1);
            netScoreRef.current = 0;
            setNetScore(0);
            setInputValue("");
            setTimeLeft(ROUND_DURATION);
            setGameState("waiting");
        }, 2000);
        setTimeoutId(id);
    }, [currentRound, totalRounds, scores, router]);

    const startRound = useCallback(() => {
        const [problem, answer] = GenerateMathProblem();
        setMathProblem(problem as string);
        setCorrectAnswer(answer as number);
        netScoreRef.current = 0;
        setNetScore(0);
        setInputValue("");
        setTimeLeft(ROUND_DURATION);
        setGameState("active");
    }, []);

    // auto-start after 7 seconds
    useEffect(() => {
        if (gameState !== "waiting") return;
        const id = setTimeout(() => startRound(), 7000);
        return () => clearTimeout(id);
    }, [gameState, startRound]);

    useEffect(() => {
        if (gameState !== "active") return;
        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    clearInterval(id);
                    finishRound();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);
        intervalRef.current = id;
        return () => clearInterval(id);
    }, [gameState, finishRound]);

    const handleSubmitAnswer = useCallback(() => {
        if (gameState !== "active") return;
        const parsed = parseInt(inputValue, 10);
        const isCorrect = parsed === correctAnswer;
        const delta = isCorrect ? 1 : -1;
        netScoreRef.current += delta;
        setNetScore((prev) => prev + delta);
        const [newProblem, newAnswer] = GenerateMathProblem();
        setMathProblem(newProblem as string);
        setCorrectAnswer(newAnswer as number);
        setInputValue("");
    }, [gameState, inputValue, correctAnswer]);

    const displayRounds = totalRounds;
    const isActive = gameState === "active";

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
                Quick Math
            </h1>

            {displayRounds > 0 && (
                <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
                    Round {currentRound} of {displayRounds}
                </div>
            )}

            <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
                Time: {isActive ? timeLeft.toFixed(1) : ROUND_DURATION.toFixed(1)}s
            </div>

            <div
                style={{
                    fontFamily: "var(--font-chewy)",
                    fontSize: "3rem",
                    color: "black",
                    textAlign: "center",
                    minHeight: "4.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {gameState === "active" && mathProblem}
                {gameState === "result" && `${netScore} point${netScore !== 1 ? "s" : ""}`}
                {gameState === "waiting" && (
                    <button
                        onClick={startRound}
                        style={{
                            fontFamily: "var(--font-chewy)",
                            fontSize: "2rem",
                            padding: "1rem 3rem",
                            borderRadius: "15px",
                            border: "none",
                            backgroundColor: "#E8956D",
                            color: "black",
                            cursor: "pointer",
                            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
                        }}
                    >
                        Start
                    </button>
                )}
            </div>


            <input
                type="number"
                value={inputValue}
                autoFocus
                disabled={!isActive}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmitAnswer(); }}
                style={{
                    fontFamily: "var(--font-chewy)",
                    fontSize: "2rem",
                    width: "200px",
                    textAlign: "center",
                    borderRadius: "10px",
                    border: "none",
                    padding: "0.5rem",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.15)",
                    opacity: gameState === "result" ? 0 : 1,
                }}
            />

            <button
                onClick={handleSubmitAnswer}
                disabled={!isActive}
                style={{
                    fontFamily: "var(--font-chewy)",
                    fontSize: "1.5rem",
                    padding: "0.75rem 2.5rem",
                    borderRadius: "15px",
                    border: "none",
                    backgroundColor: "#E8956D",
                    color: "black",
                    cursor: isActive ? "pointer" : "default",
                    boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
                    opacity: gameState === "result" ? 0 : 1,
                }}
            >
                Submit
            </button>
        </div>
    );
};

const QuickMathGame: React.FC = () => (
    <Suspense>
        <QuickMathInner />
    </Suspense>
);

export default QuickMathGame;
