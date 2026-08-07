import { describe, expect, it } from "vitest";
import { normalizeQrValue } from "./qr-value";

describe("normalizeQrValue", () => {
  it.each(["1", "2", "3", "4", "5"])("accepts UUID version %s", (version) => {
    expect(normalizeQrValue(`123e4567-e89b-${version}2d3-a456-426614174000`)).toBe(
      `123e4567-e89b-${version}2d3-a456-426614174000`,
    );
  });

  it("accepts uppercase and trims outer whitespace without changing case", () => {
    expect(normalizeQrValue("  123E4567-E89B-42D3-A456-426614174000\n")).toBe(
      "123E4567-E89B-42D3-A456-426614174000",
    );
  });

  it("rejects an invalid version", () => {
    expect(normalizeQrValue("123e4567-e89b-62d3-a456-426614174000")).toBeNull();
  });

  it("rejects an invalid variant", () => {
    expect(normalizeQrValue("123e4567-e89b-42d3-7456-426614174000")).toBeNull();
  });

  it.each(["", "not-a-uuid", "123e4567e89b42d3a456426614174000"])(
    "rejects malformed value %j",
    (value) => expect(normalizeQrValue(value)).toBeNull(),
  );
});
