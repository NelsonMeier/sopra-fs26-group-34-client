"use client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Row, Col, Card } from "antd";



import React, { useEffect, useState } from "react";
import path from "path";

const Singleplayer: React.FC = () => {
    const router = useRouter();

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

        <Row gutter={[15, 15]} justify="center">
            <Col key = "reaction-time" xs={24} sm={12} md={8} lg={6}>
                <Card 
                    title="Reaction Time"
                    onClick={() => router.push("/singleplayer/reaction-time")}
                    style={{cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"}}
                    hoverable>
                    Click as soon as the screen turns green!
                </Card>
            </Col>
            <Col key = "typing-speed" xs={24} sm={12} md={8} lg={6}>
                <Card 
                    title="Typing Speed"
                    onClick={() => router.push("/singleplayer/typing-speed")}
                    style={{cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"}}
                    hoverable>
                    Type the given text as fast as you can!
                </Card>
            </Col>
        </Row>

    </div>
    );
};

export default Singleplayer;