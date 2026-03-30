// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React from "react";
import Link from "next/link";
import { Button } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";

const Profile: React.FC = () => {
  const { value: userId } = useLocalStorage<string>("userId", "");
  return (
    <div className="card-container">
      <p>
        <strong>SampleUser</strong>
      </p>
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <Link href="/add-friend">
          <Button type="primary">Add Friend</Button>
        </Link>
        <Link href="/friend-requests">
          <Button>Friend Requests</Button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
