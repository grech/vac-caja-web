import { beforeEach, describe, expect, it, vi } from "vitest";

const { redeemLoyaltyReward } = vi.hoisted(() => ({
  redeemLoyaltyReward: vi.fn(),
}));

vi.mock("../../../features/operations/server/operation-gateway", () => ({ redeemLoyaltyReward }));

import { POST } from "./route";

const BODY = {
  businessId: "11111111-1111-4111-8111-111111111111",
  accountId: "22222222-2222-4222-8222-222222222222",
  rewardId: "33333333-3333-4333-8333-333333333333",
  operationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
};

beforeEach(() => {
  redeemLoyaltyReward.mockReset();
  redeemLoyaltyReward.mockResolvedValue({ ok: true, data: { operationOutcome: "replayed" } });
});

describe("POST /api/redeem", () => {
  it("validates and forwards the exact operationId", async () => {
    const response = await POST(new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify(BODY),
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(redeemLoyaltyReward).toHaveBeenCalledWith(BODY);
  });

  it("rejects a malformed operationId without reaching the gateway", async () => {
    const response = await POST(new Request("http://localhost/api/redeem", {
      method: "POST",
      body: JSON.stringify({ ...BODY, operationId: "invalid" }),
    }));

    expect(response.status).toBe(400);
    expect(redeemLoyaltyReward).not.toHaveBeenCalled();
  });
});
