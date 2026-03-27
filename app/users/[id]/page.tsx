// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Card } from "antd";
import { useParams, useRouter } from "next/navigation";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const {
      value: token,
      clear: clearToken,
    } = useLocalStorage<string>("token", "");

    const [mounted, setMounted] = useState(false);
    const params = useParams();
    const id = params.id;
    const  [user, setUser] = useState<User | null>(null);
    const isMyProfile = user?.token === token;

      useEffect(() =>{
      setMounted(true);
    }, []);

    // useEffect(() => {
    //   if (!mounted) return;
    //   if (!token) {
    //     alert("Not verified, please log in first.");
    //     router.push("/login");
    //     return;
    //   }
    // }, [mounted, token, router]);

    useEffect(() => {
      /*if (!mounted || !token) return;*/
      const fetchUser = async () => {
        try {
          const fetchedUser = await apiService.get<User>(`/users/${id}`);
          setUser(fetchedUser);
        } catch (error) {
          if (error instanceof Error) {
            alert(`Could not load user profile:\n${error.message}`)
            router.push("/users")
          }
        }
      };
      fetchUser();
    }, [mounted, id, token, apiService, router]);

  return (
    <div className="card-container">
      <div className="profile-container">
        <h1>
          <strong>User Profile:</strong>
        </h1>
        <Card
          title={`Hello, ${user?.name}`}
          loading={!user}
          className="dashboard-container"
        >
        </Card>
        </div></div>
  );
};

export default Profile;
