"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { Button, Carousel, Switch } from "antd"
import type { CarouselRef } from "antd/es/carousel";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { useState, useEffect, useRef } from "react";


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
        aimTest: ScoreboardEntry[];
        };
    }

    const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null);
    const [friendsOnly, setFriendsOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const carouselRef = useRef<CarouselRef | null>(null);

    const scoreboardCards = [
        {
            key: "reactionTime",
            title: "Reaction Time",
            entries: scoreboard?.scoreboards.reactionTime ?? [],
            formatScore: (score: number | null) =>
                score === null || score === undefined ? "N/A" : `${score}ms`,
        },
        {
            key: "typingSpeed",
            title: "Typing Test",
            entries: scoreboard?.scoreboards.typingSpeed ?? [],
            formatScore: (score: number | null) =>
                score === null || score === undefined ? "N/A" : `${score} WPM`,
        },
        {
            key: "timeInterval",
            title: "Time Interval",
            entries: scoreboard?.scoreboards.timeInterval ?? [],
            formatScore: (score: number | null) =>
                score === null || score === undefined ? "N/A" : `${score.toFixed(3)}s`,
        },
        {
            key: "aimTest",
            title: "Aim Test",
            entries: scoreboard?.scoreboards.aimTest ?? [],
            formatScore: (score: number | null) =>
                score === null || score === undefined ? "N/A" : `${score} pts`,
        },
    ];

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
        <div data-layer="Scoreboard Page" className="Scoreboard Page" style={{width: "min(1450px, 100%)", display: "grid", gridTemplateRows: "auto auto auto", rowGap: "28px", paddingTop: "28px", paddingBottom: "24px", background: '#6BAED6'}}>
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
                                <div style={{display: "grid", gridTemplateColumns: "48px 1fr 48px", alignItems: "center", columnGap: "16px"}}>
                                    <Button
                                        aria-label="Previous scoreboards"
                                        onClick={() => carouselRef.current?.prev()}
                                        shape="circle"
                                        style={{ height: 48, width: 48 }}
                                    >
                                        <LeftOutlined />
                                    </Button>
                                    <div style={{ width: "100%", overflow: "hidden" }}>
                                        <Carousel
                                            ref={carouselRef}
                                            dots={false}
                                            slidesToShow={3}
                                            slidesToScroll={1}
                                            responsive={[
                                                { breakpoint: 1200, settings: { slidesToShow: 2 } },
                                                { breakpoint: 900, settings: { slidesToShow: 1 } },
                                            ]}
                                        >
                                            {scoreboardCards.map((card) => (
                                                <div key={card.key} style={{ padding: "0 8px", boxSizing: "border-box" }}>
                                                <div style={{ maxWidth: 420, margin: "0 auto" }}>
                                                <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 36, fontFamily: 'var(--font-chewy)', fontWeight: '400', wordWrap: 'break-word', marginBottom: 14}}>
                                                    {card.title}
                                                </div>
                                                <div style={{minHeight: '578px', background: '#ACCEDC', borderRadius: 10, padding: '35px 24px'}}>
                                                    {loading && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Loading...</div>}
                                                    {error && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: 'red', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>Error: {error}</div>}
                                                    {!loading && !error && card.entries.length === 0 && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 20, fontFamily: 'var(--font-chewy)'}}>No records yet</div>}
                                                    {!loading && !error && card.entries.length > 0 && (
                                                        <div style={{ display: "flex", flexDirection: "column", rowGap: "12px" }}>
                                                            {card.entries.map((entry, index) => (
                                                                <div key={`${card.key}-${index}`} style={{display: "flex", justifyContent: "space-between", color: '#2f4f5a', fontSize: 18, fontFamily: 'var(--font-chewy)', padding: "8px 12px", background: '#ffffff', borderRadius: 5}}>
                                                                    <span>#{index + 1}</span>
                                                                    <span>{entry.username}</span>
                                                                    <span>{card.formatScore(entry.score)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                </div>
                                            </div>
                                            ))}
                                        </Carousel>
                                    </div>
                                    <Button
                                        aria-label="Next scoreboards"
                                        onClick={() => carouselRef.current?.next()}
                                        shape="circle"
                                        style={{ height: 48, width: 48 }}
                                    >
                                        <RightOutlined />
                                    </Button>
                                </div>
                            </div>
    </div>
    </div>
    );
};

export default Scoreboard;