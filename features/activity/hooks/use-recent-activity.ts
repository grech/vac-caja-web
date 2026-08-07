"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useSessionExpiration } from "@/features/auth/hooks/use-session-expiration";
import { queryKeys } from "@/lib/query/query-keys";
import {
  ActivityServiceError,
  isActivitySessionExpired,
} from "../domain/activity-errors";
import { deriveActivityViewState } from "../domain/activity-view-state";
import { fetchRecentActivity } from "../services/activity-service";

export function useRecentActivity(businessId: string) {
  const { isReady, userId } = useAuth();
  const expireSession = useSessionExpiration();
  const handledExpirationRef = useRef(false);
  const refreshLockRef = useRef(false);
  const canFetch = isReady && Boolean(userId) && Boolean(businessId);
  const query = useQuery({
    queryKey: userId
      ? queryKeys.recentActivity({ userId, businessId })
      : queryKeys.recentActivityUnavailable,
    queryFn: ({ signal }) => fetchRecentActivity({ businessId, signal }),
    enabled: canFetch,
    refetchOnMount: "always",
    retry: (failureCount, error) => (
      !(error instanceof ActivityServiceError)
      || (error.code !== "SESSION_EXPIRED" && error.code !== "ACCESS_DENIED")
    ) && failureCount < 1,
  });

  useEffect(() => {
    const sessionExpired = isActivitySessionExpired(query.error);

    if (sessionExpired && !handledExpirationRef.current) {
      handledExpirationRef.current = true;
      void expireSession();
    } else if (!sessionExpired) {
      handledExpirationRef.current = false;
    }
  }, [expireSession, query.error]);

  const refresh = useCallback(async () => {
    if (refreshLockRef.current || query.isFetching) {
      return;
    }

    refreshLockRef.current = true;
    try {
      await query.refetch();
    } finally {
      refreshLockRef.current = false;
    }
  }, [query]);

  return {
    viewState: deriveActivityViewState({
      isPending: !isReady || (canFetch && query.isPending),
      isError: !userId || query.isError,
      isFetching: query.isFetching,
      data: query.data,
    }),
    refresh,
  };
}
