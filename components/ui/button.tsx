import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center rounded-brand bg-ink px-5 py-3 text-sm font-semibold text-surface transition-colors hover:bg-muted-strong focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-strong ${className}`}
      {...props}
    />
  );
}
