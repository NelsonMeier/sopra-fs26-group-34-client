"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useParams, useRouter } from "next/navigation";

interface Friend {  //Defines what a friend object looks like
  id: string | number;
  name: string;
  username: string;
  status: string;
  creationDate: string;
}

const MultiplayerRoom: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const { value: userId } = useLocalStorage<string>("userId", "");

  const params = useParams();
  const id = params.id;
  const [friendId, setFriendId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<(string | number)[]>([]);

  const toggleFriend = (id: string | number) => {
    const idStr = String(id); // convert to string
    setSelectedFriends((prev) =>
    prev.includes(idStr)
      ? prev.filter((f) => f !== idStr)
      : [...prev, idStr]
    );
  };

  const handleRoundInput = async () => { // need to implement this
  };

  useEffect(() => {
      if (!id) return;
      
      const fetchFriends = async () => {  // Gets friend list
        setFriendsLoading(true);
        try {
          const fetchedFriends = await apiService.get<Friend[]>(`/users/${id}/friends`);
          setFriends(fetchedFriends);
        } catch (error) {
          console.error("Could not load friends:", error);
        } finally {
          setFriendsLoading(false);
        }
      };
      
      fetchFriends();
    }, [id, apiService]);

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
          <div style={{
            width: "100%",
            maxHeight: "250px",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            overflowY: "auto",
            marginTop: "1rem",
            alignItems: "center"
          }}
        >
          {friendsLoading ? (
            <div style={{
              position: "absolute",
              top: "55%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: "var(--font-chewy)",
              fontSize: "1.2rem",
              color: "#666",
              textAlign: "center",
            }}>
            Loading...
            </div>
          ) : friends.length > 0 ? (
            friends.map((friend) => {
              const isSelected = selectedFriends.includes(String(friend.id));

              return (
                <div
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  style={{
                    width: "90%",
                    padding: "0.8rem",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "#E8956D" : "#B8D8E8",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontFamily: "var(--font-chewy)",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.15)",
                    transition: "0.2s"
                  }}
                >
                  {friend.username}
                </div>
              );
            })
          ) : (
            <div
              style={{
                position: "absolute",
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                fontSize: "1.2rem",
                color: "#666",
                fontFamily: "var(--font-chewy)"
              }}>
              No friends yet
            </div>
          )}
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