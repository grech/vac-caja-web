import { describe, expect, it } from "vitest";
import { normalizeBackendErrorCode, normalizeTransportError } from "./scan-errors";

describe("scan error normalization", () => {
  it.each([
    ["ACCOUNT_NOT_FOUND", "ACCOUNT_NOT_FOUND"],
    ["UNAUTHORIZED", "SESSION_EXPIRED"],
    ["MEMBERSHIP_NOT_FOUND", "ACCESS_DENIED"],
    ["MEMBERSHIP_INACTIVE", "ACCESS_DENIED"],
    ["INSUFFICIENT_ROLE", "ACCESS_DENIED"],
  ] as const)("maps %s to %s", (backendCode, expected) => {
    expect(normalizeBackendErrorCode(backendCode)).toBe(expected);
  });

  it("maps timeout, network, and generic transport failures", () => {
    expect(normalizeTransportError(new DOMException("stopped", "AbortError"))).toBe("TIMEOUT");
    expect(normalizeTransportError(new TypeError("fetch failed"))).toBe("NETWORK");
    expect(normalizeTransportError(new Error("unknown"))).toBe("UNEXPECTED");
  });

  it("fails safely for an unknown backend code", () => {
    expect(normalizeBackendErrorCode("INTERNAL_DETAIL")).toBe("UNEXPECTED");
  });
});
