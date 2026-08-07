type VacBrandProps = {
  compact?: boolean;
};

export function VacBrand({ compact = false }: VacBrandProps) {
  return (
    <div className="flex items-center gap-3" aria-label="VAC Caja">
      <span className="grid size-11 place-items-center rounded-brand bg-vac-yellow text-sm font-extrabold tracking-tight text-ink shadow-brand">
        VAC
      </span>
      <span
        className={`${compact ? "hidden sm:inline" : "inline"} font-mono text-xs font-semibold uppercase tracking-system text-muted-strong`}
      >
        Terminal web
      </span>
    </div>
  );
}
