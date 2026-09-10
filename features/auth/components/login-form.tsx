"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useAuth } from "../providers/auth-provider";
import type { AuthFailureCode } from "../types";
import { GoogleSignInButton } from "./google-signin-button";

const LOGIN_ERRORS: Record<AuthFailureCode, string> = {
  "invalid-credentials": "Usuario o contraseña incorrectos.",
  network: "No pudimos conectar. Revisa tu conexión e intenta nuevamente.",
  configuration:
    "La terminal no está configurada. Solicita ayuda antes de iniciar sesión.",
  unexpected: "No pudimos iniciar sesión. Intenta nuevamente.",
};

export function LoginForm() {
  const router = useRouter();
  const { signIn, signInWithGoogle, isConfigured } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const isBusy = isSubmitting || isGoogleSubmitting;
  const visibleError = isConfigured
    ? formError
    : LOGIN_ERRORS.configuration;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);

    const result = await signIn(identifier, password);

    if (!result.ok) {
      setFormError(LOGIN_ERRORS[result.code]);
      setIsSubmitting(false);
      return;
    }

    router.replace("/caja");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    if (isBusy) {
      return;
    }

    setIsGoogleSubmitting(true);
    setFormError(undefined);

    const result = await signInWithGoogle();

    if (!result.ok) {
      setFormError(LOGIN_ERRORS[result.code]);
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <TextField
            id="identifier"
            name="identifier"
            label="Usuario o correo"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            disabled={isBusy}
          />
          <TextField
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isBusy}
          />
        </div>

        {visibleError ? (
          <p className="mt-5 text-sm leading-6 text-danger" role="alert">
            {visibleError}
          </p>
        ) : null}

        <Button
          variant="primary"
          className="mt-7 w-full"
          type="submit"
          disabled={isBusy || !identifier || !password || !isConfigured}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs font-semibold uppercase tracking-system text-muted">
          o
        </span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <GoogleSignInButton
        className="mt-6"
        onClick={handleGoogleSignIn}
        disabled={isBusy || !isConfigured}
        aria-busy={isGoogleSubmitting}
      >
        {isGoogleSubmitting ? "Conectando con Google…" : "Continuar con Google"}
      </GoogleSignInButton>
    </div>
  );
}
