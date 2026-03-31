// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";

interface Friend {  //Defines what a friend object looks like
  id: string | number;
  name: string;
  username: string;
  status: string;
  creationDate: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const { // retieves Token from local storage
      value: token,
      clear: clearToken,
    } = useLocalStorage<string>("token", "");

    const [mounted, setMounted] = useState(false);
    const params = useParams();
    const id = params.id;
    const [user, setUser] = useState<User | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);

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

    useEffect(() => { //Gets User
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
    }, [mounted, id, /*token,*/ apiService, router]);

    useEffect(() => {
      if (!id) return;
      
      const fetchFriends = async () => {  // Gets friend list
        setFriendsLoading(true);
        try {
          const fetchedFriends = await apiService.get<Friend[]>(`/users/${id}/friends`);
          setFriends(fetchedFriends);
        } catch (error) {
          console.error("Could not load friends:", error);
        } finally {
          setFriendsLoading(false);
        }
      };
      
      fetchFriends();
    }, [id, apiService]);

    const handleLogout = async () => {  // Handles logout; Incomplete due to missing apiService.ts implementation
      try{
        await apiService.post(`/logout/${id}`, token);
        clearToken();
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        clearToken();
        router.push("/login");
      }
    };

    const handleAddFriend = () => {
      router.push("/add-friend");
    };

    const handleFriendRequests = () => {
      router.push("/friend-requests");
    };

    const handleSingleplayer = () => {  //To be implemented
      alert("Singleplayer mode coming soon");
    };

    const handleMultiplayer = () => {   //To be implemented
      alert("Multiplayer mode coming soon");
    };

    const handleScoreboard = () => {  //To be implemented
      alert("Scoreboard coming soon");
    };

    // From Figma template
  return (
<div data-layer="User Profile" className="UserProfile" style={{width: '100%', minHeight: '100vh', position: 'relative', background: '#77B8D2', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', overflow: 'hidden', outline: '3px black solid', outlineOffset: '-1.50px'}}>
  <div data-layer="User Profile" className="UserProfile" style={{width: 656, height: 123, left: 419, top: 77, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 64, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>User Profile</div>
  <div data-layer="Rectangle 3" className="Rectangle3" style={{width: 240, height: 80, left: 1096, top: 675, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Scoreboard" className="Scoreboard" style={{width: 250, height: 79, left: 1091, top: 675, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleScoreboard}>Scoreboard</div>
  <div data-layer="Rectangle 9" className="Rectangle9" style={{width: 200, height: 80, left: 128, top: 99, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Logout" className="Logout" style={{width: 190, height: 79, left: 133, top: 99, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleLogout}>Logout</div>
  <div data-layer="Rectangle 4" className="Rectangle4" style={{width: 240, height: 55, left: 818, top: 387, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="add Friend" className="AddFriend" style={{width: 250, height: 61, left: 813, top: 387, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleAddFriend}>add Friend</div>
  <div data-layer="Rectangle 10" className="Rectangle10" style={{width: 240, height: 55, left: 818, top: 464, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Friend Requests" className="FriendRequests" style={{width: 250, height: 61, left: 813, top: 464, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleFriendRequests}>Friend Requests</div>
  <div data-layer="Rectangle 5" className="Rectangle5" style={{width: 240, height: 80, left: 403, top: 798, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Singleplayer" className="Singleplayer" style={{width: 250, height: 79, left: 403, top: 799, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleSingleplayer}>Singleplayer</div>
  <div data-layer="Rectangle 6" className="Rectangle6" style={{width: 240, height: 80, left: 846, top: 799, position: 'absolute', background: '#FBAB7A', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, border: '1px #FBAB7A solid'}} />
  <div data-layer="Multiplayer" className="Multiplayer" style={{width: 250, height: 79, left: 841, top: 799, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}} onClick={handleMultiplayer}>Multiplayer</div>
  <div data-layer="Username:" className="Username" style={{width: 165, height: 42, left: 393, top: 267, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Username:</div>
  <div data-layer="Creation Date:" className="CreationDate" style={{width: 205, height: 39, left: 393, top: 324, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Creation Date:</div>
  <div data-layer="Friends:" className="Friends" style={{width: 165, height: 42, left: 377, top: 378, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Friends:</div>
  <div data-layer="Rectangle 1" className="Rectangle1" style={{width: 200, height: 40, left: 598, top: 267, position: 'absolute', background: '#DBDBDB', borderRadius: 10}} />
  <div data-layer="Rectangle 7" className="Rectangle7" style={{width: 200, height: 42, left: 598, top: 321, position: 'absolute', background: '#DBDBDB', borderRadius: 10}} />
  <div data-layer="CreationDateValue" className="creationDateValue" style={{width: 141, left: 598, top: 334, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>{user?.creationDate || "Loading..."}</div>
  <div data-layer="UsernameValue" className="usernameValue" style={{width: 153, height: 27, left: 612, top: 275, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>{user?.username || "Loading..."}</div>
  <div data-layer="Rectangle 8" className="Rectangle8" style={{width: 200, height: 80, left: 598, top: 384, position: 'absolute', background: '#DBDBDB', borderRadius: 10}} />
  <div data-layer="LetPlayLabel" className="letPlayLabel" style={{width: 225, height: 59, left: 637, top: 675, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 32, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Let&apos;s Play:</div>
  <div data-layer="FriendsListValue" className="friendsListValue" style={{width: 201, height: 73, left: 612, top: 387, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 24, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>{friendsLoading ? "Loading..." : friends.length > 0 ? friends.map(f => f.name).join("") : "No friends yet"}</div>
</div>
  );
};

export default Profile;
