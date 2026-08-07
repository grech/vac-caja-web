import { decideOperation } from "../../operations/domain/operation-decision";
import type { OperationErrorCode } from "../../operations/domain/operation-errors";
import type {
  CajaEarnResult,
  CajaRedeemResult,
} from "../../operations/domain/operation-results";
import type { ScanErrorCode } from "./scan-errors";
import type { CajaScanResult } from "./scan-result";

export type OperationOutcome =
  | { operation: "earn"; result: CajaEarnResult }
  | { operation: "redeem"; result: CajaRedeemResult };

export type ScannerState =
  | { status: "ready"; version: number }
  | { status: "looking-up"; version: number }
  | {
      status: "account-ready";
      version: number;
      result: CajaScanResult;
      selectedRewardId: string | null;
      purchaseAmount: string;
      amountError: boolean;
    }
  | {
      status: "submitting";
      version: number;
      result: CajaScanResult;
      operation: "earn" | "redeem";
    }
  | {
      status: "operation-success";
      version: number;
      customerDisplayName: string;
      outcome: OperationOutcome;
    }
  | {
      status: "operation-error";
      version: number;
      operation: "earn" | "redeem";
      error: OperationErrorCode;
    }
  | { status: "error"; version: number; error: ScanErrorCode };

export type ScannerAction =
  | { type: "accept"; version: number }
  | { type: "resolve"; version: number; result: CajaScanResult }
  | { type: "reject"; version: number; error: ScanErrorCode }
  | { type: "set-purchase-amount"; value: string }
  | { type: "reject-purchase-amount" }
  | { type: "select-reward"; rewardId: string }
  | { type: "begin-operation"; operation: "earn" | "redeem" }
  | { type: "begin-auto-earn"; version: number; result: CajaScanResult }
  | { type: "resolve-operation"; version: number; outcome: OperationOutcome }
  | { type: "reject-operation"; version: number; error: OperationErrorCode }
  | { type: "reset"; version: number };

export const initialScannerState: ScannerState = { status: "ready", version: 0 };

export function scannerReducer(state: ScannerState, action: ScannerAction): ScannerState {
  if (action.type === "reset") {
    return { status: "ready", version: action.version };
  }

  if (action.type === "accept") {
    return state.status === "ready"
      ? { status: "looking-up", version: action.version }
      : state;
  }

  if (action.type === "set-purchase-amount") {
    return state.status === "account-ready"
      ? { ...state, purchaseAmount: action.value, amountError: false }
      : state;
  }

  if (action.type === "reject-purchase-amount") {
    return state.status === "account-ready" ? { ...state, amountError: true } : state;
  }

  if (action.type === "select-reward") {
    return state.status === "account-ready"
      && state.result.availableRewards.some((reward) => reward.id === action.rewardId)
      ? { ...state, selectedRewardId: action.rewardId }
      : state;
  }

  if (action.type === "begin-operation") {
    if (state.status !== "account-ready") {
      return state;
    }

    if (action.operation === "redeem" && !state.selectedRewardId) {
      return state;
    }

    return {
      status: "submitting",
      version: state.version,
      result: state.result,
      operation: action.operation,
    };
  }

  if (action.type === "begin-auto-earn") {
    return state.status === "looking-up"
      && state.version === action.version
      && decideOperation(action.result).kind === "auto-earn"
      ? {
          status: "submitting",
          version: action.version,
          result: action.result,
          operation: "earn",
        }
      : state;
  }

  if (action.type === "resolve-operation") {
    return state.status === "submitting"
      && state.version === action.version
      && state.operation === action.outcome.operation
      ? {
          status: "operation-success",
          version: action.version,
          customerDisplayName: state.result.customer.displayName,
          outcome: action.outcome,
        }
      : state;
  }

  if (action.type === "reject-operation") {
    return state.status === "submitting" && state.version === action.version
      ? {
          status: "operation-error",
          version: action.version,
          operation: state.operation,
          error: action.error,
        }
      : state;
  }

  if (state.status !== "looking-up" || state.version !== action.version) {
    return state;
  }

  return action.type === "resolve"
    ? {
        status: "account-ready",
        version: action.version,
        result: action.result,
        selectedRewardId: action.result.availableRewards[0]?.id ?? null,
        purchaseAmount: "",
        amountError: false,
      }
    : { status: "error", version: action.version, error: action.error };
}
