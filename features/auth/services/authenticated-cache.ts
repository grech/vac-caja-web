import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";

export async function clearAuthenticatedCache(queryClient: QueryClient) {
  await queryClient.cancelQueries({
    queryKey: queryKeys.authenticatedRoot,
  });
  queryClient.removeQueries({
    queryKey: queryKeys.authenticatedRoot,
  });
}
