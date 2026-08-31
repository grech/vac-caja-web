import { describe, expect, it } from "vitest";
import { mapEarnResult, mapRedeemResult } from "./operation-results";

describe("operation result mapping", () => {
  it("reduces points earn response", () => {
    expect(mapEarnResult({ data: {
      program_type: "points",
      new_balance: 240,
      points_earned: 25,
      event: { id: "hidden" },
    } })).toEqual({
      programType: "points",
      pointsBalance: 240,
      stampsBalance: 0,
      pointsDelta: 25,
      stampsDelta: null,
      operationOutcome: null,
    });
  });

  it("reduces stamps earn response", () => {
    expect(mapEarnResult({
      programType: "stamps",
      pointsBalance: 0,
      stampsBalance: 5,
      stampsDelta: 1,
    })).toEqual({
      programType: "stamps",
      pointsBalance: 0,
      stampsBalance: 5,
      pointsDelta: null,
      stampsDelta: 1,
      operationOutcome: null,
    });
  });

  it("reduces redeem response without backend internals", () => {
    const result = mapRedeemResult({ data: {
      program_type: "stamps",
      new_balance: 1,
      stamps_spent: 4,
      reward: { name: "Bebida", id: "hidden-reward" },
      redemption: { id: "hidden-redemption" },
    } });

    expect(result).toEqual({
      programType: "stamps",
      pointsBalance: 0,
      stampsBalance: 1,
      pointsSpent: 0,
      stampsSpent: 4,
      rewardName: "Bebida",
      operationOutcome: null,
    });
    expect(JSON.stringify(result)).not.toContain("hidden-");
  });

  it.each(["applied", "replayed"] as const)(
    "maps nested operationOutcome=%s as a normal earn success",
    (operationOutcome) => {
      expect(mapEarnResult({
        success: true,
        data: {
          program_type: "points",
          new_balance: 25,
          points_earned: 5,
          operationOutcome,
        },
      })).toMatchObject({ operationOutcome });
    },
  );

  it("maps nested replayed redeem outcome", () => {
    expect(mapRedeemResult({
      success: true,
      data: {
        program_type: "stamps",
        new_balance: 2,
        reward_name: "Café",
        operationOutcome: "replayed",
      },
    })).toMatchObject({ operationOutcome: "replayed" });
  });
});
