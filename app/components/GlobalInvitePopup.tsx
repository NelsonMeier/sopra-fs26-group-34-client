"use client";

import { useInviteContext } from "@/context/WebSocketContext";
import { useRouter } from "next/navigation";

export default function GlobalInvitePopup() {
  const { invite, clearInvite } = useInviteContext();
  const router = useRouter();

  if (!invite) return null;

  return (
    <>
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 999
      }} />

      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#B8D8E8",
        padding: "2rem",
        borderRadius: "20px",
        zIndex: 1000,
        textAlign: "center",
      }}>
        <div style={{
            fontFamily: "var(--font-chewy)",
            marginBottom: "1.5rem",
            fontSize: "1.25rem"}}
            >
          {invite.inviterName} invites you to play!
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>

          <button
            onClick={() => {
              const username = localStorage.getItem("username")?.replaceAll('"', '');

              clearInvite();

              router.push(`/multiplayer?roomId=${invite.roomId}`);
            }}
            style={{
                backgroundColor: "#8BC34A",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontFamily: "var(--font-chewy)",
                cursor: "pointer",
                fontSize: "1rem"
            }}
            >
            Accept
          </button>

          <button
            onClick={() => clearInvite()}
            style={{
                backgroundColor: "#E57373",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontFamily: "var(--font-chewy)",
                cursor: "pointer",
                fontSize: "1rem"
            }}
            >
            Decline
          </button>

        </div>
      </div>
    </>
  );
}