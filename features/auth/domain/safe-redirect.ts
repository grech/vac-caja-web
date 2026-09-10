const DEFAULT_NEXT_PATH = "/caja";
const ALLOWED_NEXT_PATHS = new Set<string>([DEFAULT_NEXT_PATH]);

export function resolveSafeNextPath(requestedNext: string | null): string {
  if (requestedNext && ALLOWED_NEXT_PATHS.has(requestedNext)) {
    return requestedNext;
  }

  return DEFAULT_NEXT_PATH;
}
