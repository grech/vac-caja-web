import { describe, expect, it } from "vitest";
import { initialScannerState, scannerReducer } from "./scanner-state";

const result = {
  accountId: "account",
  programType: "points" as const,
  pointsBalance: 20,
  stampsBalance: 0,
  stampsPerVisit: null,
  customer: { displayName: "Cliente Prueba" },
  availableRewards: [],
};

describe("scannerReducer", () => {
  it("transitions a successful lookup from looking-up to account-ready", () => {
    const lookingUp = scannerReducer(initialScannerState, { type: "accept", version: 1 });

    expect(scannerReducer(lookingUp, { type: "resolve", version: 1, result })).toEqual({
      status: "account-ready",
      version: 1,
      result,
      selectedRewardId: null,
      purchaseAmount: "",
      amountError: false,
    });
  });

  it("accepts one callback and ignores a second while locked", () => {
    const locked = scannerReducer(initialScannerState, { type: "accept", version: 1 });
    expect(scannerReducer(locked, { type: "accept", version: 2 })).toBe(locked);
  });

  it("reset clears prior customer data", () => {
    const accountReady = scannerReducer(
      scannerReducer(initialScannerState, { type: "accept", version: 1 }),
      { type: "resolve", version: 1, result },
    );
    const withAmount = scannerReducer(accountReady, {
      type: "set-purchase-amount",
      value: "250",
    });
    const ready = scannerReducer(withAmount, { type: "reset", version: 2 });
    expect(ready).toEqual({ status: "ready", version: 2 });
    expect("result" in ready).toBe(false);
    expect("purchaseAmount" in ready).toBe(false);
    expect("selectedRewardId" in ready).toBe(false);
  });

  it("ignores a stale response after reset", () => {
    const reset = scannerReducer(
      { status: "looking-up", version: 1 },
      { type: "reset", version: 2 },
    );
    expect(scannerReducer(reset, { type: "resolve", version: 1, result })).toBe(reset);
  });

  it("transitions a current error response to error state", () => {
    const lookingUp = scannerReducer(initialScannerState, { type: "accept", version: 1 });

    expect(scannerReducer(lookingUp, {
      type: "reject",
      version: 1,
      error: "ACCOUNT_NOT_FOUND",
    })).toEqual({
      status: "error",
      version: 1,
      error: "ACCOUNT_NOT_FOUND",
    });
  });
});
