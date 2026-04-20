"use client";
import { useApi } from "@/hooks/useApi";
import { useRouter, useSearchParams } from "next/navigation"; 
import { useWebSocket } from "@/hooks/useWebSocket"; 
import Scorecard, { calcPointsForRound } from "@/components/Scorecard"; 

import React, { Suspense, useEffect, useState, useRef } from "react"; 
import { Card, Button, Row, Col, Space, Statistic, Input } from "antd";
import { SingleplayerRounds } from "../reaction-time/page";

type GameState = "idle" | "waiting" | "waiting_quote" | "active" | "result" | "waiting_others" | "scorecard"; 

type Mode = "singleplayer" | "multiplayer"; //added mode type to know whch one is present

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const TypingSpeedGameInner: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const apiService = useApi();

    //read multiplayer info
    const roomIdParam   = searchParams.get("roomId")  ?? "";
    const roundsParam   = parseInt(searchParams.get("rounds")  ?? "0", 10);
    const isAdminParam  = searchParams.get("isAdmin") === "true";
    const usernameParam = searchParams.get("username") ?? "";

    const mode: Mode = roomIdParam ? "multiplayer" : "singleplayer"; 

    
    const [username, setUsername] = useState(usernameParam);
    const [userId,   setUserId  ] = useState("");

    
    useEffect(() => { //load from local storage
        if (!username) {
            const stored = localStorage.getItem("username")?.replaceAll('"', "") ?? "";
            if (stored) setUsername(stored);
        }
        setUserId(localStorage.getItem("userId")?.replaceAll('"', "") ?? "");
    }, []); 

    //websocket 
    const { send, roundStart, roundComplete, gameOver, sharedQuote, sharedQuoteRound } = useWebSocket(roomIdParam, userId, username);

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

    //multiplayer scores
    const [cumulativePoints,   setCumulativePoints  ] = useState<Record<string, number>>({});
    const [roundScoresForCard, setRoundScoresForCard] = useState<Record<string, number>>({});

    //cleanup timeouts on unmount
    useEffect(() => {
    return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [timeoutId]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (mode !== "singleplayer") { setSessionInitialized(true); return; } //skip for multiplayer

        try {
        const storedRounds = globalThis.sessionStorage.getItem("singleplayerRounds"); //load saved rounds
        if (!storedRounds) {
            setTotalRounds(0);
            setReactionRounds(0);
            setSessionInitialized(true);
            return;
        }

        const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>; //extract rounds
        const reaction = clampRounds(Number(parsed?.reactionTime ?? 0));
        const typing = clampRounds(Number(parsed?.typingSpeed ?? 0));

        setReactionRounds(reaction);
        setTotalRounds(typing);
        if (typeof window !== "undefined") {
            globalThis.sessionStorage.setItem("typingScores", JSON.stringify([]));
        }
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
            const data = await apiService.get<{ content: string }>("/api/games/quote");
            setQuote(data.content);
            setUserInput("");
            setGameState("active");
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
    
    // auto start game (singleplayer only)
    useEffect(() => {
        if (mode !== "singleplayer") return; 
        if (!sessionInitialized) return;

        if (totalRounds <= 0) {
            router.push("/singleplayer/results");
            return; // if no rounds
        }
        startGame();
    }, [sessionInitialized, totalRounds]); 

    //start multiplayer game when admin starts first round
    const sentFirstRound = useRef(false);
    useEffect(() => {
        if (mode !== "multiplayer" || !isAdminParam || sentFirstRound.current) return;
        const id = setTimeout(() => {
            send("/app/startRound", { roomId: roomIdParam, round: "1" });
            sentFirstRound.current = true;
        }, 500);
        setTimeoutId(id);
    }, [mode, isAdminParam]); 

    //round start (no qouote yet,  waiting for quote)
    useEffect(() => {
        if (mode !== "multiplayer" || !roundStart) return;
        setCurrentRound(roundStart.round);
        setUserInput("");
        setStartTime(0);
        setTimeElapsed(0);
        setGameState("waiting_quote");

        if (isAdminParam) {
            apiService
                .get<{ content: string }>("/api/games/quote") //fetches quote
                .then((data) => {
                    send("/app/broadcastQuote", {roomId: roomIdParam, quote:  data.content, round:  String(roundStart.round),});
                }) //broadquasts quote to everyone in room
                .catch(() => { //FALLBACK
                    send("/app/broadcastQuote", { roomId: roomIdParam, quote:  "The quick brown fox jumps over the lazy dog.", round:  String(roundStart.round),});
                });
        }
    }, [roundStart, mode]); 

    //everyone receives quote, start round
    useEffect(() => {
        if (mode !== "multiplayer" || !sharedQuote || gameState !== "waiting_quote") return;
        setQuote(sharedQuote);
        setUserInput("");
        setStartTime(0);
        setGameState("active");
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [sharedQuote, sharedQuoteRound, mode]); 

    //show scorecard
    useEffect(() => {
        if (mode !== "multiplayer" || !roundComplete) return;
        const pts = calcPointsForRound(roundComplete.scores, false);
        setCumulativePoints((prev) => {
            const next = { ...prev };
            for (const [player, p] of Object.entries(pts)) {
                next[player] = (next[player] ?? 0) + p;
            }
            globalThis.sessionStorage.setItem("multiplayerFinalPoints", JSON.stringify(next));
            return next;
        });
        setRoundScoresForCard(roundComplete.scores);
        setGameState("scorecard");
    }, [roundComplete, mode]); // 

    
    useEffect(() => {
        if (mode !== "multiplayer" || !gameOver || isAdminParam) return;
        const id = setTimeout(() => {
            router.push(`/multiplayer/results?roomId=${roomIdParam}`);
        }, 2000);
        setTimeoutId(id);
    }, [gameOver, mode, isAdminParam]); 

    // update timer while playing
    useEffect(() => {
        if (gameState !== "active" || !startTime) return;

        const interval = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            setTimeElapsed(elapsed);
        }, 100);

        return () => clearInterval(interval);
    }, [gameState, startTime]);

    // typing input
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInput = e.target.value;

        if (userInput.length === 0 && newInput.length > 0 && startTime === 0) {
            setStartTime(Date.now());
        }

        if (newInput.length <= quote.length && quote.startsWith(newInput)) {
            setUserInput(newInput);
            if (newInput === quote && quote.length > 0) {
                
                if (mode === "multiplayer") {
                    finishMultiplayerRound();
                } else {
                    finishRound();
                }
            }
        }
    };

    // calculate WPM and finish singleplayer round (unchanged)
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
        
        if (currentRound >= totalRounds) {
            const redirectTimeout = setTimeout(() => {
                router.push("/singleplayer/results");
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

    //submit WPM via websocket and wait for others
    const finishMultiplayerRound = () => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const wordCount = quote.trim().split(/\s+/).length;
        const wpm = Math.round((wordCount / elapsedSeconds) * 60);

        setTypingSpeed(wpm);
        setGameState("waiting_others");
        send("/app/submitScore", {
            roomId:  roomIdParam,
            username,
            round:   String(currentRound),
            score:   wpm,
        });
    };

    //admin scorecard button
    const handleScorecardNext = () => {
        const isLast = currentRound >= roundsParam;
        if (isLast) {
            globalThis.sessionStorage.setItem("multiplayerFinalPoints", JSON.stringify(cumulativePoints));
            router.push(`/multiplayer/results?roomId=${roomIdParam}`);
            return;
        }
        const nextRound = currentRound + 1;
        send("/app/startRound", { roomId: roomIdParam, round: String(nextRound) });
        setCurrentRound(nextRound);
        setGameState("idle");
    };

    //render quote with character highlighting 
    const renderQuote = () => {
        return (
        <div style={{ fontSize: "18px", lineHeight: "1.8", wordBreak: "break-word" }}>
            {quote.split("").map((char, i) => {
            let color = "white";
            if (i < userInput.length) {
                color = "black";
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

    const rounds4Display = mode === "multiplayer" ? roundsParam : totalRounds; // ← NEW

    //scorecard
    if (gameState === "scorecard") {
        return (
            <Scorecard
                round={currentRound}
                totalRounds={rounds4Display}
                scores={roundScoresForCard}
                cumulativePoints={cumulativePoints}
                lowerIsBetter={false}
                scoreLabel="Typing Speed"
                isAdmin={isAdminParam}
                onNext={handleScorecardNext}
            />
        );
    }
    
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
    {rounds4Display > 0 && ( 
    <div
        style={{
        fontFamily: "var(--font-chewy)",
        fontSize: "1.5rem",
        color: "black",
        }}
    >
        Round {currentRound} of {rounds4Display} 
    </div>
    )}

    {/* timer display */}
    {gameState === "active" && (
    <div
        style={{
        fontSize: "20px",
        fontFamily: "var(--font-chewy)",
        textAlign: "center",
        }}
    >
        Time: {timeElapsed}s
    </div>
    )}

    
    {gameState === "waiting_others" && (
    <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" }}>
        {typingSpeed} wpm — waiting for other players...
    </div>
    )}

    {/* quote display card */}
    <Card
    style={{
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#86b6cf",
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}
    bordered={false}
    >
    {gameState === "waiting" || gameState === "waiting_quote" ? (  
        <p style={{ textAlign: "center" }}>Loading quote...</p>
    ) : gameState === "result" || gameState === "waiting_others" ? ( 
        <p style={{ textAlign: "center" }}>Great job!</p>
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
        backgroundColor: "white",
        }}
    />
    )}

    {/* result display */}
    {(gameState === "result" || gameState === "waiting_others") && ( // ← NEW: added waiting_others
    <Card style={{ width: "100%", maxWidth: "600px", textAlign: "center", backgroundColor: "white" }} bordered={false}>
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


export default function TypingSpeedGame() {
    return (
        <Suspense>
            <TypingSpeedGameInner />
        </Suspense>
    );
}