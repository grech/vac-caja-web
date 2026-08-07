import type { SupabaseClient } from "@supabase/supabase-js";
import { prepareLoginCredentials } from "../domain/login-identity";
import type { AuthActionResult, AuthFailureCode } from "../types";

function classifyAuthError(error: unknown): AuthFailureCode {
  if (
    error instanceof TypeError ||
    (error &&
      typeof error === "object" &&
      ("status" in error && error.status === 0 ||
        "name" in error && error.name === "AuthRetryableFetchError"))
  ) {
    return "network";
  }

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number" &&
    [400, 401, 422].includes(error.status)
  ) {
    return "invalid-credentials";
  }

  return "unexpected";
}

export async function signInWithIdentifier(
  supabase: SupabaseClient,
  identifier: string,
  password: string,
): Promise<AuthActionResult> {
  const prepared = await prepareLoginCredentials(identifier, password);

  if (!prepared.ok) {
    return { ok: false, code: "invalid-credentials" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: prepared.credentials.email,
      password: prepared.credentials.password,
    });

    if (error) {
      return { ok: false, code: classifyAuthError(error) };
    }

    if (!data.session || !data.user) {
      return { ok: false, code: "unexpected" };
    }

    return { ok: true, userId: data.user.id };
  } catch (error) {
    return { ok: false, code: classifyAuthError(error) };
  }
}

export async function signOutSession(
  supabase: SupabaseClient,
): Promise<AuthActionResult> {
  try {
    const { error } = await supabase.auth.signOut();

    return error
      ? { ok: false, code: classifyAuthError(error) }
      : { ok: true };
  } catch (error) {
    return { ok: false, code: classifyAuthError(error) };
  }
}

export async function clearExpiredLocalSession(supabase: SupabaseClient) {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Expired local state is cleared by the provider even if the network is unavailable.
  }
}
