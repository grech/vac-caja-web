# VAC Caja Web — Owner Google OAuth Sign-In v1

## Alcance

Se agregó "Continuar con Google" como mecanismo de autenticación adicional para propietarios en Caja Web. Login por correo/contraseña (owner) y por alias/contraseña (cashier) no cambiaron.

Google es únicamente autenticación. La UUID de Supabase resultante fluye por la misma resolución de membresía existente; Google no otorga rol ni bypassa `business_members`.

## Archivos nuevos

- `features/auth/domain/google-oauth.ts` — construye `redirectTo` (`<origin>/auth/callback?next=/caja`) a partir del origin actual del navegador; nunca hardcodea `app.vacloy.com`.
- `features/auth/domain/safe-redirect.ts` — allowlist de destino post-callback (`/caja` únicamente); cualquier otro valor cae a `/caja`.
- `features/auth/services/google-oauth-service.ts` — invoca `supabase.auth.signInWithOAuth({ provider: "google", ... })` reutilizando la clasificación de errores existente (`classifyAuthError`, ahora exportado desde `auth-service.ts`).
- `app/auth/callback/route.ts` — Route Handler que intercambia `code` por sesión (`exchangeCodeForSession`) usando el cliente Supabase server-side existente (cookie-aware) y redirige a `/caja`; falla cerrado a `/login?notice=oauth-error` si falta `code`, si el intercambio falla, o ante cualquier excepción.
- Pruebas colocadas junto a cada módulo nuevo.

## Archivos modificados

- `features/auth/domain/login-notice.ts` (+ test) — se agregó la notice allowlisted `oauth-error`.
- `features/auth/services/auth-service.ts` — `classifyAuthError` pasó de privado a exportado (reuso, sin cambio de comportamiento).
- `features/auth/providers/auth-provider.tsx` — se agregó `signInWithGoogle()` al contexto existente, con guard anti doble-click igual al de `signIn`/`signOut`. `signIn`, `signOut`, `endExpiredSession` y la resolución de membresía no se tocaron.
- `features/auth/components/login-form.tsx` — se agregó separador "o" y botón "Continuar con Google" con su propio loading/disabled state; el formulario de correo/contraseña permanece intacto y sigue siendo el submit primario.
- `features/auth/components/login-screen.tsx` — copy actualizado a "Propietarios pueden entrar con su correo, contraseña o Google. Cajeros continúan usando su usuario de Caja."

## Callback de producción esperado

```text
https://caja.vacloy.com/auth/callback
```

Generado dinámicamente desde `window.location.origin` en el cliente; no está hardcodeado.

## Pendiente hosted (no ejecutado en este alcance)

El checkpoint transversal (`vac-checkpoint-google-auth-onboarding-owner-web-readiness-pre-wallet-audit-v1.md`) registra el redirect allowlist de Supabase Auth como:

```text
https://app.vacloy.com/**
http://localhost:3000/**
```

`https://caja.vacloy.com/**` (o al menos `https://caja.vacloy.com/auth/callback`) no aparece en esa lista. Antes de QA real en producción, alguien con acceso al proyecto Supabase (`vac-loyalty` / `fldjszobhzfxwjbsucks`) debe agregar el callback de Caja al redirect allowlist. Esta implementación no modifica configuración hosted de Supabase Auth.

## Validación ejecutada

- `pnpm test`: PASS — 35 archivos, 170 tests (incluye 12 tests nuevos).
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS — `/auth/callback` aparece como ruta dinámica junto a `/`, `/login`, `/caja`.
- `git diff --check`: PASS.
