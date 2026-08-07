import { describe, expect, it } from "vitest";
import { parsePurchaseAmount } from "./purchase-amount";

describe("parsePurchaseAmount", () => {
  it.each([
    ["250", 250],
    ["25.50", 25.5],
    [" 25,50 ", 25.5],
  ])("accepts %j as %s", (value, expected) => {
    expect(parsePurchaseAmount(value)).toBe(expected);
  });

  it.each(["", "  ", "0", "-1", "Infinity", "NaN", "texto"])(
    "rejects %j",
    (value) => expect(parsePurchaseAmount(value)).toBeNull(),
  );
});
