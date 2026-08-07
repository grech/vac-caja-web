"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { CurrentBusiness } from "../domain/membership-resolution";

const CurrentBusinessContext = createContext<CurrentBusiness | null>(null);

export function CurrentBusinessProvider({
  value,
  children,
}: {
  value: CurrentBusiness;
  children: ReactNode;
}) {
  return (
    <CurrentBusinessContext.Provider value={value}>
      {children}
    </CurrentBusinessContext.Provider>
  );
}

export function useCurrentBusiness() {
  const context = useContext(CurrentBusinessContext);

  if (!context) {
    throw new Error(
      "useCurrentBusiness debe usarse dentro de CurrentBusinessProvider.",
    );
  }

  return context;
}
