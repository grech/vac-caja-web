import type { HTMLAttributes } from "react";

type SurfaceCardProps = HTMLAttributes<HTMLElement>;

export function SurfaceCard({
  className = "",
  ...props
}: SurfaceCardProps) {
  return (
    <article
      className={`rounded-surface border border-border-subtle bg-surface p-6 shadow-surface sm:p-8 ${className}`}
      {...props}
    />
  );
}
