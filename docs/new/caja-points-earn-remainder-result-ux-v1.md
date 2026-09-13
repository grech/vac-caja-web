# Caja Web — Points Earn Remainder Result UX v1

## Alcance

Cambio local de presentación para el resultado de earn de puntos. Backend sigue siendo la autoridad de remainder monetario, cálculo de puntos, saldos, idempotencia y evidencia durable. Caja sólo presenta el resultado serializado que recibe.

## Comportamiento

- Un earn de puntos válido con `pointsDelta: 0` se presenta como éxito con **Compra registrada** y comunica que el monto queda acumulado para completar próximos puntos.
- Un earn de puntos positivo conserva el delta visible con singular/plural correcto e informa que VAC acumula montos entre compras; los puntos pueden completarse con compras anteriores.
- Sellos y canje permanecen sin cambios y no muestran este mensaje de acumulación monetaria.
- `operationOutcome: applied | replayed` continúa siendo un éxito normal; la presentación es determinista y no añade una segunda confirmación ni acción.

## Límite del contrato

El DTO actual sólo contiene `programType`, balances, deltas y `operationOutcome`. No serializa `points_remainder`, `remainder_before`, `remainder_after`, `amount_per_point_applied` ni `points_per_amount_applied`.

Por ello Caja no muestra montos exactos acumulados o faltantes, ni reconstruye remainder en cliente. Una mejora futura como `$X acumulado / $Y restante` requeriría un contrato backend aditivo aprobado con evidencia monetaria autoritativa.

## Efectos

- Backend y reglas de negocio: sin cambios.
- Hosted/provider: ninguno.
- Dependencias: sin cambios.
