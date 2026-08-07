import { normalizeTransportError, type ScanErrorCode } from "../domain/scan-errors";
import { mapScanResult, type CajaScanResult } from "../domain/scan-result";

const SCAN_TIMEOUT_MS = 12_000;
const SAFE_CODES = new Set<ScanErrorCode>([
  "INVALID_QR",
  "ACCOUNT_NOT_FOUND",
  "SESSION_EXPIRED",
  "ACCESS_DENIED",
  "NETWORK",
  "TIMEOUT",
  "UNEXPECTED",
]);

export type ScanServiceResult =
  | { ok: true; data: CajaScanResult }
  | { ok: false; code: ScanErrorCode };

function readSafeErrorCode(value: unknown): ScanErrorCode {
  if (!value || typeof value !== "object") {
    return "UNEXPECTED";
  }

  const code = (value as Record<string, unknown>).code;
  return typeof code === "string" && SAFE_CODES.has(code as ScanErrorCode)
    ? (code as ScanErrorCode)
    : "UNEXPECTED";
}

export async function lookupScannedAccount({
  businessId,
  qrCode,
  signal,
}: {
  businessId: string;
  qrCode: string;
  signal: AbortSignal;
}): Promise<ScanServiceResult> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();
  signal.addEventListener("abort", abortFromCaller, { once: true });
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, SCAN_TIMEOUT_MS);

  try {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, qrCode }),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        code: response.status === 401 ? "SESSION_EXPIRED" : readSafeErrorCode(payload),
      };
    }

    const root = payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
    const data = mapScanResult(root?.data);
    return data ? { ok: true, data } : { ok: false, code: "UNEXPECTED" };
  } catch (error) {
    if (signal.aborted && !timedOut) {
      throw new DOMException("Request cancelled", "AbortError");
    }

    return {
      ok: false,
      code: timedOut ? "TIMEOUT" : normalizeTransportError(error),
    };
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener("abort", abortFromCaller);
  }
}
