"use client";

import React, { useEffect, useState } from "react";
import { Button } from "antd";

const createGoalTime = (): string => (Math.random() * 5 + 5).toFixed(1);

const TimeIntervalGame: React.FC = () => {
  const [goalTime, setGoalTime] = useState<string>("5.0");

  useEffect(() => {
    setGoalTime(createGoalTime());
  }, []);

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
        Time Interval
      </h1>

      <div
        style={{
          fontFamily: "var(--font-chewy)",
          fontSize: "2rem",
          color: "black",
          textAlign: "center",
        }}
      >
        Stop the clock at {goalTime}s!
      </div>

      <div
        style={{
          width: "min(100%, 32rem)",
          aspectRatio: "1 / 1",
          backgroundColor: "#B8D8E8",
          borderRadius: "20px",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4rem",
          padding: "2rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-chewy)",
            fontSize: "4rem",
            color: "black",
            lineHeight: 1,
          }}
        >
          0.000s
        </div>

        <Button
          type="primary"
          style={{
            width: "12rem",
            height: "4rem",
            backgroundColor: "#51CF66",
            borderRadius: "15px",
            border: "none",
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
            color: "black",
            fontFamily: "var(--font-chewy)",
            fontSize: "1.7rem",
            fontWeight: "bold",
          }}
        >
          Start
        </Button>
      </div>
    </div>
  );
};

export default TimeIntervalGame;
