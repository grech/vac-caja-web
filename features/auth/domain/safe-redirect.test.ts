import { describe, expect, it } from "vitest";
import { resolveSafeNextPath } from "./safe-redirect";

describe("resolveSafeNextPath", () => {
  it("allows the approved /caja destination", () => {
    expect(resolveSafeNextPath("/caja")).toBe("/caja");
  });

  it("falls back to /caja when no next value is present", () => {
    expect(resolveSafeNextPath(null)).toBe("/caja");
  });

  it.each([
    "https://external-site.example",
    "//external-site.example",
    "javascript:alert(1)",
    "/caja/../../etc/passwd",
    "/otra-ruta",
  ])("never allows an open or unapproved redirect target: %s", (value) => {
    expect(resolveSafeNextPath(value)).toBe("/caja");
  });
});
