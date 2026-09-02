import { describe, expect, it, vi } from "vitest";
import { decideOperation } from "../../operations/domain/operation-decision";
import {
  createPendingEarnOperation,
  type PendingEarnOperation,
} from "../../operations/domain/pending-operation";
import {
  claimOperationSubmission,
  clearOperationSubmission,
} from "../../operations/domain/submission-guard";
import {
  initialScannerState,
  scannerReducer,
  type ScannerState,
} from "../domain/scanner-state";
import type { CajaScanResult } from "../domain/scan-result";
import { createQrFrameAdmissionGuard } from "./use-qr-camera";

const STAMPS_SCAN: CajaScanResult = {
  accountId: "11111111-1111-4111-8111-111111111111",
  programType: "stamps",
  pointsBalance: 0,
  stampsBalance: 1,
  stampsPerVisit: 1,
  customer: { displayName: "Cliente Prueba" },
  availableRewards: [],
};

describe("scan lookup rearm integration contract", () => {
  it("admits no second operation until a fresh cleared frame, then creates one new ID", () => {
    const frameGuard = createQrFrameAdmissionGuard();
    const operationLock = { current: null as number | null };
    const operationIds = [
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    ];
    const operationIdFactory = vi.fn(() => operationIds.shift()!);
    const lookup = vi.fn((qrCode: string) => {
      void qrCode;
      return STAMPS_SCAN;
    });
    const earn = vi.fn();
    const operations: PendingEarnOperation[] = [];
    let state: ScannerState = initialScannerState;
    let version = 0;
    let scanLocked = false;

    const admitFrame = (presentedFrames: number, decoded: string | null) => {
      if (!frameGuard.observePresentedFrame(presentedFrames)) {
        return;
      }

      const admitted = frameGuard.admit(decoded);
      if (admitted === null || scanLocked) {
        return;
      }

      scanLocked = true;
      const scanVersion = ++version;
      state = scannerReducer(state, { type: "accept", version: scanVersion });
      const result = lookup(admitted);

      if (decideOperation(result).kind !== "auto-earn"
        || !claimOperationSubmission(operationLock, scanVersion)) {
        return;
      }

      const pending = createPendingEarnOperation(
        { version: scanVersion, scan: result },
        operationIdFactory,
      );
      operations.push(pending);
      state = scannerReducer(state, {
        type: "begin-auto-earn",
        version: scanVersion,
        result,
      });
      earn(pending);
    };

    frameGuard.beginScanCycle();
    admitFrame(1, "QR-A");
    expect(lookup).toHaveBeenCalledOnce();
    expect(earn).toHaveBeenCalledOnce();

    const first = operations[0]!;
    state = scannerReducer(state, {
      type: "resolve-operation",
      version: first.version,
      outcome: {
        operation: "earn",
        result: {
          programType: "stamps",
          pointsBalance: 0,
          stampsBalance: 2,
          pointsDelta: null,
          stampsDelta: 1,
        },
      },
    });
    expect(state.status).toBe("operation-success");

    frameGuard.pauseForRearm(1);
    frameGuard.beginScanCycle();
    scanLocked = false;
    clearOperationSubmission(operationLock);
    state = scannerReducer(state, { type: "reset", version: ++version });

    admitFrame(1, "QR-A");
    admitFrame(2, "QR-A");
    expect(lookup).toHaveBeenCalledOnce();
    expect(earn).toHaveBeenCalledOnce();
    expect(operationIdFactory).toHaveBeenCalledOnce();

    admitFrame(3, null);
    admitFrame(4, "QR-B");

    expect(lookup).toHaveBeenCalledTimes(2);
    expect(lookup).toHaveBeenLastCalledWith("QR-B");
    expect(earn).toHaveBeenCalledTimes(2);
    expect(operationIdFactory).toHaveBeenCalledTimes(2);
    expect(operations[1]?.operationId).not.toBe(first.operationId);
  });
});
