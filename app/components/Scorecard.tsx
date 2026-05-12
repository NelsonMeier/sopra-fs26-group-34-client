"use client";

import { Button } from "antd";
import { useEffect } from "react";


const POINTS_TABLE = [3, 2, 1]; //needed for point distribution

export function calcPointsForRound( //function that takes scores and whether lower is better
  scores: Record<string, number>,
  lowerIsBetter: boolean
): Record<string, number> {

  
  const sorted = Object.entries(scores).sort(([, a], [, b]) => { // sorts players based on scores
    if (lowerIsBetter) {
      if (a === -1) return 1;   
      if (b === -1) return -1;
      return a - b;             // lower ms = better
    }
    return b - a;               // higher WPM = better
  });

  // assign points 
  const points: Record<string, number> = {};
  sorted.forEach(([player], i) => { //loops through sorted players and assigns points based on position
    points[player] = POINTS_TABLE[i] ?? 0;
  });

  return points;
}

interface ScorecardProps {
  round:            number;
  totalRounds:      number;
  scores:           Record<string, number>;   
  cumulativePoints: Record<string, number>;   
  lowerIsBetter:    boolean;                  
  scoreLabel:       string;
  scoreUnit?:       string;                   
  isAdmin:          boolean;
  hasNextGame?:     boolean;
  onNext:           () => void;
}

function rank(i: number): string { //function for rank, converting idex
  if (i === 0) return "1.";
  if (i === 1) return "2.";
  if (i === 2) return "3.";
  return `${i + 1}.`;
}

export default function Scorecard({
  round,
  totalRounds,
  scores,
  cumulativePoints,
  lowerIsBetter,
  scoreLabel,
  scoreUnit,
  isAdmin,
  hasNextGame = false,
  onNext,
}: ScorecardProps) { 
  
  const isLastRound  = round >= totalRounds && !hasNextGame; //check of finished
  
  const roundPoints  = calcPointsForRound(scores, lowerIsBetter); //calculate points
 
  const sortedByRound = Object.entries(scores).sort(([, a], [, b]) => {
    if (lowerIsBetter) {
      if (a === -1) return 1;
      if (b === -1) return -1;
      return a - b;
    }
    return b - a;
  }); //sort result
 
  const sortedByCumulative = Object.entries(cumulativePoints).sort(([, a], [, b]) => b - a); //sorts total points
 
  const formatScore = (score: number) => { //formats score for display, handling "too early" case 
    if (score === -1) return "Too early!";
    if (scoreUnit === "s" && score === 20000) return "Timed out!";
    if (scoreUnit === "s") return `${(score / 1000).toFixed(3)} s`;
    if (scoreUnit === "a") return `${score} pts`;
    if (scoreUnit === "cps") return `${score.toFixed(2)} clicks/s`;
    return lowerIsBetter ? `${score} ms` : `${score} wpm`;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#B8D8E8",
    borderRadius: "15px",
    padding: "1.5rem 2rem",
    minWidth: "280px",
    maxWidth: "400px",
    flex: 1,
    boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
  };
 
  const rowStyle = (highlight: boolean): React.CSSProperties => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0.8rem",
    backgroundColor: highlight ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.25)",
    borderRadius: "8px",
    fontFamily: "var(--font-chewy)",
    fontSize: "1.05rem",
    marginBottom: "0.4rem",
  });

  const handleFinish = () => {
    sessionStorage.setItem(
      "leaderboard",
      JSON.stringify(cumulativePoints)
    );

    onNext();
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
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.8rem",
          fontWeight: "400",
          fontFamily: "var(--font-chewy)",
          margin: 0,
          color: "black",
          textAlign: "center",
        }}
      >
        {isLastRound ? "Game Over!" : `Round ${round} / ${totalRounds} Complete`}
      </h1>
 
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        
        <div style={cardStyle}>
          <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.25rem", marginBottom: "1rem", textAlign: "center", color: "#1a1a1a" }}>
            Round {round} — {scoreLabel}
          </div>
          {sortedByRound.map(([player, score], i) => (
            <div key={player} style={rowStyle(i === 0)}>
              <span>{rank(i)}&nbsp;{player}</span>
              <span style={{ display: "flex", gap: "0.8rem" }}>
                <span>{formatScore(score)}</span>
                <span style={{ color: "#2255aa", fontWeight: "bold" }}>+{roundPoints[player] ?? 0} pts</span>
              </span>
            </div>
          ))}
        </div>
 
        
        <div style={cardStyle}>
          <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.25rem", marginBottom: "1rem", textAlign: "center", color: "#1a1a1a" }}>
            {isLastRound ? "Final Standings" : "Leaderboard"}
          </div>
          {sortedByCumulative.map(([player, pts], i) => (
            <div key={player} style={rowStyle(i === 0)}>
              <span>{rank(i)}&nbsp;{player}</span>
              <span style={{ color: "#2255aa", fontWeight: "bold" }}>{pts} pts</span>
            </div>
          ))}
        </div>
      </div>
 
      {isLastRound ? (
        <Button
          onClick={handleFinish}
          style={{
            backgroundColor: "#E8956D",
            borderRadius: "15px",
            height: "55px",
            minWidth: "200px",
            fontSize: "1.4rem",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          }}
        >
          See Final Results
        </Button>
      ) : isAdmin ? (
        <Button
          onClick={handleFinish}
          style={{
            backgroundColor: "#E8956D",
            borderRadius: "15px",
            height: "55px",
            minWidth: "200px",
            fontSize: "1.4rem",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          }}
        >
          Next Round →
        </Button>
      ) : (
        <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.3rem", color: "black", textAlign: "center" }}>
          Waiting for admin to start the next round...
        </div>
      )}
    </div>
  );
}
