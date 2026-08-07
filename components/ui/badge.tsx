import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border border-vac-orange/25 bg-surface-warm px-3 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-system text-warning ${className}`}
      {...props}
    />
  );
}
