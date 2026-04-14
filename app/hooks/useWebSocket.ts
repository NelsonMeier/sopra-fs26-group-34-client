import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs"; // to talk w server
import SockJS from "sockjs-client"; //connection to talk to server
import { getApiDomain } from "@/utils/domain";

export function useWebSocket(roomId: string, userId: string, username: string) { //hook
  const clientRef = useRef<Client | null>(null); //store client instance
  const [isConnected, setIsConnected] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]); //players
  const [gameStarted, setGameStarted] = useState(false); //status
  const [selectedGame, setSelectedGame] = useState<string>(""); //games
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
          }
          if (data.type === "GAME_STARTED") { // if started 
            setGameStarted(true);
            setSelectedGame(data.game);
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
    send,
    incomingInvite,
    setIncomingInvite,
  };
}