export type OperationErrorCode =
  | "SESSION_EXPIRED"
  | "ACCESS_DENIED"
  | "ACCOUNT_NOT_FOUND"
  | "ACCOUNT_EXPIRED"
  | "PROGRAM_NOT_FOUND"
  | "INVALID_CONFIGURATION"
  | "VALIDATION"
  | "NETWORK"
  | "TIMEOUT"
  | "UNEXPECTED"
  | "POINTS_PURCHASE_AMOUNT_REQUIRED"
  | "DUPLICATE_SCAN"
  | "REWARD_NOT_FOUND"
  | "REWARD_INACTIVE"
  | "INVALID_REWARD_CONFIGURATION"
  | "INSUFFICIENT_POINTS"
  | "INSUFFICIENT_STAMPS";

const BACKEND_ERRORS: Record<string, OperationErrorCode> = {
  UNAUTHORIZED: "SESSION_EXPIRED",
  MEMBERSHIP_NOT_FOUND: "ACCESS_DENIED",
  MEMBERSHIP_INACTIVE: "ACCESS_DENIED",
  INSUFFICIENT_ROLE: "ACCESS_DENIED",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  ACCOUNT_EXPIRED: "ACCOUNT_EXPIRED",
  PROGRAM_NOT_FOUND: "PROGRAM_NOT_FOUND",
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
  VALIDATION: "VALIDATION",
  VALIDATION_ERROR: "VALIDATION",
  POINTS_PURCHASE_AMOUNT_REQUIRED: "POINTS_PURCHASE_AMOUNT_REQUIRED",
  DUPLICATE_SCAN: "DUPLICATE_SCAN",
  REWARD_NOT_FOUND: "REWARD_NOT_FOUND",
  REWARD_INACTIVE: "REWARD_INACTIVE",
  INVALID_REWARD_CONFIGURATION: "INVALID_REWARD_CONFIGURATION",
  INSUFFICIENT_POINTS: "INSUFFICIENT_POINTS",
  INSUFFICIENT_STAMPS: "INSUFFICIENT_STAMPS",
};

export function normalizeOperationBackendError(code: unknown): OperationErrorCode {
  return typeof code === "string" && BACKEND_ERRORS[code]
    ? BACKEND_ERRORS[code]
    : "UNEXPECTED";
}

export function normalizeOperationTransportError(error: unknown): OperationErrorCode {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "TIMEOUT";
  }

  return error instanceof TypeError ? "NETWORK" : "UNEXPECTED";
}

export const OPERATION_ERROR_COPY: Record<
  OperationErrorCode,
  { title: string; description: string }
> = {
  SESSION_EXPIRED: { title: "Sesión terminada", description: "Inicia sesión nuevamente para continuar." },
  ACCESS_DENIED: { title: "Sin acceso operativo", description: "Esta cuenta no puede realizar la operación para este negocio." },
  ACCOUNT_NOT_FOUND: { title: "Cuenta no encontrada", description: "Vuelve a escanear la cuenta antes de continuar." },
  ACCOUNT_EXPIRED: { title: "Cuenta vencida", description: "La cuenta ya no admite operaciones de lealtad." },
  PROGRAM_NOT_FOUND: { title: "Programa no disponible", description: "El programa de lealtad no está disponible en este momento." },
  INVALID_CONFIGURATION: { title: "Programa no disponible", description: "La configuración del programa no permite completar esta operación." },
  VALIDATION: { title: "Operación no válida", description: "Vuelve a escanear la cuenta e intenta con datos válidos." },
  NETWORK: { title: "No pudimos conectar", description: "No sabemos si la operación llegó al servidor. Vuelve a escanear para revisar el saldo." },
  TIMEOUT: { title: "No pudimos confirmar la operación", description: "No repitas la operación automáticamente. Vuelve a escanear la cuenta para revisar su saldo." },
  UNEXPECTED: { title: "No pudimos completar la operación", description: "Vuelve a escanear la cuenta antes de intentar otra acción." },
  POINTS_PURCHASE_AMOUNT_REQUIRED: { title: "Monto requerido", description: "Ingresa un monto de compra válido antes de registrar puntos." },
  DUPLICATE_SCAN: { title: "Compra registrada recientemente", description: "La protección contra duplicados detuvo otro registro para esta cuenta. Vuelve a escanear para revisar el saldo." },
  REWARD_NOT_FOUND: { title: "Recompensa no disponible", description: "La recompensa seleccionada ya no está disponible." },
  REWARD_INACTIVE: { title: "Recompensa inactiva", description: "Selecciona otra recompensa después de volver a escanear." },
  INVALID_REWARD_CONFIGURATION: { title: "Recompensa no disponible", description: "La configuración actual no permite este canje." },
  INSUFFICIENT_POINTS: { title: "Puntos insuficientes", description: "La cuenta no tiene puntos suficientes para este canje." },
  INSUFFICIENT_STAMPS: { title: "Sellos insuficientes", description: "La cuenta no tiene sellos suficientes para este canje." },
};
