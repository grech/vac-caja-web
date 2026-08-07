import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({
  id,
  label,
  error,
  className = "",
  ...props
}: TextFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`mt-2 min-h-12 w-full rounded-brand border bg-surface px-4 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-vac-orange focus:ring-3 focus:ring-accent-soft disabled:cursor-not-allowed disabled:bg-surface-soft ${error ? "border-danger" : "border-border"} ${className}`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
