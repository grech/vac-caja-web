"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateActivityAfterConfirmedOperation } from "@/features/activity/services/activity-invalidation";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useSessionExpiration } from "@/features/auth/hooks/use-session-expiration";
import { decideOperation } from "@/features/operations/domain/operation-decision";
import { parsePurchaseAmount } from "@/features/operations/domain/purchase-amount";
import {
  createPendingEarnOperation,
  createPendingRedeemOperation,
  isAmbiguousOperationError,
  selectPendingOperationForRetry,
  type PendingEarnOperation,
  type PendingOperation,
  type PendingRedeemOperation,
} from "@/features/operations/domain/pending-operation";
import {
  claimOperationSubmission,
  clearOperationSubmission,
} from "@/features/operations/domain/submission-guard";
import {
  earnAccount,
  redeemAccountReward,
} from "@/features/operations/services/operation-service";
import { normalizeQrValue } from "../domain/qr-value";
import {
  activateScanRequestLifecycle,
  isCurrentScanRequest,
} from "../domain/scan-request-lifecycle";
import {
  initialScannerState,
  scannerReducer,
  type ScannerState,
} from "../domain/scanner-state";
import { lookupScannedAccount } from "../services/scan-service";

export function useScanLookup(businessId: string) {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const [state, dispatch] = useReducer(scannerReducer, initialScannerState);
  const lockedRef = useRef(false);
  const versionRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const operationLockRef = useRef<number | null>(null);
  const pendingOperationRef = useRef<PendingOperation | null>(null);
  const retryInFlightRef = useRef(false);
  const [retryPresentation, setRetryPresentation] = useState<Extract<
    ScannerState,
    { status: "submitting" } | { status: "operation-success" } | { status: "operation-error" }
  > | null>(null);
  const expireSession = useSessionExpiration();

  useEffect(() => activateScanRequestLifecycle({
    mounted: mountedRef,
    version: versionRef,
    request: requestRef,
  }), []);

  const performEarn = useCallback(async (
    pending: PendingEarnOperation,
    isRetry = false,
  ) => {
    const { version, scan, operationId, purchaseAmount } = pending;
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const result = await earnAccount({
        businessId,
        accountId: scan.accountId,
        operationId,
        ...(purchaseAmount === undefined ? {} : { purchaseAmount }),
        signal: controller.signal,
      });

      if (!isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)) {
        return;
      }

      if (!result.ok) {
        if (result.code === "SESSION_EXPIRED") {
          if (pendingOperationRef.current?.operationId === operationId) {
            pendingOperationRef.current = null;
          }
          await expireSession();
          return;
        }

        if (!isAmbiguousOperationError(result.code)
          && pendingOperationRef.current?.operationId === operationId) {
          pendingOperationRef.current = null;
        }
        if (isRetry) {
          setRetryPresentation({
            status: "operation-error",
            version,
            operation: "earn",
            error: result.code,
          });
        } else {
          dispatch({ type: "reject-operation", version, error: result.code });
        }
        return;
      }

      if (pendingOperationRef.current?.operationId === operationId) {
        pendingOperationRef.current = null;
      }

      if (userId) {
        await invalidateActivityAfterConfirmedOperation(
          queryClient,
          { userId, businessId },
          result,
        );
      }

      const outcome = { operation: "earn" as const, result: result.data };
      if (isRetry) {
        setRetryPresentation({
          status: "operation-success",
          version,
          customerDisplayName: scan.customer.displayName,
          outcome,
        });
      } else {
        dispatch({ type: "resolve-operation", version, outcome });
      }
    } catch (error) {
      if (
        !(error instanceof DOMException && error.name === "AbortError")
        && isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)
      ) {
        if (isRetry) {
          setRetryPresentation({
            status: "operation-error",
            version,
            operation: "earn",
            error: "UNEXPECTED",
          });
        } else {
          dispatch({ type: "reject-operation", version, error: "UNEXPECTED" });
        }
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  }, [businessId, expireSession, queryClient, userId]);

  const performRedeem = useCallback(async (
    pending: PendingRedeemOperation,
    isRetry = false,
  ) => {
    const { version, scan, rewardId, operationId } = pending;
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const result = await redeemAccountReward({
        businessId,
        accountId: scan.accountId,
        rewardId,
        operationId,
        signal: controller.signal,
      });

      if (!isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)) {
        return;
      }

      if (!result.ok) {
        if (result.code === "SESSION_EXPIRED") {
          if (pendingOperationRef.current?.operationId === operationId) {
            pendingOperationRef.current = null;
          }
          await expireSession();
          return;
        }

        if (!isAmbiguousOperationError(result.code)
          && pendingOperationRef.current?.operationId === operationId) {
          pendingOperationRef.current = null;
        }
        if (isRetry) {
          setRetryPresentation({
            status: "operation-error",
            version,
            operation: "redeem",
            error: result.code,
          });
        } else {
          dispatch({ type: "reject-operation", version, error: result.code });
        }
        return;
      }

      if (pendingOperationRef.current?.operationId === operationId) {
        pendingOperationRef.current = null;
      }

      if (userId) {
        await invalidateActivityAfterConfirmedOperation(
          queryClient,
          { userId, businessId },
          result,
        );
      }

      const outcome = { operation: "redeem" as const, result: result.data };
      if (isRetry) {
        setRetryPresentation({
          status: "operation-success",
          version,
          customerDisplayName: scan.customer.displayName,
          outcome,
        });
      } else {
        dispatch({ type: "resolve-operation", version, outcome });
      }
    } catch (error) {
      if (
        !(error instanceof DOMException && error.name === "AbortError")
        && isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)
      ) {
        if (isRetry) {
          setRetryPresentation({
            status: "operation-error",
            version,
            operation: "redeem",
            error: "UNEXPECTED",
          });
        } else {
          dispatch({ type: "reject-operation", version, error: "UNEXPECTED" });
        }
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  }, [businessId, expireSession, queryClient, userId]);

  const acceptDecodedQr = useCallback(async (rawValue: string) => {
    if (lockedRef.current) {
      return;
    }

    lockedRef.current = true;
    const version = ++versionRef.current;
    dispatch({ type: "accept", version });
    const qrCode = normalizeQrValue(rawValue);

    if (!qrCode) {
      dispatch({ type: "reject", version, error: "INVALID_QR" });
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const result = await lookupScannedAccount({ businessId, qrCode, signal: controller.signal });

      if (!isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)) {
        return;
      }

      if (!result.ok) {
        if (result.code === "SESSION_EXPIRED") {
          await expireSession();
          return;
        }

        dispatch({ type: "reject", version, error: result.code });
        return;
      }

      if (decideOperation(result.data).kind === "auto-earn") {
        if (!claimOperationSubmission(operationLockRef, version)) {
          return;
        }

        const pending = createPendingEarnOperation({ version, scan: result.data });
        pendingOperationRef.current = pending;
        dispatch({ type: "begin-auto-earn", version, result: result.data });
        await performEarn(pending);
        return;
      }

      dispatch({ type: "resolve", version, result: result.data });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        dispatch({ type: "reject", version, error: "UNEXPECTED" });
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  }, [businessId, expireSession, performEarn]);

  const setPurchaseAmount = useCallback((value: string) => {
    dispatch({ type: "set-purchase-amount", value });
  }, []);

  const selectReward = useCallback((rewardId: string) => {
    dispatch({ type: "select-reward", rewardId });
  }, []);

  const submitEarn = useCallback(async () => {
    if (state.status !== "account-ready") {
      return;
    }

    const purchaseAmount = state.result.programType === "points"
      ? parsePurchaseAmount(state.purchaseAmount)
      : undefined;

    if (state.result.programType === "points" && purchaseAmount === null) {
      dispatch({ type: "reject-purchase-amount" });
      return;
    }

    if (!claimOperationSubmission(operationLockRef, state.version)) {
      return;
    }

    const { version, result } = state;
    const pending = createPendingEarnOperation({
      version,
      scan: result,
      ...(purchaseAmount == null ? {} : { purchaseAmount }),
    });
    pendingOperationRef.current = pending;
    dispatch({ type: "begin-operation", operation: "earn" });
    await performEarn(pending);
  }, [performEarn, state]);

  const submitRedeem = useCallback(async () => {
    if (state.status !== "account-ready" || !state.selectedRewardId) {
      return;
    }

    if (!state.result.availableRewards.some(
      (reward) => reward.id === state.selectedRewardId,
    )) {
      return;
    }

    if (!claimOperationSubmission(operationLockRef, state.version)) {
      return;
    }

    const { version, result, selectedRewardId } = state;
    const pending = createPendingRedeemOperation({
      version,
      scan: result,
      rewardId: selectedRewardId,
    });
    pendingOperationRef.current = pending;
    dispatch({ type: "begin-operation", operation: "redeem" });
    await performRedeem(pending);
  }, [performRedeem, state]);

  const retryPendingOperation = useCallback(async (pending: PendingOperation) => {
    if (retryInFlightRef.current
      || pendingOperationRef.current?.operationId !== pending.operationId) {
      return;
    }

    retryInFlightRef.current = true;
    setRetryPresentation({
      status: "submitting",
      version: pending.version,
      result: pending.scan,
      operation: pending.operation,
    });

    try {
      if (pending.operation === "earn") {
        await performEarn(pending, true);
      } else {
        await performRedeem(pending, true);
      }
    } finally {
      retryInFlightRef.current = false;
    }
  }, [performEarn, performRedeem]);

  const reset = useCallback(() => {
    const pending = state.status === "operation-error"
      ? selectPendingOperationForRetry(pendingOperationRef.current, state)
      : null;
    if (pending) {
      void retryPendingOperation(pending);
      return;
    }

    requestRef.current?.abort();
    requestRef.current = null;
    const version = ++versionRef.current;
    lockedRef.current = false;
    clearOperationSubmission(operationLockRef);
    pendingOperationRef.current = null;
    retryInFlightRef.current = false;
    setRetryPresentation(null);
    dispatch({ type: "reset", version });
  }, [retryPendingOperation, state]);

  return {
    state: retryPresentation ?? state,
    acceptDecodedQr,
    reset,
    setPurchaseAmount,
    selectReward,
    submitEarn,
    submitRedeem,
    cameraEnabled: state.status === "ready",
  };
}
