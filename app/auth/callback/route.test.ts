import { beforeEach, describe, expect, it, vi } from "vitest";

const { exchangeCodeForSession, createClient } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("../../../lib/supabase/server", () => ({ createClient }));

import { GET } from "./route";

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  createClient.mockReset();
  createClient.mockResolvedValue({ auth: { exchangeCodeForSession } });
});

describe("GET /auth/callback", () => {
  it("exchanges a valid code and redirects to /caja", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request("https://caja.vacloy.com/auth/callback?code=abc123"),
    );

    expect(response.headers.get("location")).toBe(
      "https://caja.vacloy.com/caja",
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc123");
  });

  it("fails closed to /login with the oauth-error notice when the code is missing", async () => {
    const response = await GET(
      new Request("https://caja.vacloy.com/auth/callback"),
    );

    expect(response.headers.get("location")).toBe(
      "https://caja.vacloy.com/login?notice=oauth-error",
    );
    expect(createClient).not.toHaveBeenCalled();
  });

  it("fails closed to /login with the oauth-error notice when the code exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: { message: "invalid_grant" },
    });

    const response = await GET(
      new Request("https://caja.vacloy.com/auth/callback?code=abc123"),
    );

    expect(response.headers.get("location")).toBe(
      "https://caja.vacloy.com/login?notice=oauth-error",
    );
  });

  it("fails closed to /login with the oauth-error notice when the exchange throws", async () => {
    exchangeCodeForSession.mockRejectedValue(new Error("network down"));

    const response = await GET(
      new Request("https://caja.vacloy.com/auth/callback?code=abc123"),
    );

    expect(response.headers.get("location")).toBe(
      "https://caja.vacloy.com/login?notice=oauth-error",
    );
  });

  it("ignores an unsafe next value and redirects to the approved /caja destination", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request(
        "https://caja.vacloy.com/auth/callback?code=abc123&next=https://external-site.example",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://caja.vacloy.com/caja",
    );
  });
});
