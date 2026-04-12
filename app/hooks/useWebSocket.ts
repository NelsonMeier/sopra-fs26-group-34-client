import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs"; // to talk w server
import SockJS from "sockjs-client"; //connection to talk to server
import { getApiDomain } from "@/utils/domain";

export function useWebSocket(roomId: string, userId: string) {  //hook
  const clientRef = useRef<Client | null>(null); //store client instance
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]); //players
  const [gameStarted, setGameStarted] = useState(false); //status
  const [selectedGame, setSelectedGame] = useState<string>(""); //games

  useEffect(() => { // when page loads
    if (!roomId || !userId) return; // defensive check

    const client = new Client({ //create instance of client
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`),
      onConnect: () => {

        client.publish({
            destination: "/app/createRoom",
            body: JSON.stringify({ roomId, adminId: userId }),});
         // if connected
        client.subscribe(`/topic/room/${roomId}`, (message) => { //starts listenign to room
          const data = JSON.parse(message.body);

          if (data.type === "PLAYER_JOINED") { // if player joined
            setJoinedPlayers((prev) => [...new Set([...prev, data.username])]); }

          if (data.type === "GAME_SELECTED") { //if game selected
            setSelectedGame(data.game); }

          if (data.type === "GAME_STARTED") { // if started 
            setGameStarted(true);
            setSelectedGame(data.game); }
        });
      },
    });

    client.activate(); // activate connection
    clientRef.current = client; //save

    return () => { // if leaves 
      client.deactivate(); };
  
    }, [roomId, userId]); //rerun if changes

  const send = (destination: string, body: object) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,                //sending message to client
        body: JSON.stringify(body),
      });
    }
  };

  


  return { joinedPlayers, gameStarted, selectedGame, send };
}
