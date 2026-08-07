import type { CajaActivityEvent } from "./activity-event";

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function getActivityTitle(event: CajaActivityEvent) {
  switch (event.eventType) {
    case "earn_points":
      return `${signed(event.pointsDelta)} puntos`;
    case "earn_stamp":
    case "earn_stamps":
      return `${signed(event.stampsDelta)} ${Math.abs(event.stampsDelta) === 1 ? "sello" : "sellos"}`;
    case "redeem":
      return "Recompensa canjeada";
    case "adjustment":
      return "Ajuste de saldo";
  }
}

export function getAdjustmentDetail(event: CajaActivityEvent): string | null {
  if (event.eventType !== "adjustment") {
    return null;
  }

  const changes = [
    event.pointsDelta ? `${signed(event.pointsDelta)} puntos` : null,
    event.stampsDelta
      ? `${signed(event.stampsDelta)} ${Math.abs(event.stampsDelta) === 1 ? "sello" : "sellos"}`
      : null,
  ].filter((value): value is string => Boolean(value));

  return changes.length ? changes.join(" · ") : null;
}

export function formatActivityTime(
  createdAt: unknown,
  now = Date.now(),
  locale = "es-MX",
) {
  if (typeof createdAt !== "string") {
    return "Fecha no disponible";
  }

  const timestamp = Date.parse(createdAt);
  if (!Number.isFinite(timestamp)) {
    return "Fecha no disponible";
  }

  const elapsed = Math.max(0, now - timestamp);
  const minutes = Math.floor(elapsed / 60_000);

  if (minutes < 1) {
    return "Hace unos segundos";
  }

  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
  if (minutes < 60) {
    return relative.format(-minutes, "minute");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return relative.format(-hours, "hour");
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}
