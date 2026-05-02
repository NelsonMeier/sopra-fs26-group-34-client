// app/hooks/useRouteGuard.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { App } from "antd";

const PROTECTED_ROUTES = [
    "/users",
    "/add-friend", 
    "/friend-requests",
    "/multiplayer",
    "/singleplayer/results",
    "/multiplayer/results",
    "/users/[id]",
    "/scoreboard",
    "/games/reaction-time",
    "/games/typing-speed"
];

const isProtectedRoute = (pathname: string): boolean => {
    return PROTECTED_ROUTES.some(route => {
        const pattern = route.replace(/\[id\]/g, "[^/]+");
        return new RegExp(`^${pattern}$`).test(pathname);
  });
};



export const useRouteGuard = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
    const { message } = App.useApp();
    const apiService = useApi();
    const [isSynced, setIsSynced] = useState(false);

    // Step 1: Wait for useLocalStorage state to sync with actual localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        let parsedStored = "";
        
        if (storedToken) {
            try {
                parsedStored = JSON.parse(storedToken);
            } catch (e) {
                console.error("Failed to parse token from localStorage:", e);
                // Treat invalid data as empty
                parsedStored = "";
            }
        }
        
        // Only mark as synced when React state matches actual localStorage AND token exists
        if (token === parsedStored && storedToken !== null) {
            setIsSynced(true);
        }
    }, [token]);

    // Step 2: Only run route checks after sync is confirmed
    useEffect(() => {
        if (!isSynced) {
            return;
        }

        const checkRoute = async () => {
            if (!isProtectedRoute(pathname)) {
                return;
            }

            // Check localStorage directly, not React state (which may not be synced yet)
            const storedToken = localStorage.getItem("token");
            
            if (!storedToken) {
                message.error("Unauthorized! Please log in first.");
                
                // same as handleLogout in profile, should be refactored into seperate util at some point
                try {
                    const storedUserId = localStorage.getItem("userId");
                    const storedTokenForLogout = localStorage.getItem("token")?.replace(/^"|"$/g, "");

                    if (storedUserId && storedTokenForLogout) {
                        await apiService.post(`/logout/${storedUserId}`, {}, {
                            Authorization: `Bearer ${storedTokenForLogout}`,
                        });
                    }
                } catch (error) {
                    console.error("Logout error:", error);
                } finally {
                    clearToken();
                    localStorage.removeItem("userId");
                    localStorage.removeItem("username");
                    sessionStorage.clear();
                    router.push("/login");
                }
            }
        };

        checkRoute();
    }, [pathname, token, isSynced, message, clearToken, router, apiService]);
};