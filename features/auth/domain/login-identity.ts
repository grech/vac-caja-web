const CASHIER_IDENTITY_PREFIX = "vac-cashier-login:v1";
const CASHIER_EMAIL_PREFIX = "cashier.";
const CASHIER_EMAIL_DOMAIN = "@cashier.vacloy.com";

const CASHIER_USERNAME_PATTERN =
  /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$/;
const CASHIER_LOGIN_CODE_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-[a-z2-9]{8}$/;
const OWNER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginIdentityKind = "owner" | "cashier";

export type PreparedLoginCredentials = {
  kind: LoginIdentityKind;
  email: string;
  password: string;
};

export type PrepareLoginCredentialsResult =
  | { ok: true; credentials: PreparedLoginCredentials }
  | { ok: false; reason: "invalid-identifier" };

function isValidCashierUsername(username: string) {
  return (
    username.length >= 3 &&
    username.length <= 32 &&
    CASHIER_USERNAME_PATTERN.test(username)
  );
}

function isValidCashierLoginCode(loginCode: string) {
  return CASHIER_LOGIN_CODE_PATTERN.test(loginCode);
}

async function sha256Base64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const binary = String.fromCharCode(...new Uint8Array(digest));

  return globalThis
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

async function createCashierAuthEmail(loginCode: string, username: string) {
  const digest = await sha256Base64Url(
    `${CASHIER_IDENTITY_PREFIX}\n${loginCode}\n${username}`,
  );

  return `${CASHIER_EMAIL_PREFIX}${digest}${CASHIER_EMAIL_DOMAIN}`;
}

export async function prepareLoginCredentials(
  identifier: string,
  password: string,
): Promise<PrepareLoginCredentialsResult> {
  const trimmedIdentifier = identifier.trim();
  const identifierParts = trimmedIdentifier.split("@");

  if (identifierParts.length !== 2) {
    return { ok: false, reason: "invalid-identifier" };
  }

  const [visibleUsername, loginCode] = identifierParts;

  if (isValidCashierLoginCode(loginCode)) {
    const canonicalUsername = visibleUsername.trim().toLowerCase();

    if (!isValidCashierUsername(canonicalUsername)) {
      return { ok: false, reason: "invalid-identifier" };
    }

    return {
      ok: true,
      credentials: {
        kind: "cashier",
        email: await createCashierAuthEmail(loginCode, canonicalUsername),
        password,
      },
    };
  }

  if (!OWNER_EMAIL_PATTERN.test(trimmedIdentifier)) {
    return { ok: false, reason: "invalid-identifier" };
  }

  return {
    ok: true,
    credentials: {
      kind: "owner",
      email: trimmedIdentifier,
      password,
    },
  };
}
