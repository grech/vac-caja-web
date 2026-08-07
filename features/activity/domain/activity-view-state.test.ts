import { describe, expect, it } from "vitest";
import { deriveActivityViewState } from "./activity-view-state";

const event = {
  id: "event",
  eventType: "earn_stamp" as const,
  pointsDelta: 0,
  stampsDelta: 1,
  createdAt: "2026-08-07T18:00:00.000Z",
  customerName: null,
  rewardName: null,
  programType: "stamps" as const,
};

describe("deriveActivityViewState", () => {
  it("distinguishes loading, empty, list, and error", () => {
    expect(deriveActivityViewState({ isPending: true, isError: false, isFetching: true, data: undefined })).toEqual({ status: "loading" });
    expect(deriveActivityViewState({ isPending: false, isError: false, isFetching: false, data: [] })).toEqual({ status: "empty", isRefreshing: false, canRefresh: true });
    expect(deriveActivityViewState({ isPending: false, isError: false, isFetching: false, data: [event] })).toEqual({ status: "list", events: [event], isRefreshing: false, canRefresh: true });
    expect(deriveActivityViewState({ isPending: false, isError: true, isFetching: false, data: undefined })).toEqual({ status: "error", canRetry: true });
  });

  it("disables manual refresh while fetching", () => {
    expect(deriveActivityViewState({ isPending: false, isError: false, isFetching: true, data: [event] })).toMatchObject({
      status: "list",
      isRefreshing: true,
      canRefresh: false,
    });
  });
});
