import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys";

describe("recent activity query key", () => {
  it("changes with authenticated user and business", () => {
    const base = queryKeys.recentActivity({ userId: "user-a", businessId: "business-a" });
    expect(queryKeys.recentActivity({ userId: "user-b", businessId: "business-a" })).not.toEqual(base);
    expect(queryKeys.recentActivity({ userId: "user-a", businessId: "business-b" })).not.toEqual(base);
  });

  it("is naturally removed with the authenticated cache root", () => {
    const client = new QueryClient();
    const userA = queryKeys.recentActivity({ userId: "user-a", businessId: "business-a" });
    const userB = queryKeys.recentActivity({ userId: "user-b", businessId: "business-b" });
    client.setQueryData(userA, [{ id: "event-a" }]);
    client.setQueryData(userB, [{ id: "event-b" }]);

    client.removeQueries({ queryKey: queryKeys.authenticatedRoot });

    expect(client.getQueryData(userA)).toBeUndefined();
    expect(client.getQueryData(userB)).toBeUndefined();
  });
});
