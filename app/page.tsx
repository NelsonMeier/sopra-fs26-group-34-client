"use client";
import { useRouter } from "next/navigation";
import { Button } from "antd";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem"}}>
      
      <h1 style={{
        fontSize: "5.5rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        color: "black"}}>
        Think-off
      </h1>

      <Button
        onClick={() => router.push("/login")}
        style={{
          backgroundColor: "#E8956D",
          borderColor: "#E8956D",
          borderRadius: "30px",
          width: "260px",
          height: "70px",
          fontSize: "1.4rem",
          fontWeight: "bold",
          fontFamily: "var(--font-chewy)",
          boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
          color: "black",
          border: "none"}}>
        Login
      </Button>

      <div style={{ 
        display: "flex",
        alignItems: "center",
        gap: "0.5rem" }}>

        <span style={{ 
          fontFamily: "var(--font-chewy)",
          fontWeight: "600", 
          color: "black",
          fontSize: "1.5rem" }}>
          No Account yet?
        </span>


        <Button
          onClick={() => router.push("/register")}
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
            boxShadow: "0px 8px 10px rgba(0,0,0,0.2)"}}>
          Register
        </Button>
      </div>
    </div>
  );
}