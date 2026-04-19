import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs"; // to talk w server
import SockJS from "sockjs-client"; //connection to talk to server
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
  const [roundComplete, setRoundComplete] = useState<{
    round:  number;
    scores: Record<string, number>;
  } | null>(null);
  const [nextRoundSignal, setNextRoundSignal] = useState<number>(0);


  const [incomingInvite, setIncomingInvite] = useState<{
    roomId: string;
    inviterName: string;
  } | null>(null);

  useEffect(() => { // when page loads
    if (!roomId || !userId) return; // defensive check

    const client = new Client({ //create instance of client
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to the shared room topic
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const data = JSON.parse(message.body);

          if (data.type === "PLAYER_JOINED") { // if player joined
            setJoinedPlayers((prev) => [...new Set([...prev, data.username])]);
          }
          
          if (data.type === "ROOM_STATE") { // if room state update
            setJoinedPlayers(data.players ?? []);
          }
          if (data.type === "GAME_SELECTED") { //if game selected
            setSelectedGame(data.game);
            setRounds(parseInt(data.rounds as string, 10) || 0);
          }
          if (data.type === "GAME_STARTED") { // if started 
            setGameStarted(true);
            setSelectedGame(data.game);
            setRounds(parseInt(data.rounds as string, 10) || 0);
          }

          if (data.type === "QUOTE_BROADCAST") {
            setSharedQuote(data.quote as string);
            setSharedQuoteRound(parseInt(data.round as string, 10) || 1);
          }

          if (data.type === "SCORE_SUBMITTED") {
            setSubmittedInRound((prev) => [...new Set([...prev, data.username as string])]); //adds user to list of submitted players for the round
          }

          if (data.type === "ROUND_COMPLETE") {
              setRoundComplete({
              round:  parseInt(data.round as string, 10), //stores round 
              scores: data.scores as Record<string, number>, //stores scores
            });
            setSubmittedInRound([]); //reset for next round
          }

        if (data.type === "NEXT_ROUND") {
            setRoundComplete(null); //clear scorecard
            setNextRoundSignal((prev) => prev + 1);
          }
});


        // subscribe to personal invite topic 
        client.subscribe(`/topic/invite/${username}`, (message) => {
          const data = JSON.parse(message.body);
          if (data.type === "PLAYER_INVITED") {
            setIncomingInvite({ roomId: data.roomId, inviterName: data.inviterName });
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
  send,
  incomingInvite,
  setIncomingInvite,
};

}