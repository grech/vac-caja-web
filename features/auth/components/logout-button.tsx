"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "../providers/auth-provider";

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleLogout() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(undefined);
    const result = await signOut();

    if (!result.ok) {
      setError(
        result.code === "network"
          ? "No pudimos cerrar la sesión. Revisa tu conexión e intenta nuevamente."
          : "No pudimos cerrar la sesión. Intenta nuevamente.",
      );
      setIsSubmitting(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div>
      <Button onClick={handleLogout} disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Cerrando sesión…" : "Cerrar sesión"}
      </Button>
      {error ? (
        <p className="mt-3 max-w-sm text-sm leading-6 text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
