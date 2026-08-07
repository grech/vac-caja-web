import { describe, expect, it } from "vitest";
import { getLoginNotice } from "./login-notice";

describe("getLoginNotice", () => {
  it("returns the approved session-expired notice", () => {
    expect(getLoginNotice("session-expired")).toBe(
      "Tu sesión terminó. Inicia sesión nuevamente.",
    );
  });

  it("never reflects an arbitrary URL value", () => {
    expect(getLoginNotice("raw-internal-error")).toBeUndefined();
  });
});
