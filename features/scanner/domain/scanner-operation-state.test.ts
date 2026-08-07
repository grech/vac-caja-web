import { describe, expect, it } from "vitest";
import type { CajaScanResult } from "./scan-result";
import { initialScannerState, scannerReducer } from "./scanner-state";

const reward = {
  id: "33333333-3333-4333-8333-333333333333",
  name: "Bebida",
  description: null,
  pointsRequired: null,
  stampsRequired: 5,
};

function stampsScan(rewards = [reward]): CajaScanResult {
  return {
    accountId: "11111111-1111-4111-8111-111111111111",
    programType: "stamps",
    pointsBalance: 0,
    stampsBalance: 5,
    stampsPerVisit: 1,
    customer: { displayName: "Cliente Prueba" },
    availableRewards: rewards,
  };
}

describe("scanner operation state", () => {
  it("selects the first returned reward by default", () => {
    const lookingUp = scannerReducer(initialScannerState, { type: "accept", version: 1 });
    const ready = scannerReducer(lookingUp, {
      type: "resolve",
      version: 1,
      result: stampsScan(),
    });

    expect(ready.status).toBe("account-ready");
    expect(ready.status === "account-ready" && ready.selectedRewardId).toBe(reward.id);
  });

  it("moves automatic stamps earn directly from lookup to one submitting state", () => {
    const lookingUp = scannerReducer(initialScannerState, { type: "accept", version: 1 });
    const submitting = scannerReducer(lookingUp, {
      type: "begin-auto-earn",
      version: 1,
      result: stampsScan([]),
    });

    expect(submitting.status).toBe("submitting");
    expect(submitting.status === "submitting" && submitting.operation).toBe("earn");
    expect(scannerReducer(submitting, {
      type: "begin-auto-earn",
      version: 1,
      result: stampsScan([]),
    })).toBe(submitting);
  });

  it("transitions earn success to a terminal state without retaining the account", () => {
    const submitting = {
      status: "submitting" as const,
      version: 1,
      result: stampsScan([]),
      operation: "earn" as const,
    };
    const success = scannerReducer(submitting, {
      type: "resolve-operation",
      version: 1,
      outcome: {
        operation: "earn",
        result: {
          programType: "stamps",
          pointsBalance: 0,
          stampsBalance: 6,
          pointsDelta: null,
          stampsDelta: 1,
        },
      },
    });

    expect(success.status).toBe("operation-success");
    expect("accountId" in success).toBe(false);
    expect("result" in success).toBe(false);
  });

  it("makes timeout terminal and ignores a late success", () => {
    const submitting = {
      status: "submitting" as const,
      version: 1,
      result: stampsScan([]),
      operation: "redeem" as const,
    };
    const timedOut = scannerReducer(submitting, {
      type: "reject-operation",
      version: 1,
      error: "TIMEOUT",
    });

    expect(timedOut).toEqual({
      status: "operation-error",
      version: 1,
      operation: "redeem",
      error: "TIMEOUT",
    });
    expect(scannerReducer(timedOut, {
      type: "resolve-operation",
      version: 1,
      outcome: {
        operation: "redeem",
        result: {
          programType: "stamps",
          pointsBalance: 0,
          stampsBalance: 0,
          pointsSpent: 0,
          stampsSpent: 5,
          rewardName: "Bebida",
        },
      },
    })).toBe(timedOut);
  });

  it("reset clears terminal success and error operation state", () => {
    const success = {
      status: "operation-success" as const,
      version: 1,
      customerDisplayName: "Cliente Prueba",
      outcome: {
        operation: "earn" as const,
        result: {
          programType: "stamps" as const,
          pointsBalance: 0,
          stampsBalance: 6,
          pointsDelta: null,
          stampsDelta: 1,
        },
      },
    };
    const error = {
      status: "operation-error" as const,
      version: 1,
      operation: "redeem" as const,
      error: "TIMEOUT" as const,
    };

    expect(scannerReducer(success, { type: "reset", version: 2 })).toEqual({
      status: "ready",
      version: 2,
    });
    expect(scannerReducer(error, { type: "reset", version: 2 })).toEqual({
      status: "ready",
      version: 2,
    });
  });

  it("ignores a reward identifier not returned by scan", () => {
    const ready = scannerReducer(
      scannerReducer(initialScannerState, { type: "accept", version: 1 }),
      { type: "resolve", version: 1, result: stampsScan() },
    );
    expect(scannerReducer(ready, {
      type: "select-reward",
      rewardId: "99999999-9999-4999-8999-999999999999",
    })).toBe(ready);
  });
});
