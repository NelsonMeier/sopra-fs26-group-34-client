"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Input, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

const AddFriend: React.FC = () => {
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [friendUsername, setFriendUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) {
      message.error("Please enter a friend's username");
      return;
    }

    setLoading(true);
    try {
      //GET request to find friend by username and retrieve their ID
      const friend = await apiService.get<User>(`/users/search/${friendUsername}`); 
      const friendId = friend.id; 
      //POST request to send friend request
      await apiService.post(
        `/users/${userId}/friends/requests`,
        friendId
      );
      message.success("Friend request sent successfully!");
      setFriendUsername("");
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
            placeholder="Enter friend&apos;s username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            onPressEnter={handleAddFriend}
            size="large"
            style={{ color: "white" }}
          />
        </div>
        <Button
          type="primary"
          onClick={handleAddFriend}
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
          Send Friend Request
        </Button>
      </div>

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
