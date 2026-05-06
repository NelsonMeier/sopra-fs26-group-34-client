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
      setSearchResults(Array.isArray(users) ? users.filter(user => user.id !== userId) : []);
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
        backgroundColor: "rgb(184, 216, 232)",
        borderRadius: "15px",
        padding: "2rem",
        boxShadow: "0px 8px 10px rgba(12, 11, 11, 0.2)",
        width: "100%",
        maxWidth: "700px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"}}>
        <div>
          <label style={{
            display: "block",
            marginBottom: "1rem",
            fontWeight: "bold",
            fontSize: "1.5rem",
            fontFamily: "var(--font-chewy)"
          }}>
            Friend&apos;s Username
          </label>
          <Input
            placeholder="Search for users by entering a username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            size="large"
            style={{ color: "black", backgroundColor: "#F0F0F0", border: "none", borderRadius: "8px" }}
          />
        </div>
        <Button
          type="primary"
          onClick={() => handleSearchUsers(friendUsername)}
          loading={loading}
          style={{
            backgroundColor: "#E8956D",
            borderColor: "#E8956D",
            height: "75px",
            fontSize: "2rem",
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
        styles ={{title : {fontFamily: "var(--font-chewy)", fontSize: "2rem", color: "black"}}}
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
                  <p style={{ margin: 0, fontFamily: "var(--font-chewy)", fontSize: "1.5rem", color: "black" }}>
                    {user.username}  {/* ADD THIS */}
                  </p>
                </div>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#FFE135",
                    height: "40px",
                    fontSize: "1.2rem",
                    color: "black",
                    fontFamily: "var(--font-chewy)",
                    border: "none"
                  }}
                  onClick={() => handleAddFriend(user)}
                  loading={loading}
                >
                  Add Friend
                </Button>
              </List.Item>
            )}
          />

        </Modal>

      <div className="back-button-anchor">
        <Link href={"/users/" + userId}>
          <Button
            className="back-button"
            type="primary">Back to Profile</Button>
        </Link>
      </div>
    </div>
  );
};

export default AddFriend;
