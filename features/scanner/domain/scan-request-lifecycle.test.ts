import { describe, expect, it } from "vitest";
import {
  activateScanRequestLifecycle,
  isCurrentScanRequest,
  type ScanRequestLifecycle,
} from "./scan-request-lifecycle";

function createLifecycle(): ScanRequestLifecycle {
  return {
    mounted: { current: true },
    version: { current: 0 },
    request: { current: null },
  };
}

describe("scan request lifecycle", () => {
  it("accepts the current result after a Strict Mode setup-cleanup-setup replay", () => {
    const lifecycle = createLifecycle();
    const firstCleanup = activateScanRequestLifecycle(lifecycle);

    firstCleanup();
    const secondCleanup = activateScanRequestLifecycle(lifecycle);
    const requestVersion = ++lifecycle.version.current;

    expect(isCurrentScanRequest(lifecycle, requestVersion)).toBe(true);

    secondCleanup();
  });

  it("rejects a result after cleanup and aborts its active request", () => {
    const lifecycle = createLifecycle();
    const controller = new AbortController();
    lifecycle.request.current = controller;
    const cleanup = activateScanRequestLifecycle(lifecycle);
    const requestVersion = ++lifecycle.version.current;

    cleanup();

    expect(controller.signal.aborted).toBe(true);
    expect(isCurrentScanRequest(lifecycle, requestVersion)).toBe(false);
  });
});
