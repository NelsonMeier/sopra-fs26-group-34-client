"use client";


const POINTS_TABLE = [3, 2, 1]; //needed for point distribution

export function calcPointsForRound( //function that takes scores and whether lower is better
  scores: Record<string, number>,
  lowerIsBetter: boolean
): Record<string, number> {

  
  const sorted = Object.entries(scores).sort(([, a], [, b]) => { // sorts players based on scores
    if (lowerIsBetter) {
      if (a === -1) return 1;   // too early → last
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
  isAdmin:          boolean;
  onNext:           () => void;
}


export default function Scorecard({
  round,
  totalRounds,
  scores,
  cumulativePoints,
  lowerIsBetter,
  scoreLabel,
  isAdmin,
  onNext,
}: ScorecardProps) {}


