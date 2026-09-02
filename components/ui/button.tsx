import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex min-h-12 items-center justify-center rounded-brand px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-vac-yellow text-ink hover:bg-vac-orange disabled:bg-border disabled:text-muted-strong",
  secondary:
    "border border-border bg-surface text-ink hover:bg-surface-soft disabled:bg-surface-soft disabled:text-muted",
  ghost:
    "text-muted-strong hover:bg-surface-soft hover:text-ink disabled:text-muted disabled:hover:bg-transparent",
};

export function buttonClassName(
  variant: ButtonVariant = "secondary",
  className = "",
) {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className = "",
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
