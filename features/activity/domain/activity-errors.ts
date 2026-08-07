export type ActivityErrorCode =
  | "SESSION_EXPIRED"
  | "ACCESS_DENIED"
  | "NETWORK"
  | "TIMEOUT"
  | "UNEXPECTED";

const BACKEND_ERRORS: Record<string, ActivityErrorCode> = {
  UNAUTHORIZED: "SESSION_EXPIRED",
  MEMBERSHIP_NOT_FOUND: "ACCESS_DENIED",
  MEMBERSHIP_INACTIVE: "ACCESS_DENIED",
  INSUFFICIENT_ROLE: "ACCESS_DENIED",
};

export function normalizeActivityBackendError(code: unknown): ActivityErrorCode {
  return typeof code === "string" && BACKEND_ERRORS[code]
    ? BACKEND_ERRORS[code]
    : "UNEXPECTED";
}

export class ActivityServiceError extends Error {
  constructor(public readonly code: ActivityErrorCode) {
    super("No fue posible cargar la actividad reciente.");
    this.name = "ActivityServiceError";
  }
}

export function isActivitySessionExpired(error: unknown) {
  return error instanceof ActivityServiceError && error.code === "SESSION_EXPIRED";
}
