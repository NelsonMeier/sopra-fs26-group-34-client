// app/hooks/useRouteGuard.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { App } from "antd";

const SINGLEPLAYER_GAME_ROUTES = [
    "/games/reaction-time",
    "/games/typing-speed",
    "/games/time-interval"
];

const PROTECTED_ROUTES = [
    "/users",
    "/add-friend", 
    "/friend-requests",
    "/multiplayer",
    "/multiplayer/results",
    "/users/[id]",
    "/scoreboard",
    "/games/reaction-time",
    "/games/typing-speed",
    "/games/time-interval"
];

// Checks if incoming route is protected
const isProtectedRoute = (pathname: string): boolean => {
    return PROTECTED_ROUTES.some(route => {
        const pattern = route.replace(/\[id\]/g, "[^/]+");
        return new RegExp(`^${pattern}$`).test(pathname);
    });
};

const isPublicSingleplayerRoute = (pathname: string, hasRoomId: boolean): boolean => {
    if (pathname === "/singleplayer/results") return true;
    return SINGLEPLAYER_GAME_ROUTES.includes(pathname) && !hasRoomId;
};


// Check that user has a token, otherwise redirects to login
export const useRouteGuard = (): { isAuthChecked: boolean; isAuthorized: boolean } => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchParamsString = searchParams.toString();
    const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
    const { message } = App.useApp();
    const apiService = useApi();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Tracks most recent processed route/auth state to avoid duplicate checking
    const lastProcessedPathnameRef = useRef<string | null>(null);

    // Extract user ID from /users/{id} pathname
    const getUserIdFromPathname = (path: string): string | null => {
        const match = path.match(/^\/users\/(.+)$/);
        return match ? match[1] : null;
    };

    useEffect(() => {
        const routeKey = `${pathname}?${searchParamsString}:${token ? "token" : "anonymous"}`;

        // Skip if we've already processed this exact route/auth state
        if (lastProcessedPathnameRef.current === routeKey) {
            return;
        }
        lastProcessedPathnameRef.current = routeKey;
        setIsAuthChecked(false);
        setIsAuthorized(false);

        const checkRoute = async () => {
            const hasRoomId = searchParams.has("roomId");

            if (isPublicSingleplayerRoute(pathname, hasRoomId)) {
                setIsAuthorized(true);
                setIsAuthChecked(true);
                return;
            }

            // Public routes are always accessible
            if (!isProtectedRoute(pathname)) {
                setIsAuthorized(true);
                setIsAuthChecked(true);
                return;
            }

            // Protected route: check for token in localStorage
            const storedToken = localStorage.getItem("token");
            
            if (!storedToken) {
                // No token found => unauthorized
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
                // Check profile ownership for /users/[id] routes
                const requestedId = getUserIdFromPathname(pathname);
                if (requestedId) {
                    const storedUserId = localStorage.getItem("userId");

                    if (requestedId !== storedUserId) {
                        // If the User tries to access someone else's profile,
                        //  theyre redirected to their own profile and get a message
                        message.error("You can only view your own profile.");
                        router.push(`/users/${storedUserId}`);
                        return;
                    }
                }
                // Token found => authorized
                setIsAuthorized(true);
                setIsAuthChecked(true);
            }
        };

        checkRoute();
    }, [pathname, searchParams, searchParamsString, token]);

    return { isAuthChecked, isAuthorized }; // Returns authorisation status
};
