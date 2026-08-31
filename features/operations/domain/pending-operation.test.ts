import { describe, expect, it, vi } from "vitest";
import type { CajaScanResult } from "@/features/scanner/domain/scan-result";
import { claimOperationSubmission } from "./submission-guard";
import {
  createPendingEarnOperation,
  createPendingRedeemOperation,
  isAmbiguousOperationError,
  selectPendingOperationForRetry,
} from "./pending-operation";

const SCAN: CajaScanResult = {
  accountId: "11111111-1111-4111-8111-111111111111",
  programType: "stamps",
  pointsBalance: 0,
  stampsBalance: 2,
  stampsPerVisit: 1,
  customer: { displayName: "Cliente Prueba" },
  availableRewards: [],
};

describe("pending loyalty operation", () => {
  it("allocates one ID for an automatic stamps earn after the submission lock", () => {
    const operationIdFactory = vi.fn(() => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    const lock = { current: null as number | null };

    const first = claimOperationSubmission(lock, 4)
      ? createPendingEarnOperation({ version: 4, scan: SCAN }, operationIdFactory)
      : null;
    const duplicate = claimOperationSubmission(lock, 4)
      ? createPendingEarnOperation({ version: 4, scan: SCAN }, operationIdFactory)
      : null;

    expect(first?.operationId).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(duplicate).toBeNull();
    expect(operationIdFactory).toHaveBeenCalledOnce();
  });

  it("returns the same earn or redeem attempt for an ambiguous explicit retry", () => {
    const earn = createPendingEarnOperation(
      { version: 5, scan: SCAN },
      () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    );
    const redeem = createPendingRedeemOperation(
      { version: 6, scan: SCAN, rewardId: "22222222-2222-4222-8222-222222222222" },
      () => "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    );

    expect(selectPendingOperationForRetry(earn, {
      version: 5,
      operation: "earn",
      error: "TIMEOUT",
    })).toBe(earn);
    expect(selectPendingOperationForRetry(redeem, {
      version: 6,
      operation: "redeem",
      error: "NETWORK",
    })).toBe(redeem);
  });

  it("rotates the ID for a new intentional earn or redeem", () => {
    const ids = [
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    ];
    const operationIdFactory = () => ids.shift()!;
    const first = createPendingEarnOperation({ version: 1, scan: SCAN }, operationIdFactory);
    const next = createPendingRedeemOperation({
      version: 2,
      scan: SCAN,
      rewardId: "22222222-2222-4222-8222-222222222222",
    }, operationIdFactory);

    expect(first.operationId).not.toBe(next.operationId);
  });

  it("fails conflict closed without selecting a retry or replacement ID", () => {
    const operationIdFactory = vi.fn(() => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    const pending = createPendingEarnOperation({ version: 1, scan: SCAN }, operationIdFactory);

    expect(isAmbiguousOperationError("LOYALTY_OPERATION_ID_CONFLICT")).toBe(false);
    expect(selectPendingOperationForRetry(pending, {
      version: 1,
      operation: "earn",
      error: "LOYALTY_OPERATION_ID_CONFLICT",
    })).toBeNull();
    expect(operationIdFactory).toHaveBeenCalledOnce();
  });
});
