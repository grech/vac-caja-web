import { describe, expect, it } from "vitest";
import { mapScanResult } from "./scan-result";

const rawBackendPayload = {
  data: {
    account: {
      id: "11111111-1111-4111-8111-111111111111",
      points_balance: 125,
      stamps_balance: 4,
      customer: {
        full_name: "Ada Prueba",
        email: "ada@example.test",
        phone: "+520000000000",
        id: "internal-customer-id",
      },
      qr_code: "22222222-2222-4222-8222-222222222222",
    },
    program: { type: "stamps", stamps_per_visit: 2, configuration: { private: true } },
    available_rewards: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Bebida",
        description: "Una bebida de prueba",
        points_required: null,
        stamps_required: 8,
      },
    ],
  },
};

describe("mapScanResult", () => {
  it("maps the backend account to the reduced Caja DTO", () => {
    expect(mapScanResult(rawBackendPayload)).toEqual({
      accountId: "11111111-1111-4111-8111-111111111111",
      programType: "stamps",
      pointsBalance: 125,
      stampsBalance: 4,
      stampsPerVisit: 2,
      customer: { displayName: "Ada Prueba" },
      availableRewards: [{
        id: "33333333-3333-4333-8333-333333333333",
        name: "Bebida",
        description: "Una bebida de prueba",
        pointsRequired: null,
        stampsRequired: 8,
      }],
    });
  });

  it("never includes email, phone, QR, or raw program configuration", () => {
    const serialized = JSON.stringify(mapScanResult(rawBackendPayload));
    expect(serialized).not.toContain("ada@example.test");
    expect(serialized).not.toContain("+520000000000");
    expect(serialized).not.toContain("qr_code");
    expect(serialized).not.toContain("configuration");
  });

  it("uses Cliente when the customer name is unavailable", () => {
    const result = mapScanResult({
      account: { id: "account", points_balance: 10, stamps_balance: 0 },
      program: { type: "points", stamps_per_visit: null },
      customer: { email: "hidden@example.test" },
      available_rewards: [],
    });

    expect(result?.customer.displayName).toBe("Cliente");
    expect(result?.programType).toBe("points");
    expect(result?.stampsPerVisit).toBeNull();
  });

  it("rejects an unsupported program type", () => {
    expect(mapScanResult({ account: { id: "account" }, program: { type: "other" } })).toBeNull();
  });
});
