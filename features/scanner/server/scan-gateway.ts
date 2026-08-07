import "server-only";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { normalizeBackendErrorCode, type ScanErrorCode } from "../domain/scan-errors";
import { mapScanResult, type CajaScanResult } from "../domain/scan-result";

const SCAN_TIMEOUT_MS = 12_000;

export type ScanGatewayResult =
  | { ok: true; data: CajaScanResult }
  | { ok: false; code: ScanErrorCode };

function readBackendCode(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const error = record.error;

  if (error && typeof error === "object") {
    return (error as Record<string, unknown>).code;
  }

  return record.code;
}

export async function scanLoyaltyAccount(
  businessId: string,
  qrCode: string,
): Promise<ScanGatewayResult> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const authenticatedUserId = claimsData?.claims?.sub;

  if (claimsError || typeof authenticatedUserId !== "string") {
    return { ok: false, code: "SESSION_EXPIRED" };
  }

  // The claims check above is the authorization boundary. The session is read
  // only to forward its short-lived token to the private Edge Function.
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
  const timeoutId = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/functions/v1/scan-loyalty-account`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: publishableKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ business_id: businessId, qr_code: qrCode }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        code: response.status === 401
          ? "SESSION_EXPIRED"
          : normalizeBackendErrorCode(readBackendCode(payload)),
      };
    }

    const data = mapScanResult(payload);
    return data ? { ok: true, data } : { ok: false, code: "UNEXPECTED" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, code: "TIMEOUT" };
    }

    return { ok: false, code: "NETWORK" };
  } finally {
    clearTimeout(timeoutId);
  }
}
