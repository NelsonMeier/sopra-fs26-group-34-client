// app/components/RouteGuardWrapper.tsx
"use client";

import { useRouteGuard } from "@/hooks/useRouteGuard";

// Component lets layout access the RouteGuard
export function RouteGuardWrapper() {
  useRouteGuard();
  return null;
}