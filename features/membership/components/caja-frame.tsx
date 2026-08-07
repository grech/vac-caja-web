import type { ReactNode } from "react";
import { VacBrand } from "@/components/brand/vac-brand";
import { Badge } from "@/components/ui/badge";

export function CajaFrame({
  status,
  statusTone = "neutral",
  children,
}: {
  status: string;
  statusTone?: "neutral" | "ready";
  children: ReactNode;
}) {
  return (
    <main className="min-h-svh px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-container flex-col sm:min-h-[calc(100svh-4rem)]">
        <header className="flex items-center justify-between gap-4">
          <VacBrand compact />
          <Badge
            className={
              statusTone === "ready"
                ? "border-success/25 bg-surface text-success"
                : undefined
            }
          >
            {status}
          </Badge>
        </header>

        <section className="grid flex-1 items-center py-10 sm:py-12">
          {children}
        </section>

        <footer className="border-t border-border-subtle py-5 font-mono text-xs text-muted">
          Uso de contingencia · VAC
        </footer>
      </div>
    </main>
  );
}
