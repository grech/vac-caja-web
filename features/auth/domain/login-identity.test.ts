import { describe, expect, it } from "vitest";
import { prepareLoginCredentials } from "./login-identity";

describe("prepareLoginCredentials", () => {
  it("preserves a valid owner email and password after trimming outer whitespace", async () => {
    const result = await prepareLoginCredentials(
      "  Owner.Name@example.com  ",
      " password unchanged ",
    );

    expect(result).toEqual({
      ok: true,
      credentials: {
        kind: "owner",
        email: "Owner.Name@example.com",
        password: " password unchanged ",
      },
    });
  });

  it("normalizes the cashier username and freezes the v1 identity vector", async () => {
    const visibleAlias = "Caja.Norte@negocio-abcdefgh";
    const result = await prepareLoginCredentials(visibleAlias, "test-password");

    expect(result).toEqual({
      ok: true,
      credentials: {
        kind: "cashier",
        email:
          "cashier.SoxWLGjg8kSvUmr0-ikXc-tQJs3YOi5MsmVgOoe1oac@cashier.vacloy.com",
        password: "test-password",
      },
    });

    if (result.ok) {
      expect(result.credentials.email).not.toBe(visibleAlias);
      expect(result.credentials.email).toMatch(
        /^cashier\.[A-Za-z0-9_-]{43}@cashier\.vacloy\.com$/,
      );
    }
  });

  it.each([
    ["missing @", "owner.example.com"],
    ["empty username", "@negocio-abcdefgh"],
    ["empty login code", "cajero@"],
    ["invalid username characters", "ca+jero@negocio-abcdefgh"],
    ["username starts with punctuation", ".cajero@negocio-abcdefgh"],
    ["username ends with punctuation", "cajero-@negocio-abcdefgh"],
    ["username too short", "ab@negocio-abcdefgh"],
    ["username too long", `${"a".repeat(33)}@negocio-abcdefgh`],
    ["invalid cashier suffix", "cajero@negocio-abcdefg0"],
    ["malformed identifier", "cajero@@negocio-abcdefgh"],
  ])("rejects %s", async (_caseName, identifier) => {
    await expect(prepareLoginCredentials(identifier, "password")).resolves.toEqual(
      { ok: false, reason: "invalid-identifier" },
    );
  });
});
