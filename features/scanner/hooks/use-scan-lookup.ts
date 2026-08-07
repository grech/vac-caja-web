"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateActivityAfterConfirmedOperation } from "@/features/activity/services/activity-invalidation";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useSessionExpiration } from "@/features/auth/hooks/use-session-expiration";
import { decideOperation } from "@/features/operations/domain/operation-decision";
import { parsePurchaseAmount } from "@/features/operations/domain/purchase-amount";
import {
  claimOperationSubmission,
  clearOperationSubmission,
} from "@/features/operations/domain/submission-guard";
import {
  earnAccount,
  redeemAccountReward,
} from "@/features/operations/services/operation-service";
import type { CajaScanResult } from "../domain/scan-result";
import { normalizeQrValue } from "../domain/qr-value";
import {
  activateScanRequestLifecycle,
  isCurrentScanRequest,
} from "../domain/scan-request-lifecycle";
import { initialScannerState, scannerReducer } from "../domain/scanner-state";
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
  const expireSession = useSessionExpiration();

  useEffect(() => activateScanRequestLifecycle({
    mounted: mountedRef,
    version: versionRef,
    request: requestRef,
  }), []);

  const performEarn = useCallback(async (
    version: number,
    scan: CajaScanResult,
    purchaseAmount?: number,
  ) => {
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const result = await earnAccount({
        businessId,
        accountId: scan.accountId,
        ...(purchaseAmount === undefined ? {} : { purchaseAmount }),
        signal: controller.signal,
      });

      if (!isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)) {
        return;
      }

      if (!result.ok) {
        if (result.code === "SESSION_EXPIRED") {
          await expireSession();
          return;
        }

        dispatch({ type: "reject-operation", version, error: result.code });
        return;
      }

      if (userId) {
        await invalidateActivityAfterConfirmedOperation(
          queryClient,
          { userId, businessId },
          result,
        );
      }

      dispatch({
        type: "resolve-operation",
        version,
        outcome: { operation: "earn", result: result.data },
      });
    } catch (error) {
      if (
        !(error instanceof DOMException && error.name === "AbortError")
        && isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)
      ) {
        dispatch({ type: "reject-operation", version, error: "UNEXPECTED" });
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  }, [businessId, expireSession, queryClient, userId]);

  const performRedeem = useCallback(async (
    version: number,
    scan: CajaScanResult,
    rewardId: string,
  ) => {
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const result = await redeemAccountReward({
        businessId,
        accountId: scan.accountId,
        rewardId,
        signal: controller.signal,
      });

      if (!isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)) {
        return;
      }

      if (!result.ok) {
        if (result.code === "SESSION_EXPIRED") {
          await expireSession();
          return;
        }

        dispatch({ type: "reject-operation", version, error: result.code });
        return;
      }

      if (userId) {
        await invalidateActivityAfterConfirmedOperation(
          queryClient,
          { userId, businessId },
          result,
        );
      }

      dispatch({
        type: "resolve-operation",
        version,
        outcome: { operation: "redeem", result: result.data },
      });
    } catch (error) {
      if (
        !(error instanceof DOMException && error.name === "AbortError")
        && isCurrentScanRequest({ mounted: mountedRef, version: versionRef }, version)
      ) {
        dispatch({ type: "reject-operation", version, error: "UNEXPECTED" });
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

        dispatch({ type: "begin-auto-earn", version, result: result.data });
        await performEarn(version, result.data);
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
    dispatch({ type: "begin-operation", operation: "earn" });
    await performEarn(version, result, purchaseAmount ?? undefined);
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
    dispatch({ type: "begin-operation", operation: "redeem" });
    await performRedeem(version, result, selectedRewardId);
  }, [performRedeem, state]);

  const reset = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    const version = ++versionRef.current;
    lockedRef.current = false;
    clearOperationSubmission(operationLockRef);
    dispatch({ type: "reset", version });
  }, []);

  return {
    state,
    acceptDecodedQr,
    reset,
    setPurchaseAmount,
    selectReward,
    submitEarn,
    submitRedeem,
    cameraEnabled: state.status === "ready",
  };
}
