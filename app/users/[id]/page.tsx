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
import {Modal, Form, Input, Button, message} from "antd"

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
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

      useEffect(() =>{
      setMounted(true);
      const userId = localStorage.getItem("loggedInUserId");
      setLoggedInUserId(userId);
    }, []);

    useEffect(() => {
      if (!mounted) return;
      if (!token) {
        //alert("Not verified, please log in first.");
        router.push("/login");
        return;
      }
    }, [mounted, token, router]);

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

    const handleSingleplayer = () => {  //To be implemented
      alert("Singleplayer mode coming soon");
    };

    const handleMultiplayer = () => {   //To be implemented
      alert("Multiplayer mode coming soon");
    };

    const handleScoreboard = () => {  //To be implemented
      alert("Scoreboard coming soon");
    };

    // From Figma template
  return (
<div data-layer="User Profile" className="UserProfile" style={{width: '100%', minHeight: '100vh', position: 'relative', background: '#77B8D2', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', overflow: 'hidden', outline: '3px black solid', outlineOffset: '-1.50px'}}>
  <div data-layer="User Profile" className="UserProfile" style={{width: 656, height: 123, left: 419, top: 77, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 64, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>User Profile</div>
  <div data-layer="Rectangle 3" className="Rectangle3" style={{width: 240, height: 80, left: 1096, top: 675, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Scoreboard" className="Scoreboard" style={{width: 250, height: 79, left: 1091, top: 675, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleScoreboard}>Scoreboard</div>
  <div data-layer="Rectangle 9" className="Rectangle9" style={{width: 200, height: 80, left: 128, top: 99, position: 'absolute', background: '#E8A09F', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #E8A09F solid'}} />
  <div data-layer="Logout" className="Logout" style={{width: 190, height: 79, left: 133, top: 99, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleLogout}>Logout</div>
  <div data-layer="Rectangle 4" className="Rectangle4" style={{width: 240, height: 55, left: 818, top: 387, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="add Friend" className="AddFriend" style={{width: 250, height: 61, left: 813, top: 387, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleAddFriend}>add Friend</div>
  <div data-layer="Rectangle 10" className="Rectangle10" style={{width: 240, height: 55, left: 818, top: 464, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Friend Requests" className="FriendRequests" style={{width: 250, height: 61, left: 813, top: 464, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleFriendRequests}>Friend Requests</div>
  <div data-layer="Rectangle 5" className="Rectangle5" style={{width: 240, height: 80, left: 403, top: 798, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Singleplayer" className="Singleplayer" style={{width: 250, height: 79, left: 403, top: 799, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleSingleplayer}>Singleplayer</div>
  <div data-layer="Rectangle 6" className="Rectangle6" style={{width: 240, height: 80, left: 846, top: 799, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Multiplayer" className="Multiplayer" style={{width: 250, height: 79, left: 841, top: 799, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleMultiplayer}>Multiplayer</div>
  <div data-layer="Username:" className="Username" style={{width: 165, height: 42, left: 393, top: 267, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Username:</div>
  <div data-layer="Creation Date:" className="CreationDate" style={{width: 205, height: 39, left: 393, top: 324, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Creation Date:</div>
  <div data-layer="Friends:" className="Friends" style={{width: 165, height: 42, left: 377, top: 378, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Friends:</div>
  <div data-layer="Rectangle 1" className="Rectangle1" style={{width: 200, height: 40, left: 598, top: 267, position: 'absolute', background: '#DBDBDB', borderRadius: 10}} />
  <div data-layer="Rectangle 7" className="Rectangle7" style={{width: 200, height: 42, left: 598, top: 321, position: 'absolute', background: '#DBDBDB', borderRadius: 10}} />
  <div data-layer="CreationDateValue" className="creationDateValue" style={{width: 141, left: 598, top: 334, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>{user?.creationDate || "Loading..."}</div>
  <div data-layer="UsernameValue" className="usernameValue" style={{width: 153, height: 27, left: 612, top: 275, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>{user?.username || "Loading..."}</div>
  <div data-layer="Rectangle 8" className="Rectangle8" style={{width: 200, height: 80, left: 598, top: 384, position: 'absolute', background: '#DBDBDB', borderRadius: 10}} />
  <div data-layer="LetPlayLabel" className="letPlayLabel" style={{width: 225, height: 59, left: 637, top: 675, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Let&apos;s Play:</div>
  <div data-layer="FriendsListValue" className="friendsListValue" style={{width: 201, height: 73, left: 612, top: 387, position: 'absolute', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', overflowY: 'auto'}}>
    {friendsLoading ? "Loading..." : friends.length > 0 ? friends.map((friend) => (
      <div key={friend.id}>{friend.username}</div>
    )) : "No friends yet"}
  </div>
  {loggedInUserId && loggedInUserId === String(id) && (
    <>
      <div data-layer="Rectangle 11" className="Rectangle11" style={{width: 240, height: 42, left: 818, top: 267, position: 'absolute', background: '#E8A09F', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #E8A09F solid'}} />
      <div data-layer="Change Password" className="ChangePassword" style={{width: 250, height: 48, left: 813, top: 267, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleChangePassword}>Change Password</div>
    </>
  )}
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
  );
};

export default Profile;