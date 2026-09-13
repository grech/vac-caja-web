import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { OPERATION_ERROR_COPY, type OperationErrorCode } from "@/features/operations/domain/operation-errors";
import { isAmbiguousOperationError } from "@/features/operations/domain/pending-operation";
import { getOperationSuccessPresentation } from "@/features/operations/domain/operation-success-presentation";
import type { OperationOutcome } from "../domain/scanner-state";
import type { CajaScanResult } from "../domain/scan-result";

export function OperationProgressCard({
  operation,
  result,
}: {
  operation: "earn" | "redeem";
  result: CajaScanResult;
}) {
  return (
    <SurfaceCard className="max-w-2xl" aria-labelledby="operation-progress-title" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-system text-muted-strong">Operación en curso</p>
      <h2 id="operation-progress-title" className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {operation === "earn" ? "Registrando saldo…" : "Canjeando recompensa…"}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-strong">
        Estamos confirmando la operación para {result.customer.displayName}. No cierres esta pantalla.
      </p>
    </SurfaceCard>
  );
}

export function OperationSuccessCard({
  customerDisplayName,
  outcome,
  onReset,
}: {
  customerDisplayName: string;
  outcome: OperationOutcome;
  onReset: () => void;
}) {
  const result = outcome.result;
  const presentation = getOperationSuccessPresentation(outcome);
  const isPoints = result.programType === "points";
  const balance = isPoints ? result.pointsBalance : result.stampsBalance;

  return (
    <SurfaceCard className="max-w-2xl" aria-labelledby="operation-success-title" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-system text-success">Operación completada</p>
          <h2 id="operation-success-title" className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {presentation.title}
          </h2>
        </div>
        <Badge>{isPoints ? "Puntos" : "Sellos"}</Badge>
      </div>
      <p className="mt-4 text-base text-muted-strong">{customerDisplayName}</p>
      {outcome.operation === "redeem" ? (
        <p className="mt-6 text-2xl font-semibold text-ink">{outcome.result.rewardName}</p>
      ) : presentation.earnedDelta !== null ? (
        <p className="mt-6 text-4xl font-bold tracking-display text-success">
          {presentation.earnedDelta}
        </p>
      ) : null}
      {presentation.accumulationMessage ? (
        <p className="mt-5 rounded-brand border border-success/25 bg-surface-soft p-4 text-sm font-medium leading-6 text-muted-strong">
          {presentation.accumulationMessage}
        </p>
      ) : null}
      <p className="mt-6 text-xs font-semibold uppercase tracking-system text-muted">Saldo actual</p>
      <p className="mt-2 text-5xl font-bold tracking-display text-ink">{balance}</p>
      <Button variant="secondary" className="mt-8 w-full sm:w-auto" onClick={onReset}>Escanear otro</Button>
    </SurfaceCard>
  );
}

export function OperationErrorCard({
  operation,
  error,
  onReset,
}: {
  operation: "earn" | "redeem";
  error: OperationErrorCode;
  onReset: () => void;
}) {
  const copy = OPERATION_ERROR_COPY[error];
  const isAmbiguous = isAmbiguousOperationError(error);

  return (
    <SurfaceCard className="max-w-2xl" aria-labelledby="operation-error-title" role="alert">
      <p
        className={`text-xs font-semibold uppercase tracking-system ${isAmbiguous ? "text-warning" : "text-danger"}`}
      >
        {isAmbiguous ? "Resultado por confirmar" : "Operación detenida"}
      </p>
      <h2 id="operation-error-title" className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {copy.title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-strong">{copy.description}</p>
      {isAmbiguous ? (
        <p className="mt-4 rounded-brand border border-warning/30 bg-surface-warm p-4 text-sm font-semibold leading-6 text-warning">
          {operation === "redeem"
            ? "El reintento conserva este mismo canje pendiente. No selecciones otra recompensa."
            : "El reintento conserva este mismo registro pendiente. No cambies los datos de la compra."}
        </p>
      ) : null}
      <Button variant="primary" className="mt-7" onClick={onReset}>
        {isAmbiguous ? "Reintentar operación" : "Volver a escanear"}
      </Button>
    </SurfaceCard>
  );
}
