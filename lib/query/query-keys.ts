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
  membershipResolution: (userId: string) =>
    ["vac-caja", "authenticated", userId, "membership-resolution"] as const,
  authenticated: ({ userId, businessId }: AuthenticatedQueryScope) =>
    ["vac-caja", "authenticated", userId, businessId] as const,
};
