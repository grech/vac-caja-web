export function parsePurchaseAmount(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
