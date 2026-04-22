# Endurecimiento del módulo de Control de Membresías

## Reglas de negocio definitivas

1. **No se elimina historial financiero**
   - La baja de usuario es lógica (`users.is_active = false`).
   - No se borran ciclos, pagos, notas ni auditorías.

2. **Próxima a vencer**
   - Umbral centralizado: `MEMBERSHIP_EXPIRING_SOON_DAYS`.
   - Valor por defecto: `5` días.

3. **Integridad de pagos**
   - `amount > 0` obligatorio.
   - Cada pago pertenece a un `membership_cycle_id`.
   - Anti-duplicado:
     - `idempotency_key` opcional con unicidad por ciclo.
     - detección temporal (misma combinación monto/método/admin en ventana de 60 segundos).
   - Sobrepago:
     - por defecto se rechaza.
     - se permite solo con `allow_overpayment=true`.

4. **Renovaciones y adeudos**
   - Renovar crea un nuevo ciclo y marca los anteriores como no activos.
   - No se mezclan pagos entre ciclos.
   - Se reporta:
     - adeudo ciclo activo,
     - adeudo histórico (ciclos previos),
     - adeudo total.

5. **Edición de ciclos con pagos**
   - Si el ciclo ya tiene pagos:
     - cambios estructurales requieren `force_update=true` y `change_reason`.
     - se registra auditoría en `membership_cycle_audits`.

6. **Pagos mal capturados**
   - No se editan ni borran.
   - Se revierten con `/membership/admin/payment/{payment_id}/reverse` + razón obligatoria.

7. **Permisos**
   - Endpoints administrativos usan `get_current_admin` en backend.
   - Baja lógica y operaciones sensibles quedan restringidas a admin.

8. **Precedencia exacta de estatus (única y centralizada)**
   - Implementada en `app/domain/membership_rules.py`.
   - Orden estricto:
     1) `suspendida`
     2) `vencida`
     3) `con_adeudo`
     4) `proxima_a_vencer`
     5) `activa`

9. **Política de ciclos vencidos con deuda**
   - Se permiten pagos en ciclos vencidos (si se registra explícitamente en ese ciclo).
   - Los pagos nunca cambian de ciclo: no hay mezcla entre ciclo histórico y actual.
   - En detalle se separa:
     - `current_pending_balance`
     - `historical_pending_balance`
     - `total_pending_balance`
   - Un ciclo vencido puede seguir mostrando adeudo histórico hasta liquidarse.

10. **Semántica de reactivación**
   - Reactivar usuario: `PUT /users/{user_id}/reactivate`
   - Reactivar membresía (bandera global): `PUT /membership/{user_id}/reactivate`
   - Quitar suspensión de ciclo: `PUT /membership/cycle/{cycle_id}/unsuspend`

## Migración aplicada

- Script: `BACKEND/migrations/2026-04-22_membership_control_hardening.sql`
- Nuevas/ajustadas:
  - `users`: `is_active`, `deactivated_at`, `deactivated_by`, `deactivation_reason`
  - `membership_cycles`: `renewed_from_cycle_id`, `created_by`, `updated_by`
  - `membership_payments`: `idempotency_key`, `reversed_at`, `reversed_by`, `reversal_reason`
  - índice único: `ux_membership_payments_cycle_idempotency`
  - nueva tabla: `membership_cycle_audits`

## Política de esquema y despliegue

- La fuente de verdad de cambios estructurales es la migración SQL versionada.
- `init_database()` ya no intenta alterar columnas/índices.
- `init_database()` solo:
  - verifica conectividad,
  - asegura tablas con `Base.metadata.create_all`,
  - ejecuta seed no destructivo.

## Pruebas funcionales mínimas (checklist)

1. Crear ciclo
   - Crear ciclo con costo > 0 y vigencia válida.
   - Resultado esperado: ciclo activo creado.

2. Registrar abono parcial
   - Registrar pago menor al costo.
   - Resultado esperado: saldo pendiente > 0, estatus `con_adeudo`.

3. Liquidar ciclo
   - Registrar pago restante.
   - Resultado esperado: saldo del ciclo activo = 0.

4. Marcar vencimiento
   - Simular fecha de fin pasada.
   - Resultado esperado: estatus `vencida` (aunque existan notas).

5. Renovar sin perder historial
   - Crear nuevo ciclo con renovación.
   - Resultado esperado: pagos y adeudos previos siguen visibles como históricos.

6. Agregar nota
   - Registrar nota no vacía.
   - Resultado esperado: nota guardada con usuario y fecha.

7. Suspender
   - Ejecutar desactivación de membresía.
   - Resultado esperado: ciclo activo pasa a `suspendida`.

8. Filtro por estatus
   - Consumir `/membership/admin/clients?status=...`.
   - Resultado esperado: solo clientes del estatus solicitado.

## Pruebas automáticas (pytest)

Archivo: `tests/test_membership_control.py`

- `test_status_precedence_rules`
- `test_login_blocked_for_inactive_user`
- `test_admin_membership_core_flows` (cubre):
  - crear ciclo válido
  - rechazar ciclo inválido
  - abono parcial
  - liquidación
  - rechazo de duplicado
  - rechazo de sobrepago sin bandera
  - sobrepago controlado
  - reversa de pago
  - renovar y separar deuda histórica
  - bloqueo a no-admin
  - edición forzada con auditoría
  - suspensión/reactivación
  - vencimiento + filtro por estatus
