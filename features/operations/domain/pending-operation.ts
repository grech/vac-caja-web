import type { CajaScanResult } from "@/features/scanner/domain/scan-result";
import type { OperationErrorCode } from "./operation-errors";
import { createOperationId } from "./operation-id";

type PendingOperationBase = {
  operationId: string;
  version: number;
  scan: CajaScanResult;
};

export type PendingEarnOperation = PendingOperationBase & {
  operation: "earn";
  purchaseAmount?: number;
};

export type PendingRedeemOperation = PendingOperationBase & {
  operation: "redeem";
  rewardId: string;
};

export type PendingOperation = PendingEarnOperation | PendingRedeemOperation;

type OperationIdFactory = () => string;

export function createPendingEarnOperation(
  input: Omit<PendingEarnOperation, "operation" | "operationId">,
  operationIdFactory: OperationIdFactory = createOperationId,
): PendingEarnOperation {
  return { ...input, operation: "earn", operationId: operationIdFactory() };
}

export function createPendingRedeemOperation(
  input: Omit<PendingRedeemOperation, "operation" | "operationId">,
  operationIdFactory: OperationIdFactory = createOperationId,
): PendingRedeemOperation {
  return { ...input, operation: "redeem", operationId: operationIdFactory() };
}

export function isAmbiguousOperationError(code: OperationErrorCode): boolean {
  return code === "NETWORK" || code === "TIMEOUT" || code === "UNEXPECTED";
}

export function selectPendingOperationForRetry(
  pending: PendingOperation | null,
  failed: { version: number; operation: "earn" | "redeem"; error: OperationErrorCode },
): PendingOperation | null {
  return pending
    && pending.version === failed.version
    && pending.operation === failed.operation
    && isAmbiguousOperationError(failed.error)
    ? pending
    : null;
}
