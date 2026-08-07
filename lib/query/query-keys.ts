export type AuthenticatedQueryScope = {
  userId: string;
  businessId: string;
};

export const queryKeys = {
  root: ["vac-caja"] as const,
  authenticatedRoot: ["vac-caja", "authenticated"] as const,
  membershipResolutionUnavailable: [
    "vac-caja",
    "authenticated",
    "membership-resolution-unavailable",
  ] as const,
  recentActivityUnavailable: [
    "vac-caja",
    "authenticated",
    "recent-activity-unavailable",
  ] as const,
  membershipResolution: (userId: string) =>
    ["vac-caja", "authenticated", userId, "membership-resolution"] as const,
  authenticated: ({ userId, businessId }: AuthenticatedQueryScope) =>
    ["vac-caja", "authenticated", userId, businessId] as const,
  recentActivity: ({ userId, businessId }: AuthenticatedQueryScope) =>
    ["vac-caja", "authenticated", userId, businessId, "recent-activity"] as const,
};
