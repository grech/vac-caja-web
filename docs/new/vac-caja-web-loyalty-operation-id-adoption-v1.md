# VAC Caja Web — Loyalty OperationId Adoption & Safe Ambiguous Retry v1

Fecha: 2026-08-27
Gate: `P1C — CAJA WEB LOYALTY OPERATION ID ADOPTION`
Modo: implementación local únicamente

## Resultado

Caja Web adopta el `operationId` UUID suministrado por el caller para earn de puntos, earn manual de sellos, earn automático de sellos y redeem. Caja no implementa idempotencia: conserva el boundary `browser → BFF same-origin → Edge Function` y Backend sigue siendo la autoridad canónica.

Cada acción intencional crea un UUID con `crypto.randomUUID()` después de adquirir el lock sincrónico de submission y antes del primer request. Un doble click o callback repetido no crea otro ID. Un retry explícito de un resultado ambiguo conserva en memoria el mismo payload y el mismo UUID; una acción nueva crea otro UUID.

## Cobertura operacional

- Puntos: `/api/earn` recibe y valida `operationId`, conserva `purchaseAmount` y el gateway lo serializa como `operationId` hacia `update-points` sin calcular puntos en Caja.
- Sellos manuales: usa el mismo contrato de earn sin inventar monto, puntos o sellos cliente.
- Sellos automáticos: el pending operation se crea una sola vez después del lock de scan/submission y antes de invocar earn.
- Redeem: `/api/redeem` recibe y valida `operationId`; se conservan `business_id`, `account_id`, `reward_id` y `branch_id: null` al invocar `redeem-reward`.

## Lifecycle del operationId

1. La acción intencional adquiere el lock sincrónico existente.
2. Se crea un pending operation inmutable con `crypto.randomUUID()`, versión de scan y payload exacto.
3. El primer request envía ese ID al BFF.
4. `NETWORK`, `TIMEOUT` o un resultado de servidor no confirmado (`UNEXPECTED`) mantienen el pending operation en memoria.
5. El botón explícito `Reintentar operación` vuelve a enviar ese mismo pending operation; no hay retry HTTP automático.
6. Éxito o rechazo determinístico elimina el pending operation.
7. `LOYALTY_OPERATION_ID_CONFLICT` es terminal: no reenvía, no crea un UUID de reemplazo y exige iniciar una acción nueva.
8. Reset/nuevo scan limpia el lock y cualquier estado transitorio; la siguiente acción intencional obtiene un UUID nuevo.

La UI no muestra términos técnicos de idempotencia, replay o UUID. `applied` y `replayed` son éxitos normales y no cambian la presentación operativa.

## BFF y respuesta

Los dos BFF validan un UUID antes de invocar el gateway y reenvían el string exacto. Se preservan Auth/session, `cache: "no-store"`, timeout de 12 segundos y allowlist de errores existentes.

El mapper lee exclusivamente el campo anidado de Backend:

```text
success.data.operationOutcome
```

y siempre produce en respuestas mapeadas:

```text
operationOutcome: "applied" | "replayed" | null
```

La ausencia del campo en la respuesta legacy sigue siendo éxito y mapea a `null`. El tipo estructural permite omitir el campo sólo para compatibilidad con fixtures legacy directos; los mappers runtime siempre lo emiten.

## Límite explícito de refresh

El pending operation vive únicamente en memoria dentro de `use-scan-lookup`. Un refresh, cierre de pestaña, desmontaje del proceso o teardown pierde el operationId pendiente y no puede recuperar/reintentar esa operación. Este scope no agrega `localStorage`, `sessionStorage`, IndexedDB, queue, service worker, ledger, background sync ni store server-side en Caja. La recuperación que sobreviva refresh requiere una decisión de producto/arquitectura separada.

## Archivos creados

- `app/api/earn/route.test.ts`
- `app/api/redeem/route.test.ts`
- `features/operations/domain/operation-id.ts`
- `features/operations/domain/operation-id.test.ts`
- `features/operations/domain/pending-operation.ts`
- `features/operations/domain/pending-operation.test.ts`
- `features/operations/services/operation-service.test.ts`
- `docs/new/vac-caja-web-loyalty-operation-id-adoption-v1.md`

## Archivos actualizados

- `app/api/earn/route.ts`
- `app/api/redeem/route.ts`
- `features/operations/domain/operation-errors.ts`
- `features/operations/domain/operation-errors.test.ts`
- `features/operations/domain/operation-payloads.ts`
- `features/operations/domain/operation-payloads.test.ts`
- `features/operations/domain/operation-results.ts`
- `features/operations/domain/operation-results.test.ts`
- `features/operations/server/operation-gateway.ts`
- `features/operations/server/route-response.ts`
- `features/operations/services/operation-service.ts`
- `features/scanner/hooks/use-scan-lookup.ts`
- `features/scanner/components/operation-status-card.tsx`

## Pruebas y checks

- Focused Vitest: PASS — 9 files, 43 tests.
- `pnpm test`: PASS — 29 files, 141 tests.
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS fuera del sandbox — compilación, TypeScript, 7 páginas estáticas y rutas dinámicas completadas. El primer intento dentro del sandbox falló antes de compilar con el error ambiental conocido `Could not parse output from TypeScript's --showConfig`.
- `git diff --check`: PASS.

La cobertura prueba UUID de plataforma, validación de transporte, browser DTO exacto, BFF exacto, payload de `update-points`, payload de `redeem-reward`, puntos, sellos, auto-earn, retry ambiguo con el mismo objeto/ID, rotación para una acción nueva, legacy sin outcome, outcome anidado `applied`/`replayed`, conflicto terminal, doble submit con una sola asignación y ausencia de retry HTTP automático.

## Efectos externos

- Backend changes: **NONE**.
- Hosted effects: **NONE**.
- Provider effects: **NONE**.
- Dependency changes: **NONE**.
- Sibling repository source inspection/edits: **NONE**.
- Commit/push/deploy: **NONE**.
