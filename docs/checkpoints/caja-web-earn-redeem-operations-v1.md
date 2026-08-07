# Caja Web — Earn & Redeem Operations v1

## Resultado

El flujo transitorio de Caja ahora continúa desde un scan resuelto hasta una única mutación earn o redeem, presenta el resultado terminal y exige `Escanear otro` antes de operar otra cuenta. No se agregó persistencia de cliente, retry automático, activity ni captura manual.

## 1. Decisión operacional

`features/operations/domain/operation-decision.ts` clasifica el DTO existente:

- stamps sin recompensas: `auto-earn`;
- stamps con recompensas: elección entre agregar sellos y canjear;
- points sin recompensas: elección con única acción earn y monto requerido;
- points con recompensas: elección entre registrar compra y canjear.

El reducer amplía el flujo a:

```text
ready
→ looking-up
→ account-ready | submitting automático
→ submitting
→ operation-success | operation-error
→ reset
```

`account-ready` es la pantalla de elección. La primera recompensa devuelta queda seleccionada; el reducer ignora IDs que no pertenecen al scan vigente.

## 2. Earn automático de sellos

La rama stamps sin recompensas se ejecuta directamente dentro del éxito del lookup. No depende de un effect, por lo que un rerender o replay de Strict Mode no dispara otra mutación. Un lock sincrónico ligado a la versión del scan permite una sola submission y se libera únicamente con reset.

El browser no envía monto, cantidad de sellos ni delta calculado. Backend conserva cálculo, locking, atomicidad y regla anti-duplicado.

## 3. Monto para puntos

`parsePurchaseAmount` recorta espacios, normaliza coma decimal a punto, aplica `Number(...)` y sólo acepta un número finito mayor a cero. No calcula puntos, convierte moneda ni agrega un máximo propio.

El input usa label visible, `inputMode="decimal"`, error accesible y botón `Registrar compra`.

## 4. `/api/earn`

Browser:

```ts
{
  businessId: string;
  accountId: string;
  purchaseAmount?: number;
}
```

Edge Function `update-points`:

```text
business_id
customer_loyalty_account_id
purchase_amount  // sólo points
```

La traducción usa `accountId → customer_loyalty_account_id`. Nunca envía puntos o sellos calculados por cliente.

## 5. DTO seguro de earn

El BFF reduce la respuesta a:

```text
programType
pointsBalance
stampsBalance
pointsDelta | null
stampsDelta | null
```

Puede consumir `new_balance` internamente como compatibilidad, sin exponer eventos, diagnósticos ni IDs innecesarios.

## 6. Protección de duplicado backend

La protección autoritativa permanece en backend: ventana de 30 segundos para la familia earn sobre la misma cuenta/negocio, incluida la verificación bajo lock. `DUPLICATE_SCAN` se presenta como compra registrada recientemente, no como error genérico. El lock cliente sólo evita doble click, callbacks y auto-earn duplicado; no pretende sustituir esa regla.

## 7. Timeout de earn

No existe retry automático. Un timeout o fallo de red puede ocurrir después de un commit; la UI no vuelve a enviar la compra y dirige a reescanear para consultar el saldo. La protección backend hace el retry de earn condicionalmente seguro dentro de su ventana, pero no equivale a idempotencia y Caja no lo ejecuta automáticamente.

## 8. `/api/redeem`

Browser:

```ts
{
  businessId: string;
  accountId: string;
  rewardId: string;
}
```

Edge Function `redeem-reward`:

```text
business_id
account_id
reward_id
branch_id: null
```

`branch_id:null` preserva el contrato operacional auditado; no se inventó selección de sucursal.

## 9. DTO seguro de redeem

El navegador recibe sólo tipo de programa, balances, puntos/sellos gastados y nombre de recompensa. No recibe registro de canje, evento, diagnósticos ni payload backend crudo.

## 10. Timeout de redeem

Redeem nunca se reintenta automáticamente ni ofrece un botón para reenviar el mismo canje después de timeout. Como el backend no tiene idempotency key o guard de redención duplicada, el estado ambiguo obliga a reescanear y comprobar balance antes de decidir otra acción.

## 11. Auth y transporte

Los dos Route Handlers validan UUID y JSON y usan un helper server-only limitado a `update-points` y `redeem-reward`. Primero validan `auth.getClaims()`; después leen la sesión sólo para transportar el access token del mismo usuario. Usan URL pública, publishable/anon key y timeout de 12 segundos.

No hay `service_role`, admin client, password de base de datos, logs de tokens ni retorno de JWT. El backend/RLS/Edge Function conserva toda autorización y lógica de mutación.

## 12. Errores

Los códigos backend se reducen a categorías comunes y específicas: sesión, acceso, cuenta/programa, configuración, validación, red, timeout, duplicado, recompensa y saldo insuficiente. HTTP 401/`UNAUTHORIZED` reutiliza la expiración de sesión existente. Los mensajes raw nunca llegan a UI.

## 13. Reset y datos transitorios

Éxito y error son estados terminales. Success conserva sólo nombre seguro y DTO reducido; error descarta cuenta/recompensas. Reset:

- aborta la espera local sin afirmar que el servidor se detuvo;
- incrementa versión;
- libera locks;
- elimina cliente, account ID, rewards, monto, selección, resultados y errores;
- reactiva adquisición de cámara.

Nada se almacena en TanStack Query, URL, `localStorage` o `sessionStorage`.

## 14. Protecciones de concurrencia

- lock de decoder y versión de scan existentes;
- lifecycle corregido para Strict Mode;
- lock sincrónico único para earn/redeem;
- resultado tardío ignorado por versión;
- acción terminal sin botón de segunda mutación;
- cero retry automático en cliente o TanStack Query.

## 15. Pruebas

La suite cubre decisiones points/stamps, monto, payloads snake_case, `branch_id:null`, DTOs reducidos, errores, lock de auto-earn/doble submit, selección inicial/ID inválido, transición automática, éxito terminal, timeout terminal, respuesta tardía y limpieza por reset.

Smoke local sin credenciales:

- `/api/earn`: `401 SESSION_EXPIRED`, `Cache-Control: no-store`;
- `/api/redeem`: `401 SESSION_EXPIRED`, `Cache-Control: no-store`.

## 16. Validación

- `pnpm test`: PASS — 18 archivos, 91 tests.
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS.
- `git diff --check`: PASS.

## 17. Matriz QA manual

No ejecutada por Codex porque requiere credenciales y mutaciones reales del usuario.

### Sellos sin recompensa

```text
scan
→ auto earn exactamente una vez
→ balance backend aumenta
→ éxito muestra delta y saldo nuevo
```

### Scan inmediato repetido

```text
misma cuenta dentro de la ventana backend
→ DUPLICATE_SCAN
→ no existe segunda mutación de balance
```

### Cuenta de puntos

```text
scan
→ monto de compra
→ registrar
→ puntos calculados por servidor y saldo nuevo
```

### Recompensa

```text
scan elegible
→ seleccionar recompensa
→ canjear
→ nombre y saldo restante
```

Verificar también timeout simulado: nunca debe aparecer una acción que reenvíe earn o redeem; sólo reescanear.

## 18. Siguiente bloque

`Caja Web — Recent Activity v1`
