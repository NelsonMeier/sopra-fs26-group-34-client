"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Input, List, message, Modal } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

const AddFriend: React.FC = () => {
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [friendUsername, setFriendUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]); 
  const [modalVisibility, setModalVisibility] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearchUsers = async (value: string) => {
    setFriendUsername(value);
    
    if(!value.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const users = await apiService.get<User[]>(`/users/search/${value}`);
      console.log("API Response:", users); 
      console.log("Is Array:", Array.isArray(users)); 
      setSearchResults(Array.isArray(users) ? users : []);
      setModalVisibility(true);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);

    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (user: User) => {

    setLoading(true);
    try {
      //POST request to send friend request
      await apiService.post(
        `/users/${userId}/friends/requests`,
        user.id
      );
      message.success(`Friend request sent to ${user.username}!`);
      setFriendUsername("");
      setSearchResults([]);
      setModalVisibility(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to send friend request: ${error.message}`);
      } else {
        message.error("Failed to send friend request");
      }
    } finally {
      setLoading(false);
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
      gap: "1.5rem",
      padding: "2rem"}}>
      
      <h1 style={{
        fontSize: "4rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        color: "black",
        textAlign: "center"}}>
        Add a Friend
      </h1>

      <div style={{
        backgroundColor: "white",
        borderRadius: "15px",
        padding: "2rem",
        boxShadow: "0px 8px 10px rgba(12, 11, 11, 0.2)",
        width: "100%",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"}}>
        <div>
          <label style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "bold",
            fontFamily: "var(--font-chewy)"
          }}>
            Friend&apos;s Username
          </label>
          <Input
            placeholder="Search for users by entering a username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            size="large"
            style={{ color: "white" }}
          />
        </div>
        <Button
          type="primary"
          onClick={() => handleSearchUsers(friendUsername)}
          loading={loading}
          style={{
            backgroundColor: "#E8956D",
            borderColor: "#E8956D",
            height: "50px",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none"
          }}
        >
          Search Users
        </Button>
      </div>

        {/* search results modal */}
        <Modal
        title="Search Result"
        open={modalVisibility}
        onCancel={() => {setModalVisibility(false); setSearchResults([]);}}
        footer={null}
        width={500}
        >
          <List
            dataSource={searchResults}
            renderItem={(user) => (
              <List.Item>
                <div style={{ flex: 1 }}>  {/* ADD THIS WRAPPER */}
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    {user.username}  {/* ADD THIS */}
                  </p>
                </div>
                <Button
                  type="primary"
                  onClick={() => handleAddFriend(user)}
                  loading={loading}
                >
                  Add Friend
                </Button>
              </List.Item>
            )}
          />

        </Modal>


      <Link href={`/users/${userId}`}>
        <Button
          style={{
            backgroundColor: "#E8956D",
            borderColor: "#E8956D",
            borderRadius: "20px",
            height: "55px",
            fontSize: "1.2rem",
            padding: "0 30px",
            fontWeight: "bold",
            color: "black",
            fontFamily: "var(--font-chewy)",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"}}
          type="primary">Back to Profile</Button>
      </Link>
    </div>
  );
};

export default AddFriend;
