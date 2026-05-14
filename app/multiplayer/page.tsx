"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "antd";
import { useApi } from "@/hooks/useApi";
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

const GAME_ROUTES: Record<string, string> = { //maps game names to their URL 
  "reaction time": "reaction-time",
  "typing test":   "typing-speed",
  "time interval": "time-interval",
  "aim test":      "aim-test",
  "click speed":   "click-speed",
};

function MultiplayerRoomInner() {
  const router = useRouter();
  const apiService = useApi();
  const searchParams = useSearchParams();

  const [userId]   = useState(() => typeof window !== "undefined" ? localStorage.getItem("userId")  ?.replaceAll('"', "") ?? "" : "");
  const [username] = useState(() => typeof window !== "undefined" ? localStorage.getItem("username")?.replaceAll('"', "") ?? "" : "");
    // roomid in URL means we're joining an existing room, no roomId means we're creating a new one 
  const roomIdFromUrl = searchParams.get("roomId");
  const isAdmin       = !roomIdFromUrl;
  const [roomId]      = useState<string>(() => roomIdFromUrl ?? uuidv4());

  const { isConnected, joinedPlayers, gameStarted, selectedGame, rounds, nextGame, send } =
    useWebSocket(roomId, userId, username);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading ] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<(string | number)[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  //clear stale session data from any previous multiplayer session
  useEffect(() => {
    globalThis.sessionStorage.removeItem("multiplayerCumulativePoints");
    globalThis.sessionStorage.removeItem("disconnectedPlayers");
    globalThis.sessionStorage.removeItem("multiplayerFinalPoints");
  }, []);

  useEffect(() => {
    if (!isConnected || !userId || !username) return;
    if (isAdmin) {
      send("/app/createRoom", { roomId, adminId: userId, adminUsername: username });
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

  useEffect(() => {
    if (!gameStarted || !selectedGame) return;
    const slug = GAME_ROUTES[selectedGame.toLowerCase()];
    if (!slug) return;
    router.push(`/games/${slug}?roomId=${roomId}&rounds=${rounds}&isAdmin=${isAdmin}`);
  }, [gameStarted, selectedGame]);

  useEffect(() => {
    if (!nextGame) return;
    const slug = GAME_ROUTES[nextGame.game.toLowerCase()];
    if (!slug) return;
    router.push(`/games/${slug}?roomId=${roomId}&rounds=${nextGame.rounds}&isAdmin=${isAdmin}`);
  }, [nextGame]);

  const toggleFriend = (id: string | number, friendUsername: string) => {
    if (!isAdmin) return;
    const idStr      = String(id);
    const isSelected = selectedFriends.includes(idStr);
    if (isSelected) {
      setSelectedFriends((prev) => prev.filter((f) => f !== idStr));
    } else {
      setSelectedFriends((prev) => [...prev, idStr]);
      send("/app/inviteRoom", { roomId, username: friendUsername, inviterName: username });
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

      <div className="back-button-anchor">
        <Link href={`/users/${userId}`}>
          <Button className="back-button" type="primary">
            Back
          </Button>
        </Link>
      </div>

      <div style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10 }}>
        <Button
          onClick={() => setShowHelp(true)}
          style={{
            backgroundColor: "#E8956D",
            border: "none",
            borderRadius: "15px",
            height: "70px",
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
            padding: "0 30px",
          }}
        >
          ?
        </Button>
      </div>

      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#B8D8E8",
              borderRadius: "20px",
              padding: "2.5rem",
              maxWidth: "520px",
              width: "90%",
              boxShadow: "0px 12px 30px rgba(0,0,0,0.3)",
              fontFamily: "var(--font-chewy)",
              color: "black",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1.2rem",
                background: "none",
                border: "none",
                fontSize: "1.8rem",
                cursor: "pointer",
                color: "black",
                fontFamily: "var(--font-chewy)",
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: "2rem", marginBottom: "1.2rem", textAlign: "center" }}>
              How Multiplayer Works
            </h2>

            <div style={{ fontSize: "1.1rem", lineHeight: "1.8", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <p><strong>1. Create or Join a Room</strong><br />
                The player who opens the multiplayer page becomes the <em>admin</em>.</p>

              <p><strong>2. Invite Friends</strong><br />
                Admins can tick friends from the invite list → they will receive an invite to join the room.</p>

              <p><strong>3. Pick Games &amp; Rounds</strong><br />
                The admin sets how many rounds to play for each game (Reaction Time / Typing Test / Time Interval / Aim Test / Click Speed). Set rounds to 0 to skip a game.</p>

              <p><strong>4. Start the Game</strong><br />
                Once everyone is in the Ready Players list, the admin hits <em>Start</em>. All players are sent to the same game simultaneously.</p>

              <p><strong>5. Scoring</strong><br />
                Each round your score is compared against the other players. After all rounds the leaderboard shows total scores. The player with the highest score is the best thinker!</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        display: "flex", 
        flexDirection: "row", 
        alignItems: "center", 
        gap: "1.5rem" }}>

        <div style={{
          backgroundColor: "#B8D8E8",
          borderRadius: "15px",
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          padding: "2rem", 
          width: "350px", 
          height: "400px",
          overflowY: "auto",
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
              Waiting for admin to pick a game...
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
                    send("/app/selectGame", { roomId, game: "Reaction Time", rounds: e.target.value, userId });
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
                    send("/app/selectGame", { roomId, game: "Typing Test", rounds: e.target.value, userId });
                  }}
                />
                Typing Test
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-chewy)" }}>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  style={{ width: "40px" }}
                  onChange={(e) => {
                    send("/app/selectGame", { roomId, game: "Time Interval", rounds: e.target.value, userId });
                  }}
                />
                Time Interval
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-chewy)" }}>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  style={{ width: "40px" }}
                  onChange={(e) => {
                    send("/app/selectGame", { roomId, game: "Aim Test", rounds: e.target.value, userId });
                  }}
                />
                Aim Test
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-chewy)" }}>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  style={{ width: "40px" }}
                  onChange={(e) => {
                    send("/app/selectGame", { roomId, game: "Click Speed", rounds: e.target.value, userId });
                  }}
                />
                Click Speed
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
            {joinedPlayers.map((player) => (
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
              if (joinedPlayers.length === 0) {
                alert("You need at least one friend to join to start!");
                return;
              }
              if (!selectedGame) {
                alert("Please select at least one game first!");
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
}

export default function MultiplayerRoom() {
  return (
    <Suspense>
      <MultiplayerRoomInner />
    </Suspense>
  );
}