import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "../../../lib/query/query-keys";
import { invalidateActivityAfterConfirmedOperation } from "./activity-invalidation";

const scope = { userId: "user-a", businessId: "business-a" };

describe("activity invalidation after operations", () => {
  it.each(["earn", "redeem"])("confirmed %s invalidates the exact activity key once", async () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    await invalidateActivityAfterConfirmedOperation(client, scope, {
      ok: true,
      data: { operation: "confirmed" },
    });

    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.recentActivity(scope),
      exact: true,
      refetchType: "none",
    });
  });

  it.each(["TIMEOUT", "UNEXPECTED"] as const)("%s does not invalidate activity", async (code) => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    expect(await invalidateActivityAfterConfirmedOperation(client, scope, {
      ok: false,
      code,
    })).toBe(false);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("does not invalidate another user or business", async () => {
    const client = new QueryClient();
    const exactKey = queryKeys.recentActivity(scope);
    const otherKey = queryKeys.recentActivity({ userId: "user-b", businessId: "business-b" });
    client.setQueryData(exactKey, []);
    client.setQueryData(otherKey, []);

    await invalidateActivityAfterConfirmedOperation(client, scope, { ok: true, data: {} });

    expect(client.getQueryState(exactKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(otherKey)?.isInvalidated).toBe(false);
  });
});
