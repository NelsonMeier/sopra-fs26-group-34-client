"use client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { ApplicationError } from "@/types/error";
import Password from "antd/es/input/Password";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "antd";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import {Modal, Form, Button, message} from "antd"

interface Friend {  //Defines what a friend object looks like
  id: string | number;
  name: string;
  username: string;
  status: string;
  creationDate: string;
}

interface FriendRequest {
  id: number;
  sender: {
    id: number;
    username: string;
    name: string;
  };
  status: string;
}

interface FormFieldProps {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

    const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
    const { id } = useParams();
    const [user, setUser] = useState<User | null>(null);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendRequestCount, setFriendRequestCount] = useState(0);
    const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);
    const [isDeletingFriend, setIsDeletingFriend] = useState(false);

    const [modalVisibility, setModalVisibility] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
    const storedToken = localStorage.getItem("token"); //authetication checks
    if (!storedToken) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!id || !token || !apiService) return; //userdata if not stop execution

    const fetchUser = async () => {
  try {
    const userData: User = await apiService.get<User>(`/users/${id}`, {
      Authorization: `Bearer ${token}`,
    });
    setUser(userData);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const appError = error as ApplicationError;
      if (appError.status === 401) {
        message.error("You do not have permission to access this profile.");
        const ownUserId = localStorage.getItem("userId");
        if (ownUserId && ownUserId !== String(id)) {
          router.push(`/users/${ownUserId}`);
        }
      } else {
        message.error(`Error: ${error.message}`);
        try {
          const userId = localStorage.getItem("userId");
          const logoutToken = localStorage.getItem("token")?.replace(/^"|"$/g, "");
          if (userId && logoutToken) {
            await apiService.post(`/logout/${userId}`, {}, { Authorization: `Bearer ${logoutToken}` });
          }
        } catch {
          console.error("Logout error during session reset");
        } finally {
          clearToken();
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
          router.push("/login");
        }
      }
    } else {
      message.error("An unknown error occurred while fetching user data.");
      try {
        const userId = localStorage.getItem("userId");
        const logoutToken = localStorage.getItem("token")?.replace(/^"|"$/g, "");
        if (userId && logoutToken) {
          await apiService.post(`/logout/${userId}`, {}, { Authorization: `Bearer ${logoutToken}` });
        }
      } catch {
        console.error("Logout error during session reset");
      } finally {
        clearToken();
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        router.push("/login");
      }
    }
  }
};

    fetchUser();

  }, [id, token, apiService, router]);

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

    // Fetch friend requests to display count on button
    useEffect(() => {
      if (!id || !apiService) return;

      const fetchRequests = async () => {
        try {
          const data = await apiService.get<FriendRequest[]>(
            `/users/${id}/friends/requests`
          );

          setFriendRequestCount(data.length);
        } catch (error) {
          console.error("Failed to fetch friend requests", error);
        }
      };

      fetchRequests();
    }, [id, apiService]);

    const handleChangePassword = () => {
      setModalVisibility(true);
    };

    const handleCancelPasswordChange = () => {
    setModalVisibility(false);
    form.resetFields();
  };

  const handleSubmit = async (values: FormFieldProps) => {
    setLoading(true)
    try{
      if (values.newPassword !== values.confirmPassword) {
        message.warning("New and confirming passwords don't match!")
        setLoading(false);
        return;
      }
      if (values.oldPassword == values.newPassword) {
        message.warning("New password must be different from old password")
        setLoading(false);
        return;
      }
      if (!values.newPassword || values.newPassword == "") {
        message.warning("New password can't be empty")
        setLoading(false);
        return;
      }

    const currentToken = token;

    await apiService.put(`/users/${id}`, 
      {password: values.newPassword}, 
      {Authorization: `Bearer ${currentToken}`});
    
    message.success("Password changed successfully!");
    setModalVisibility(false);
    form.resetFields();
    await handleLogout();    
    
  }
    catch (error) {
        if (error instanceof Error) {
        alert(`Unable to change password: \n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleLogout = async (): Promise<void> => { //async func that returns nothing
  try {
  const userId = localStorage.getItem("userId"); //get userid
  const token = localStorage.getItem("token")?.replace(/^"|"$/g, "");  //get token and strip from ""

if (userId && token) { //check that both r here
  await apiService.post(`/logout/${userId}`, {}, { //call backend post
    Authorization: `Bearer ${token}`,
  });
}

    clearToken(); //remove token
    localStorage.removeItem("userId");
    localStorage.removeItem("username"); //remove id
    router.push("/login"); //reroute to start aka login

  } catch (error) {
    console.error("Logout error:", error); //if not work
  }
};

    const handleDeleteFriend = async () => {
      if (!friendToDelete) return;
      setIsDeletingFriend(true);
      try {
        await apiService.delete(`/users/${id}/friends/${friendToDelete.id}`);
        setFriends((prev) => prev.filter((f) => f.id !== friendToDelete.id));
        setFriendToDelete(null);
        message.success(`${friendToDelete.username} removed from friends`);
      } catch {
        message.error("Failed to remove friend. Please try again.");
      } finally {
        setIsDeletingFriend(false);
      }
    };

    const handleAddFriend = () => {
      router.push("/add-friend");
    };

    const handleFriendRequests = () => {
      router.push("/friend-requests");
    };

    const handleSingleplayer = () => {  
      router.push("/singleplayer");
    };

    const handleMultiplayer = () => {
      router.push("/multiplayer");
    };

    const handleScoreboard = () => {
      router.push("/scoreboard");
    };

    const formatRankLine = (
      label: string,
      score: number | null | undefined,
      rank: number | null | undefined,
      unit: string,
    ) => {
      if (score == null) {
        return `${label} — No score yet`;
      }
      const rankLabel = rank != null ? `#${rank}` : "#?";
      const formattedScore = unit === "s" ? score.toFixed(3) : score;
      return `${label} ${rankLabel} — ${formattedScore} ${unit}`;
    };

  const cardStyle: React.CSSProperties = {
    background: "#b8d4e8",
    borderRadius: 20,
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  };

  const cardTitleStyle: React.CSSProperties = {
    textAlign: "center",
    color: "black",
    fontSize: 28,
    fontFamily: "var(--font-chewy)",
    fontWeight: "400",
    borderBottom: "2px solid rgba(0,0,0,0.2)",
    paddingBottom: "10px",
    marginBottom: "4px",
  };

  const labelStyle: React.CSSProperties = {
    textAlign: "center",
    color: "black",
    fontSize: 20,
    fontFamily: "var(--font-chewy)",
    fontWeight: "400",
    whiteSpace: "nowrap",
  };

  const valueBoxStyle: React.CSSProperties = {
    background: "#d6e9f5",
    borderRadius: 10,
    padding: "6px 12px",
    minHeight: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "black",
    fontSize: 20,
    fontFamily: "var(--font-chewy)",
    fontWeight: "400",
    wordWrap: "break-word",
    flex: 1,
  };

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    columnGap: "12px",
    alignItems: "center",
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#6BAED6", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 48px 0", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", outline: "3px black solid", outlineOffset: "-1.50px" }}>

  
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "220px 1fr 260px", alignItems: "center", columnGap: "24px", padding: "24px 40px", background: "#6BAED6", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
        <Button
          data-layer="Logout"
          className="Logout back-button"
          type="primary"
          style={{ width: "200px" }}
          onClick={handleLogout}>
            Logout
        </Button>

        <div style={{ textAlign: "center", color: "black", fontFamily: "var(--font-chewy)", fontWeight: "400" }}>
          <div style={{ fontSize: 56 }}>User Profile</div>
          <div style={{ fontSize: 28 }}>Welcome, {user?.username || "..."}!</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {id && id === String(id) ? (
            <Button
              data-layer="Change Password"
              className="ChangePassword back-button"
              type="primary"
              style={{ width: "240px" }}
              onClick={handleChangePassword}>
                Change Password
            </Button>
          ) : <div style={{ width: "240px" }} />}
        </div>
      </div>

   
      <div style={{ width: "min(1300px, 100%)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", columnGap: "32px", padding: "0 40px", alignItems: "stretch" }}>


        <div style={{ ...cardStyle, justifyContent: "space-between" }}>
          <div>
            <div style={cardTitleStyle}>About you</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>

              <div style={rowStyle}>
                <div style={labelStyle}>Username:</div>
                <div style={{ ...valueBoxStyle, minHeight: "56px", fontSize: 22 }}>
                  {user?.username || "Loading..."}
                </div>
              </div>

              <div style={rowStyle}>
                <div style={labelStyle}>Member Since:</div>
                <div style={{ ...valueBoxStyle, minHeight: "56px", fontSize: 22 }}>
                  {user?.creationDate || "Loading..."}
                </div>
              </div>

            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "28px" }}>
            <div style={{ ...labelStyle, textAlign: "left", fontSize: 22 }}>Rankings:</div>
            <div style={{ ...valueBoxStyle, flexDirection: "column", alignItems: "flex-start", minHeight: "180px", fontSize: 19, gap: "8px", padding: "16px" }}>
              <div>{formatRankLine("Reaction Time", user?.reaction?.score ?? null, user?.reaction?.rank ?? null, "ms")}</div>
              <div>{formatRankLine("Typing Speed", user?.typing?.score ?? null, user?.typing?.rank ?? null, "wpm")}</div>
              <div>{formatRankLine("Time Interval", user?.timeInterval?.score ?? null, user?.timeInterval?.rank ?? null, "s")}</div>
              <div>{formatRankLine("Aim Test", user?.aimTest?.score ?? null, user?.aimTest?.rank ?? null, "hits")}</div>
              <div>{formatRankLine("Click Speed", user?.clickSpeed?.score ?? null, user?.clickSpeed?.rank ?? null, "c/s")}</div>
            </div>
          </div>
        </div>

   
        <div style={{ ...cardStyle, justifyContent: "space-between" }}>
          <div>
            <div style={cardTitleStyle}>Friends</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "24px" }}>

              <Button
                data-layer="add Friend"
                className="AddFriend back-button"
                type="primary"
                style={{ width: "100%", height: "52px", fontSize: 20, fontFamily: "var(--font-chewy)" }}
                onClick={handleAddFriend}>
                  + Add Friend
              </Button>

              <Badge count={friendRequestCount} showZero={false}>
                <Button
                  data-layer="Friend Requests"
                  className="FriendRequests back-button"
                  type="primary"
                  style={{ width: "100%", height: "52px", fontSize: 20, fontFamily: "var(--font-chewy)" }}
                  onClick={handleFriendRequests}>
                    Friend Requests
                </Button>
              </Badge>

            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "28px", flex: 1 }}>
            <div style={{ ...labelStyle, textAlign: "left", fontSize: 22 }}>Friends List:</div>
            <div style={{ ...valueBoxStyle, flexDirection: "column", alignItems: "flex-start", minHeight: "200px", flex: 1, overflowY: "auto", gap: "8px", fontSize: 20, padding: "16px" }}>
              {friendsLoading ? "Loading..." : friends.length > 0 ? friends.map((friend) => (
                <div key={friend.id} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                  <span>{friend.username}</span>
                  <span
                    onClick={() => setFriendToDelete(friend)}
                    style={{ color: "red", cursor: "pointer", fontWeight: "bold", fontSize: 20, lineHeight: 1, userSelect: "none" }}>
                      -
                  </span>
                </div>
              )) : "No friends yet"}
            </div>
          </div>
        </div>

       
        <div style={{ ...cardStyle, justifyContent: "space-between" }}>
          <div style={cardTitleStyle}>Lets play!</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center", padding: "20px 0" }}>
            <Button
              data-layer="Singleplayer"
              className="Singleplayer back-button"
              type="primary"
              style={{ width: "100%", height: "64px", fontSize: 24, fontFamily: "var(--font-chewy)" }}
              onClick={handleSingleplayer}>
                Singleplayer
            </Button>

            <Button
              data-layer="Multiplayer"
              className="Multiplayer back-button"
              type="primary"
              style={{ width: "100%", height: "64px", fontSize: 24, fontFamily: "var(--font-chewy)" }}
              onClick={handleMultiplayer}>
                Multiplayer
            </Button>

            <Button
              data-layer="Scoreboard"
              className="Scoreboard back-button"
              type="primary"
              style={{ width: "100%", height: "64px", fontSize: 24, fontFamily: "var(--font-chewy)" }}
              onClick={handleScoreboard}>
                Scoreboard
            </Button>
          </div>
        </div>

      </div>

      <Modal
        open={!!friendToDelete}
        title="Remove Friend"
        onCancel={() => setFriendToDelete(null)}
        onOk={handleDeleteFriend}
        okText="Remove"
        okButtonProps={{ danger: true, loading: isDeletingFriend }}
        cancelButtonProps={{ disabled: isDeletingFriend }}
        styles={{ header: { fontFamily: "var(--font-chewy)" } }}
      >
        Are you sure you want to remove <strong>{friendToDelete?.username}</strong> from your friends?
      </Modal>

      <Modal
        open={modalVisibility}
        onCancel={handleCancelPasswordChange}
        title="Change Password"
        footer={null}
        styles={{
          title: {
            fontFamily: "var(--font-chewy)",
            fontSize: "2rem",
            color: "black"
          },
          header: {
            backgroundColor: "white",
            borderBottom: "2px solid white"
          },
          body: {
            backgroundColor: "white"
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[{ required: true, message: "Enter your OLD password" }]}
            labelCol={{ style: { fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" } }}
          >
            <Password
              placeholder="Enter your old password"
              style={{ borderRadius: "12px", height: "50px", backgroundColor: "rgb(184, 216, 232)", color: "black" }}
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Enter your NEW password" }]}
            labelCol={{ style: { fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" } }}
          >
            <Password
              placeholder="Enter your new password"
              style={{ borderRadius: "12px", height: "50px", backgroundColor: "rgb(184, 216, 232)", color: "black" }}
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: "Confirm your password" }]}
            labelCol={{ style: { fontFamily: "var(--font-chewy)", fontSize: "1.2rem", color: "black" } }}
          >
            <Password
              placeholder="Confirm your new password"
              style={{ borderRadius: "12px", height: "50px", backgroundColor: "rgb(184, 216, 232)", color: "black" }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "2rem", marginBottom: 0 }}>
            <Button
              className="back-button"
              type="primary"
              onClick={handleCancelPasswordChange}
              style={{ 
                marginRight: "8px" }}
            >
              Cancel
            </Button>
            <Button
              className="back-button"
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Confirm Change
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Profile;