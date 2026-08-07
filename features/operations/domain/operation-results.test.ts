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
    });
    expect(JSON.stringify(result)).not.toContain("hidden-");
  });
});
