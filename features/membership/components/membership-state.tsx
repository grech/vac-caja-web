import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { CajaFrame } from "./caja-frame";

type MembershipStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  retry?: () => void;
  isRetrying?: boolean;
};

export function MembershipState({
  eyebrow,
  title,
  description,
  retry,
  isRetrying = false,
}: MembershipStateProps) {
  return (
    <CajaFrame status="Sesión activa">
      <SurfaceCard className="w-full max-w-2xl" aria-labelledby="membership-state-title">
        <p className="font-mono text-xs font-semibold uppercase tracking-system text-warning">
          {eyebrow}
        </p>
        <h1 id="membership-state-title" className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-strong">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
          {retry ? (
            <Button onClick={retry} disabled={isRetrying} aria-busy={isRetrying}>
              {isRetrying ? "Reintentando…" : "Reintentar"}
            </Button>
          ) : null}
          <LogoutButton />
        </div>
      </SurfaceCard>
    </CajaFrame>
  );
}
