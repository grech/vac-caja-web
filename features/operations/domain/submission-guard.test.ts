import { describe, expect, it } from "vitest";
import { claimOperationSubmission, clearOperationSubmission } from "./submission-guard";

describe("operation submission guard", () => {
  it("allows exactly one automatic earn for a scan version across repeated calls", () => {
    const lock = { current: null as number | null };
    expect(claimOperationSubmission(lock, 7)).toBe(true);
    expect(claimOperationSubmission(lock, 7)).toBe(false);
    expect(claimOperationSubmission(lock, 8)).toBe(false);
  });

  it("blocks double redeem submission until an explicit reset", () => {
    const lock = { current: null as number | null };
    expect(claimOperationSubmission(lock, 2)).toBe(true);
    expect(claimOperationSubmission(lock, 2)).toBe(false);
    clearOperationSubmission(lock);
    expect(claimOperationSubmission(lock, 3)).toBe(true);
  });
});
