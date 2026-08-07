"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  CurrentBusiness,
  MembershipResolution,
} from "../domain/membership-resolution";
import { fetchMembershipResolution } from "../services/membership-service";

type RetryState = {
  retry: () => void;
  isRetrying: boolean;
};

export type MembershipViewState =
  | { status: "loading" }
  | ({ status: "resolved"; currentBusiness: CurrentBusiness })
  | ({ status: "no-active-membership" } & RetryState)
  | ({ status: "multiple-active-memberships" } & RetryState)
  | ({ status: "error" } & RetryState);

export function useMembershipResolution(): MembershipViewState {
  const { isReady, userId } = useAuth();
  const canFetch = isReady && Boolean(userId);
  const query = useQuery({
    queryKey: userId
      ? queryKeys.membershipResolution(userId)
      : queryKeys.membershipResolutionUnavailable,
    queryFn: () => {
      if (!userId) {
        throw new Error("Authenticated user is required.");
      }
      return fetchMembershipResolution(userId);
    },
    enabled: canFetch,
  });

  if (!isReady || (canFetch && query.isPending)) {
    return { status: "loading" };
  }

  const retryState: RetryState = {
    retry: () => {
      void query.refetch();
    },
    isRetrying: query.isFetching,
  };

  if (!userId || query.isError || !query.data || query.data.status === "error") {
    return { status: "error", ...retryState };
  }

  const resolution: MembershipResolution = query.data;

  if (resolution.status === "resolved") {
    return resolution;
  }

  return { ...resolution, ...retryState };
}
