import { describe, expect, it } from "vitest";
import { mapActivityResult } from "./activity-event";

const TYPES = ["earn_points", "earn_stamp", "earn_stamps", "adjustment", "redeem"] as const;

describe("mapActivityResult", () => {
  it.each(TYPES)("maps canonical %s events", (eventType) => {
    const [event] = mapActivityResult({ events: [{
      id: `event-${eventType}`,
      event_type: eventType,
      points_delta: 25,
      stamps_delta: 1,
      created_at: "2026-08-07T18:00:00.000Z",
      program_type: eventType === "earn_points" ? "points" : "stamps",
    }] }) ?? [];

    expect(event?.eventType).toBe(eventType);
  });

  it("prefers full_name and supports name fallback and null customer", () => {
    const events = mapActivityResult({ events: [
      { id: "a", event_type: "earn_stamp", customer: { full_name: "Nombre completo", name: "Compat" } },
      { id: "b", event_type: "earn_stamp", customer: { name: "Compat" } },
      { id: "c", event_type: "earn_stamp", customer: null },
    ] });

    expect(events?.map((event) => event.customerName)).toEqual([
      "Nombre completo",
      "Compat",
      null,
    ]);
  });

  it("maps reward name while excluding internal customer/program records", () => {
    const [event] = mapActivityResult({ data: { events: [{
      id: "event",
      event_type: "redeem",
      reward: { name: "Café", id: "hidden-reward-id" },
      customer: { full_name: "Cliente", id: "hidden-customer-id", email: "hidden@example.test" },
      program: { id: "hidden-program-id" },
      program_type: "stamps",
    }] } }) ?? [];
    const serialized = JSON.stringify(event);

    expect(event?.rewardName).toBe("Café");
    expect(serialized).not.toContain("hidden-");
    expect(serialized).not.toContain("example.test");
  });

  it("drops an unknown future event type without crashing", () => {
    expect(mapActivityResult({ events: [{ id: "future", event_type: "future_type" }] })).toEqual([]);
  });
});
