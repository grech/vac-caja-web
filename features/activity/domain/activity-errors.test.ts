import { describe, expect, it } from "vitest";
import {
  ActivityServiceError,
  isActivitySessionExpired,
  normalizeActivityBackendError,
} from "./activity-errors";

describe("normalizeActivityBackendError", () => {
  it.each([
    ["UNAUTHORIZED", "SESSION_EXPIRED"],
    ["MEMBERSHIP_NOT_FOUND", "ACCESS_DENIED"],
    ["MEMBERSHIP_INACTIVE", "ACCESS_DENIED"],
    ["INSUFFICIENT_ROLE", "ACCESS_DENIED"],
  ] as const)("maps %s to %s", (backend, expected) => {
    expect(normalizeActivityBackendError(backend)).toBe(expected);
  });

  it("fails safely for unknown errors", () => {
    expect(normalizeActivityBackendError("INTERNAL_DETAIL")).toBe("UNEXPECTED");
  });

  it("identifies only the centralized session-expired response", () => {
    expect(isActivitySessionExpired(new ActivityServiceError("SESSION_EXPIRED"))).toBe(true);
    expect(isActivitySessionExpired(new ActivityServiceError("TIMEOUT"))).toBe(false);
    expect(isActivitySessionExpired(new Error("raw"))).toBe(false);
  });
});
