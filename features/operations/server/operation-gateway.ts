import "server-only";

import {
  normalizeOperationBackendError,
  type OperationErrorCode,
} from "../domain/operation-errors";
import {
  buildEarnBackendPayload,
  buildRedeemBackendPayload,
  type EarnPayloadInput,
} from "../domain/operation-payloads";
import {
  mapEarnResult,
  mapRedeemResult,
  type CajaEarnResult,
  type CajaRedeemResult,
} from "../domain/operation-results";
import { invokeAuthenticatedOperation } from "./authenticated-edge-transport";

export type OperationGatewayResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: OperationErrorCode };

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

async function normalizeInvocation<T>(
  invocation: Awaited<ReturnType<typeof invokeAuthenticatedOperation>>,
  mapResult: (payload: unknown) => T | null,
): Promise<OperationGatewayResult<T>> {
  if (!invocation.ok) {
    return invocation;
  }

  if (!invocation.responseOk) {
    return {
      ok: false,
      code: invocation.status === 401
        ? "SESSION_EXPIRED"
        : normalizeOperationBackendError(readBackendCode(invocation.payload)),
    };
  }

  const data = mapResult(invocation.payload);
  return data ? { ok: true, data } : { ok: false, code: "UNEXPECTED" };
}

export async function earnLoyalty(
  input: EarnPayloadInput,
): Promise<OperationGatewayResult<CajaEarnResult>> {
  const invocation = await invokeAuthenticatedOperation(
    "update-points",
    buildEarnBackendPayload(input),
  );
  return normalizeInvocation(invocation, mapEarnResult);
}

export async function redeemLoyaltyReward(input: {
  businessId: string;
  accountId: string;
  rewardId: string;
  operationId: string;
}): Promise<OperationGatewayResult<CajaRedeemResult>> {
  const invocation = await invokeAuthenticatedOperation(
    "redeem-reward",
    buildRedeemBackendPayload(input),
  );
  return normalizeInvocation(invocation, mapRedeemResult);
}
