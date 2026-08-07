import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { signInWithIdentifier } from "./auth-service";

describe("signInWithIdentifier", () => {
  it("maps an invalid identifier to the generic credential failure without calling Supabase", async () => {
    const signInWithPassword = vi.fn();
    const supabase = {
      auth: { signInWithPassword },
    } as unknown as SupabaseClient;

    await expect(
      signInWithIdentifier(supabase, "identificador-invalido", "password"),
    ).resolves.toEqual({ ok: false, code: "invalid-credentials" });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
