"use client";
import { useRouter } from "next/navigation";
import { Button } from "antd";

const teamMembers = [
  { name: "Zara Ahmed" },
  { name: "Anita Baumann" },
  { name: "Lukas Stahl" },
  { name: "Jonas de Kallas Fischer" },
  { name: "Nelson Meier" },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#6BAED6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3.5rem 1.5rem 1rem",
      gap: "0.7rem",
      position: "relative"}}>

      <Button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
          backgroundColor: "#22426b",
          borderColor: "#22426b",
          borderRadius: "20px",
          height: "42px",
          fontSize: "1rem",
          padding: "0 22px",
          fontWeight: "bold",
          color: "white",
          fontFamily: "var(--font-chewy)",
          border: "none",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)"}}>
        ← Back
      </Button>

      <h1 style={{
        fontSize: "3.2rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        color: "black"}}>
        About Think-off
      </h1>

      <div style={{
        backgroundColor: "rgba(255,255,255,0.35)",
        borderRadius: "16px",
        padding: "0.8rem 1.5rem",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0px 6px 16px rgba(0,0,0,0.15)"}}>

      <p style={{
        fontFamily: "var(--font-chewy)",
        fontSize: "1.15rem",
        color: "black",
        margin: 0,
        lineHeight: "1.5",
        textAlign: "center"}}>
        Think-off is a student project that brings players together in a competitive platform where they can go head-to-head in fast paced cognitive mini games designed to test their mental abilities.
      </p>
      <p style={{
        fontFamily: "var(--font-chewy)",
        fontSize: "1.15rem",
        color: "black",
        margin: 0,
        lineHeight: "1.5",
        textAlign: "center"}}>
        Compete with friends, climb the scoreboard and prove who truly stands out as the best thinker!
      </p>
      </div>

      <h2 style={{
        fontSize: "2rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        marginTop: "3rem",
        color: "black"}}>
        How to Play
      </h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.7rem",
        justifyContent: "center",
        maxWidth: "800px",
        width: "100%"}}>
        {[
          {
            step: "1",
            title: "Create an Account",
            desc: "Register and log in to access all game modes and track your scores on the leaderboard.",
          },
          {
            step: "2",
            title: "Choose a Mode",
            desc: "Pick Single Player to practice alone or Multiplayer to challenge a friend head-to-head in real time.",
          },
          {
            step: "3",
            title: "Select a Game",
            desc: "Choose your challenge: push your speed, sharpen your focus and test your reflexes.",
          },
          {
            step: "4",
            title: "Compete & Win",
            desc: "Finish the mini game as fast and accurately as possible. The player with the best score is crowned the best thinker!",
          },
        ].map(({ step, title, desc }) => (
          <div
            key={step}
            style={{
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: "14px",
              padding: "0.7rem 1rem",
              width: "200px",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.3rem",
              textAlign: "center"}}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#22426b",
              color: "white",
              fontFamily: "var(--font-chewy)",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"}}>
              {step}
            </div>
            <div style={{
              fontFamily: "var(--font-chewy)",
              fontSize: "1.1rem",
              color: "black",
              fontWeight: "600"}}>
              {title}
            </div>
            <div style={{
              fontFamily: "var(--font-chewy)",
              fontSize: "1rem",
              color: "black",
              lineHeight: "1.4"}}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{
        fontSize: "2rem",
        fontWeight: "400",
        fontFamily: "var(--font-chewy)",
        margin: 0,
        marginTop: "3rem",
        color: "black"}}>
        The Thinkers behind the game...
      </h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.6rem",
        justifyContent: "center",
        maxWidth: "700px"}}>
        {teamMembers.map((member) => (
          <div
            key={member.name}
            style={{
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: "12px",
              padding: "0.5rem 1.2rem",
              minWidth: "160px",
              textAlign: "center",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.12)"}}>
            <div style={{
              fontFamily: "var(--font-chewy)",
              fontSize: "1.2rem",
              color: "black",
              fontWeight: "600"}}>
              {member.name}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
