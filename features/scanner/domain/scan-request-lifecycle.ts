type MutableCell<T> = { current: T };

export type ScanRequestLifecycle = {
  mounted: MutableCell<boolean>;
  version: MutableCell<number>;
  request: MutableCell<AbortController | null>;
};

export function activateScanRequestLifecycle(lifecycle: ScanRequestLifecycle) {
  lifecycle.mounted.current = true;

  return () => {
    lifecycle.mounted.current = false;
    lifecycle.version.current += 1;
    lifecycle.request.current?.abort();
  };
}

export function isCurrentScanRequest(
  lifecycle: Pick<ScanRequestLifecycle, "mounted" | "version">,
  version: number,
) {
  return lifecycle.mounted.current && lifecycle.version.current === version;
}
