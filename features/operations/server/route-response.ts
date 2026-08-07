import { NextResponse } from "next/server";
import type { OperationErrorCode } from "../domain/operation-errors";
import type { OperationGatewayResult } from "./operation-gateway";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

const ERROR_STATUS: Record<OperationErrorCode, number> = {
  SESSION_EXPIRED: 401,
  ACCESS_DENIED: 403,
  ACCOUNT_NOT_FOUND: 404,
  ACCOUNT_EXPIRED: 409,
  PROGRAM_NOT_FOUND: 404,
  INVALID_CONFIGURATION: 409,
  VALIDATION: 400,
  NETWORK: 502,
  TIMEOUT: 504,
  UNEXPECTED: 502,
  POINTS_PURCHASE_AMOUNT_REQUIRED: 400,
  DUPLICATE_SCAN: 409,
  REWARD_NOT_FOUND: 404,
  REWARD_INACTIVE: 409,
  INVALID_REWARD_CONFIGURATION: 409,
  INSUFFICIENT_POINTS: 409,
  INSUFFICIENT_STAMPS: 409,
};

export function operationResponse<T>(result: OperationGatewayResult<T>) {
  return NextResponse.json(result, {
    status: result.ok ? 200 : ERROR_STATUS[result.code],
    headers: NO_STORE_HEADERS,
  });
}

export function invalidOperationRequest() {
  return NextResponse.json(
    { ok: false, code: "VALIDATION" },
    { status: 400, headers: NO_STORE_HEADERS },
  );
}

export function unexpectedOperationResponse() {
  return NextResponse.json(
    { ok: false, code: "UNEXPECTED" },
    { status: 500, headers: NO_STORE_HEADERS },
  );
}
