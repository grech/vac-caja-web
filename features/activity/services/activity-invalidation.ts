import type { QueryClient } from "@tanstack/react-query";
import type { OperationServiceResult } from "../../operations/services/operation-service";
import { queryKeys, type AuthenticatedQueryScope } from "../../../lib/query/query-keys";

export async function invalidateActivityAfterConfirmedOperation(
  queryClient: QueryClient,
  scope: AuthenticatedQueryScope,
  result: OperationServiceResult<unknown>,
) {
  if (!result.ok) {
    return false;
  }

  await queryClient.invalidateQueries({
    queryKey: queryKeys.recentActivity(scope),
    exact: true,
    refetchType: "none",
  });
  return true;
}
