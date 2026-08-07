import { describe, expect, it } from "vitest";
import { ACTIVE_MEMBERSHIP_SELECT } from "./membership-select";

describe("ACTIVE_MEMBERSHIP_SELECT", () => {
  it("embeds the current member profile through profile_id", () => {
    expect(ACTIVE_MEMBERSHIP_SELECT).toContain(
      "profile:profiles!business_members_profile_id_fkey(full_name)",
    );
    expect(ACTIVE_MEMBERSHIP_SELECT).not.toContain(
      "business_members_created_by_profile_id_fkey",
    );
  });
});
