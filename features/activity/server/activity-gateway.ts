import "server-only";

import { invokeAuthenticatedOperation } from "@/features/operations/server/authenticated-edge-transport";
import {
  normalizeActivityBackendError,
  type ActivityErrorCode,
} from "../domain/activity-errors";
import { mapActivityResult, type CajaActivityEvent } from "../domain/activity-event";

export type ActivityGatewayResult =
  | { ok: true; data: CajaActivityEvent[] }
  | { ok: false; code: ActivityErrorCode };

function readBackendCode(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }

  const root = value as Record<string, unknown>;
  if (root.error && typeof root.error === "object") {
    return (root.error as Record<string, unknown>).code;
  }

  return root.code;
}

export async function getRecentActivity(businessId: string): Promise<ActivityGatewayResult> {
  const invocation = await invokeAuthenticatedOperation(
    "get-recent-loyalty-events",
    { business_id: businessId },
  );

  if (!invocation.ok) {
    return invocation;
  }

  if (!invocation.responseOk) {
    return {
      ok: false,
      code: invocation.status === 401
        ? "SESSION_EXPIRED"
        : normalizeActivityBackendError(readBackendCode(invocation.payload)),
    };
  }

  const data = mapActivityResult(invocation.payload);
  return data ? { ok: true, data } : { ok: false, code: "UNEXPECTED" };
}
