"use client";

import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useCurrentBusiness } from "../providers/current-business-provider";
import { CajaFrame } from "./caja-frame";

export function OperationalShell() {
  const currentBusiness = useCurrentBusiness();

  return (
    <CajaFrame status="Caja lista" statusTone="ready">
      <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:gap-16">
        <div className="relative isolate max-w-2xl">
          <div className="vac-sun" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold uppercase tracking-system text-success">
            Caja lista
          </p>
          <h1 className="mt-5 text-balance text-5xl font-bold tracking-display text-ink sm:text-7xl">
            {currentBusiness.businessName}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-strong sm:text-lg sm:leading-8">
            La terminal está vinculada al negocio y lista para el siguiente paso operativo.
          </p>
        </div>

        <SurfaceCard aria-labelledby="operator-title">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-system text-muted">
                Cuenta activa
              </p>
              <h2 id="operator-title" className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                {currentBusiness.safeDisplayName}
              </h2>
            </div>
            <Badge>{currentBusiness.roleLabel}</Badge>
          </div>
          <p className="mt-4 break-words text-sm leading-6 text-muted-strong">
            {currentBusiness.safeDisplayIdentifier}
          </p>
          <Link
            href="/caja/scan"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-brand bg-ink px-5 py-3 text-sm font-semibold text-surface transition-colors hover:bg-muted-strong focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange"
          >
            Escanear cliente
          </Link>
          <Link
            href="/caja/activity"
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-brand border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange"
          >
            Ver actividad reciente
          </Link>
          <div className="mt-5 border-t border-border-subtle pt-5">
            <LogoutButton />
          </div>
        </SurfaceCard>
      </div>
    </CajaFrame>
  );
}
