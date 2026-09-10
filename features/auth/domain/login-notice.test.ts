import { describe, expect, it } from "vitest";
import { getLoginNotice } from "./login-notice";

describe("getLoginNotice", () => {
  it("returns the approved session-expired notice", () => {
    expect(getLoginNotice("session-expired")).toBe(
      "Tu sesión terminó. Inicia sesión nuevamente.",
    );
  });

  it("returns the approved oauth-error notice", () => {
    expect(getLoginNotice("oauth-error")).toBe(
      "No pudimos iniciar sesión con Google. Intenta nuevamente.",
    );
  });

  it("never reflects an arbitrary URL value", () => {
    expect(getLoginNotice("raw-internal-error")).toBeUndefined();
  });
});
