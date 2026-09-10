import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { signInWithGoogleRedirect } from "./google-oauth-service";

describe("signInWithGoogleRedirect", () => {
  it("requests the google provider with the current Caja-origin callback", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });
    const supabase = { auth: { signInWithOAuth } } as unknown as SupabaseClient;

    await expect(
      signInWithGoogleRedirect(supabase, "https://caja.vacloy.com"),
    ).resolves.toEqual({ ok: true });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://caja.vacloy.com/auth/callback?next=%2Fcaja",
      },
    });
  });

  it("maps a Supabase error to a safe failure code instead of raw provider text", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: {},
      error: { status: 0, name: "AuthRetryableFetchError" },
    });
    const supabase = { auth: { signInWithOAuth } } as unknown as SupabaseClient;

    await expect(
      signInWithGoogleRedirect(supabase, "https://caja.vacloy.com"),
    ).resolves.toEqual({ ok: false, code: "network" });
  });

  it("maps a thrown error to a safe failure code", async () => {
    const signInWithOAuth = vi.fn().mockRejectedValue(new TypeError("failed to fetch"));
    const supabase = { auth: { signInWithOAuth } } as unknown as SupabaseClient;

    await expect(
      signInWithGoogleRedirect(supabase, "https://caja.vacloy.com"),
    ).resolves.toEqual({ ok: false, code: "network" });
  });
});
