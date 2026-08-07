# VAC Caja Web — Unified Authentication & Session Foundation v1

## 1. Arquitectura implementada

La feature queda organizada bajo `features/auth/` con esta dirección de dependencias:

```text
app route
→ auth component / hook
→ AuthProvider
→ auth service
→ Supabase browser adapter

login form
→ pure login identity module
→ Web Crypto
```

Las páginas `app/page.tsx`, `app/login/page.tsx` y `app/caja/page.tsx` permanecen como Server Components. Sólo el formulario, logout, provider y hook de expiración requieren `"use client"`.

No se consultan perfiles, membresías, negocios ni funciones operativas.

## 2. Login owner

`features/auth/domain/login-identity.ts` recorta únicamente whitespace exterior del identificador. Un correo válido que no coincide con la forma de alias de Caja se conserva como identidad owner, incluyendo su casing. La contraseña se transmite sin normalización y nunca se persiste ni se registra.

`features/auth/services/auth-service.ts` entrega esa identidad exclusivamente a `supabase.auth.signInWithPassword`. El resultado presentado por `features/auth/components/login-form.tsx` nunca distingue existencia de owner o cashier.

## 3. Alias cashier e identidad v1

El módulo puro separa `<login_username>@<cashier_login_code>` y aplica:

- trim y lowercase sólo al username;
- longitud de username de 3–32;
- patrón `^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$` más control explícito de longitud;
- login code lowercase con slug y sufijo final de ocho caracteres del alfabeto `a-z2-9`;
- preimagen UTF-8 exacta `vac-cashier-login:v1`, newline, login code, newline, username canónico;
- SHA-256 mediante `globalThis.crypto.subtle`;
- base64url sin padding;
- prefijo y dominio sintéticos v1 aprobados.

La identidad sintética sólo vive dentro de la preparación de credenciales y del adapter de Auth. No forma parte del estado del formulario, contexto público, mensajes, logs o UI. La clasificación del identificador no se interpreta como rol autorizado.

## 4. Vector determinista y pruebas

`features/auth/domain/login-identity.test.ts` contiene un vector hard-coded generado independientemente con OpenSSL para el alias ficticio `Caja.Norte@negocio-abcdefgh`. El expected no reutiliza el helper de producción.

La cobertura automatizada incluye:

- owner válido, trim exterior y contraseña intacta;
- parsing cashier y normalización uppercase → lowercase;
- vector SHA-256/base64url v1 exacto;
- forma base64url de 43 caracteres y separación entre alias visible e identidad Auth;
- identificadores sin `@`, vacíos, malformed, username corto/largo, puntuación en extremos, caracteres inválidos y sufijo inválido;
- mapeo de identificador inválido a fallo genérico sin llamar Supabase;
- notice de sesión permitido y rechazo de texto arbitrario desde URL.

Se añadió `vitest` `4.1.10` como el mínimo runner TypeScript; no se añadió DOM ni framework de componentes.

## 5. Límite Supabase browser/server

- `lib/supabase/client.ts`: cliente browser cookie-aware con `createBrowserClient`.
- `lib/supabase/server.ts`: cliente nuevo por solicitud con `createServerClient` y `cookies()` asíncrono.
- `features/auth/services/server-auth.ts`: valida claims firmados con `supabase.auth.getClaims()` y sólo devuelve `sub` o `null`.
- `lib/supabase/config.ts`: usa únicamente URL y publishable/anon key públicas; el error de configuración es seguro y no incluye valores.

El estado React coordina UX, pero no protege rutas. No se usa `getSession()` como autoridad server-side, ni Auth Helpers deprecados, almacenamiento custom o claves privadas.

## 6. Refresh con Proxy de Next.js 16

`proxy.ts` usa la convención de Next.js 16 y delega en `lib/supabase/proxy.ts`. El cliente SSR:

1. lee todas las cookies de la solicitud;
2. llama `getClaims()` al inicio para validar/refrescar cuando corresponda;
3. copia cookies actualizadas a request y response;
4. aplica los headers privados/no-cache entregados por `@supabase/ssr` `0.12.4`.

El matcher excluye assets estáticos. Si falta configuración o Auth no está disponible, Proxy no expone el error; las páginas server-side siguen negando acceso protegido.

## 7. Routing protegido

- `/`: valida claims y redirige a `/caja` o `/login`.
- `/login`: redirige una sesión válida a `/caja`; de otro modo muestra el formulario unificado.
- `/caja`: exige claims válidos y redirige a `/login` cuando no existen.

Las tres rutas usan `dynamic = "force-dynamic"` para impedir cache compartido de respuestas autenticadas. El shell muestra únicamente VAC Caja, sesión activa, estado pre-operacional y logout.

## 8. Logout

`features/auth/components/logout-button.tsx` impide doble submit. `AuthProvider.signOut()`:

1. espera `supabase.auth.signOut()`;
2. si falla, conserva el estado protegido y muestra un error seguro/reintentable;
3. si pasa, cancela y elimina cache autenticado;
4. limpia identidad cliente;
5. la UI reemplaza navegación por `/login` y refresca el árbol server.

No se presenta éxito optimista.

## 9. Expiración de sesión

`features/auth/hooks/use-session-expiration.ts` expone el mecanismo reusable para futuros adapters operativos. Al recibir una señal `SESSION EXPIRED`:

- solicita limpieza local de Supabase;
- elimina cache autenticado;
- limpia identidad protegida;
- reemplaza la ruta por `/login?notice=session-expired`;
- refresca la evaluación server-side.

`features/auth/domain/login-notice.ts` usa allowlist y nunca refleja texto arbitrario de URL. No existe loop automático de redirect/refresh.

## 10. Cache autenticado

`lib/query/query-keys.ts` añade `authenticatedRoot`. `features/auth/services/authenticated-cache.ts` cancela y elimina sólo queries bajo `['vac-caja', 'authenticated']`.

El provider ejecuta esa limpieza en logout, expiración y transición de un user ID a otro. Cache público futuro queda intacto; password, sesión y tokens no entran a TanStack Query.

## 11. Dependencias añadidas

- `vitest` `4.1.10` (dev): pruebas TypeScript del contrato criptográfico y normalización segura.

No se añadieron dependencias de crypto, estado global, UI, scanner o Auth.

## 12. Validación

- `pnpm test`: PASS — 3 archivos, 15 tests.
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS — `/`, `/login`, `/caja` dinámicas y Proxy compilado.
- `git diff --check`: PASS.
- Smoke local `/login`: PASS — HTTP 200 y contenido esperado.
- Smoke local `/caja` sin sesión: PASS — HTTP 307 a `/login`.
- Smoke local `/` sin sesión: PASS — HTTP 307 a `/login`.
- Revisión responsive: PASS en 1440×1000 y 390×844.

No se ejecutó sign-in contra cuentas reales ni se mutó Supabase hospedado, de acuerdo con el alcance autorizado.

## 13. Siguiente bloque recomendado

```text
Caja Web — Membership & Operational Shell v1
```

Ese bloque debe resolver la membresía activa y la identidad segura owner/cashier. No debe implementar todavía scanner ni mutaciones de lealtad.
