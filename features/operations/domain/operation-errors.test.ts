import { describe, expect, it } from "vitest";
import {
  normalizeOperationBackendError,
  normalizeOperationTransportError,
} from "./operation-errors";

describe("normalizeOperationBackendError", () => {
  it.each([
    ["DUPLICATE_SCAN", "DUPLICATE_SCAN"],
    ["ACCOUNT_EXPIRED", "ACCOUNT_EXPIRED"],
    ["UNAUTHORIZED", "SESSION_EXPIRED"],
    ["REWARD_NOT_FOUND", "REWARD_NOT_FOUND"],
    ["REWARD_INACTIVE", "REWARD_INACTIVE"],
    ["INVALID_REWARD_CONFIGURATION", "INVALID_REWARD_CONFIGURATION"],
    ["INSUFFICIENT_POINTS", "INSUFFICIENT_POINTS"],
    ["INSUFFICIENT_STAMPS", "INSUFFICIENT_STAMPS"],
  ] as const)("maps %s to %s", (backend, expected) => {
    expect(normalizeOperationBackendError(backend)).toBe(expected);
  });

  it("maps unknown failures safely", () => {
    expect(normalizeOperationBackendError("RAW_INTERNAL_ERROR")).toBe("UNEXPECTED");
  });

  it("distinguishes timeout, network, and generic transport failures", () => {
    expect(normalizeOperationTransportError(new DOMException("stopped", "AbortError"))).toBe("TIMEOUT");
    expect(normalizeOperationTransportError(new TypeError("fetch failed"))).toBe("NETWORK");
    expect(normalizeOperationTransportError(new Error("unknown"))).toBe("UNEXPECTED");
  });
});
