import type { CajaScanResult } from "@/features/scanner/domain/scan-result";

export type OperationDecision =
  | { kind: "auto-earn" }
  | { kind: "choose-action"; canEarn: true; canRedeem: boolean };

export function decideOperation(scan: CajaScanResult): OperationDecision {
  if (scan.programType === "stamps" && scan.availableRewards.length === 0) {
    return { kind: "auto-earn" };
  }

  return {
    kind: "choose-action",
    canEarn: true,
    canRedeem: scan.availableRewards.length > 0,
  };
}
