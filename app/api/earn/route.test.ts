import { beforeEach, describe, expect, it, vi } from "vitest";

const { earnLoyalty } = vi.hoisted(() => ({ earnLoyalty: vi.fn() }));

vi.mock("../../../features/operations/server/operation-gateway", () => ({ earnLoyalty }));

import { POST } from "./route";

const BODY = {
  businessId: "11111111-1111-4111-8111-111111111111",
  accountId: "22222222-2222-4222-8222-222222222222",
  operationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  purchaseAmount: 250,
};

beforeEach(() => {
  earnLoyalty.mockReset();
  earnLoyalty.mockResolvedValue({ ok: true, data: { operationOutcome: "applied" } });
});

describe("POST /api/earn", () => {
  it("validates and forwards the exact operationId", async () => {
    const response = await POST(new Request("http://localhost/api/earn", {
      method: "POST",
      body: JSON.stringify(BODY),
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(earnLoyalty).toHaveBeenCalledWith(BODY);
  });

  it("rejects a malformed operationId without reaching the gateway", async () => {
    const response = await POST(new Request("http://localhost/api/earn", {
      method: "POST",
      body: JSON.stringify({ ...BODY, operationId: "invalid" }),
    }));

    expect(response.status).toBe(400);
    expect(earnLoyalty).not.toHaveBeenCalled();
  });
});
