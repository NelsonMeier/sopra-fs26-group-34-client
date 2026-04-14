"use client";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";

import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Row, Col, Space, Statistic, Input } from "antd";

interface SingleplayerRounds {
    reactionTime: number;
    typingSpeed: number;
}

type GameState = "idle" | "waiting" | "active" | "result";

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const TypingSpeedGame: React.FC = () => {
    const router = useRouter();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [gameState, setGameState] = useState<GameState>("idle");
    const [quote, setQuote] = useState<string>("");
    const [userInput, setUserInput] = useState<string>("");

    const [typingSpeed, setTypingSpeed] = useState<number>(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const [totalRounds, setTotalRounds] = useState<number>(0);
    const [reactionRounds, setReactionRounds] = useState<number>(0);
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
            setTotalRounds(0);
            setReactionRounds(0);
            setSessionInitialized(true);
            return;
        }

        const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
        const reaction = clampRounds(Number(parsed?.reactionTime ?? 0));
        const typing = clampRounds(Number(parsed?.typingSpeed ?? 0));

        setReactionRounds(reaction);
        setTotalRounds(typing);
    globalThis.sessionStorage.setItem("typingScores", JSON.stringify([]));
        setScores([]);
        setCurrentRound(1);
        setSessionInitialized(true);
        } catch (error) {
        setTotalRounds(0);
        setReactionRounds(0);
        setSessionInitialized(true);
        }
    }, []);

    // Get quote from API
    const fetchQuote = async () => {
        try {
            const response = await fetch("https://api.quotable.io/random?minLength=100&maxLength=300");
            const data = await response.json();
            setQuote(data.content);
            setUserInput("");
            setGameState("active");
            setStartTime(Date.now());
            setTimeout(() => inputRef.current?.focus(), 0);

        } catch (error) {
            alert("Failed to fetch quote. Please try again.");
        }
    };

    const startGame = () => {
        setGameState("waiting");
        const id = setTimeout(() => {
            fetchQuote();
        }, 500);
        setTimeoutId(id);
    };
    
    //auto start game
    useEffect(() => {
        if (!sessionInitialized) return;

        if (totalRounds <= 0) {
            router.push("/singleplayer/results");
            return;
        }
        startGame();
}, [sessionInitialized, totalRounds]);

    // update timer while playing
    useEffect(() => {
        if (gameState !== "active" || !startTime) return;

        const interval = setInterval(() => {
            const elapsed = Math.round ((Date.now() - startTime) / 1000);
            setTimeElapsed(elapsed);
        }, 100);

        return () => clearInterval(interval);
    }, [gameState, startTime]);

    //typing input
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInput = e.target.value;

        //only allow if it matches the letters of quote
        if (newInput.length <= quote.length && quote.startsWith(newInput)) {
            setUserInput(newInput);
        // if completed
        if (newInput === quote && quote.length > 0) {
            finishRound();
        }
        }
    };

    //calculate WPM and finish round
    const finishRound = () => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const wordCount = quote.trim().split(/\s+/).length;
        const wpm = Math.round((wordCount / elapsedSeconds) * 60);

        setTypingSpeed(wpm);
        setGameState("result");

        const nextScores = [...scores, wpm];
        setScores(nextScores);
        if (typeof window !== "undefined") {
            globalThis.sessionStorage.setItem("typingScores", JSON.stringify(nextScores));
        }
        
        //prepare next round or finish game
        if (currentRound >= totalRounds) {
            const redirectTimeout = setTimeout(() => {
                if (reactionRounds > 0) {
                    router.push("/games/reaction-time");
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

    // render quote with character highlighting 
    const renderQuote = () => {
        return (
        <div style={{ fontSize: "18px", lineHeight: "1.8", wordBreak: "break-word" }}>
            {quote.split("").map((char, i) => {
            let color = "#999"; // untyped - gray
            if (i < userInput.length) {
                color = "#22c55e"; // typed - green
            }
            return (
                <span key={i} style={{ color }}>
                {char}
                </span>
            );
            })}
        </div>
        );
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
    {/* title */}
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
    Typing Test
    </h1>

    {/* round counter */}
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

    {/* stats row */}
    {gameState === "active" && (
    <Row
        gutter={[32, 16]}
        justify="center"
        style={{ width: "100%", maxWidth: "600px" }}
    >
        <Col xs={12} sm={12}>
        <Statistic
            title="Time"
            value={timeElapsed}
            suffix="s"
            valueStyle={{ color: "#1890ff", fontSize: "24px" }}
        />
        </Col>
    </Row>
    )}

    {/* quote display card */}
    <Card
    style={{
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#f5f5f5",
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}
    bordered={false}
    >
    {gameState === "waiting" ? (
        <p style={{ color: "#999", textAlign: "center" }}>Loading quote...</p>
    ) : gameState === "result" ? (
        <p style={{ color: "#999", textAlign: "center" }}>Great job!</p>
    ) : (
        renderQuote()
    )}
    </Card>

    {/* input textarea */}
    {gameState === "active" && (
    <Input.TextArea
        value={userInput}
        onChange={handleInputChange}
        placeholder="Start typing here..."
        autoFocus
        style={{
        width: "100%",
        maxWidth: "600px",
        height: "120px",
        fontSize: "16px",
        }}
    />
    )}

    {/* result display */}
    {gameState === "result" && (
    <Card style={{ width: "100%", maxWidth: "600px", textAlign: "center" }}>
        <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24}>
            <Statistic
            title="WPM"
            value={typingSpeed}
            valueStyle={{ color: "#22c55e", fontSize: "28px" }}
            />
        </Col>
        </Row>
    </Card>
    )}
</div>
);
};

export default TypingSpeedGame;


