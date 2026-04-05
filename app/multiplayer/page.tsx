"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

const MultiplayerRoom: React.FC = () => {
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [friendId, setFriendId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleRoundInput = async () => {
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      gap: "2rem"
    }}>
      
     <h1 style={{
        fontSize: "3.5rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        color: "black",
        marginBottom: "2rem"
     }}>
        Games (Multiplayer)
     </h1>

      <div style={{
        position: "absolute",
        right: "200px",
        top: "100px",
        display: "flex",
        gap: "1rem",
        alignItems: "center"
      }}>
        
        <Link href={`/users/${userId}`}>
          <Button
            style={{
              backgroundColor: "#E8956D",
              borderColor: "#E8956D",
              borderRadius: "15px",
              height: "55px",
              fontSize: "1.4rem",
              padding: "0 30px",
              fontWeight: "bold",
              color: "black",
              fontFamily: "var(--font-chewy)",
              border: "none",
              boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"}}
            type="primary">
            Back
          </Button>
        </Link>
      </div>

    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "1.5rem"
    }}>
      <div style={{
        backgroundColor: "#B8D8E8",
        borderRadius: "15px",
        padding: "2rem",
        width: "100%",
        minWidth: "350px",
        minHeight: "400px"}}>
             <div style={{
            display: "flex",
            justifyContent: "center",
            height: "300px",
            fontSize: "1.5rem",
            color: "#000000",
            fontFamily: "var(--font-chewy)"
          }}>
            Games:
          </div>
      </div>

      <div style={{
        backgroundColor: "#B8D8E8",
        borderRadius: "15px",
        padding: "2rem",
        width: "100%",
        minWidth: "350px",
        minHeight: "400px"}}>
           <div style={{
            display: "flex",
            justifyContent: "center",
            height: "300px",
            fontSize: "1.5rem",
            color: "#000000",
            fontFamily: "var(--font-chewy)"
          }}>
            Invite Friends:
          </div>
      </div>

      <div style={{
        backgroundColor: "#B8D8E8",
        borderRadius: "15px",
        padding: "2rem",
        width: "100%",
        minWidth: "350px",
        minHeight: "400px"}}>
             <div style={{
            display: "flex",
            justifyContent: "center",
            height: "300px",
            fontSize: "1.5rem",
            color: "#000000",
            fontFamily: "var(--font-chewy)"
          }}>
            Ready Players:
          </div>
      </div>
    
      </div>

    </div>
  );
};

export default MultiplayerRoom;