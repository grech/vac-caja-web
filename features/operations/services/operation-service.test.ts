import { afterEach, describe, expect, it, vi } from "vitest";
import { earnAccount, redeemAccountReward } from "./operation-service";

const OPERATION_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

afterEach(() => {
  vi.restoreAllMocks();
});

function successfulFetch(data: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
    JSON.stringify({ ok: true, data }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  ));
}

describe("Caja operation service", () => {
  it("sends the exact operationId with existing points earn semantics", async () => {
    const fetch = successfulFetch({
      programType: "points",
      pointsBalance: 20,
      stampsBalance: 0,
      pointsDelta: 5,
      stampsDelta: null,
      operationOutcome: "applied",
    });

    const result = await earnAccount({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      operationId: OPERATION_ID,
      purchaseAmount: 250,
      signal: new AbortController().signal,
    });

    expect(result).toMatchObject({ ok: true, data: { operationOutcome: "applied" } });
    expect(fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toEqual({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      operationId: OPERATION_ID,
      purchaseAmount: 250,
    });
  });

  it("sends stamps earn without inventing purchase or balance inputs", async () => {
    const fetch = successfulFetch({
      programType: "stamps",
      pointsBalance: 0,
      stampsBalance: 3,
      pointsDelta: null,
      stampsDelta: 1,
    });

    await earnAccount({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      operationId: OPERATION_ID,
      signal: new AbortController().signal,
    });

    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toEqual({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      operationId: OPERATION_ID,
    });
  });

  it("sends the exact operationId with redeem identifiers", async () => {
    const fetch = successfulFetch({
      programType: "stamps",
      pointsBalance: 0,
      stampsBalance: 1,
      pointsSpent: 0,
      stampsSpent: 4,
      rewardName: "Café",
      operationOutcome: "replayed",
    });

    const result = await redeemAccountReward({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      rewardId: "33333333-3333-4333-8333-333333333333",
      operationId: OPERATION_ID,
      signal: new AbortController().signal,
    });

    expect(result).toMatchObject({ ok: true, data: { operationOutcome: "replayed" } });
    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toEqual({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      rewardId: "33333333-3333-4333-8333-333333333333",
      operationId: OPERATION_ID,
    });
  });

  it("does not automatically retry a conflict response", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ ok: false, code: "LOYALTY_OPERATION_ID_CONFLICT" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    ));

    const result = await earnAccount({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      operationId: OPERATION_ID,
      signal: new AbortController().signal,
    });

    expect(result).toEqual({ ok: false, code: "LOYALTY_OPERATION_ID_CONFLICT" });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("does not automatically retry an ambiguous network failure", async () => {
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockRejectedValue(new TypeError("network unavailable"));

    const result = await redeemAccountReward({
      businessId: "11111111-1111-4111-8111-111111111111",
      accountId: "22222222-2222-4222-8222-222222222222",
      rewardId: "33333333-3333-4333-8333-333333333333",
      operationId: OPERATION_ID,
      signal: new AbortController().signal,
    });

    expect(result).toEqual({ ok: false, code: "NETWORK" });
    expect(fetch).toHaveBeenCalledOnce();
  });
});
