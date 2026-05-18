export interface User {
  id: string | null;
  name: string | null;
  username: string | null;
  token: string | null;
  status: string | null;
  creationDate: string | null;
  reactionTimeHighScore: number | null;
  typingSpeedHighScore: number | null;
  timeIntervalHighScore?: number | null;
  reaction?: GameRank | null;
  typing?: GameRank | null;
  timeInterval?: GameRank | null;
  aimTest?: GameRank | null;
  clickSpeed?: GameRank | null;
}

export interface GameRank {
  score: number | null;
  rank: number | null;
}
