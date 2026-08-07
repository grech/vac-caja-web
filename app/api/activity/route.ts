import { NextResponse } from "next/server";
import { getRecentActivity } from "@/features/activity/server/activity-gateway";
import type { ActivityErrorCode } from "@/features/activity/domain/activity-errors";
import { normalizeQrValue } from "@/features/scanner/domain/qr-value";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };
const ERROR_STATUS: Record<ActivityErrorCode, number> = {
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
      { ok: false, code: "UNEXPECTED" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const { businessId } = body as Record<string, unknown>;
  const business = typeof businessId === "string" ? normalizeQrValue(businessId) : null;

  if (!business) {
    return NextResponse.json(
      { ok: false, code: "UNEXPECTED" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const result = await getRecentActivity(business);
    return NextResponse.json(result, {
      status: result.ok ? 200 : ERROR_STATUS[result.code],
      headers: NO_STORE_HEADERS,
    });
  } catch {
    return NextResponse.json(
      { ok: false, code: "UNEXPECTED" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
