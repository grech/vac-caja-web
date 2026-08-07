export const ACTIVITY_EVENT_TYPES = [
  "earn_points",
  "earn_stamp",
  "earn_stamps",
  "adjustment",
  "redeem",
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export type CajaActivityEvent = {
  id: string;
  eventType: ActivityEventType;
  pointsDelta: number;
  stampsDelta: number;
  createdAt: string;
  customerName: string | null;
  rewardName: string | null;
  programType: "points" | "stamps" | null;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asEventType(value: unknown): ActivityEventType | null {
  return typeof value === "string"
    && (ACTIVITY_EVENT_TYPES as readonly string[]).includes(value)
    ? (value as ActivityEventType)
    : null;
}

function asProgramType(value: unknown): "points" | "stamps" | null {
  return value === "points" || value === "stamps" ? value : null;
}

function mapActivityEvent(value: unknown): CajaActivityEvent | null {
  const event = asRecord(value);
  const customer = asRecord(event?.customer);
  const reward = asRecord(event?.reward);
  const id = asString(event?.id);
  const eventType = asEventType(event?.event_type ?? event?.eventType);

  if (!event || !id || !eventType) {
    return null;
  }

  return {
    id,
    eventType,
    pointsDelta: asNumber(event.points_delta ?? event.pointsDelta),
    stampsDelta: asNumber(event.stamps_delta ?? event.stampsDelta),
    createdAt: asString(event.created_at ?? event.createdAt) ?? "",
    customerName: asString(customer?.full_name) ?? asString(customer?.name),
    rewardName: asString(reward?.name),
    programType: asProgramType(event.program_type ?? event.programType),
  };
}

export function mapActivityResult(value: unknown): CajaActivityEvent[] | null {
  const root = asRecord(value);
  const data = root?.data ?? value;
  const payload = asRecord(data);
  const events = Array.isArray(data)
    ? data
    : Array.isArray(payload?.events)
      ? payload.events
      : Array.isArray(payload?.activity)
        ? payload.activity
        : null;

  return events ? events.flatMap((event) => {
    const mapped = mapActivityEvent(event);
    return mapped ? [mapped] : [];
  }) : null;
}
