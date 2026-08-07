import {
  createSafeDisplayIdentity,
  type MembershipRole,
} from "./display-identity";

export type ActiveMembershipRow = {
  id: string | null;
  business_id: string | null;
  profile_id: string | null;
  role: string;
  status: string;
  login_username: string | null;
  profile: { full_name: string | null } | null;
  business: {
    name: string | null;
    cashier_login_code: string | null;
  } | null;
};

export type CurrentBusiness = {
  membershipId: string;
  businessId: string;
  role: MembershipRole;
  roleLabel: "Owner" | "Cajero";
  businessName: string;
  safeDisplayName: string;
  safeDisplayIdentifier: string;
};

export type MembershipResolution =
  | { status: "resolved"; currentBusiness: CurrentBusiness }
  | { status: "no-active-membership" }
  | { status: "multiple-active-memberships" }
  | { status: "error"; reason: "unsupported-role" | "invalid-membership" };

export function resolveMembershipRows(
  rows: ActiveMembershipRow[],
  authenticatedUserId: string,
  authenticatedEmail: string | null,
): MembershipResolution {
  if (rows.length === 0) {
    return { status: "no-active-membership" };
  }

  if (rows.length > 1) {
    return { status: "multiple-active-memberships" };
  }

  const membership = rows[0];

  if (
    !membership.id ||
    !membership.business_id ||
    membership.profile_id !== authenticatedUserId ||
    membership.status !== "active"
  ) {
    return { status: "error", reason: "invalid-membership" };
  }

  const displayResult = createSafeDisplayIdentity({
    role: membership.role,
    profileFullName: membership.profile?.full_name ?? null,
    loginUsername: membership.login_username,
    cashierLoginCode: membership.business?.cashier_login_code ?? null,
    authenticatedEmail,
  });

  if (!displayResult.ok) {
    return { status: "error", reason: displayResult.reason };
  }

  return {
    status: "resolved",
    currentBusiness: {
      membershipId: membership.id,
      businessId: membership.business_id,
      role: displayResult.identity.role,
      roleLabel: displayResult.identity.roleLabel,
      businessName: membership.business?.name?.trim() || "Negocio VAC",
      safeDisplayName: displayResult.identity.displayName,
      safeDisplayIdentifier: displayResult.identity.displayIdentifier,
    },
  };
}
