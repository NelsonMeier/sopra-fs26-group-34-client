"use client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import Password from "antd/es/input/Password";
import { useParams, useRouter } from "next/navigation";
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

interface FormFieldProps {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const { // retieves Token from local storage
      value: token,
      clear: clearToken,
    } = useLocalStorage<string>("token", "");

    const [mounted, setMounted] = useState(false);
    const params = useParams();
    const id = params.id;
    const [user, setUser] = useState<User | null>(null);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);

    const [modalVisibility, setModalVisibility] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userId, SetUserId] = useState<string | null>(null);

      useEffect(() =>{
      setMounted(true);
      const userId = localStorage.getItem("userId");
      SetUserId(userId);
    }, []);

    useEffect(() => {
      if (!mounted) return;
      if (!token) {
        //alert("Not verified, please log in first.");
        router.push("/login");
        return;
      }
    }, [mounted, router]);

    useEffect(() => { //Gets User
      if (!mounted || !token) return; 
      const fetchUser = async () => {
        try {
          const storedToken = localStorage.getItem("token")?.replaceAll('"', ''); 
          const fetchedUser = await apiService.get<User>(`/users/${id}`, {
            Authorization: `Bearer ${storedToken}`, 
          });
          setUser(fetchedUser);
        } catch (error) {
          if (error instanceof Error) {
            alert(`Could not load user profile:\n${error.message}`)
            router.push("/users")
          }
        }
      };
      fetchUser();
    }, [mounted, id, token, apiService, router]); 

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

    const currentToken = localStorage.getItem("token")?.replaceAll('"', '');

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

    const handleLogout = async () => {
      try{
        const storedToken = localStorage.getItem("token")?.replaceAll('"', '');
        await apiService.post(`/logout/${id}`, {}, {
          Authorization: `Bearer ${storedToken}`
        });
        clearToken();
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        clearToken();
        router.push("/login");
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

    const handleScoreboard = () => {  //To be implemented
      router.push("/scoreboard");
    };

  
  return (
<div
  style={{
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#6BAED6",
  fontFamily: "var(--font-chewy)",
  display: "flex",
  justifyContent: "center",
  paddingTop: "40px",
  }}
  >
  <div style={{ width: "900px" }}>

  {/* Title and Logout Button */}
  <div style={{ position: "relative", textAlign: "center" }}>
    <h1 style={{ fontSize: "56px" }}>User Profile</h1>

    <div
      style={{ position: "absolute", left: 0, top: 0 }}
      onClick={handleLogout}
      >
      <div style={{
        backgroundColor: "#E8956D",
        borderRadius: "20px",
        padding: "18px 28px",
        cursor: "pointer",
        textAlign: "center" as const,
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        fontSize: "20px",
        }}>Logout</div>
    </div>
  </div>

  {/* User Info */}
  <div
    style={{
      marginTop: "60px",
      display: "grid",
      gridTemplateColumns: "160px 260px 360px",
      rowGap: "20px",
      columnGap: "10px",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
    }}
  >
    {/* Username */}
    <div>Username:</div>
    <div style={{
      backgroundColor: "#D9D9D9",
      borderRadius: "10px",
      padding: "8px",
      textAlign: "left",
      }}>{user?.username}</div>
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
    <div
      onClick={handleChangePassword}
      style={{
        backgroundColor: "#E8956D",
        borderRadius: "20px",
        padding: "10px 16px",
        cursor: "pointer",
        textAlign: "center",
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        fontSize: "20px",
      }}>
      Change Password
    </div>
  </div>
      
  {/* Creation Date */}
  <div>Creation Date:</div>
  <div style={{
    backgroundColor: "#D9D9D9",
    borderRadius: "10px",
    padding: "8px",
    textAlign: "left",
    }}>{user?.creationDate}</div>
  <div />

  {/* Friends */}
  <div>Friends:</div>

  <div style={{
    backgroundColor: "#D9D9D9",
    borderRadius: "10px",
    padding: "8px",
    textAlign: "left", 
    minHeight: "80px", 
    }}>
    {friendsLoading
          ? "Loading..."
          : friends.length > 0
          ? friends.map((f) => <div key={f.id}>{f.username}</div>)
          : "No friends yet"}
  </div>

    {/* Buttons column */}
      <div style={{display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            backgroundColor: "#E8956D",
            borderRadius: "20px",
            padding: "14px",
            width: "100%",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            }}
            onClick={handleAddFriend}>
            Add Friend
          </div>
          <div style={{
            backgroundColor: "#E8956D",
            borderRadius: "20px",
            padding: "14px",
            width: "100%",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            }}
            onClick={handleFriendRequests}>
            Friend Requests
          </div>
      </div>
    </div>

  {/* Bottom Section */}
  <div
      style={{
        marginTop: "80px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2 style={{ fontSize: "32px", margin: 0 }}>
        Let’s Play:
      </h2>

      <div
        style={{
          position: "absolute",
          right: 0,
          backgroundColor: "#E8956D",
          borderRadius: "20px",
          padding: "12px 20px",
          cursor: "pointer",
          textAlign: "center",
          boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
          width: "200px",
          fontSize: "20px",
        }}
        onClick={handleScoreboard}
      >
        Scoreboard
      </div>
  </div>
        
  <div
    style={{
      marginTop: "40px",
      display: "flex",
      justifyContent: "center",
      gap: "70px",
    }}
  >
    <div style={{
      backgroundColor: "#E8956D",
      borderRadius: "20px",
      padding: "12px 20px",
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
      width: "200px",
      fontSize: "20px",
    }} onClick={handleSingleplayer}>
      Singleplayer
    </div>

    <div style={{
      backgroundColor: "#E8956D",
      borderRadius: "20px",
      padding: "12px 20px",
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
      width: "200px",
      fontSize: "20px",
    }} onClick={handleMultiplayer}>
      Multiplayer
    </div>
  </div>

  <Modal
    open={modalVisibility}
    onCancel={handleCancelPasswordChange}
    title="Change Password"
    footer={null}
    styles={{
      header: {
        backgroundColor: "#77B8D2",
        borderBottom: "2px solid #6BAED6"
      },
      body: {
        backgroundColor: "#77B8D2"
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
          style={{ borderRadius: "12px", height: "50px", backgroundColor: "white", color: "black" }}
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
          style={{ borderRadius: "12px", height: "50px", backgroundColor: "white", color: "black" }}
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
          style={{ borderRadius: "12px", height: "50px", backgroundColor: "white", color: "black" }}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: "2rem", marginBottom: 0 }}>
        <Button
          onClick={handleCancelPasswordChange}
          style={{
            backgroundColor: "#FBAB7A",
            borderRadius: "15px",
            height: "45px",
            fontSize: "1rem",
            fontFamily: "var(--font-chewy)",
            border: "none",
            color: "black",
            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            marginRight: "8px"
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{
            backgroundColor: "#E8A09F",
            borderRadius: "15px",
            height: "45px",
            fontSize: "1rem",
            fontFamily: "var(--font-chewy)",
            border: "none",
            color: "black",
            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)"
          }}
        >
          Confirm Change
        </Button>
      </Form.Item>
    </Form>
  </Modal>
</div>
</div>
  );
};

export default Profile;
