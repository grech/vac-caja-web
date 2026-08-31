import { describe, expect, it } from "vitest";
import { buildEarnBackendPayload, buildRedeemBackendPayload } from "./operation-payloads";

describe("operation backend payloads", () => {
  it("maps browser accountId to the canonical earn locator with purchase amount", () => {
    expect(buildEarnBackendPayload({ businessId: "business", accountId: "account", operationId: "operation", purchaseAmount: 250 })).toEqual({
      business_id: "business",
      customer_loyalty_account_id: "account",
      operationId: "operation",
      purchase_amount: 250,
    });
  });

  it("omits purchase amount and calculated deltas for stamps", () => {
    const payload = buildEarnBackendPayload({ businessId: "business", accountId: "account", operationId: "operation" });
    expect(payload).toEqual({
      business_id: "business",
      customer_loyalty_account_id: "account",
      operationId: "operation",
    });
    expect(payload).not.toHaveProperty("points");
    expect(payload).not.toHaveProperty("stamps");
  });

  it("maps redeem identifiers and an explicit null branch", () => {
    expect(buildRedeemBackendPayload({ businessId: "business", accountId: "account", rewardId: "reward", operationId: "operation" })).toEqual({
      business_id: "business",
      account_id: "account",
      reward_id: "reward",
      branch_id: null,
      operationId: "operation",
    });
  });
});
