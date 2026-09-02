import Image from "next/image";

type VacBrandProps = {
  compact?: boolean;
};

// Canonical VAC lockup (icon + wordmark). Asset lives in this repository at
// public/images/vac-logo-horizontal.webp — do not recreate, recolor or crop it.
const ASPECT_RATIO = 2172 / 724;

export function VacBrand({ compact = false }: VacBrandProps) {
  const height = compact ? 24 : 28;

  return (
    <Image
      src="/images/vac-logo-horizontal.webp"
      alt="VAC"
      width={Math.round(height * ASPECT_RATIO)}
      height={height}
      priority
      className="w-auto"
    />
  );
}
