"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { CajaFrame } from "@/features/membership/components/caja-frame";
import { useCurrentBusiness } from "@/features/membership/providers/current-business-provider";
import { SCAN_ERROR_COPY } from "../domain/scan-errors";
import { useScanLookup } from "../hooks/use-scan-lookup";
import { QrCamera } from "./qr-camera";
import {
  OperationErrorCard,
  OperationProgressCard,
  OperationSuccessCard,
} from "./operation-status-card";
import { ScanResultCard } from "./scan-result-card";

export function ScannerScreen() {
  const currentBusiness = useCurrentBusiness();
  const {
    state,
    acceptDecodedQr,
    reset,
    setPurchaseAmount,
    selectReward,
    submitEarn,
    submitRedeem,
    cameraEnabled,
  } = useScanLookup(currentBusiness.businessId);

  const terminalReady = state.status === "operation-success";

  return (
    <CajaFrame status={terminalReady ? "Operación lista" : "Escáner"} statusTone="ready">
      <div className="w-full">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-system text-muted-strong">
              {currentBusiness.businessName}
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Escanear cliente</h1>
          </div>
          <Link
            href="/caja"
            className="inline-flex min-h-12 items-center rounded-brand px-3 text-sm font-semibold text-muted-strong underline decoration-border underline-offset-4 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange"
          >
            Volver a Caja
          </Link>
        </div>

        <div hidden={state.status !== "ready" && state.status !== "looking-up"}>
          <QrCamera enabled={cameraEnabled} onDecoded={acceptDecodedQr} />
          {state.status === "looking-up" ? (
            <div className="mt-5 rounded-brand border border-vac-yellow/50 bg-surface-warm p-4" role="status" aria-live="polite">
              <p className="font-semibold text-ink">Consultando cuenta…</p>
              <p className="mt-1 text-sm text-muted-strong">La cámara está en pausa mientras confirmamos el código.</p>
            </div>
          ) : null}
        </div>

        {state.status === "account-ready" ? (
          <ScanResultCard
            result={state.result}
            selectedRewardId={state.selectedRewardId}
            purchaseAmount={state.purchaseAmount}
            amountError={state.amountError}
            onPurchaseAmountChange={setPurchaseAmount}
            onRewardChange={selectReward}
            onEarn={() => void submitEarn()}
            onRedeem={() => void submitRedeem()}
            onReset={reset}
          />
        ) : null}

        {state.status === "submitting" ? (
          <OperationProgressCard operation={state.operation} result={state.result} />
        ) : null}

        {state.status === "operation-success" ? (
          <OperationSuccessCard
            customerDisplayName={state.customerDisplayName}
            outcome={state.outcome}
            onReset={reset}
          />
        ) : null}

        {state.status === "operation-error" ? (
          <OperationErrorCard
            operation={state.operation}
            error={state.error}
            onReset={reset}
          />
        ) : null}

        {state.status === "error" ? (
          <SurfaceCard aria-labelledby="scan-error-title" role="alert" className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-system text-danger">Consulta detenida</p>
            <h2 id="scan-error-title" className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {SCAN_ERROR_COPY[state.error].title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-strong">
              {SCAN_ERROR_COPY[state.error].description}
            </p>
            <Button variant="primary" className="mt-7" onClick={reset}>Escanear otro</Button>
          </SurfaceCard>
        ) : null}
      </div>
    </CajaFrame>
  );
}
