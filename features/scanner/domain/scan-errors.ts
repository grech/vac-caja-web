export type ScanErrorCode =
  | "INVALID_QR"
  | "ACCOUNT_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "ACCESS_DENIED"
  | "NETWORK"
  | "TIMEOUT"
  | "UNEXPECTED";

const BACKEND_ERROR_CODES: Record<string, ScanErrorCode> = {
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  UNAUTHORIZED: "SESSION_EXPIRED",
  MEMBERSHIP_NOT_FOUND: "ACCESS_DENIED",
  MEMBERSHIP_INACTIVE: "ACCESS_DENIED",
  INSUFFICIENT_ROLE: "ACCESS_DENIED",
  VALIDATION_ERROR: "INVALID_QR",
};

export function normalizeBackendErrorCode(code: unknown): ScanErrorCode {
  return typeof code === "string" && BACKEND_ERROR_CODES[code]
    ? BACKEND_ERROR_CODES[code]
    : "UNEXPECTED";
}

export function normalizeTransportError(error: unknown): ScanErrorCode {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "TIMEOUT";
  }

  if (error instanceof TypeError) {
    return "NETWORK";
  }

  return "UNEXPECTED";
}

export const SCAN_ERROR_COPY: Record<ScanErrorCode, { title: string; description: string }> = {
  INVALID_QR: {
    title: "QR inválido",
    description: "El código leído no corresponde a una cuenta VAC.",
  },
  ACCOUNT_NOT_FOUND: {
    title: "Cuenta no encontrada",
    description: "No encontramos una cuenta activa para este código.",
  },
  SESSION_EXPIRED: {
    title: "Sesión terminada",
    description: "Inicia sesión nuevamente para continuar.",
  },
  ACCESS_DENIED: {
    title: "No tienes acceso operativo",
    description: "Esta cuenta no puede consultar clientes para el negocio actual.",
  },
  NETWORK: {
    title: "No pudimos conectar",
    description: "Revisa la conexión e intenta escanear nuevamente.",
  },
  TIMEOUT: {
    title: "La consulta tardó demasiado",
    description: "La cuenta no se modificó. Intenta escanear nuevamente.",
  },
  UNEXPECTED: {
    title: "Error inesperado",
    description: "No pudimos consultar esta cuenta. Intenta nuevamente.",
  },
};
