import { createClient } from "@/lib/supabase/client";
import {
  resolveMembershipRows,
  type ActiveMembershipRow,
  type MembershipResolution,
} from "../domain/membership-resolution";
import { ACTIVE_MEMBERSHIP_SELECT } from "./membership-select";

export class MembershipLoadError extends Error {
  constructor() {
    super("No fue posible cargar la membresía activa.");
    this.name = "MembershipLoadError";
  }
}

export async function fetchMembershipResolution(
  userId: string,
): Promise<MembershipResolution> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("business_members")
    .select(ACTIVE_MEMBERSHIP_SELECT)
    .eq("profile_id", userId)
    .eq("status", "active")
    .returns<ActiveMembershipRow[]>();

  if (error) {
    throw new MembershipLoadError();
  }

  const rows = data ?? [];

  if (rows.length !== 1 || rows[0].role !== "owner") {
    return resolveMembershipRows(rows, userId, null);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user || authData.user.id !== userId) {
    throw new MembershipLoadError();
  }

  return resolveMembershipRows(rows, userId, authData.user.email ?? null);
}
