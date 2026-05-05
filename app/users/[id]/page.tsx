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

  }, [id, token, apiService, router, clearToken]);

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

  
  return (
<div style={{
  width: '100%', 
  minHeight: '100vh', 
  background: '#6BAED6', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  overflow: 'auto', 
  padding: '16px', 
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', 
  outline: '3px black solid', 
  outlineOffset: '-1.50px'}}>

<div 
data-layer="User Profile" 
className="UserProfile" 
style={{
  width: "min(1100px, 100%)", 
  display: "grid", 
  gridTemplateRows: "auto auto auto", 
  rowGap: "28px", 
  paddingTop: "28px", 
  paddingBottom: "24px", 
  background: '#6BAED6'}}>

  <div 
  data-layer="Header" 
  className="Header" 
  style={{
    display: "grid", 
    gridTemplateColumns: "220px 1fr 260px", 
    alignItems: "center", 
    columnGap: "24px"}}>

    <Button
    data-layer="Logout"
    className="Logout back-button"
    type="primary"
    style={{ width: "200px" }}
    onClick={handleLogout}>Logout</Button>

    <div 
    data-layer="User Profile" 
    className="UserProfile" 
    style={{
      textAlign: 'center', 
      justifyContent: 'center', 
      display: 'flex', 
      flexDirection: 'column', 
      color: 'black', 
      fontSize: 64,
      fontFamily: 'var(--font-chewy)', 
      fontWeight: '400', 
      wordWrap: 'break-word'}}
      >User Profile</div>

    <div 
    style={{
      display: 'flex', 
      justifyContent: 'flex-end'}}>

      {id && id === String(id) ? (
        <Button
        data-layer="Change Password"
        className="ChangePassword back-button"
        type="primary"
        style={{ width: "240px" }}
        onClick={handleChangePassword}>Change Password</Button>
      ) : <div style={{width: '240px'}} />}
    </div>
  </div>

  <div 
  data-layer="Middle" 
  className="Middle" 
  style={{
    display: "grid", 
    marginTop: "50px",
    gridTemplateColumns: "1fr 260px", 
    columnGap: "42px", 
    alignItems: "start"}}>
    
    <div 
    data-layer="Left Info" 
    className="Left Info" 
    style={{
      display: "grid", 
      rowGap: "16px", 
      marginLeft: "200px"}}>
      
      <div 
      data-layer="Username Row" 
      className="Username Row" 
      style={{
        display: "grid", 
        gridTemplateColumns: "190px 250px", 
        columnGap: "12px", 
        alignItems: "center"}}>
        
        <div 
        data-layer="Username:" 
        className="Username" 
        style={{
          textAlign: 'center', 
          justifyContent: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          color: 'black', 
          fontSize: 24, 
          fontFamily: 'var(--font-chewy)', 
          fontWeight: '400', 
          wordWrap: 'break-word'}}>
            Username:</div>
        
        <div 
        data-layer="UsernameValue" 
        className="usernameValue" 
        style={{
          background: "#DBDBDB", 
          borderRadius: 10, 
          padding: "6px 12px", 
          minHeight: "42px", 
          display: "flex", 
          alignItems: "center", 
          textAlign: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column', 
          color: 'black', 
          fontSize: 24, 
          fontFamily: 'var(--font-chewy)', 
          fontWeight: '400', 
          wordWrap: 'break-word'}}>
            {user?.username || "Loading..."}</div>
      </div>
      
      <div 
      data-layer="Creation Date Row" 
      className="Creation Date Row" 
      style={{
        display: "grid", 
        gridTemplateColumns: "190px 250px", 
        columnGap: "12px", 
        alignItems: "center"}}>

        <div 
        data-layer="Creation Date:" 
        className="CreationDate" 
        style={{
          textAlign: 'center', 
          justifyContent: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          color: 'black', 
          fontSize: 24, 
          fontFamily: 'var(--font-chewy)', 
          fontWeight: '400', 
          wordWrap: 'break-word'}}>
            Creation Date:</div>

        <div 
        data-layer="CreationDateValue" 
        className="creationDateValue" 
        style={{
          background: "#DBDBDB", 
          borderRadius: 10, 
          padding: "6px 12px", 
          minHeight: "42px", 
          display: "flex", 
          alignItems: "center", 
          textAlign: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column', 
          color: 'black', 
          fontSize: 24, 
          fontFamily: 'var(--font-chewy)', 
          fontWeight: '400', 
          wordWrap: 'break-word'}}>
            {user?.creationDate || "Loading..."}</div>
      </div>

      <div 
      data-layer="Friends Row" 
      className="Friends Row" 
      style={{
        display: "grid", 
        gridTemplateColumns: "190px 250px", 
        columnGap: "12px", 
        alignItems: "center"}}>
        
        <div 
        data-layer="Friends:" 
        className="Friends" 
        style={{
          textAlign: 'center', 
          justifyContent: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          color: 'black', 
          fontSize: 24, 
          fontFamily: 'var(--font-chewy)', 
          fontWeight: '400', 
          wordWrap: 'break-word'}}>
            Friends:</div>

        <div
         data-layer="FriendsListValue" 
         className="friendsListValue" 
         style={{
          background: "#DBDBDB", 
          borderRadius: 10, 
          padding: "6px 12px", 
          minHeight: "90px", 
          maxHeight: "140px", 
          display: "flex", 
          justifyContent: 'flex-start', 
          alignItems: "flex-start", 
          flexDirection: 'column', 
          color: 'black', 
          fontSize: 24, 
          fontFamily: 'var(--font-chewy)', 
          fontWeight: '400', 
          wordWrap: 'break-word', 
          overflowY: 'auto'}}>

          {friendsLoading ? "Loading..." : friends.length > 0 ? friends.map((friend) => (
            <div
              key={friend.id}
              style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}
            >
              <span>{friend.username}</span>
              <span
                onClick={() => setFriendToDelete(friend)}
                style={{
                  color: "red",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 20,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                -
              </span>
            </div>
          )) : "No friends yet"}
        </div>
      </div>
    </div>

    <div 
    data-layer="Right Buttons" 
    className="Right Buttons" 
    style={{display: "grid", rowGap: "16px", paddingTop: "0px"}}>
      <Button
      data-layer="add Friend"
      className="AddFriend back-button"
      type="primary"
      style={{ width: "240px" }}
      onClick={handleAddFriend}>add Friend</Button>
      
      <Badge count={friendRequestCount} showZero={false}>
        <Button
        data-layer="Friend Requests"
        className="FriendRequests back-button"
        type="primary"
        style={{ width: "240px" }}
        onClick={handleFriendRequests}>Friend Requests</Button>
      </Badge>
    </div>
  </div>

  <div 
  data-layer="Bottom" 
  className="Bottom" 
  style={{
    display: "grid", 
    gridTemplateColumns: "1fr 250px", 
    marginTop: "30px", 
    columnGap: "40px",
    alignItems: "center"}}>

    <div 
    data-layer="Play Group" 
    className="Play Group" 
    style={{
      display: "grid", 
      rowGap: "20px", 
      justifyItems: "center",
      marginTop: "50px"}}>

      <div 
      data-layer="LetPlayLabel" 
      className="letPlayLabel" 
      style={{
        textAlign: 'center', 
        justifyContent: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        color: 'black', 
        fontSize: 32, 
        fontFamily: 'var(--font-chewy)', 
        fontWeight: '400', 
        wordWrap: 'break-word'}}>
          Let&apos;s Play:</div>
      <div 
      data-layer="Play Buttons" 
      className="Play Buttons" 
      style={{display: "grid", 
      gridTemplateColumns: "240px 240px", 
      columnGap: "30px"}}>

        <Button
        data-layer="Singleplayer"
        className="Singleplayer back-button"
        type="primary"
        style={{ width: "240px" }}
        onClick={handleSingleplayer}>
            Singleplayer</Button>
        
        <Button
        data-layer="Multiplayer"
        className="Multiplayer back-button"
        type="primary"
        style={{ width: "240px" }}
        onClick={handleMultiplayer}>
            Multiplayer</Button>
      </div>
    </div>
    <Button
    data-layer="Scoreboard"
    className="Scoreboard back-button"
    type="primary"
    style={{ width: "240px", marginTop: "25px" }}
    onClick={handleScoreboard}>
        Scoreboard</Button>
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
            marginRight: "8px"
          }}
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
</div>
  );
};

export default Profile;
