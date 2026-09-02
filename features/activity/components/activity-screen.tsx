"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { CajaFrame } from "@/features/membership/components/caja-frame";
import { useCurrentBusiness } from "@/features/membership/providers/current-business-provider";
import {
  formatActivityTime,
  getActivityTitle,
  getAdjustmentDetail,
} from "../domain/activity-presentation";
import type { CajaActivityEvent } from "../domain/activity-event";
import { useRecentActivity } from "../hooks/use-recent-activity";

function ActivityRow({ event }: { event: CajaActivityEvent }) {
  const adjustment = getAdjustmentDetail(event);

  return (
    <li className="grid gap-3 border-b border-border-subtle py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div>
        <p className="text-lg font-semibold text-ink">{getActivityTitle(event)}</p>
        {event.rewardName ? <p className="mt-1 font-medium text-ink">{event.rewardName}</p> : null}
        {adjustment ? <p className="mt-1 text-sm text-muted-strong">{adjustment}</p> : null}
        {event.customerName ? <p className="mt-2 text-sm text-muted-strong">{event.customerName}</p> : null}
      </div>
      <time
        dateTime={event.createdAt || undefined}
        className="font-mono text-xs text-muted sm:pt-1 sm:text-right"
      >
        {formatActivityTime(event.createdAt)}
      </time>
    </li>
  );
}

export function ActivityScreen() {
  const currentBusiness = useCurrentBusiness();
  const { viewState, refresh } = useRecentActivity(currentBusiness.businessId);

  return (
    <CajaFrame status="Actividad" statusTone="ready">
      <div className="w-full">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-system text-muted-strong">
              {currentBusiness.businessName}
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Actividad reciente
            </h1>
          </div>
          <Link
            href="/caja"
            className="inline-flex min-h-12 items-center rounded-brand px-3 text-sm font-semibold text-muted-strong underline decoration-border underline-offset-4 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange"
          >
            Volver a Caja
          </Link>
        </div>

        {viewState.status === "loading" ? (
          <SurfaceCard role="status" aria-live="polite" className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-system text-muted-strong">Consultando</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Cargando actividad…</h2>
          </SurfaceCard>
        ) : null}

        {viewState.status === "error" ? (
          <SurfaceCard role="alert" aria-labelledby="activity-error-title" className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-system text-danger">Consulta detenida</p>
            <h2 id="activity-error-title" className="mt-3 text-2xl font-semibold text-ink">No pudimos cargar la actividad</h2>
            <p className="mt-3 text-sm leading-6 text-muted-strong">Revisa tu conexión e intenta nuevamente.</p>
            <Button variant="primary" className="mt-6" onClick={() => void refresh()}>Reintentar</Button>
          </SurfaceCard>
        ) : null}

        {viewState.status === "empty" || viewState.status === "list" ? (
          <SurfaceCard aria-labelledby="activity-list-title">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-center">
              <div>
                <h2 id="activity-list-title" className="text-xl font-semibold text-ink">Últimas operaciones</h2>
                <p className="mt-1 text-sm text-muted-strong" aria-live="polite">
                  {viewState.isRefreshing ? "Actualizando…" : "Hasta 25 eventos recientes"}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => void refresh()}
                disabled={!viewState.canRefresh}
                aria-busy={viewState.isRefreshing}
              >
                {viewState.isRefreshing ? "Actualizando…" : "Actualizar"}
              </Button>
            </div>

            {viewState.status === "empty" ? (
              <div className="py-10 text-center">
                <p className="text-lg font-semibold text-ink">Aún no hay actividad reciente.</p>
                <p className="mt-2 text-sm leading-6 text-muted-strong">Las operaciones realizadas en caja aparecerán aquí.</p>
              </div>
            ) : (
              <ol>
                {viewState.events.map((event) => <ActivityRow key={event.id} event={event} />)}
              </ol>
            )}
          </SurfaceCard>
        ) : null}
      </div>
    </CajaFrame>
  );
}
