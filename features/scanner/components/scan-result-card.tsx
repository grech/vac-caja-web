import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { CajaScanResult } from "../domain/scan-result";

export function ScanResultCard({
  result,
  selectedRewardId,
  purchaseAmount,
  amountError,
  onPurchaseAmountChange,
  onRewardChange,
  onEarn,
  onRedeem,
  onReset,
}: {
  result: CajaScanResult;
  selectedRewardId: string | null;
  purchaseAmount: string;
  amountError: boolean;
  onPurchaseAmountChange: (value: string) => void;
  onRewardChange: (rewardId: string) => void;
  onEarn: () => void;
  onRedeem: () => void;
  onReset: () => void;
}) {
  const isPoints = result.programType === "points";
  const balance = isPoints ? result.pointsBalance : result.stampsBalance;

  return (
    <div aria-live="polite" className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <SurfaceCard aria-labelledby="customer-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-system text-success">Cuenta encontrada</p>
            <h1 id="customer-title" className="mt-3 text-3xl font-bold tracking-tight text-ink">
              {result.customer.displayName}
            </h1>
          </div>
          <Badge>{isPoints ? "Puntos" : "Sellos"}</Badge>
        </div>
        <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-system text-muted">
          {isPoints ? "Puntos" : "Sellos"}
        </p>
        <p className="mt-2 text-6xl font-bold tracking-display text-ink">{balance}</p>
        {isPoints ? (
          <div className="mt-8">
            <label htmlFor="purchase-amount" className="text-sm font-semibold text-ink">
              Monto de compra
            </label>
            <div className="mt-2 flex rounded-brand border border-border bg-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-vac-orange">
              <span className="flex min-h-12 items-center border-r border-border-subtle px-4 font-semibold text-muted-strong" aria-hidden="true">$</span>
              <input
                id="purchase-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={purchaseAmount}
                onChange={(event) => onPurchaseAmountChange(event.target.value)}
                aria-invalid={amountError}
                aria-describedby={amountError ? "purchase-amount-error" : undefined}
                className="min-h-12 min-w-0 flex-1 rounded-r-brand bg-transparent px-4 text-base text-ink outline-none"
                placeholder="0.00"
              />
            </div>
            {amountError ? (
              <p id="purchase-amount-error" className="mt-2 text-sm font-medium text-danger">
                Ingresa un monto mayor a cero.
              </p>
            ) : null}
            <Button className="mt-4 w-full" onClick={onEarn}>Registrar compra</Button>
          </div>
        ) : (
          <Button className="mt-8 w-full" onClick={onEarn}>Agregar sellos</Button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="mt-4 min-h-12 w-full rounded-brand px-4 text-sm font-semibold text-muted-strong underline decoration-border underline-offset-4 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-vac-orange"
        >
          Escanear otro
        </button>
      </SurfaceCard>

      <SurfaceCard aria-labelledby="rewards-title">
        <h2 id="rewards-title" className="text-xl font-semibold text-ink">Recompensas disponibles</h2>
        {result.availableRewards.length ? (
          <fieldset className="mt-5">
            <legend className="sr-only">Selecciona una recompensa</legend>
            <div className="space-y-3">
              {result.availableRewards.map((reward) => {
                const requirement = result.programType === "points"
                  ? reward.pointsRequired
                  : reward.stampsRequired;
                const selected = selectedRewardId === reward.id;
                return (
                  <label
                    key={reward.id}
                    className={`block cursor-pointer rounded-brand border p-4 transition-colors focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-vac-orange ${selected ? "border-vac-orange bg-surface-warm" : "border-border-subtle bg-surface-soft"}`}
                  >
                    <span className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="reward"
                        value={reward.id}
                        checked={selected}
                        onChange={() => onRewardChange(reward.id)}
                        className="mt-1 size-4 accent-vac-orange"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-4">
                          <span className="font-semibold text-ink">{reward.name}</span>
                          {requirement !== null ? (
                            <span className="shrink-0 font-mono text-xs font-semibold text-warning">
                              {requirement} {result.programType === "points" ? "pts" : "sellos"}
                            </span>
                          ) : null}
                        </span>
                        {reward.description ? (
                          <span className="mt-2 block text-sm leading-6 text-muted-strong">{reward.description}</span>
                        ) : null}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <Button className="mt-5 w-full" onClick={onRedeem} disabled={!selectedRewardId}>
              Canjear recompensa
            </Button>
          </fieldset>
        ) : (
          <p className="mt-5 text-sm leading-6 text-muted-strong">
            No hay recompensas disponibles para canjear en este momento.
          </p>
        )}
      </SurfaceCard>
    </div>
  );
}
