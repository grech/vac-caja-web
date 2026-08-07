import {
  ActivityServiceError,
  type ActivityErrorCode,
} from "../domain/activity-errors";
import { mapActivityResult } from "../domain/activity-event";

const ACTIVITY_TIMEOUT_MS = 12_000;
const SAFE_CODES = new Set<ActivityErrorCode>([
  "SESSION_EXPIRED",
  "ACCESS_DENIED",
  "NETWORK",
  "TIMEOUT",
  "UNEXPECTED",
]);

function readSafeCode(payload: unknown): ActivityErrorCode {
  if (!payload || typeof payload !== "object") {
    return "UNEXPECTED";
  }

  const code = (payload as Record<string, unknown>).code;
  return typeof code === "string" && SAFE_CODES.has(code as ActivityErrorCode)
    ? (code as ActivityErrorCode)
    : "UNEXPECTED";
}

export async function fetchRecentActivity({
  businessId,
  signal,
}: {
  businessId: string;
  signal: AbortSignal;
}) {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromQuery = () => controller.abort();
  signal.addEventListener("abort", abortFromQuery, { once: true });
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, ACTIVITY_TIMEOUT_MS);

  try {
    const response = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ActivityServiceError(
        response.status === 401 ? "SESSION_EXPIRED" : readSafeCode(payload),
      );
    }

    const root = payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
    const data = mapActivityResult(root?.data);

    if (!data) {
      throw new ActivityServiceError("UNEXPECTED");
    }

    return data;
  } catch (error) {
    if (error instanceof ActivityServiceError) {
      throw error;
    }

    if (signal.aborted && !timedOut) {
      throw error;
    }

    if (timedOut || (error instanceof DOMException && error.name === "AbortError")) {
      throw new ActivityServiceError("TIMEOUT");
    }

    throw new ActivityServiceError(error instanceof TypeError ? "NETWORK" : "UNEXPECTED");
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener("abort", abortFromQuery);
  }
}
