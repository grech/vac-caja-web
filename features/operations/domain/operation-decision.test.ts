import { describe, expect, it } from "vitest";
import type { CajaScanResult } from "@/features/scanner/domain/scan-result";
import { decideOperation } from "./operation-decision";

function scan(programType: "points" | "stamps", rewardCount: number): CajaScanResult {
  return {
    accountId: "11111111-1111-4111-8111-111111111111",
    programType,
    pointsBalance: 10,
    stampsBalance: 2,
    stampsPerVisit: programType === "stamps" ? 1 : null,
    customer: { displayName: "Cliente Prueba" },
    availableRewards: Array.from({ length: rewardCount }, (_, index) => ({
      id: `${index + 1}1111111-1111-4111-8111-111111111111`,
      name: `Recompensa ${index + 1}`,
      description: null,
      pointsRequired: programType === "points" ? 10 : null,
      stampsRequired: programType === "stamps" ? 5 : null,
    })),
  };
}

describe("decideOperation", () => {
  it("automatically earns for stamps without rewards", () => {
    expect(decideOperation(scan("stamps", 0))).toEqual({ kind: "auto-earn" });
  });

  it("offers earn and redeem for stamps with rewards", () => {
    expect(decideOperation(scan("stamps", 1))).toEqual({
      kind: "choose-action",
      canEarn: true,
      canRedeem: true,
    });
  });

  it("offers points earn when no reward exists", () => {
    expect(decideOperation(scan("points", 0))).toEqual({
      kind: "choose-action",
      canEarn: true,
      canRedeem: false,
    });
  });

  it("offers points earn or redeem when rewards exist", () => {
    expect(decideOperation(scan("points", 1))).toEqual({
      kind: "choose-action",
      canEarn: true,
      canRedeem: true,
    });
  });
});
