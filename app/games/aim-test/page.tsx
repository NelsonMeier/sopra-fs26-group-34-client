"use client";
import React, { useCallback, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal, message } from "antd";
import type { SingleplayerRounds } from "../reaction-time/page";
import { useWebSocket } from "@/hooks/useWebSocket";
import Scorecard, { calcPointsForRound } from "@/components/Scorecard";


type GameState = "idle" | "waiting" | "ready" | "active" | "result" | "waiting_others" | "scorecard";
type Mode      = "singleplayer" | "multiplayer";


const GAME_ROUTES: Record<string, string> = {
  "reaction time": "reaction-time",
  "typing test":   "typing-speed",
  "time interval": "time-interval",
  "aim test":      "aim-test",
 "click speed":   "click-speed",
};

const clampRounds = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.trunc(value)));
};

const ROUND_DURATION = 15000;
const AUTO_START_DELAY = 7000;
const TARGET_SIZE = 70;
const AREA_WIDTH = 700;
const AREA_HEIGHT = 450;

const randomPos = () => ({
    x: TARGET_SIZE/2 + Math.random() * (AREA_WIDTH - TARGET_SIZE),
    y: TARGET_SIZE/2 + Math.random() * (AREA_HEIGHT - TARGET_SIZE),
})

function AimTestInner() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId") ?? "";
    const mode   = (roomId ? "multiplayer" : "singleplayer") as Mode;
    
    const roundsFromUrl = parseInt(searchParams.get("rounds") ?? "0", 10);
    const isAdmin = searchParams.get("isAdmin") === "true";
  
    const username = typeof window !== "undefined" ? localStorage.getItem("username")?.replaceAll('"', "") ?? "" : "";
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId")?.replaceAll('"', "") ?? "" : "";

    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // intercept back button
    useEffect(() => {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
        if (mode !== "multiplayer") return;
        setShowLeaveModal(true);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }, [userId]);

    const handleLeaveConfirm = () => {
      if (mode === "multiplayer" && !gameCompletedRef.current) {
        globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
        send("/app/playerLeft", { roomId, username, round: String(currentRound) });
      }
      gameCompletedRef.current = true;
      router.push(`/users/${userId}`);
    };

    const { send, roundStart, roundComplete, sessionEnded, nextGame } = useWebSocket(roomId || "", userId, username);
    const rounds = mode === "multiplayer" ? roundsFromUrl : 0;
    
    const processedRoundRef = useRef<number>(0);
    
    const [gameState, setGameState] = useState<GameState>("idle");
    const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [score, setScore] = useState<number | null>(null);
    const [totalRounds, setTotalRounds] = useState<number>(0);
    const [clickSpeedRounds, setClickSpeedRounds] = useState<number>(0);
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

    const [cumulativePoints, setCumulativePoints] =
        useState<Record<string, number>>(() => {
            if (typeof window === "undefined") return {};
            try {
                const s = globalThis.sessionStorage.getItem("multiplayerCumulativePoints");
                return s ? JSON.parse(s) : {};
            } catch {
                return {};
            }
        });

    const [roundScoresForCard, setRoundScoresForCard] = useState<Record<string, number>>({});
    const [disconnectedPlayers, setDisconnectedPlayers] = useState<string[]>([]);
    const gameCompletedRef = useRef(false);

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
                setClickSpeedRounds(0);
                setSessionInitialized(true);
                return;
            }
            const parsed = JSON.parse(storedRounds) as Partial<SingleplayerRounds>;
            const aimTest = clampRounds(Number(parsed?.aimTest ?? 0));
            const clickSpeed = clampRounds(Number(parsed?.clickSpeed ?? 0));

            setTotalRounds(aimTest);
            setClickSpeedRounds(clickSpeed);
            setCurrentRound(1);
            globalThis.sessionStorage.setItem("aimTestScores", JSON.stringify([]));
            setScores([]);
            setSessionInitialized(true);
        } catch {
            setTotalRounds(0);
            setClickSpeedRounds(0);
            setSessionInitialized(true);
        }
    }, []);

    const getNextRoute = useCallback(() => (
        clickSpeedRounds > 0 ? "/games/click-speed" : "/singleplayer/results"
    ), [clickSpeedRounds]);

    useEffect(() => {
        if (mode !== "singleplayer") return;
        if (!sessionInitialized) return;
        if (totalRounds <= 0) router.push(getNextRoute());
    }, [sessionInitialized, totalRounds, router, getNextRoute, mode]);

    const startRound = useCallback(() => {
        setHits(0);
        setMisses(0);
        hitsRef.current = 0;
        missesRef.current = 0;
        setTimeLeft(ROUND_DURATION);
        setTargetPos(randomPos());
        setGameState("ready");
    }, []);

    useEffect(() => {
        if (mode !== "singleplayer" || !sessionInitialized) return;
        if (totalRounds <= 0) return;
        startRound();
    }, [sessionInitialized, mode, startRound, totalRounds]);

    // multiplayer first round triggered by admin
    const sentFirstRound = useRef(false);

    // playerLeft on unmount
    useEffect(() => {
      return () => {
        if (mode !== "multiplayer") return;
        if (gameCompletedRef.current) return;
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
        send("/app/playerLeft", { roomId, username, round: String(currentRound) });
      };
    }, []);

    // session ended (admin left)
    useEffect(() => {
      if (!sessionEnded) return;
      if (isAdmin) return;
      globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
      globalThis.sessionStorage.removeItem("disconnectedPlayers");
      setTimeout(() => router.push(`/users/${userId}`), 3000);
    }, [sessionEnded]);

    useEffect(() => {
        if (mode !== "multiplayer" || !isAdmin || !roomId || sentFirstRound.current) return;

        const t = setTimeout(() => {
            send("/app/startRound", {roomId, round: String(currentRound),});
            sentFirstRound.current = true;
        }, 1000);

        return () => clearTimeout(t);
    }, [mode, isAdmin, roomId, currentRound, send]);

    // multiplayer round start
    useEffect(() => {
        if (mode !== "multiplayer" || !roundStart) return;
        setCurrentRound(roundStart.round);
        setHits(0);
        setMisses(0);
        hitsRef.current = 0;
        missesRef.current = 0;
        setScore(null);
        setTimeLeft(ROUND_DURATION);
        setTargetPos(randomPos());
        setGameState("ready");
    }, [roundStart, mode]);

    useEffect(() => {
        if (gameState !== "ready") return;
        const id = setTimeout(() => {
            setGameState((current) => current === "ready" ? "active" : current);
        }, AUTO_START_DELAY);
        return () => clearTimeout(id);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== "active") return;
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 100) {
                    clearInterval(id);
                    if (mode === "multiplayer") {
                        finishMultiplayerRound(
                        hitsRef.current,
                        missesRef.current
                        );
                    } else {
                        finishSingleplayerRound(
                        hitsRef.current,
                        missesRef.current
                        );
                    }
                    return 0;
                }
                return prev - 100;
            });
        }, 100);
        setIntervalId(id);
        return () => clearInterval(id);
    }, [gameState]);

    const finishSingleplayerRound = (finalHits: number, finalMisses: number) => {
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

    // finish multiplayer round 
    const finishMultiplayerRound = (finalHits: number, finalMisses: number) => {
        if (intervalId) clearInterval(intervalId);
        const roundScore = Math.max(0, finalHits - finalMisses);
        setScore(roundScore);
        setGameState("waiting_others");
        send("/app/submitScore", {roomId, username, round: String(currentRound), score: roundScore,});
    };

    useEffect(() => {
        if (mode !== "multiplayer" || !roundComplete) return;
        if (gameState !== "waiting_others") return;

        if (processedRoundRef.current === roundComplete.round) return;
        processedRoundRef.current = roundComplete.round;

        const pts = calcPointsForRound(roundComplete.scores, false, roundComplete.disconnected ?? []);
        
        setCumulativePoints((prev) => {
            const next = { ...prev };
            for (const [player, p] of Object.entries(pts)) {
                next[player] = (next[player] ?? 0) + p;
            }
            globalThis.sessionStorage.setItem("multiplayerCumulativePoints", JSON.stringify(next));
            return next;
        });
        setRoundScoresForCard(roundComplete.scores);
        setDisconnectedPlayers(roundComplete.disconnected ?? []);
        setGameState("scorecard");
    }, [roundComplete, mode]);

    // multiplayer handling next game
    useEffect(() => {
        if (mode !== "multiplayer" || !nextGame || isAdmin) return;
        if (gameState !== "scorecard" || currentRound < rounds) return;
        const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
        if (!slug) return;
        const t = setTimeout(() => {
            gameCompletedRef.current = true;
            router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=false`);
        }, 2000);
        return () => clearTimeout(t);
    }, [nextGame, gameState, currentRound, rounds, mode, isAdmin, router, roomId,]);

    const handleScorecardNext = () => {
        const isLast = currentRound >= rounds;
        if (isLast) {
            if (nextGame && isAdmin) {
                const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
                if (slug) {
                    gameCompletedRef.current = true;
                    router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=true`);
                    return;
                }
            }
            globalThis.sessionStorage.setItem("multiplayerFinalPoints", JSON.stringify(cumulativePoints));
      globalThis.sessionStorage.setItem("disconnectedPlayers", JSON.stringify([...disconnectedPlayers]));
            globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
            gameCompletedRef.current = true;
            router.push(`/multiplayer/results?roomId=${roomId}`);
            return;
        }
        if (!isAdmin) return;
        const nextRound = currentRound + 1;
        send("/app/startRound", {roomId, round: String(nextRound),});
        setCurrentRound(nextRound);
        setGameState("idle");
    };

    const handleHit = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();  // disable miss detection for this click
        if (gameState !== "active" && gameState !== "ready") return;
        if (gameState === "ready") setGameState("active"); //starts timer once first target is clicked
        addHit();
        setTargetPos(randomPos());
    };

    // display scorecard
    if (gameState === "scorecard") {
        return (
            <>
                <Scorecard
                    round={currentRound}
                    totalRounds={rounds}
                    scores={roundScoresForCard}
                    cumulativePoints={cumulativePoints}
                    lowerIsBetter={false}
                    scoreLabel="Aim Test"
                    scoreUnit="a"
                    isAdmin={isAdmin}
                    hasNextGame={!!nextGame}
                    disconnectedPlayers={disconnectedPlayers}
                    onNext={handleScorecardNext}
                />
      {sessionEnded && !isAdmin && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}>
            <div style={{
              backgroundColor: "#B8D8E8",
              borderRadius: "20px",
              padding: "3rem",
              textAlign: "center",
              maxWidth: "420px",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.4)",
            }}>
              <h2 style={{ fontFamily: "var(--font-chewy)", fontSize: "2rem", marginBottom: "1rem" }}>
                Oh no!
              </h2>
              <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Seems like the admin has left the game.
              </p>
              <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", color: "#555" }}>
                Redirecting you to your profile...
              </p>
            </div>
          </div>
        )}
            <Modal
              open={showLeaveModal}
              onCancel={() => setShowLeaveModal(false)}
              footer={null}
              centered
            >
              <div style={{ fontFamily: "var(--font-chewy)", textAlign: "center", padding: "1rem" }}>
                <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Leave Game?</h2>
                <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
                  {isAdmin ? "You are the admin — leaving will end the session for all players." : "Are you sure you want to leave? This will end your game session."}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <Button onClick={() => setShowLeaveModal(false)} style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}>Stay</Button>
                  <Button onClick={handleLeaveConfirm} style={{ backgroundColor: "#e55", border: "none", color: "white", fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}>Leave</Button>
                </div>
              </div>
            </Modal>
            </>
        );
    }

    // display rounds
    const displayRounds = mode === "singleplayer" ? totalRounds : rounds;
    

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

      { displayRounds > 0 && (
        <div 
        style={{ 
          fontFamily: "var(--font-chewy)", 
          fontSize: "1.5rem",
          color: "black" 
          }}
          >
          Round {currentRound} of {displayRounds}
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

       {gameState === "waiting_others" && (
        <div
          style={{
            fontFamily: "var(--font-chewy)",
            fontSize: "1.5rem",
            color: "black",
          }}
        >
          Waiting for other players...
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

        <Modal
          open={showLeaveModal}
          onCancel={() => setShowLeaveModal(false)}
          footer={null}
          centered
        >
          <div style={{ fontFamily: "var(--font-chewy)", textAlign: "center", padding: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Leave Game?</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
              {isAdmin ? "You are the admin — leaving will end the session for all players." : "Are you sure you want to leave? This will end your game session."}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <Button
                onClick={() => setShowLeaveModal(false)}
                style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}
              >
                Stay
              </Button>
              <Button
                onClick={handleLeaveConfirm}
                style={{ backgroundColor: "#e55", border: "none", color: "white", fontFamily: "var(--font-chewy)", fontSize: "1rem", height: "45px", width: "120px" }}
              >
                Leave
              </Button>
            </div>
          </div>
        </Modal>

        {sessionEnded && !isAdmin && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}>
            <div style={{
              backgroundColor: "#B8D8E8",
              borderRadius: "20px",
              padding: "3rem",
              textAlign: "center",
              maxWidth: "420px",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.4)",
            }}>
              <h2 style={{ fontFamily: "var(--font-chewy)", fontSize: "2rem", marginBottom: "1rem" }}>
                Oh no!
              </h2>
              <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Seems like the admin has left the game.
              </p>
              <p style={{ fontFamily: "var(--font-chewy)", fontSize: "1rem", color: "#555" }}>
                Redirecting you to your profile...
              </p>
            </div>
          </div>
        )}
    </div>
    );

};

export default function AimTestGame() {
  return (
    <Suspense>
      <AimTestInner />
    </Suspense>
  );
}
