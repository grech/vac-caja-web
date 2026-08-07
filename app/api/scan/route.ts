import { NextResponse } from "next/server";
import { normalizeQrValue } from "@/features/scanner/domain/qr-value";
import type { ScanErrorCode } from "@/features/scanner/domain/scan-errors";
import { scanLoyaltyAccount } from "@/features/scanner/server/scan-gateway";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

const ERROR_STATUS: Record<ScanErrorCode, number> = {
  INVALID_QR: 400,
  ACCOUNT_NOT_FOUND: 404,
  SESSION_EXPIRED: 401,
  ACCESS_DENIED: 403,
  NETWORK: 502,
  TIMEOUT: 504,
  UNEXPECTED: 502,
};

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, code: "INVALID_QR" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const { businessId, qrCode } = body as Record<string, unknown>;
  const normalizedBusinessId = typeof businessId === "string"
    ? normalizeQrValue(businessId)
    : null;
  const normalizedQrCode = typeof qrCode === "string" ? normalizeQrValue(qrCode) : null;

  if (!normalizedBusinessId || !normalizedQrCode) {
    return NextResponse.json(
      { ok: false, code: "INVALID_QR" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const result = await scanLoyaltyAccount(normalizedBusinessId, normalizedQrCode);

    if (!result.ok) {
      return NextResponse.json(result, {
        status: ERROR_STATUS[result.code],
        headers: NO_STORE_HEADERS,
      });
    }

    return NextResponse.json(result, { status: 200, headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { ok: false, code: "UNEXPECTED" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
