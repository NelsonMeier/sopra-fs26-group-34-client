"use client";

import React from "react";
import Link from "next/link";
import { Button } from "antd";

const AddFriend: React.FC = () => {
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
        boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: "500px"}}>
        {/* Add friend functionality will go here */}
      </div>

      <Link href="/users/1">
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
