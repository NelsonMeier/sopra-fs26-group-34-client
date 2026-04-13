"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "@/utils/domain";
import GlobalInvitePopup from "@/components/GlobalInvitePopup";

interface Invite {
  roomId: string;
  inviterName: string; //how does invite look like 
}

interface WebSocketContextType {
  invite: Invite | null;     //what we share w all pages when invite 
  clearInvite: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({ //creates instance w null first
  invite: null,
  clearInvite: () => {},
});

export function WebSocketContextProvider({ children }: { children: React.ReactNode }) { // to wrap whole app so pop up can show up everyhwerw
  const [invite, setInvite] = useState<Invite | null>(null);
  const clientRef = useRef<Client | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("username")?.replaceAll('"', '');
    if (stored) setUsername(stored);
  }, []);

  useEffect(() => {
    if (!username) 
        return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`), // new connection to endpoint
      onConnect: () => {
        client.subscribe(`/topic/invite/${username}`, (message) => {
          const data = JSON.parse(message.body);
          if (data.type === "PLAYER_INVITED") { // if invite received, set invite state to show pop up
            setInvite({ roomId: data.roomId, inviterName: data.inviterName });
          }
        });
      },
    });

    client.activate(); //activate 
    clientRef.current = client; // starts connection

    return () => { client.deactivate(); };
  }, [username]);

  const clearInvite = () => setInvite(null); // to clear invite after accepting or declining, so pop up disappears

  return ( //so pop up can be shown anywhere in app when invite received
    <WebSocketContext.Provider value={{ invite, clearInvite }}>
      {children}
      <GlobalInvitePopup /> 
    </WebSocketContext.Provider>
  );
}

export function useInviteContext() {
  return useContext(WebSocketContext); // for hooks
}