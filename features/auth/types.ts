export type AuthFailureCode =
  | "invalid-credentials"
  | "network"
  | "configuration"
  | "unexpected";

export type AuthActionResult =
  | { ok: true; userId?: string }
  | { ok: false; code: AuthFailureCode };
