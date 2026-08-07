import { describe, expect, it } from "vitest";
import {
  resolveMembershipRows,
  type ActiveMembershipRow,
} from "./membership-resolution";

const USER_ID = "user-fixture";

function membershipRow(
  overrides: Partial<ActiveMembershipRow> = {},
): ActiveMembershipRow {
  return {
    id: "membership-fixture",
    business_id: "business-fixture",
    profile_id: USER_ID,
    role: "owner",
    status: "active",
    login_username: null,
    profile: { full_name: "Ana Propietaria" },
    business: {
      name: "Café Ejemplo",
      cashier_login_code: "cafe-abcdefgh",
    },
    ...overrides,
  };
}

describe("resolveMembershipRows", () => {
  it("resolves exactly one active membership", () => {
    const result = resolveMembershipRows(
      [membershipRow()],
      USER_ID,
      "ana@example.com",
    );

    expect(result).toEqual({
      status: "resolved",
      currentBusiness: {
        membershipId: "membership-fixture",
        businessId: "business-fixture",
        role: "owner",
        roleLabel: "Owner",
        businessName: "Café Ejemplo",
        safeDisplayName: "Ana Propietaria",
        safeDisplayIdentifier: "ana@example.com",
      },
    });
  });

  it("maps zero memberships to no-active-membership", () => {
    expect(resolveMembershipRows([], USER_ID, null)).toEqual({
      status: "no-active-membership",
    });
  });

  it("maps multiple memberships to the explicit ambiguous state", () => {
    expect(
      resolveMembershipRows(
        [membershipRow(), membershipRow({ id: "membership-two" })],
        USER_ID,
        null,
      ),
    ).toEqual({ status: "multiple-active-memberships" });
  });

  it("fails safely for an unexpected membership role", () => {
    expect(
      resolveMembershipRows(
        [membershipRow({ role: "manager" })],
        USER_ID,
        "manager@example.com",
      ),
    ).toEqual({ status: "error", reason: "unsupported-role" });
  });
});
