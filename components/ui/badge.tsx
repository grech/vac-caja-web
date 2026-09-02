import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border border-border bg-surface-soft px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-system text-muted-strong ${className}`}
      {...props}
    />
  );
}
