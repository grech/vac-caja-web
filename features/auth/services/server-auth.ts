import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const subject = data?.claims?.sub;

    return !error && typeof subject === "string" ? subject : null;
  } catch {
    return null;
  }
}
