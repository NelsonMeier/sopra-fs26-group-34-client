"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useWebSocket } from "@/hooks/useWebSocket";

interface Friend { //Defines what a friend object looks like
  id: string | number;
  name: string;
  username: string;
  status: string;
  creationDate: string;
}

const MultiplayerRoom: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const searchParams = useSearchParams();

  const { value: userId } = useLocalStorage<string>("userId", "");
  const { value: username } = useLocalStorage<string>("username", "");

  // roomid in URL means we're joining an existing room, no roomId means we're creating a new one 
  const roomIdFromUrl = searchParams.get("roomId");
  const isAdmin = !roomIdFromUrl;
  const [roomId] = useState<string>(() => roomIdFromUrl ?? uuidv4());

  const { isConnected, joinedPlayers, gameStarted, selectedGame, send } =
    useWebSocket(roomId, userId, username);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<(string | number)[]>([]);

  // once the WebSocket is connected, either create the room (admin) or join it 
  useEffect(() => {
    if (!isConnected || !userId || !username) return;

    if (isAdmin) {
      send("/app/createRoom", { roomId, adminId: userId });
    } else {
      send("/app/joinRoom", { roomId, username });
    }
  }, [isConnected, userId, username]);

  // fetch friend list (only needed for admin who can send invites)
  useEffect(() => {
    if (!userId || !isAdmin) return;

    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const fetchedFriends = await apiService.get<Friend[]>(`/users/${userId}/friends`);
        setFriends(fetchedFriends);
      } catch (error) {
        console.error("Could not load friends:", error);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchFriends();
  }, [userId, isAdmin]);

  // redirect everyone to the game once the admin starts it
  useEffect(() => {
    if (gameStarted && selectedGame) {
      router.push(`/game/${selectedGame.toLowerCase().replace(" ", "-")}?roomId=${roomId}`);
    }
  }, [gameStarted, selectedGame]);

  const toggleFriend = (id: string | number, friendUsername: string) => {
    if (!isAdmin) return;
    const idStr = String(id);
    const isSelected = selectedFriends.includes(idStr);

    if (isSelected) {
      setSelectedFriends((prev) => prev.filter((f) => f !== idStr));
    } else {
      setSelectedFriends((prev) => [...prev, idStr]);
      send("/app/inviteRoom", {
        roomId,
        username: friendUsername,
        inviterName: username,
      });
    }
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
          <Button style={{
            backgroundColor: "#E8956D",
            borderRadius: "15px",
            height: "55px",
            fontSize: "1.4rem",
            padding: "0 30px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"
          }} type="primary">
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          width: "350px",
          height: "400px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#000000",
            fontFamily: "var(--font-chewy)"
          }}>
            Games:
          </div>

          
          {!isAdmin && (
            <div style={{
              marginTop: "2rem",
              fontFamily: "var(--font-chewy)",
              fontSize: "1.1rem",
              color: "#444",
              textAlign: "center"
            }}>
              {selectedGame
                ? `Selected: ${selectedGame}`
                : "Waiting for admin to pick a game..."}
            </div>
          )}

         
          {isAdmin && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "2rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-chewy)" }}>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  style={{ width: "40px" }}
                  onChange={(e) => {
                    const rounds = e.target.value;
                    if (parseInt(rounds) > 0) {
                      send("/app/selectGame", { roomId, game: "Reaction Time", rounds, userId });
                    }
                  }}
                />
                Reaction Time
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-chewy)" }}>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  style={{ width: "40px" }}
                  onChange={(e) => {
                    const rounds = e.target.value;
                    if (parseInt(rounds) > 0) {
                      send("/app/selectGame", { roomId, game: "Typing Test", rounds, userId });
                    }
                  }}
                />
                Typing Test
              </div>
            </div>
          )}
        </div>

        
        <div style={{
          backgroundColor: "#B8D8E8",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          width: "350px",
          height: "400px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#000000",
            fontFamily: "var(--font-chewy)"
          }}>
            {isAdmin ? "Invite Friends:" : "Room Info:"}
          </div>

          {!isAdmin ? (
            <div style={{
              marginTop: "2rem",
              fontFamily: "var(--font-chewy)",
              fontSize: "1.1rem",
              color: "#444",
              textAlign: "center"
            }}>
              You have joined the room.<br />
              Waiting for the admin to start the game...
            </div>
          ) : (
            <div style={{
              width: "100%",
              maxHeight: "250px",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              overflowY: "auto",
              marginTop: "2rem",
              alignItems: "center"
            }}>
              {friendsLoading ? (
                <div style={{ fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "#666" }}>
                  Loading...
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => {
                  const isSelected = selectedFriends.includes(String(friend.id));
                  return (
                    <div
                      key={friend.id}
                      style={{
                        width: "70%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontFamily: "var(--font-chewy)"
                      }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFriend(friend.id, friend.username)}
                      />
                      {friend.username}
                    </div>
                  );
                })
              ) : (
                <div style={{
                  fontFamily: "var(--font-chewy)",
                  fontSize: "1.2rem",
                  color: "#666",
                  marginTop: "2rem"
                }}>
                  No friends yet
                </div>
              )}
            </div>
          )}
        </div>

        
        <div style={{
          backgroundColor: "#B8D8E8",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          width: "350px",
          height: "400px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#000000",
            fontFamily: "var(--font-chewy)"
          }}>
            Ready Players:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "2rem" }}>
            {[...new Set([...(username ? [username] : []), ...joinedPlayers])].map((player) => (
              <div key={player} style={{ fontFamily: "var(--font-chewy)" }}>
                {player}{player === username ? " (you)" : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      
      {isAdmin && (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <Button
            onClick={() => {
              if (!selectedGame) {
                alert("Please select a game first!");
                return;
              }
              send("/app/startGame", { roomId });
            }}
            style={{
              marginTop: "2rem",
              backgroundColor: "#E8956D",
              borderRadius: "15px",
              height: "55px",
              width: "150px",
              fontSize: "1.4rem",
              fontWeight: "bold",
              color: "black",
              fontFamily: "var(--font-chewy)",
              border: "none",
              boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"
            }}>
            Start
          </Button>
        </div>
      )}
    </div>
  );
};

export default MultiplayerRoom;