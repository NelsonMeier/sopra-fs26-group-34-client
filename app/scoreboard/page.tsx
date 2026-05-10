"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { Button, Switch } from "antd"
import { useApi } from "@/hooks/useApi";
import { useState, useEffect } from "react";


const Scoreboard: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const { value: userId } = useLocalStorage<string>("userId", "");
    const { value: token } = useLocalStorage<string>("token", "");

    interface ScoreboardEntry {
    username: string;
    score: number | null;
    }

    interface ScoreboardResponse {
    scoreboards: {
        reactionTime: ScoreboardEntry[];
        typingSpeed: ScoreboardEntry[];
        timeInterval: ScoreboardEntry[];
        };
    }

    const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null);
    const [friendsOnly, setFriendsOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScoreboard = async () => {
            try {
                setLoading(true);
                const data = await apiService.get<ScoreboardResponse>(
                    `/scoreboard?friendsOnly=${friendsOnly}`,
                    { Authorization: `Bearer ${token}` },
                );
                setScoreboard(data);
                setError(null);
            } catch (err) {
                setError("Failed to load scoreboard");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchScoreboard();
    }, [apiService, friendsOnly, token]);


    

    return(
        <div style={{
            minHeight: '100vh', 
            display: 'flex',
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", 
            backgroundColor: '#6BAED6', 
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', 
            overflow: 'hidden', 
            outline: '3px black solid',
            outlineOffset: '-1.50px',
            position: 'relative'}}>
            <div style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", alignItems: "center", gap: "18px", color: "black", fontFamily: "var(--font-chewy)", fontSize: 22, zIndex: 10, height: "70px" }}>
                <span>Friends only</span>
                <Switch
                    checked={friendsOnly}
                    onChange={setFriendsOnly}
                    size="default"
                    style={{ transform: "scale(1.6)", backgroundColor: friendsOnly ? "#22c55e" : "#ef4444" }}
                />
            </div>
            <div style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10 }}>
                <Button className="back-button" type="primary" onClick={() => router.push(userId ? `/users/${userId}` : "/users")}>Back</Button>
            </div>
        <div data-layer="Scoreboard Page" className="Scoreboard Page" style={{width: "min(1100px, 100%)", display: "grid", gridTemplateRows: "auto auto auto", rowGap: "28px", paddingTop: "28px", paddingBottom: "24px", background: '#6BAED6'}}>
                            <div data-layer="Header" className="Header" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <div style={{
                    textAlign: 'center', 
                    justifyContent: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    color: 'black', 
                    fontSize: 64, 
                    fontFamily: 'var(--font-chewy)', 
                    fontWeight: '400', 
                    wordWrap: 'break-word'}}>Scoreboard</div>
              </div>
                            <div data-layer="Middle" className="Middle" style={{display: "grid", marginTop: "50px", rowGap: "14px"}}>
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center"}}>
                                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 36, fontFamily: 'var(--font-chewy)', fontWeight: '400', wordWrap: 'break-word'}}>Reaction Time</div>
                                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 36, fontFamily: 'var(--font-chewy)', fontWeight: '400', wordWrap: 'break-word'}}>Typing Test</div>
                                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 36, fontFamily: 'var(--font-chewy)', fontWeight: '400', wordWrap: 'break-word'}}>Time Interval</div>
                                </div>

                                <div style={{width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '40px'}}>
                                    <div style={{minHeight: '578px', background: '#ACCEDC', borderRadius: 10, padding: '35px 24px'}} >
                                        {loading && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Loading...</div>}
                                        {error && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: 'red', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Error: {error}</div>}
                                        {scoreboard && scoreboard.scoreboards.reactionTime.length === 0 && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>No records yet</div>}
                                        {scoreboard && scoreboard.scoreboards.reactionTime.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
                                                {scoreboard.scoreboards.reactionTime.map((entry, index) => (
                                                    <div key={index} style={{display: "flex", justifyContent: "space-between", color: '#2f4f5a', fontSize: 18, fontFamily: 'var(--font-chewy)', padding: "8px 12px", background: '#ffffff', borderRadius: 5}}>
                                                        <span>#{index + 1}</span>
                                                        <span>{entry.username}</span>
                                                        <span>{entry.score}ms</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{minHeight: '578px', background: '#ACCEDC', borderRadius: 10, padding: '35px 24px'}} >
                                        {loading && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Loading...</div>}
                                        {error && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: 'red', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Error: {error}</div>}
                                        {scoreboard && scoreboard.scoreboards.typingSpeed.length === 0 && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>No records yet</div>}
                                        {scoreboard && scoreboard.scoreboards.typingSpeed.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
                                                {scoreboard.scoreboards.typingSpeed.map((entry, index) => (
                                                    <div key={index} style={{display: "flex", justifyContent: "space-between", color: '#2f4f5a', fontSize: 18, fontFamily: 'var(--font-chewy)', padding: "8px 12px", background: '#ffffff', borderRadius: 5}}>
                                                        <span>#{index + 1}</span>
                                                        <span>{entry.username}</span>
                                                        <span>{entry.score} WPM</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{minHeight: '578px', background: '#ACCEDC', borderRadius: 10, padding: '35px 24px'}} >
                                        {loading && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Loading...</div>}
                                        {error && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: 'red', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Error: {error}</div>}
                                        {scoreboard && scoreboard.scoreboards.timeInterval.length === 0 && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>No records yet</div>}
                                        {scoreboard && scoreboard.scoreboards.timeInterval.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
                                                {scoreboard.scoreboards.timeInterval.map((entry, index) => (
                                                    <div key={index} style={{display: "flex", justifyContent: "space-between", color: '#2f4f5a', fontSize: 18, fontFamily: 'var(--font-chewy)', padding: "8px 12px", background: '#ffffff', borderRadius: 5}}>
                                                        <span>#{index + 1}</span>
                                                        <span>{entry.username}</span>
                                                        <span>{typeof entry.score === 'number' ? entry.score.toFixed(3) : 'N/A'}s</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
    </div>
    </div>
    );
};

export default Scoreboard;