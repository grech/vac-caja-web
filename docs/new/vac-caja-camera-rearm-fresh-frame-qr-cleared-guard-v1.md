# VAC Caja — Camera Rearm Fresh-Frame + QR-Cleared Guard v1

Fecha: 2026-08-31
Modo: implementación local únicamente
Baseline: `main` en `66627c546047814ad7c22d7577ce7bac7ae77a38`

## Resultado

Caja corrige la readmisión involuntaria del QR anterior al pulsar `Escanear otro`. El cambio se limita al lifecycle de adquisición de cámara; no modifica P1A, `operationId`, earn/redeem, scanner business rules ni Backend.

El incidente observado ocurría porque el mismo `MediaStream` y `video.srcObject` se conservaban durante la pausa, y el rearm aceptaba el primer frame decodificable sin demostrar avance ni salida del QR anterior.

## Boundary implementado

Archivo de runtime:

- `features/scanner/hooks/use-qr-camera.ts`

No fue necesario cambiar UI, decoder, scanner state, operaciones ni APIs.

## Semántica del guard

### Activación inicial

Un stream nuevo reinicia el admission guard. El primer frame válido puede aceptar un QR inmediatamente; no se exige un frame previo sin QR.

Se conserva un solo callback aceptado por ciclo mediante el callback lock integrado al guard.

### Rearm de un stream existente

Después de aceptar un QR, deshabilitar la cámara marca el ciclo como rearm pendiente y conserva los marcadores de frame. Al volver a habilitar:

1. un frame sin avance se ignora;
2. un frame nuevo que todavía contiene QR A se decodifica pero no se admite;
3. un frame nuevo con decode `null` libera la barrera QR-cleared;
4. sólo un frame nuevo posterior con QR puede ejecutar `onDecoded`;
5. después de ese callback, el ciclo vuelve a quedar bloqueado.

El mismo QR A puede aceptarse legítimamente más tarde si primero salió de cámara y se observó un frame fresco sin QR. No existe blacklist por cliente ni deduplicación por valor QR.

## Fresh-frame mechanism

El loop prefiere `HTMLVideoElement.requestVideoFrameCallback`. Usa `presentedFrames` como marcador monotónico y no procesa callbacks repetidos o anteriores al último frame observado.

Cuando esa API no existe o no entrega el marcador, el fallback usa avance estricto de `video.currentTime` dentro del RAF existente. El valor capturado al pausar actúa como baseline de rearm. Un timeout no se usa como garantía de frescura.

Cada start/stop incrementa además una generación de loop. Un callback RAF/video-frame perteneciente a una generación anterior no puede decodificar aunque su cancelación nativa llegue tarde o no esté disponible.

## QR-cleared requirement

La exigencia de un decode `null` aplica únicamente al rearm posterior a un ciclo que ya aceptó QR. Si QR A permanece frente a la cámara, Caja espera. Al retirar QR A, el primer frame fresco sin QR habilita el próximo scan.

Esto cubre:

- frame pausado/retenido con QR A;
- frame realmente nuevo que todavía muestra QR A;
- callbacks viejos pendientes durante disable/re-enable.

## Lifecycle preservado

- El `MediaStream` existente se reutiliza durante rearm.
- Disable cancela RAF/video-frame callbacks y pausa video.
- Unmount/error detiene todos los tracks y elimina `srcObject`.
- `video.play()` fallido no inicia loop y conserva fail-safe de cámara.
- Initial camera permissions/status behavior permanece sin cambio visible.
- Scan version fencing, operation submission guard y P1A permanecen intactos.

## Pruebas agregadas

### `features/scanner/hooks/use-qr-camera.test.tsx`

Cubre:

- activación inicial acepta el primer QR sin clear previo;
- exactamente un decode por ciclo;
- rearm sin avance no readmite QR A;
- frame fresco con QR A sigue bloqueado;
- frame fresco `null` seguido por QR B acepta una vez;
- QR A puede aceptarse legítimamente después de clear;
- fallback por `currentTime`;
- invalidación de loops en disable/Strict Mode replay;
- teardown de tracks y `srcObject`;
- error y éxito de `video.play()`.

### `features/scanner/hooks/use-scan-lookup.test.tsx`

El contrato de integración modela:

```text
QR A
→ stamps auto-earn
→ operation-success
→ reset/rearm
→ sin clear: 0 lookup/earn/operationId adicionales
→ fresh null
→ QR B
→ exactamente 1 lookup y 1 earn nuevos
→ operationId nuevo y distinto
```

No llama APIs ni duplica la implementación interna del decoder.

## QA

- Focused camera/scanner: **PASS — 2 archivos, 11 tests**.
- Full Vitest: **PASS — 31 archivos, 152 tests**.
- `npm run lint`: **PASS**.
- `npm run build -- --webpack`: **PASS** — compilación, TypeScript, 7 páginas estáticas y rutas dinámicas.
- `git diff --check`: **PASS**.

## Caveats de navegador

- `requestVideoFrameCallback` depende del navegador; el fallback requiere que `video.currentTime` avance.
- Si la cámara temporalmente no produce frames, el scanner espera sin admitir contenido stale.
- Si QR A permanece visible, el scanner espera intencionalmente hasta observar un frame sin QR.
- No se agregó copy visible; el estado existente `Buscando código QR` sigue siendo correcto.

## Verificación recomendada después de deploy

1. completar un auto-earn de stamps con QR A;
2. pulsar `Escanear otro` manteniendo QR A visible y confirmar cero segunda mutación;
3. retirar QR A hasta dejar el encuadre libre;
4. presentar QR B y confirmar exactamente un earn nuevo;
5. repetir con QR A después del clear y confirmar que puede escanearse legítimamente;
6. repetir en los navegadores/dispositivos operativos soportados, incluyendo fallback sin `requestVideoFrameCallback` cuando sea posible.

## Efectos externos

- Supabase effects: **NONE**.
- Hosted/provider effects: **NONE**.
- Production API calls: **NONE**.
- Commit/push/deploy: **NONE**.
