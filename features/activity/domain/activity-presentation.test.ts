import { describe, expect, it } from "vitest";
import type { CajaActivityEvent } from "./activity-event";
import { formatActivityTime, getActivityTitle } from "./activity-presentation";

function event(overrides: Partial<CajaActivityEvent>): CajaActivityEvent {
  return {
    id: "event",
    eventType: "earn_points",
    pointsDelta: 25,
    stampsDelta: 0,
    createdAt: "2026-08-07T18:00:00.000Z",
    customerName: null,
    rewardName: null,
    programType: "points",
    ...overrides,
  };
}

describe("activity presentation", () => {
  it("formats points, singular/plural stamps, redeem, and adjustment titles", () => {
    expect(getActivityTitle(event({ eventType: "earn_points", pointsDelta: 25 }))).toBe("+25 puntos");
    expect(getActivityTitle(event({ eventType: "earn_stamp", stampsDelta: 1 }))).toBe("+1 sello");
    expect(getActivityTitle(event({ eventType: "earn_stamps", stampsDelta: 2 }))).toBe("+2 sellos");
    expect(getActivityTitle(event({ eventType: "redeem" }))).toBe("Recompensa canjeada");
    expect(getActivityTitle(event({ eventType: "adjustment" }))).toBe("Ajuste de saldo");
  });

  it("handles very recent and invalid/missing dates safely", () => {
    const now = Date.parse("2026-08-07T18:00:30.000Z");
    expect(formatActivityTime("2026-08-07T18:00:00.000Z", now)).toBe("Hace unos segundos");
    expect(formatActivityTime("invalid", now)).toBe("Fecha no disponible");
    expect(formatActivityTime(null, now)).toBe("Fecha no disponible");
  });
});
