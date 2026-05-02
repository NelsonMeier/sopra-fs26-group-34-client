// app/components/RouteGuardWrapper.tsx
"use client";

import { useRouteGuard } from "@/hooks/useRouteGuard";
import { ReactNode } from "react";

interface RouteGuardWrapperProps {
  children: ReactNode;
}

// Component blocks rendering until validation
export function RouteGuardWrapper({ children }: RouteGuardWrapperProps) {
  const { isAuthChecked, isAuthorized } = useRouteGuard();

  // While validation in progress, render nothing (prevents page flashing)
  if (!isAuthChecked) {
    return null;
  }

  // If user is not authorized, render nothing (useRouteGuard redirects to login)
  if (!isAuthorized) {
    return null;
  }

  // Render page if checks are fine
  return <>{children}</>;
}