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
  invite: Invite | null; //what we share w all pages when invite 
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

  // reads username from localStorage
  useEffect(() => {
    const syncUsername = () => {
      const stored = localStorage.getItem("username")?.replaceAll('"', '');
      console.log("[InviteContext] syncUsername called, found:", stored);
      if (stored) setUsername(stored);
    };

    syncUsername();
    window.addEventListener("username-set", syncUsername);
    return () => window.removeEventListener("username-set", syncUsername);
  }, []);

  useEffect(() => {
    console.log("[InviteContext] username state is now:", username);
    if (!username) return;

    console.log("[InviteContext] Connecting WS, will listen on /topic/invite/" + username);

    const client = new Client({
      webSocketFactory: () => new SockJS(`${getApiDomain()}/ws`), // new connection to endpoin
      onConnect: () => {
        console.log("[InviteContext] Connected! Subscribed to /topic/invite/" + username);
        client.subscribe(`/topic/invite/${username}`, (message) => { //subscribe to personal invite topic
          console.log("[InviteContext] Message received:", message.body); 
          const data = JSON.parse(message.body); // when meessage received, parse it
          if (data.type === "PLAYER_INVITED") { // if invite received, set invite state to show pop up
            console.log("[InviteContext] Showing invite popup from:", data.inviterName);
            setInvite({ roomId: data.roomId, inviterName: data.inviterName });
          }
        });
      },
      onDisconnect: () => console.log("[InviteContext] Disconnected"),
      onStompError: (frame) => console.error("[InviteContext] STOMP error:", frame),
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