import { describe, expect, it } from "vitest";
import { createSafeDisplayIdentity } from "./display-identity";

describe("createSafeDisplayIdentity", () => {
  it("allows an owner to display the real authenticated email", () => {
    expect(
      createSafeDisplayIdentity({
        role: "owner",
        profileFullName: "Ana Propietaria",
        loginUsername: null,
        cashierLoginCode: null,
        authenticatedEmail: "ana@example.com",
      }),
    ).toEqual({
      ok: true,
      identity: {
        role: "owner",
        roleLabel: "Owner",
        displayName: "Ana Propietaria",
        displayIdentifier: "ana@example.com",
      },
    });
  });

  it("reconstructs the public cashier alias and discards the Auth email", () => {
    const authEmail = "private-auth-account@example.invalid";
    const result = createSafeDisplayIdentity({
      role: "cashier",
      profileFullName: "Caja Norte",
      loginUsername: "cajero-norte",
      cashierLoginCode: "negocio-abcdefgh",
      authenticatedEmail: authEmail,
    });

    expect(result).toEqual({
      ok: true,
      identity: {
        role: "cashier",
        roleLabel: "Cajero",
        displayName: "Caja Norte",
        displayIdentifier: "cajero-norte@negocio-abcdefgh",
      },
    });
    expect(JSON.stringify(result)).not.toContain(authEmail);
  });

  it("uses safe cashier fallbacks when display fields are missing", () => {
    expect(
      createSafeDisplayIdentity({
        role: "cashier",
        profileFullName: null,
        loginUsername: null,
        cashierLoginCode: null,
        authenticatedEmail: "private-auth-account@example.invalid",
      }),
    ).toEqual({
      ok: true,
      identity: {
        role: "cashier",
        roleLabel: "Cajero",
        displayName: "Cuenta de caja",
        displayIdentifier: "Alias de caja no disponible",
      },
    });
  });

  it("fails safely for an unexpected role", () => {
    expect(
      createSafeDisplayIdentity({
        role: "manager",
        profileFullName: "Cuenta inesperada",
        loginUsername: null,
        cashierLoginCode: null,
        authenticatedEmail: "manager@example.com",
      }),
    ).toEqual({ ok: false, reason: "unsupported-role" });
  });
});
