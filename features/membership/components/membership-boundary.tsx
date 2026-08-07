"use client";

import type { ReactNode } from "react";
import { useMembershipResolution } from "../hooks/use-membership-resolution";
import { CurrentBusinessProvider } from "../providers/current-business-provider";
import { MembershipState } from "./membership-state";

export function MembershipBoundary({ children }: { children: ReactNode }) {
  const membership = useMembershipResolution();

  if (membership.status === "loading") {
    return <MembershipState eyebrow="Preparando Caja" title="Buscando tu negocio activo" description="Estamos vinculando esta sesión con su contexto operativo." />;
  }

  if (membership.status === "no-active-membership") {
    return <MembershipState eyebrow="Acceso pendiente" title="No encontramos un negocio activo para esta cuenta" description="Confirma el acceso con el administrador del negocio o vuelve a intentarlo." retry={membership.retry} isRetrying={membership.isRetrying} />;
  }

  if (membership.status === "multiple-active-memberships") {
    return <MembershipState eyebrow="Selección requerida" title="Esta cuenta tiene más de un negocio activo asociado" description="Caja Web todavía no admite seleccionar entre varios negocios." retry={membership.retry} isRetrying={membership.isRetrying} />;
  }

  if (membership.status === "error") {
    return <MembershipState eyebrow="No pudimos cargar Caja" title="El negocio no está disponible en este momento" description="Revisa tu conexión e intenta nuevamente. Si el problema continúa, solicita ayuda." retry={membership.retry} isRetrying={membership.isRetrying} />;
  }

  return <CurrentBusinessProvider value={membership.currentBusiness}>{children}</CurrentBusinessProvider>;
}
