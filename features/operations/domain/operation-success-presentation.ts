import type { CajaEarnResult, CajaRedeemResult } from "./operation-results";

type OperationSuccessOutcome =
  | { operation: "earn"; result: CajaEarnResult }
  | { operation: "redeem"; result: CajaRedeemResult };

export type OperationSuccessPresentation = {
  title: string;
  earnedDelta: string | null;
  accumulationMessage: string | null;
};

export function getOperationSuccessPresentation(
  outcome: OperationSuccessOutcome,
): OperationSuccessPresentation {
  if (outcome.operation === "redeem") {
    return {
      title: "Recompensa canjeada",
      earnedDelta: null,
      accumulationMessage: null,
    };
  }

  const { result } = outcome;

  if (result.programType === "stamps") {
    return {
      title: "Saldo actualizado",
      earnedDelta: result.stampsDelta === null
        ? null
        : `+${result.stampsDelta} ${result.stampsDelta === 1 ? "sello" : "sellos"}`,
      accumulationMessage: null,
    };
  }

  if (result.pointsDelta === 0) {
    return {
      title: "Compra registrada",
      earnedDelta: null,
      accumulationMessage: "El monto de esta compra quedó acumulado para completar tus próximos puntos.",
    };
  }

  return {
    title: "Saldo actualizado",
    earnedDelta: result.pointsDelta === null
      ? null
      : `+${result.pointsDelta} ${result.pointsDelta === 1 ? "punto" : "puntos"}`,
    accumulationMessage: result.pointsDelta !== null && result.pointsDelta > 0
      ? "VAC acumula los montos entre compras. Por eso los puntos pueden completarse con compras anteriores."
      : null,
  };
}
