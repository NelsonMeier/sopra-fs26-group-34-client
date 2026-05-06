"use client";
import { useRouter } from "next/navigation";
import { Button, Carousel, Card } from "antd";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);


  const handleSingleplayer = () => {  
      router.push("/singleplayer");
    };

    const handleMultiplayer = () => {
      router.push("/multiplayer");
    };

    const handleScoreboard = () => {
      router.push("/scoreboard");
    };

    useEffect(() => {
      setUserId(localStorage.getItem("userId"));
    }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "1rem 2rem 3rem",
      boxSizing: "border-box"}}>

      <Button
        onClick ={()=> router.push(userId ? `/users/${userId}` : "/login")}
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          backgroundColor: "#E8956D",
          borderColor: "#E8956D",
          borderRadius: "30px",
          width: "clamp(120px, 12vw, 175px)",
          height: "clamp(40px, 5vh, 50px)",
          fontSize: "clamp(1rem, 1.5vw, 1.4rem)",
          fontWeight: "bold",
          fontFamily: "var(--font-chewy)",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          color: "black",
          border: "none"}}>
        {userId ? "My Profile" : "Login / Sign Up"}
      </Button> 

        <Button
        onClick={() => router.push("/about")}
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "1.5rem",
          backgroundColor: "#22426b",
          borderColor: "#22426b",
          borderRadius: "20px",
          height: "clamp(36px, 4vh, 42px)",
          fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
          padding: "0 22px",
          fontWeight: "bold",
          color: "white",
          fontFamily: "var(--font-chewy)",
          border: "none",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)"}}>
        About
      </Button>


      <div style={{
        width: "100%",
        maxWidth: "min(90vw, 900px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}>
        <div style = {{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <img src="favicon.ico" alt="Think-off Logo" style={{ 
            width: "clamp(60px, 8vw, 120px)", 
            height: "auto"
            }} />
          <h1 style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            fontWeight: "400",
            fontFamily: "var(--font-chewy)",
            margin: 0,
            color: "black"}}>
            Think-off
          </h1>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        gap: "2rem"
      }}>
      <div style={{width: "60vw", maxWidth: "600px"}}>
        <Carousel autoplay dots style={{ borderRadius: "20px", boxShadow: "1px 6px 10px rgba(0,0,0,0.3)", border: "1.5px solid #000000" }}>
          <div>
            <div style={{ aspectRatio: "5/3", overflow: "hidden", borderRadius: "20px" }}>
              <img src="/assets/Reaction_Time.jpg" alt="Reaction Time" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
          <div>
            <div style={{ aspectRatio: "5/3", overflow: "hidden", borderRadius: "20px" }}>
              <img src="/assets/Typing_Test.jpg" alt="Typing Speed" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
          <div>
            <div style={{ aspectRatio: "5/3", overflow: "hidden", borderRadius: "20px" }}>
              <img src="/assets/Time_Interval.jpg" alt="Time interval" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        </Carousel>
      </div>

        <div style={{
          display: "flex",
          gap: "clamp(1rem, 3vw, 2rem)",
          width: "100%",
          justifyContent: "center",
          marginTop: "2rem",
          marginBottom: "1rem"
        }}>

          <Button
          data-layer="Singleplayer"
          className="Singleplayer back-button"
          type="primary"
          style={{ 
            flex: "1 1 0", 
            maxWidth: "300px",
            height: "clamp(40px, 5vh, 52px)",
            fontSize: "clamp(0.9rem, 1.5vw, 1.1 rem)"}}
          onClick={handleSingleplayer}>
              Singleplayer</Button>
          
          <Button
          data-layer="Multiplayer"
          className="Multiplayer back-button"
          type="primary"
          style={{ 
            flex: "1 1 0", 
            maxWidth: "300px",
            height: "clamp(40px, 5vh, 52px)",
            fontSize: "clamp(0.9rem, 1.5vw, 1.1 rem)"}}
          onClick={handleMultiplayer}>
              Multiplayer
          </Button>
        </div>
          <Button
          data-layer="Scoreboard"
          className="Scoreboard back-button"
          type="primary"
          style={{ width: "240px" }}
          onClick={handleScoreboard}>
              Scoreboard</Button>
        </div>
      </div>
  );
}