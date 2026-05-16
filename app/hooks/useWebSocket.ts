import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "@/utils/domain";

export function useWebSocket(roomId: string, userId: string, username: string) { //hook
  const clientRef = useRef<Client | null>(null); //store client instance
  const [isConnected, setIsConnected] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]); //players
  const [gameStarted, setGameStarted] = useState(false); //status
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [rounds, setRounds] = useState<number>(0);//game rounds

  const [sharedQuote,      setSharedQuote     ] = useState<string | null>(null);
  const [sharedQuoteRound, setSharedQuoteRound] = useState<number>(0);
  const [submittedInRound, setSubmittedInRound] = useState<string[]>([]);

  const [roundStart, setRoundStart] = useState<{
    startAt: number;
    round: number;
  } | null>(null);

  const [roundComplete, setRoundComplete] = useState<{
    round:  number;
    scores: Record<string, number>;
    totalScores: Record<string, number>;
    disconnected: string[];
  } | null>(null);

  const [nextRoundSignal, setNextRoundSignal] = useState<number>(0);

  const [gameOver, setGameOver] = useState<{
    finalScores: Record<string, number>;
  } | null>(null);

  const [sessionEnded, setSessionEnded] = useState(false);

  const [nextGame, setNextGame] = useState<{
    game:   string;
    rounds: number;
  } | null>(null);

  useEffect(() => { // when page loads
    if (!roomId || !userId) return; // defensive check

    const client = new Client({ //create instance of client
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setIsConnected(true);
        // Subscribe to the shared room topic
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
         
          if (data.type === "ROOM_STATE") { // if room state update
            setJoinedPlayers(data.players ?? []);
          }
          if (data.type === "GAME_SELECTED") { //if game selected
            setSelectedGame(data.game);
            setRounds(parseInt(data.rounds as string, 10) || 0);
          }
          if (data.type === "GAME_STARTED") { //if game started
            setGameStarted(true);
            setSelectedGame(data.game);
            setRounds(parseInt(data.rounds as string, 10) || 0);
          }
          if (data.type === "NEXT_GAME") { 
            setNextGame({
              game:   data.game as string,
              rounds: parseInt(data.rounds as string, 10) || 0,
            });
            setSelectedGame(data.game as string);
            setRounds(parseInt(data.rounds as string, 10) || 0);
          }
          if (data.type === "QUOTE_BROADCAST") {
            setSharedQuote(data.quote as string);
            setSharedQuoteRound(parseInt(data.round as string, 10) || 1);
          }
          if (data.type === "SCORE_SUBMITTED") {
            setSubmittedInRound((prev) => [...new Set([...prev, data.username as string])]);
          }
          if (data.type === "ROUND_COMPLETE") {
            setRoundComplete({
              round:        parseInt(data.round as string, 10),
              scores:       data.scores       as Record<string, number>,
              totalScores:  data.totalScores  as Record<string, number>,
              disconnected: (data.disconnected as string[]) ?? [],
            });
            setSubmittedInRound([]); //reset for next round
          }
          if (data.type === "ROUND_START") {
            setRoundStart({
              startAt: Number(data.startAt),
              round:   parseInt(data.round as string, 10) || 1,
            });
          }
          if (data.type === "GAME_OVER") {
            setGameOver({
              finalScores: data.finalScores as Record<string, number>,
            });
          }
          if (data.type === "SESSION_ENDED") {
            setSessionEnded(true);
          }
        });
      },
      onDisconnect: () => setIsConnected(false),
    });

    client.activate(); // activate connection
    clientRef.current = client; //save

    return () => { // if leaves
      setIsConnected(false);
      client.deactivate();
    };
  }, [roomId, userId]); //rerun if changes

  const send = (destination: string, body: object) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,                //sending message to client
        body: JSON.stringify(body),
      });
    }
  };

  return {
    isConnected,
    joinedPlayers,
    gameStarted,
    selectedGame,
    rounds,
    sharedQuote,
    sharedQuoteRound,
    submittedInRound,
    roundComplete,
    nextRoundSignal,
    roundStart,
    gameOver,
    sessionEnded,
    nextGame,
    send,
  };
}