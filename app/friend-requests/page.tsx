"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, message, Spin } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

interface FriendRequest {
  id: number;
  sender: {
    id: number;
    username: string;
    name: string;
  };
  status: string;
}

const FriendRequests: React.FC = () => {
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("userId", "");
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchRequests = async () => {
      try {
        const data = await apiService.get<FriendRequest[]>(
          `/users/${userId}/friends/requests`
        );
        setRequests(data);
      } catch (error) {
        if (error instanceof Error) {
          message.error(`Failed to load friend requests: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId, apiService]);

  const handleAccept = async (requestId: number) => {
    try {
      await apiService.put(
        `/users/${userId}/friends/requests/${requestId}`,
        "ACCEPTED"
      );
      message.success("Friend request accepted!");
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to accept request: ${error.message}`);
      }
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await apiService.put(
        `/users/${userId}/friends/requests/${requestId}`,
        "DECLINED"
      );
      message.success("Friend request declined!");
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to decline request: ${error.message}`);
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "2rem",
      gap: "2rem"}}>
      
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "900px"}}>
        <h1 style={{
          fontSize: "4rem",
          fontWeight: "400",
          fontFamily: "var(--font-chewy)",
          margin: 0,
          color: "black"}}>
          Friend Requests
        </h1>
        
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
            type="primary">
            Back
          </Button>
        </Link>
      </div>

      <div style={{
        backgroundColor: "#B8D8E8",
        borderRadius: "15px",
        padding: "2rem",
        width: "100%",
        maxWidth: "900px",
        minHeight: "400px"}}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <Spin />
          </div>
        ) : requests.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "1.2rem",
            color: "#666",
            fontFamily: "var(--font-chewy)"
          }}>
            No friend requests
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {requests.map((request) => (
              <div
                key={request.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.5rem",
                  backgroundColor: "white",
                  borderRadius: "10px",
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
                }}>
                <span style={{
                  fontSize: "1.2rem",
                  fontFamily: "var(--font-chewy)",
                  fontWeight: "bold",
                  color: "black"
                }}>
                  {request.sender.username}
                </span>
                
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <Button
                    onClick={() => handleAccept(request.id)}
                    style={{
                      backgroundColor: "#FFE135",
                      borderColor: "#FFE135",
                      color: "black",
                      fontWeight: "bold",
                      fontFamily: "var(--font-chewy)",
                      border: "none"
                    }}>
                    accept
                  </Button>
                  
                  <Button
                    onClick={() => handleDecline(request.id)}
                    style={{
                      backgroundColor: "#FF6B6B",
                      borderColor: "#FF6B6B",
                      color: "black",
                      fontWeight: "bold",
                      fontFamily: "var(--font-chewy)",
                      border: "none"
                    }}>
                    decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
