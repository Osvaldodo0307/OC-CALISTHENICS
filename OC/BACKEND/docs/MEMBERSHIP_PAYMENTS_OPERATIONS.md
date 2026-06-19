# Operación de pagos y membresías — OC Club

Guía operativa para administradores y soporte técnico. Aplica a Fase 2A / 2A.1 / 2A.2 (pagos manuales, sin pasarela).

## Zona horaria

El sistema usa la fecha operativa del gimnasio (`APP_TIMEZONE`, por defecto `America/Mexico_City`) para:

- `vence_hoy`, `vencida`, `por vencer`
- Días restantes / días vencidos
- “Pagos recibidos hoy” en el resumen

Las vigencias (`end_date`) son **fechas calendario**, no horas UTC.

## Pago antes de vencer

Si el socio está vigente y paga la renovación completa con acción **Renovar / extender membresía**:

- La nueva vigencia se calcula desde el **vencimiento actual** + duración (ej. vence 20 jun, paga 15 jun → nuevo vencimiento 20 jul).
- No pierde días ya pagados del periodo actual.

## Pago el día de vencimiento

Igual que pago anticipado: extiende desde el `end_date` actual.

## Pago después de vencido

Si el socio ya venció:

- La renovación corre desde la **fecha de pago** (o la “fecha de inicio de renovación” que indique el admin).
- Ejemplo: venció 10 jun, paga 20 jun por 1 mes → vence 20 jul.

## Pagos parciales

- Se registran en historial y **reducen el saldo pendiente** del ciclo.
- **No extienden la vigencia automáticamente**, aunque varios parciales sumen el monto del plan.
- El socio puede quedar `con_adeudo` hasta cubrir el monto del ciclo.
- Cuando el saldo esté cubierto, el admin debe registrar un pago con acción **Renovar / extender** (o renovar ciclo manualmente si aplica).

## Cortesía

- Método `cortesia` / acción **Cortesía con extensión de vigencia**.
- Puede extender vigencia sin cobro (monto $0 permitido).
- **No cuenta como ingreso real** ni reduce adeudo (`counts_as_income=false`, `applies_to_balance=false`).
- Queda visible en historial y en resumen como cortesías del mes (informativo).

## Ajuste administrativo

- Para correcciones de saldo o casos especiales.
- Por defecto **no suma ingreso real**; el admin puede marcar “Contar como ingreso real” si hubo cobro efectivo.
- Solo extiende vigencia si se indica periodo/duración explícita.

## Registrar pago sin cambiar vigencia

Acción **Registrar pago sin modificar vigencia**: útil para abonos que no deben mover la fecha de vencimiento.

## Reversa de pago

- **No borra** el registro; lo marca como revertido y guarda motivo obligatorio.
- Recalcula saldo y, si aplica, restaura la vigencia anterior.
- Solo se permite en **orden inverso** (LIFO): primero el pago más reciente del ciclo.
- Si intentas revertir un pago anterior habiendo pagos posteriores, el sistema **bloquea** con error claro.

### Cuándo puede bloquearse una reversa

- Ya fue revertido.
- Existen pagos posteriores en el mismo ciclo (revertir primero el más reciente).
- La vigencia actual no coincide con la extensión de ese pago (renovación posterior).

## Resumen financiero

| Métrica | Qué incluye |
|---------|-------------|
| Ingresos reales del mes | Pagos con `counts_as_income=true`, no revertidos |
| Pagos de hoy | Ingresos reales con fecha operativa de hoy |
| Cortesías del mes | Monto informativo de cortesías (no ingreso real) |
| Ajustes del mes | Total ajustes; subtotal “ingreso por ajustes” solo si `counts_as_income=true` |
| Pendiente estimado | Suma de saldos pendientes de socios activos |

Los pagos **revertidos** no suman ingreso. Las cortesías no inflan ingresos reales.

## Suspensión

- `suspendida` tiene **máxima prioridad** en el estado mostrado.
- Suspender / levantar suspensión queda auditado.

## Cambios de plan o monto

- El admin puede editar tipo y costo del **ciclo activo** desde el panel (con restricciones si ya hay pagos).
- El resumen y saldo usan el **costo del ciclo vigente**.
- Cambios estructurales con pagos existentes requieren `force_update` y motivo (auditoría).
- Flujos avanzados de cambio de plan (prorrateo automático, migración entre planes) quedan para **fase posterior**.

## Limitaciones actuales (no incluido)

- Pasarela de pago (Stripe, Mercado Pago).
- Cobros recurrentes automáticos.
- WhatsApp automático al cliente.
- Facturación CFDI.
- Extensión automática al completar parciales acumulados.
- Reversa que recalcula toda la línea temporal (solo LIFO).

## Panel admin

Ruta: `/app/admin/membresias` (solo rol admin).

Flujo recomendado: revisar alertas → localizar socio → registrar pago con acción correcta → confirmar nueva vigencia en el mensaje de éxito → verificar resumen.
