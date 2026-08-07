const QR_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeQrValue(value: string): string | null {
  const trimmed = value.trim();

  return QR_UUID_PATTERN.test(trimmed) ? trimmed : null;
}
