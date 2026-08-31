import { normalizeQrValue } from "../../../features/scanner/domain/qr-value";
import { isValidOperationId } from "../../../features/operations/domain/operation-id";
import { redeemLoyaltyReward } from "../../../features/operations/server/operation-gateway";
import {
  invalidOperationRequest,
  operationResponse,
  unexpectedOperationResponse,
} from "../../../features/operations/server/route-response";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return invalidOperationRequest();
  }

  const { businessId, accountId, rewardId, operationId } = body as Record<string, unknown>;
  const business = typeof businessId === "string" ? normalizeQrValue(businessId) : null;
  const account = typeof accountId === "string" ? normalizeQrValue(accountId) : null;
  const reward = typeof rewardId === "string" ? normalizeQrValue(rewardId) : null;

  if (!business || !account || !reward || !isValidOperationId(operationId)) {
    return invalidOperationRequest();
  }

  try {
    return operationResponse(await redeemLoyaltyReward({
      businessId: business,
      accountId: account,
      rewardId: reward,
      operationId,
    }));
  } catch {
    return unexpectedOperationResponse();
  }
}
