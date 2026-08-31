import { describe, expect, it, vi } from "vitest";
import { createOperationId, isValidOperationId } from "./operation-id";

describe("operation identity", () => {
  it("uses the platform cryptographic UUID capability", () => {
    const randomUUID = vi.spyOn(crypto, "randomUUID")
      .mockReturnValue("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");

    expect(createOperationId()).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it.each([
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "BBBBBBBB-BBBB-4BBB-ABBB-BBBBBBBBBBBB",
  ])("accepts valid UUID transport values", (value) => {
    expect(isValidOperationId(value)).toBe(true);
  });

  it.each([undefined, "", "not-a-uuid", " aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa "])(
    "rejects invalid UUID transport value %j",
    (value) => expect(isValidOperationId(value)).toBe(false),
  );
});
