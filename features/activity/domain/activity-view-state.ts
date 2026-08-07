import type { CajaActivityEvent } from "./activity-event";

export type ActivityViewState =
  | { status: "loading" }
  | { status: "error"; canRetry: true }
  | { status: "empty"; isRefreshing: boolean; canRefresh: boolean }
  | {
      status: "list";
      events: CajaActivityEvent[];
      isRefreshing: boolean;
      canRefresh: boolean;
    };

export function deriveActivityViewState({
  isPending,
  isError,
  isFetching,
  data,
}: {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  data: CajaActivityEvent[] | undefined;
}): ActivityViewState {
  if (isPending) {
    return { status: "loading" };
  }

  if (isError || !data) {
    return { status: "error", canRetry: true };
  }

  const refreshState = {
    isRefreshing: isFetching,
    canRefresh: !isFetching,
  };

  return data.length
    ? { status: "list", events: data, ...refreshState }
    : { status: "empty", ...refreshState };
}
