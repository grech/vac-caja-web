# VAC Caja Web — Foundation & Application Architecture v1

## 1. Plataforma detectada

Evidencia verificada en `package.json`, `pnpm-lock.yaml`, `app/`, `tsconfig.json`, `postcss.config.mjs` y `eslint.config.mjs`:

- Next.js `16.3.0` con App Router en `app/`.
- React y React DOM `19.2.8`.
- TypeScript `5.9.3`, modo `strict` y alias raíz `@/*`.
- Tailwind CSS y `@tailwindcss/postcss` `4.3.3`.
- pnpm `10.20.0` declarado en `packageManager`.
- ESLint `9.39.5` con Core Web Vitals y reglas TypeScript de Next.js.
- No existe framework de pruebas. No se añadió uno porque este bloque no incorpora comportamiento de dominio que lo justifique.

Se conservó la estructura raíz existente; no se introdujo `src/` ni se modificó configuración funcional de Next.js, TypeScript, ESLint o PostCSS.

## 2. Dependencias añadidas

- `@tanstack/react-query` `5.101.4`: estado remoto cliente y base del `QueryClientProvider`.
- `@supabase/supabase-js` `2.112.2`: cliente oficial base de Supabase.
- `@supabase/ssr` `0.12.4`: adaptación oficial para clientes browser/server con sesión en cookies.

Supabase recomienda actualmente `@supabase/ssr` cuando la sesión de un framework SSR vive en cookies. No se usaron Auth Helpers deprecados. Referencias: [selección de paquete](https://supabase.com/docs/guides/auth/choosing-a-server-package) y [creación de clientes SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

## 3. Arquitectura final

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  providers/app-providers.tsx
  ui/badge.tsx
  ui/button.tsx
  ui/surface-card.tsx
lib/
  query/create-query-client.ts
  query/query-keys.ts
  supabase/client.ts
  supabase/config.ts
  supabase/server.ts
docs/checkpoints/
  caja-web-foundation-v1.md
```

La dirección preparada es `route/page → feature composition → hook/service → lib integration`. No se crearon carpetas vacías para auth, membership, scanner o activity; aparecerán sólo cuando cada bloque implemente comportamiento real.

## 4. Query Client

`lib/query/create-query-client.ts` crea una instancia por árbol de aplicación desde `components/providers/app-providers.tsx`. La página permanece como Server Component y sólo el provider requiere `"use client"`.

Los defaults son `staleTime: 30_000`, un reintento para lecturas, cero reintentos para mutaciones y sin refetch por foco. `lib/query/query-keys.ts` establece el prefijo `vac-caja` y exige `userId` + `businessId` para el espacio autenticado. El siguiente bloque deberá limpiar o reemplazar el cache al cerrar sesión o cambiar de cuenta. TanStack Query no se usa como almacén genérico de UI.

## 5. Límite Supabase browser/server

- `lib/supabase/client.ts` crea el cliente browser con `createBrowserClient`.
- `lib/supabase/server.ts` crea por solicitud el cliente server con `createServerClient` y `cookies()` asíncrono de Next.js 16.
- `lib/supabase/config.ts` centraliza URL y clave pública. Prefiere `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y conserva compatibilidad temporal con `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ya presente en el entorno local.
- `.env.example` documenta sólo URL y publishable key públicas, sin valores.

No se añadió `proxy.ts`, validación de identidad, refresh, login, logout ni protección de rutas. Esas responsabilidades corresponden al bloque de autenticación. No existe ninguna clave privada o `service_role` en la aplicación.

## 6. Límite BFF futuro

Los futuros adaptadores operativos deberán ser Route Handlers same-origin bajo `app/api/`, delegando en servicios pequeños que invoquen los Edge Functions aprobados:

```text
browser feature service
→ Next.js Route Handler
→ VAC Supabase Edge Function
```

El Route Handler sólo transportará sesión, validará la forma serializada mínima y normalizará respuestas seguras. No duplicará reglas de lealtad, autorización, membresía o idempotencia. No se creó ningún proxy operacional en este bloque.

## 7. Tema y tokens

`app/globals.css` integra la paleta VAC con Tailwind 4 mediante `@theme inline`. Colores, radios, sombras, tipografía, tracking y ancho de contenido tienen nombres semánticos; los componentes no dispersan valores hexadecimales.

La pantalla usa Geist Sans para lectura y Geist Mono para etiquetas operativas. Incluye una única firma visual amarilla, foco visible, `prefers-reduced-motion`, contenido responsive y targets táctiles mínimos de 44–48 px.

## 8. Primitivas creadas

- `Button`: botón semántico, estado disabled, target táctil y foco visible.
- `SurfaceCard`: superficie semántica con borde, radio y sombra tokenizados.
- `Badge`: etiqueta compacta de estado.

Las tres se usan en `app/page.tsx`; no se crearon primitivas sin consumidor. La página no contiene navegación, datos operativos ficticios ni comportamiento de autenticación.

## 9. Validación

- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS; `/` se prerenderiza como contenido estático.
- `git diff --check`: PASS.
- Inspección visual en el servidor local: PASS en `1440×1000` y `390×844`.
- `pnpm build`: FAIL en Codex. Primero `next/font` no tuvo red; con red, Turbopack encontró la restricción del sandbox al abrir el puerto interno de PostCSS (`EPERM`). El build equivalente con el compilador webpack oficial pasó. No se cambió el script por una restricción exclusiva del entorno de validación.

## 10. Siguiente bloque recomendado

```text
Caja Web — Unified Authentication & Session Foundation
```

Ese bloque debe implementar exclusivamente el login unificado owner/cashier y el ciclo de sesión del navegador, incluyendo el proxy de refresh y el aislamiento/limpieza del cache autenticado. No debe incorporar scanner ni operaciones de lealtad.
