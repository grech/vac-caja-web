# VAC Caja — Camera Rearm / Unintended Auto-Earn Audit v1

Fecha: 2026-08-31
Modo: auditoría local; sin implementación
Baseline: `main` en `66627c546047814ad7c22d7577ce7bac7ae77a38`

## Resultado ejecutivo

El comportamiento observado está **parcialmente reproducido por el flujo de código**. El código confirma que, al pulsar `Escanear otro`, Caja abre un ciclo lógico nuevo, reactiva el mismo `MediaStream`, libera el lock del decoder y acepta inmediatamente el primer frame decodificable sin demostrar que sea posterior al rearm ni que el QR anterior haya salido de cámara.

La causa primaria se clasifica como **HIGH-CONFIDENCE — camera lifecycle/rearm admission bug**. La variante exacta «el navegador volvió a entregar el frame pausado anterior» queda como **PLAUSIBLE**, porque el código la permite pero la temporización real del navegador no puede demostrarse sólo con fuente y pruebas unitarias. Una alternativa igualmente compatible es que el primer frame sí fuera nuevo, pero todavía contuviera el QR anterior.

P1A no falló. Un decode aceptado después de reset se convierte deliberadamente en un scan nuevo, con versión nueva y `operationId` nuevo; Backend debe tratarlo como operación nueva y puede devolver `applied`.

## Comportamiento observado

1. Un earn de sellos terminó correctamente y dejó saldo 2.
2. El replay P1A devolvió `operationOutcome = replayed` sin incrementar saldo.
3. El usuario pulsó `Escanear otro`.
4. La cámara reapareció.
5. Antes de presentar intencionalmente otro QR, se agregó otro sello.

No se llamó ninguna API productiva durante esta auditoría.

## Flujo causal actual

### 1. Éxito y reset

`ScannerScreen` conserva `QrCamera` montado; sólo oculta su contenedor según el estado. `QrCamera` recibe `enabled={cameraEnabled}` y `cameraEnabled` vale únicamente cuando el estado real del scanner es `ready` (`features/scanner/components/scanner-screen.tsx:51`, `features/scanner/hooks/use-scan-lookup.ts:423`).

Desde `operation-success`, `Escanear otro` ejecuta `reset()` (`features/scanner/components/scanner-screen.tsx:79`). El reset:

- aborta y elimina el request actual;
- incrementa `versionRef`;
- libera `lockedRef`;
- limpia el submission lock;
- elimina el pending operation;
- limpia el retry transitorio;
- despacha `reset` (`features/scanner/hooks/use-scan-lookup.ts:395`).

El reducer convierte cualquier estado en `{ status: "ready", version }` para esa acción (`features/scanner/domain/scanner-state.ts:60`). Esto es un ciclo lógico nuevo intencional, no una continuación del earn anterior.

### 2. Cámara deshabilitada y rearmada

Cuando `enabled` cambia a `false`, `useQrCamera`:

- cancela el RAF registrado;
- pausa el `<video>`;
- **no** detiene tracks;
- **no** limpia `streamRef`;
- **no** elimina `video.srcObject`;
- **no** invalida explícitamente el frame actual (`features/scanner/hooks/use-qr-camera.ts:159`).

Por lo tanto, durante lookup, submitting y success, el mismo `MediaStream` y el mismo `srcObject` permanecen asociados al `<video>`. El elemento pausado puede conservar su frame actual.

Cuando reset devuelve el scanner a `ready`, `enabled` cambia a `true`. Si ya existen stream y video, el hook:

1. libera `callbackLockedRef`;
2. llama `video.play()`;
3. al resolverse el promise, llama `startLoop()` (`features/scanner/hooks/use-qr-camera.ts:168`).

`startLoop()` cancela el RAF registrado, vuelve a liberar el callback lock, pone `lastDecodeAtRef` en cero y agenda un RAF inmediato (`features/scanner/hooks/use-qr-camera.ts:107`). El primer RAF acepta cualquier `video.readyState >= HAVE_CURRENT_DATA`; no compara `currentTime`, frame metadata, `presentedFrames` ni una generación de rearm (`features/scanner/hooks/use-qr-camera.ts:69`).

Consecuencia confirmada: el primer frame decodificable después del rearm se admite sin prueba de frescura. Ese frame puede ser:

- **PLAUSIBLE:** el frame que estaba visible al pausar el video;
- **PLAUSIBLE:** un frame nuevo del stream que aún contiene el QR anterior;
- un frame realmente nuevo con otro QR, que sí debe aceptarse.

El código actual no distingue esos casos.

### 3. Decode, lookup y auto-earn

El canvas se redimensiona y se repinta desde el video antes de cada decode. `decodeQrFrame` llama directamente a `jsQR` y no conserva resultados (`features/scanner/hooks/use-qr-camera.ts:80`, `features/scanner/services/qr-decoder.ts:3`). No hay cache de QR en decoder ni en estado del hook.

Si el primer frame devuelve QR A, el hook bloquea callbacks adicionales y ejecuta `onDecoded` una vez (`features/scanner/hooks/use-qr-camera.ts:90`). `acceptDecodedQr` encuentra `lockedRef = false` por el reset, lo vuelve a bloquear, incrementa otra vez la versión y ejecuta lookup con `cache: "no-store"` (`features/scanner/hooks/use-scan-lookup.ts:248`, `features/scanner/services/scan-service.ts:30`).

Si Backend devuelve un programa stamps sin recompensas, `decideOperation` elige `auto-earn` (`features/operations/domain/operation-decision.ts:7`). Caja adquiere el submission lock de la versión nueva, crea un pending earn y llama `performEarn` (`features/scanner/hooks/use-scan-lookup.ts:283`).

`createPendingEarnOperation` genera un `operationId` mediante `crypto.randomUUID()` (`features/operations/domain/pending-operation.ts:25`, `features/operations/domain/operation-id.ts:8`). `earnAccount` envía ese ID a `/api/earn` una sola vez (`features/operations/services/operation-service.ts:106`), y el BFF lo valida y reenvía (`app/api/earn/route.ts:17`).

Cadena compacta:

```text
operation-success
→ Escanear otro
→ reset: version++, scan lock libre, operation lock libre, pending = null
→ ready / cameraEnabled = true
→ mismo stream + video.play()
→ callback lock libre + decode inmediato sin freshness gate
→ QR A aceptado
→ scan version nueva
→ lookup
→ stamps sin reward = auto-earn
→ operationId nuevo
→ POST /api/earn
→ applied posible
```

## Hallazgos clasificados y rankeados

### 1. CONFIRMED — falta una barrera de rearm/frescura

La cámara acepta el primer frame decodificable tras re-enable sin exigir un frame posterior al rearm ni observar primero ausencia de QR. Ésta es la deficiencia causal necesaria para el incidente.

### 2. HIGH-CONFIDENCE — el incidente es un scan nuevo no intencional

Una segunda lectura de QR después de reset atraviesa un ciclo nuevo, obtiene versión nueva, libera los guards por diseño y genera un UUID nuevo. Eso explica un resultado `applied` y un sello adicional sin contradecir el replay anterior.

### 3. PLAUSIBLE — reutilización del frame pausado

El stream y `srcObject` permanecen activos/asociados y el video sólo se pausa. `HAVE_CURRENT_DATA` y el frame actual pueden seguir disponibles cuando el primer RAF se ejecuta. Falta una prueba controlada de browser para elevar esta variante a CONFIRMED.

### 4. PLAUSIBLE — el QR anterior seguía en el primer frame realmente nuevo

Aunque el navegador entregue un frame nuevo antes del RAF, el código tampoco exige que la cámara haya observado un frame sin QR. Si QR A seguía físicamente visible, se acepta otra vez.

### 5. RULED OUT / no respaldado por la fuente

- **P1A/idempotency failure:** RULED OUT para la cadena observada. Replay con el mismo ID funcionó; el segundo ciclo crea otro ID.
- **Automatic HTTP retry:** RULED OUT. Los servicios hacen un único `fetch`; pruebas existentes verifican una sola llamada incluso ante error ambiguo.
- **Decoder cache:** RULED OUT. `decodeQrFrame` es stateless.
- **Canvas cache:** RULED OUT como fuente independiente. El canvas se repinta completo desde video en cada intento; el posible contenido stale proviene del video.
- **Duplicate callback dentro del mismo ciclo:** RULED OUT por `callbackLockedRef` y `lockedRef`.
- **Scanner reducer iniciando earn sin decode:** RULED OUT. El reducer sólo entra a auto-earn después de lookup y `begin-auto-earn` válido.
- **Submission guard defectuoso:** RULED OUT como defecto. Se limpia intencionalmente en reset para permitir el próximo cliente; no puede distinguir un re-decode involuntario.
- **Strict Mode/effect replay:** no hay evidencia causal. El lifecycle de requests invalida versiones y aborta en cleanup; existe prueba específica de replay.
- **Múltiples RAF loops activos:** no respaldado. `startLoop` cancela el RAF registrado antes de crear otro y el loop se detiene cuando `enabled` es falso.
- **MediaStreams superpuestos:** no respaldado en el rearm normal. El hook reutiliza un único `streamRef`; una solicitud manual nueva detiene el stream anterior.
- **Browser/service-worker cache:** RULED OUT como explicación de la mutación. Scan y earn son POST con `cache: "no-store"`; no hay retry/cache de operación en los paths auditados.

## Clasificación de causa

```text
Categoría primaria: camera lifecycle bug
Scanner state bug: NO
Operation lifecycle bug: NO
P1A/idempotency bug: NO
Confianza global: HIGH-CONFIDENCE
Variante exacta stale paused frame: PLAUSIBLE
```

## ¿Falló P1A?

**NO.** P1A garantiza que un retry ambiguo de la misma operación reutilice su `operationId`. No pretende considerar todos los scans posteriores del mismo QR como la misma operación. Reset borra el pending anterior y abre un ciclo nuevo; una lectura admitida después de reset genera correctamente otro UUID.

Reutilizar el ID anterior o extender idempotencia a través de reset sería una corrección incorrecta: podría bloquear intenciones legítimas y mover al lifecycle de operación una responsabilidad que pertenece a adquisición/rearm de cámara.

## Opciones mínimas de corrección futura

### Opción recomendada — freshness gate + QR-cleared gate

En `features/scanner/hooks/use-qr-camera.ts`, representar explícitamente una generación de rearm:

1. al deshabilitar, detener el loop y marcar rearm pendiente;
2. al habilitar, no decodificar hasta observar un frame presentado después del rearm;
3. antes de volver a habilitar callbacks, exigir al menos un frame decodificado como `null`;
4. sólo después aceptar exactamente un QR.

Una señal de frame real puede usar `requestVideoFrameCallback` cuando esté disponible, con fallback probado para navegadores soportados. Exigir un frame `null` evita tanto el frame pausado como un QR anterior que continúe físicamente en cámara.

### Opción más fuerte — teardown de stream al deshabilitar

Usar `stopStream()` al salir de `ready`, eliminar `srcObject` y reiniciar cámara después de reset. Reduce la posibilidad de frame retenido, pero por sí sola no evita que el primer frame del stream nuevo todavía contenga QR A. También aumenta latencia, churn de cámara y riesgo de permisos/disponibilidad; debería combinarse con el QR-cleared gate.

### Opción no recomendada — deduplicación por QR en operación

No reutilizar `operationId`, no persistir el QR anterior como idempotency key y no bloquear permanentemente el mismo cliente. Eso confundiría adquisición de cámara con semántica de negocio y podría impedir un scan legítimo posterior.

Boundary recomendado:

```text
features/scanner/hooks/use-qr-camera.ts
features/scanner/hooks/use-qr-camera.test.tsx (nuevo)
features/scanner/hooks/use-scan-lookup.test.tsx (nuevo o integración equivalente)
features/scanner/components/qr-camera.tsx sólo si cambia la UX de rearm
```

No requiere cambios en operaciones, BFF, Backend, Supabase ni P1A.

## Pruebas de regresión requeridas

### Negativa: no re-decoding sin frame nuevo/intencional

Prueba determinística con `getUserMedia`, `<video>`, RAF y decoder controlados:

1. entregar QR A;
2. resolver lookup stamps sin rewards;
3. completar exactamente un auto-earn;
4. llegar a `operation-success`;
5. ejecutar reset;
6. reactivar cámara sin avanzar el marcador de frame y sin entregar un frame `null`;
7. ejecutar RAF;
8. afirmar cero callbacks adicionales, cero lookup adicional y cero earn adicional.

Esta prueba debe fallar con la implementación actual.

### Positiva: frame realmente nuevo permite una operación

Después del mismo reset:

1. avanzar el marcador de frame;
2. entregar primero un frame sin QR;
3. entregar después un frame nuevo con QR B;
4. afirmar un solo callback, un solo lookup y un solo earn;
5. afirmar que el nuevo `operationId` es distinto al de la operación anterior;
6. repetir callbacks/RAF del mismo ciclo y confirmar que no aparece una segunda operación.

### Cobertura adicional

- rearm con stream reutilizado;
- fallback sin `requestVideoFrameCallback`;
- Strict Mode setup/cleanup/setup;
- disable mientras hay RAF pendiente;
- error de `video.play()`;
- teardown/unmount detiene tracks;
- QR A permanece visible: no aceptar hasta observar ausencia de QR.

## Evidencia de pruebas actuales

Ejecutado localmente:

```text
7 archivos PASS
28 tests PASS
0 fallas
```

Incluye reducer, request lifecycle/Strict Mode, decisión auto-earn, submission guard, pending operation y ausencia de retry automático. No existe actualmente una prueba de `useQrCamera` que modele disable/re-enable y frescura del primer frame.

## Riesgo y rollout

Riesgo de implementación: **MEDIUM**.

El cambio está contenido en Caja, pero media/video frame timing varía entre navegadores. Un gate demasiado estricto puede dejar el scanner esperando indefinidamente; uno demasiado laxo conserva la mutación involuntaria. La implementación debe validarse localmente con mocks determinísticos y manualmente en los navegadores/dispositivos operativos soportados antes de producción.

## Siguiente gate recomendado

```text
CAJA CAMERA REARM FRESH-FRAME + QR-CLEARED GUARD v1
```

Scope: implementar el guard únicamente en adquisición de cámara, agregar las dos regresiones descritas y ejecutar QA completo de Caja. No modificar P1A, Backend ni semántica de operación.

## Efectos externos

- Application source edits: **NONE**.
- Test edits: **NONE**.
- Hosted/provider effects: **NONE**.
- Supabase effects: **NONE**.
- Commit/push/deploy: **NONE**.
