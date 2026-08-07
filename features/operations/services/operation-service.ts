import {
  normalizeOperationTransportError,
  type OperationErrorCode,
} from "../domain/operation-errors";
import {
  mapEarnResult,
  mapRedeemResult,
  type CajaEarnResult,
  type CajaRedeemResult,
} from "../domain/operation-results";

const OPERATION_TIMEOUT_MS = 12_000;
const SAFE_ERROR_CODES = new Set<OperationErrorCode>([
  "SESSION_EXPIRED",
  "ACCESS_DENIED",
  "ACCOUNT_NOT_FOUND",
  "ACCOUNT_EXPIRED",
  "PROGRAM_NOT_FOUND",
  "INVALID_CONFIGURATION",
  "VALIDATION",
  "NETWORK",
  "TIMEOUT",
  "UNEXPECTED",
  "POINTS_PURCHASE_AMOUNT_REQUIRED",
  "DUPLICATE_SCAN",
  "REWARD_NOT_FOUND",
  "REWARD_INACTIVE",
  "INVALID_REWARD_CONFIGURATION",
  "INSUFFICIENT_POINTS",
  "INSUFFICIENT_STAMPS",
]);

export type OperationServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: OperationErrorCode };

function readSafeCode(payload: unknown): OperationErrorCode {
  if (!payload || typeof payload !== "object") {
    return "UNEXPECTED";
  }

  const code = (payload as Record<string, unknown>).code;
  return typeof code === "string" && SAFE_ERROR_CODES.has(code as OperationErrorCode)
    ? (code as OperationErrorCode)
    : "UNEXPECTED";
}

async function postOperation<T>({
  endpoint,
  body,
  signal,
  mapResult,
}: {
  endpoint: "/api/earn" | "/api/redeem";
  body: Record<string, unknown>;
  signal: AbortSignal;
  mapResult: (payload: unknown) => T | null;
}): Promise<OperationServiceResult<T>> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();
  signal.addEventListener("abort", abortFromCaller, { once: true });
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, OPERATION_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        code: response.status === 401 ? "SESSION_EXPIRED" : readSafeCode(payload),
      };
    }

    const root = payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
    const data = mapResult(root?.data);
    return data ? { ok: true, data } : { ok: false, code: "UNEXPECTED" };
  } catch (error) {
    if (signal.aborted && !timedOut) {
      throw new DOMException("Request cancelled", "AbortError");
    }

    return {
      ok: false,
      code: timedOut ? "TIMEOUT" : normalizeOperationTransportError(error),
    };
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener("abort", abortFromCaller);
  }
}

export function earnAccount(input: {
  businessId: string;
  accountId: string;
  purchaseAmount?: number;
  signal: AbortSignal;
}) {
  return postOperation<CajaEarnResult>({
    endpoint: "/api/earn",
    body: {
      businessId: input.businessId,
      accountId: input.accountId,
      ...(input.purchaseAmount === undefined ? {} : { purchaseAmount: input.purchaseAmount }),
    },
    signal: input.signal,
    mapResult: mapEarnResult,
  });
}

export function redeemAccountReward(input: {
  businessId: string;
  accountId: string;
  rewardId: string;
  signal: AbortSignal;
}) {
  return postOperation<CajaRedeemResult>({
    endpoint: "/api/redeem",
    body: {
      businessId: input.businessId,
      accountId: input.accountId,
      rewardId: input.rewardId,
    },
    signal: input.signal,
    mapResult: mapRedeemResult,
  });
}
