# Caja Web — Recent Activity v1

## Resultado

Caja Web completa el loop operativo mínimo con una bitácora reciente protegida por Auth y membresía. Activity es lectura remota en TanStack Query, sin persistencia, polling, realtime, paginación ni analytics. Earn/redeem confirmados marcan stale únicamente el feed del usuario y negocio actuales.

## 1. Ruta

`/caja/activity` valida Auth en servidor y reutiliza `MembershipBoundary`. Sólo una membresía activa resuelta monta `ActivityScreen`; cero, múltiples o error conservan los estados seguros existentes. `/caja` muestra las acciones en orden:

```text
Escanear cliente
Ver actividad reciente
Cerrar sesión
```

## 2. BFF

`POST /api/activity` recibe únicamente:

```ts
{ businessId: string }
```

Valida el UUID, traduce a `{ business_id }` e invoca `get-recent-loyalty-events`. El allowlist del transporte server-only existente se amplió sólo con esta función.

El transporte valida `auth.getClaims()`, lee la sesión únicamente para transportar el JWT del mismo usuario, usa URL pública/publishable key y aplica timeout de 12 segundos. No usa `service_role`, admin client, password de base de datos ni expone tokens o mensajes backend.

## 3. DTO seguro

El navegador recibe una lista de:

```text
id
eventType
pointsDelta
stampsDelta
createdAt
customerName
rewardName
programType
```

El mapper prefiere `customer.full_name`, después `customer.name` y finalmente `null`. Reward usa únicamente `reward.name`; programa acepta `points`, `stamps` o `null`. No pasan IDs internos de cliente/programa, emails, teléfonos, records unidos, diagnósticos ni `purchase_amount`.

## 4. Tipos de evento

Se soportan exclusivamente:

- `earn_points`;
- `earn_stamp`;
- `earn_stamps`;
- `adjustment`;
- `redeem`.

Un tipo futuro desconocido se omite de forma segura sin romper el feed. Títulos usan deltas backend: puntos, singular/plural de sellos, `Recompensa canjeada` y `Ajuste de saldo`. Caja no recalcula movimientos.

## 5. Semántica de 25 eventos

El backend obtiene hasta 25 ledger events y 25 redemptions completados, los combina, ordena por `created_at` descendente y devuelve los primeros 25. Las redemptions se representan como eventos sintéticos `redeem`, no duplican ledger rows. Caja preserva orden y tamaño backend: no agrega límite, ordenamiento, deduplicación o paginación cliente.

## 6. Query key

La clave exacta es:

```text
['vac-caja', 'authenticated', userId, businessId, 'recent-activity']
```

Cambiar usuario o negocio produce otra key. Continúa bajo `authenticatedRoot`, por lo que logout, expiración y cambio de identidad cancelan/remueven el feed con el cleanup existente.

## 7. Fetch y refetch

La query se habilita sólo con Auth ready, `userId` y `businessId` resuelto. Usa defaults existentes: `staleTime` 30 segundos, un retry de lectura, reconnect y sin focus refetch. Activity añade `refetchOnMount:"always"` para consultar al entrar a la ruta. Auth/access no se reintentan.

No existe interval, polling, websocket o background timer.

## 8. Refresh manual

`Actualizar` llama `query.refetch()`. Un lock sincrónico más `isFetching` evita solicitudes manuales concurrentes; el botón se deshabilita y anuncia `Actualizando…`. El estado de error ofrece `Reintentar` sin mostrar detalles técnicos.

## 9. Invalidación post-operación

Después de un `ok:true` confirmado de earn o redeem se ejecuta:

```text
invalidateQueries({
  queryKey: recentActivity({ userId, businessId }),
  exact: true,
  refetchType: 'none'
})
```

Esto marca stale sólo el feed exacto y deja que la próxima visita/refetch obtenga el evento nuevo. Fallo, timeout ambiguo, scan, selección y reset no invalidan Activity. No hay navegación automática.

## 10. Aislamiento y persistencia

Las pruebas demuestran que usuario/negocio distintos generan keys distintas, la invalidación no toca otro scope y remover `authenticatedRoot` elimina feeds previos. La caché es únicamente la memoria normal de TanStack Query; no usa URL, cookies, local/session storage o IndexedDB.

## 11. Sesión expirada

HTTP 401 o `UNAUTHORIZED` se normaliza a `SESSION_EXPIRED`. El hook reconoce únicamente ese error y llama el mecanismo central `useSessionExpiration`; no crea otra recuperación Auth. Errores de acceso permanecen operativos.

## 12. UI

Estados distintos:

- loading;
- lista;
- empty con guía operacional;
- refreshing;
- error/retry.

Cada fila muestra qué ocurrió, customer sólo cuando existe, reward cuando aplica y tiempo basado en `createdAt`. `Intl.RelativeTimeFormat` cubre minutos/horas e `Intl.DateTimeFormat` fechas anteriores; fechas inválidas muestran `Fecha no disponible`.

La superficie conserva tokens VAC, controles de 48 px, foco visible, HTML semántico y mensajes `aria-live`. No contiene métricas, chart, filtros ni navegación administrativa.

## 13. Pruebas

La suite cubre cinco tipos canónicos, PII minimization, fallbacks customer/reward/program, tipo futuro, títulos/deltas, fechas inválidas, estados de fetch, refresh bloqueado, sesión expirada, scoping, cleanup autenticado e invalidación exacta tras earn/redeem confirmado sin invalidar fallos/timeouts.

## 14. Validación

- `pnpm test`: PASS — 24 archivos, 116 tests.
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS.
- `git diff --check`: PASS.
- Smoke `/caja/activity` sin sesión: PASS — `307 /login`.
- Smoke `/api/activity` sin sesión: PASS — `401 SESSION_EXPIRED`, `Cache-Control:no-store`.

## 15. QA manual en Vercel

No ejecutada por Codex porque requiere credenciales y datos reales del usuario en `https://caja.vacloy.com`.

```text
login
→ Ver actividad reciente
→ eventos existentes visibles

scan de prueba
→ earn +1 sello confirmado
→ /caja
→ Ver actividad reciente
→ evento nuevo visible (Actualizar si hace falta)

redeem confirmado
→ Activity
→ una redención visible, sin representación duplicada

logout
→ otra cuenta
→ ningún evento del usuario previo
```

## 16. Estado de paridad y cierre mínimo

El loop mínimo de contingencia está cubierto: Auth, negocio, scan, earn/redeem y Activity reciente. No se recomienda iniciar automáticamente otra feature.

Cierre/hardening mínimo restante:

1. ejecutar la matriz QA autenticada anterior en Vercel con cuentas de prueba propiedad del usuario;
2. confirmar visualmente responsive/keyboard/cámara en los navegadores objetivo;
3. antes de uso comercial, cerrar el gap backend ya identificado de acceso operativo/billing y realizar una revisión final de seguridad/observabilidad, sin convertirlo en gating sólo cliente.
