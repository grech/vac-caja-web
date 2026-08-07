import { normalizeQrValue } from "@/features/scanner/domain/qr-value";
import { earnLoyalty } from "@/features/operations/server/operation-gateway";
import {
  invalidOperationRequest,
  operationResponse,
  unexpectedOperationResponse,
} from "@/features/operations/server/route-response";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return invalidOperationRequest();
  }

  const { businessId, accountId, purchaseAmount } = body as Record<string, unknown>;
  const business = typeof businessId === "string" ? normalizeQrValue(businessId) : null;
  const account = typeof accountId === "string" ? normalizeQrValue(accountId) : null;
  const hasPurchaseAmount = purchaseAmount !== undefined;

  if (
    !business ||
    !account ||
    (hasPurchaseAmount && (
      typeof purchaseAmount !== "number" ||
      !Number.isFinite(purchaseAmount) ||
      purchaseAmount <= 0
    ))
  ) {
    return invalidOperationRequest();
  }

  try {
    return operationResponse(await earnLoyalty({
      businessId: business,
      accountId: account,
      ...(hasPurchaseAmount ? { purchaseAmount: purchaseAmount as number } : {}),
    }));
  } catch {
    return unexpectedOperationResponse();
  }
}
