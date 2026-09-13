import { describe, expect, it } from "vitest";
import { getOperationSuccessPresentation } from "./operation-success-presentation";

describe("operation success presentation", () => {
  it("treats a zero-point earn as successful accumulated progress", () => {
    const presentation = getOperationSuccessPresentation({
      operation: "earn",
      result: {
        programType: "points",
        pointsBalance: 18,
        stampsBalance: 0,
        pointsDelta: 0,
        stampsDelta: null,
        operationOutcome: "applied",
      },
    });

    expect(presentation).toEqual({
      title: "Compra registrada",
      earnedDelta: null,
      accumulationMessage: "El monto de esta compra quedó acumulado para completar tus próximos puntos.",
    });
    expect(JSON.stringify(presentation)).not.toContain("+0 puntos");
  });

  it("uses singular copy and explains accumulation for a one-point earn", () => {
    expect(getOperationSuccessPresentation({
      operation: "earn",
      result: {
        programType: "points",
        pointsBalance: 19,
        stampsBalance: 0,
        pointsDelta: 1,
        stampsDelta: null,
      },
    })).toEqual({
      title: "Saldo actualizado",
      earnedDelta: "+1 punto",
      accumulationMessage: "VAC acumula los montos entre compras. Por eso los puntos pueden completarse con compras anteriores.",
    });
  });

  it("uses plural copy and explains accumulation for a multi-point earn", () => {
    expect(getOperationSuccessPresentation({
      operation: "earn",
      result: {
        programType: "points",
        pointsBalance: 21,
        stampsBalance: 0,
        pointsDelta: 2,
        stampsDelta: null,
      },
    })).toMatchObject({
      earnedDelta: "+2 puntos",
      accumulationMessage: expect.stringContaining("acumula los montos entre compras"),
    });
  });

  it("keeps stamps earn presentation unchanged and without monetary accumulation copy", () => {
    expect(getOperationSuccessPresentation({
      operation: "earn",
      result: {
        programType: "stamps",
        pointsBalance: 0,
        stampsBalance: 6,
        pointsDelta: null,
        stampsDelta: 1,
      },
    })).toEqual({
      title: "Saldo actualizado",
      earnedDelta: "+1 sello",
      accumulationMessage: null,
    });
  });

  it("keeps redeem presentation unchanged and without monetary accumulation copy", () => {
    expect(getOperationSuccessPresentation({
      operation: "redeem",
      result: {
        programType: "points",
        pointsBalance: 10,
        stampsBalance: 0,
        pointsSpent: 5,
        stampsSpent: 0,
        rewardName: "Café",
      },
    })).toEqual({
      title: "Recompensa canjeada",
      earnedDelta: null,
      accumulationMessage: null,
    });
  });

  it("is deterministic for a replayed successful points operation", () => {
    const result = {
      programType: "points" as const,
      pointsBalance: 21,
      stampsBalance: 0,
      pointsDelta: 2,
      stampsDelta: null,
    };

    expect(getOperationSuccessPresentation({
      operation: "earn",
      result: { ...result, operationOutcome: "applied" },
    })).toEqual(getOperationSuccessPresentation({
      operation: "earn",
      result: { ...result, operationOutcome: "replayed" },
    }));
  });
});
