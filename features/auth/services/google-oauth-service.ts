import type { SupabaseClient } from "@supabase/supabase-js";
import { buildGoogleOAuthRedirectTo } from "../domain/google-oauth";
import type { AuthActionResult } from "../types";
import { classifyAuthError } from "./auth-service";

export async function signInWithGoogleRedirect(
  supabase: SupabaseClient,
  origin: string,
): Promise<AuthActionResult> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildGoogleOAuthRedirectTo(origin),
      },
    });

    if (error) {
      return { ok: false, code: classifyAuthError(error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, code: classifyAuthError(error) };
  }
}
