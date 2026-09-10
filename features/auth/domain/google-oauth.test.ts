import { describe, expect, it } from "vitest";
import { buildGoogleOAuthRedirectTo } from "./google-oauth";

describe("buildGoogleOAuthRedirectTo", () => {
  it("returns to the Caja callback and post-login destination on the given origin", () => {
    expect(buildGoogleOAuthRedirectTo("https://caja.vacloy.com")).toBe(
      "https://caja.vacloy.com/auth/callback?next=%2Fcaja",
    );
  });

  it("never hardcodes another VAC origin", () => {
    expect(buildGoogleOAuthRedirectTo("http://localhost:3000")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fcaja",
    );
  });
});
