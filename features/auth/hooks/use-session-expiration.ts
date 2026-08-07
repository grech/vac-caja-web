"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/auth-provider";

export function useSessionExpiration() {
  const router = useRouter();
  const { endExpiredSession } = useAuth();

  return useCallback(async () => {
    await endExpiredSession();
    router.replace("/login?notice=session-expired");
    router.refresh();
  }, [endExpiredSession, router]);
}
