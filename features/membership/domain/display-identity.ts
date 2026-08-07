export type MembershipRole = "owner" | "cashier";

type DisplayIdentityInput = {
  role: string;
  profileFullName: string | null;
  loginUsername: string | null;
  cashierLoginCode: string | null;
  authenticatedEmail: string | null;
};

export type SafeDisplayIdentity = {
  role: MembershipRole;
  roleLabel: "Owner" | "Cajero";
  displayName: string;
  displayIdentifier: string;
};

export type DisplayIdentityResult =
  | { ok: true; identity: SafeDisplayIdentity }
  | { ok: false; reason: "unsupported-role" };

function normalizedValue(value: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

export function createSafeDisplayIdentity(
  input: DisplayIdentityInput,
): DisplayIdentityResult {
  const fullName = normalizedValue(input.profileFullName);

  if (input.role === "owner") {
    return {
      ok: true,
      identity: {
        role: "owner",
        roleLabel: "Owner",
        displayName: fullName ?? "Cuenta propietaria",
        displayIdentifier:
          normalizedValue(input.authenticatedEmail) ?? "Correo no disponible",
      },
    };
  }

  if (input.role === "cashier") {
    const loginUsername = normalizedValue(input.loginUsername);
    const cashierLoginCode = normalizedValue(input.cashierLoginCode);

    return {
      ok: true,
      identity: {
        role: "cashier",
        roleLabel: "Cajero",
        displayName: fullName ?? "Cuenta de caja",
        displayIdentifier:
          loginUsername && cashierLoginCode
            ? `${loginUsername}@${cashierLoginCode}`
            : "Alias de caja no disponible",
      },
    };
  }

  return { ok: false, reason: "unsupported-role" };
}
