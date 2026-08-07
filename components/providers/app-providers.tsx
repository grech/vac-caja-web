"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/features/auth/providers/auth-provider";
import { createQueryClient } from "@/lib/query/create-query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
