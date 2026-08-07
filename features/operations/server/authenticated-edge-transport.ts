import "server-only";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const OPERATION_TIMEOUT_MS = 12_000;

type OperationalFunction =
  | "update-points"
  | "redeem-reward"
  | "get-recent-loyalty-events";

export type EdgeTransportResult =
  | { ok: true; responseOk: boolean; status: number; payload: unknown }
  | { ok: false; code: "SESSION_EXPIRED" | "NETWORK" | "TIMEOUT" };

export async function invokeAuthenticatedOperation(
  functionName: OperationalFunction,
  body: Record<string, unknown>,
): Promise<EdgeTransportResult> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const authenticatedUserId = claimsData?.claims?.sub;

  if (claimsError || typeof authenticatedUserId !== "string") {
    return { ok: false, code: "SESSION_EXPIRED" };
  }

  // Claims are the validation boundary. Session access is transport-only.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (
    sessionError ||
    !session?.access_token ||
    session.user.id !== authenticatedUserId
  ) {
    return { ok: false, code: "SESSION_EXPIRED" };
  }

  const { url, publishableKey } = getSupabasePublicConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPERATION_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: publishableKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const payload: unknown = await response.json().catch(() => null);

    return {
      ok: true,
      responseOk: response.ok,
      status: response.status,
      payload,
    };
  } catch (error) {
    return error instanceof DOMException && error.name === "AbortError"
      ? { ok: false, code: "TIMEOUT" }
      : { ok: false, code: "NETWORK" };
  } finally {
    clearTimeout(timeoutId);
  }
}
