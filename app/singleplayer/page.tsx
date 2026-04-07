"use client";
//@ts-ignore
import "./styles.css";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Row, Col, Card, Button } from "antd";



import React, { useEffect, useState } from "react";
import path from "path";

const Singleplayer: React.FC = () => {
    const router = useRouter();
    const { value: userId } = useLocalStorage<string>("userId", "");

    return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem",
      padding: "2rem"}}
    >

        <h1 style={{
            fontSize: "4rem",
            fontWeight: "400",
            fontFamily: "var(--font-chewy)",
            margin: 0,
            color: "black",
            textAlign: "center"}}
        >
        Singleplayer
        </h1>
        
        <Link href={`/users/${userId}`} style = {{position: "absolute", top: "3rem", left: "3rem" }}>
            <Button
                style={{
                backgroundColor: "#E8956D",
                borderColor: "#E8956D",
                borderRadius: "20px",
                height: "75px",
                fontSize: "1.8rem",
                padding: "0 30px",
                fontWeight: "bold",
                color: "black",
                fontFamily: "var(--font-chewy)",
                border: "none",
                boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"}}
                type="primary">Back to Profile</Button>
        </Link>

        <Row gutter={[15, 15]} justify="center">
            <Col key = "reaction-time" xs={24} sm={12} md={8} lg={6}>
                <Card 
                    title="Reaction Time"
                    onClick={() => router.push("/singleplayer/reaction-time")}
                    className = "gameCard"
                    hoverable>
                    Click as soon as the screen turns green!
                </Card>
            </Col>
            <Col key = "typing-speed" xs={24} sm={12} md={8} lg={6}>
                <Card 
                    title="Typing Speed"
                    onClick={() => router.push("/singleplayer/typing-speed")}
                    className = "gameCard"
                    hoverable>
                    Type the given text as fast as you can!
                </Card>
            </Col>
        </Row>

    </div>
    );
};

export default Singleplayer;