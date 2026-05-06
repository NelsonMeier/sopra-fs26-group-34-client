"use client";

import React from "react";

const ClickSpeedGame: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#6BAED6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "400",
          fontFamily: "var(--font-chewy)",
          margin: 0,
          color: "black",
          textAlign: "center",
        }}
      >
        Click Speed
      </h1>

      <div
        style={{
          fontFamily: "var(--font-chewy)",
          fontSize: "1.5rem",
          color: "black",
        }}
      >
        Round 1 of 1
      </div>

      <button
        type="button"
        style={{
          width: "min(100%, 70%)",
          height: "65vh",
          backgroundColor: "#B8D8E8",
          border: "none",
          borderRadius: "20px",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          color: "black",
          cursor: "pointer",
          fontFamily: "var(--font-chewy)",
          fontSize: "3rem",
          padding: "2rem",
          textAlign: "center",
          whiteSpace: "normal",
        }}
      >
        start clicking as fast as possible!
      </button>
    </div>
  );
};

export default ClickSpeedGame;
