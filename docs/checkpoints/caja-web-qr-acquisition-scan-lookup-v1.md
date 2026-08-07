# Caja Web — QR Acquisition & Scan Lookup v1

## Resultado

Caja Web incorpora el primer flujo operativo de consulta: una sesión autenticada con una membresía activa única puede abrir `/caja/scan`, adquirir un QR con la cámara del navegador, validarlo localmente, consultarlo mediante el BFF same-origin y presentar un DTO mínimo de cuenta y recompensas. El resultado permanece sólo en memoria y se elimina al reiniciar o salir.

## Decodificador QR

- Dependencia: `jsqr` 1.4.0.
- Motivo: decodifica exclusivamente QR desde píxeles, no incorpora UI ni administra la cámara, no tiene dependencias transitivas de ejecución y evita depender exclusivamente de `BarcodeDetector`.
- Caja Web conserva el control explícito de `getUserMedia`, video, frames y liberación del stream.

## Cámara y capacidades

`useQrCamera` solicita permiso únicamente al pulsar **Activar cámara**, usa `facingMode: environment` como preferencia y entrega frames sólo al adaptador de `jsqr`. No persiste ni sube imágenes. El loop se pausa durante la consulta y después de resultado/error; los tracks se detienen al desmontar, navegar o fallar la adquisición/decodificación.

Estados explícitos:

- disponible para solicitar;
- inicializando;
- activa;
- permiso denegado;
- cámara/API no disponible;
- error de cámara.

La guía de permiso se limita a los permisos del sitio y no promete abrir una configuración universal del navegador.

## Contrato local de QR

`normalizeQrValue` recorta únicamente espacios exteriores y acepta UUID RFC-4122 con guiones, versión 1–5 y variante `8`, `9`, `a` o `b`, sin distinguir mayúsculas. No cambia el valor válido después del recorte. Es una protección UX; el backend sigue siendo autoritativo.

## Estado y concurrencia

El reducer puro modela `ready → looking-up → account-ready | error`. Dos bloqueos complementarios protegen la consulta:

- el decoder bloquea sincrónicamente el primer callback aceptado;
- el hook de orquestación bloquea otra aceptación y asigna una versión a cada solicitud.

Reset cancela la espera local, incrementa la versión, elimina QR, cliente, cuenta, recompensas y error, y reactiva de forma segura el stream existente. Una respuesta con versión anterior no puede repoblar el estado. Un abort del navegador no se interpreta como prueba de que la ejecución downstream se detuvo; la operación actual es sólo lectura.

## BFF y sesión

`POST /api/scan` valida JSON, `businessId` y `qrCode`, y usa el cliente Supabase SSR del servidor. Primero valida la identidad con `auth.getClaims()`; sólo después lee la sesión para transportar temporalmente el access token a `scan-loyalty-account`. Verifica que ambas identidades coincidan.

La invocación usa exclusivamente URL pública, publishable/anon key y el JWT del usuario autenticado. No usa `service_role`, no consulta tablas de lealtad y no replica autorización de membresía. El timeout es 12 segundos. El token nunca entra al JSON, logs, TanStack Query ni documentación.

## DTO seguro y minimización de PII

El navegador recibe únicamente:

- `accountId`;
- tipo y balances del programa;
- `stampsPerVisit` cuando existe;
- nombre seguro del cliente, con fallback `Cliente`;
- recompensas disponibles con ID, nombre, descripción y requisito de puntos/sellos.

El mapper elimina correo, teléfono, ID interno de cliente, QR crudo, ID/configuración de programa y diagnósticos backend. `accountId` e IDs de recompensa se conservan porque son necesarios para el siguiente bloque. `effective_status` se omitió porque esta pantalla no muta y no debe inventar reglas de expiración; la futura operación y el backend seguirán siendo autoritativos.

Los resultados no se almacenan en TanStack Query, URL, `localStorage`, `sessionStorage` ni caché persistente.

## Errores

El BFF reduce códigos estables a `ACCOUNT_NOT_FOUND`, `SESSION_EXPIRED`, `ACCESS_DENIED`, `INVALID_QR`, `NETWORK`, `TIMEOUT` o `UNEXPECTED`. No reenvía cuerpos o mensajes internos. Un HTTP 401 o `UNAUTHORIZED` activa el mecanismo existente de expiración, limpia caché autenticada/sesión y vuelve a login. Errores de membresía permanecen como restricción operativa, no como fallo Auth.

## Routing y UI

- `/caja` ofrece **Escanear cliente** sólo dentro del estado de membresía resuelta.
- `/caja/scan` vuelve a validar Auth en servidor y reutiliza `MembershipBoundary`; cero, múltiples o error de membresía no exponen el escáner.
- La UI incluye estado textual, `aria-live`, botones semánticos, foco visible, preview descrito, controles táctiles y reset explícito.
- Las recompensas son informativas; no existe selección ni redención ficticia.

## Pruebas

Las pruebas cubren UUID v1–v5, mayúsculas, trim, versión/variante inválidas; reducción de DTO y exclusión de PII; fallback `Cliente`; programa/sellos/recompensas; normalización de errores; callback único, limpieza por reset y rechazo de respuestas obsoletas.

Smoke local sin credenciales:

- `GET /caja/scan` respondió `307` hacia `/login`.
- `POST /api/scan` con UUID ficticios y sin sesión respondió `401` con `SESSION_EXPIRED` y `Cache-Control: no-store`.

## Validación

- `pnpm test`: PASS (9 archivos, 48 pruebas).
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS; el primer intento dentro del sandbox no pudo interpretar `tsc --showConfig`, y el mismo comando autorizado fuera del sandbox compiló, verificó TypeScript y generó rutas correctamente.
- `git diff --check`: PASS.

## Limitación de paridad

Full operational parity is not yet complete because earn/redeem mutations are intentionally deferred.

En particular, no se implementó earn, auto-earn de sellos, redeem ni activity. Cada lookup exitoso termina en `account-ready`.

## Siguiente bloque

`Caja Web — Earn & Redeem Operations v1`

## Corrección de transición cliente (Strict Mode)

Síntoma observado en runtime: `POST /api/scan` completaba con `200` y DTO seguro, pero la pantalla permanecía en `Consultando cuenta…`.

La causa estaba en `useScanLookup`: el cleanup del effect marcaba `mountedRef.current = false`, incrementaba la versión y abortaba la solicitud, pero el setup no restauraba el indicador. El replay de effects de React Strict Mode (`setup → cleanup → setup`) dejaba el hook activo marcado permanentemente como desmontado. Después de parsear el éxito, el guard `!mountedRef.current` descartaba el resultado antes de `dispatch({ type: "resolve" })`, por lo que el reducer nunca recibía la transición a `account-ready`.

El setup ahora activa explícitamente el lifecycle en cada ejecución. El cleanup conserva la invalidación de versión y el abort para desmontajes reales; el guard sigue aceptando sólo la versión actual. La regresión cubre replay de Strict Mode, éxito `looking-up → account-ready`, respuesta de error, segundo callback bloqueado, reset sin datos previos y resultado obsoleto ignorado.

Validación local de la corrección: 11 archivos/53 tests, lint, TypeScript, build webpack y `git diff --check` PASS.
