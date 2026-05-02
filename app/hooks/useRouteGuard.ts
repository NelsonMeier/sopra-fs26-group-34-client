// app/hooks/useRouteGuard.ts
"use client";

import { useEffect, useState, useRef } from "react";
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



export const useRouteGuard = (): { isAuthChecked: boolean; isAuthorized: boolean } => {
    const router = useRouter();
    const pathname = usePathname();
    const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
    const { message } = App.useApp();
    const apiService = useApi();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const redirectedRef = useRef(false); // Track if we've already redirected for this route

    useEffect(() => {
        const checkRoute = async () => {
            // Public routes are always accessible
            if (!isProtectedRoute(pathname)) {
                setIsAuthorized(true);
                setIsAuthChecked(true);
                redirectedRef.current = false; // Reset for next route check
                return;
            }

            // Protected route: check for token in localStorage
            const storedToken = localStorage.getItem("token");
            
            if (!storedToken) {
                // Only execute redirect logic once per route
                if (redirectedRef.current) {
                    return;
                }
                redirectedRef.current = true;

                // No token found - unauthorized
                setIsAuthorized(false);
                setIsAuthChecked(true);
                
                message.error("Unauthorized! Please log in first.");
                
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
            } else {
                // Token found - authorized
                redirectedRef.current = false; // Reset ref when authorized
                setIsAuthorized(true);
                setIsAuthChecked(true);
            }
        };

        checkRoute();
    }, [pathname, token]); // Only depend on pathname - more stable

    return { isAuthChecked, isAuthorized };
};