# BUG_TRIAGE_RULES

## Objetivo

Definir reglas unificadas para clasificar, priorizar y resolver bugs durante el ciclo:
QA Android -> correccion -> rebuild -> revalidacion -> decision GO/NO-GO.

## Severidades

- **S1 Critico**
  - Bloquea login, sesion, clases, reservas o arranque de app.
  - Crash, bucle de redireccion, perdida de sesion permanente.
- **S2 Alto**
  - Flujo principal funciona con degradacion severa o workaround inestable.
  - Ejemplo: reserva falla de forma intermitente, errores de red sin recuperacion clara.
- **S3 Medio**
  - Falla funcional no bloqueante o inconsistencia de UX relevante.
  - Ejemplo: mensaje incorrecto, estado vacio mal presentado.
- **S4 Bajo**
  - Detalle visual, texto, microinteraccion menor sin impacto operativo.

## Prioridad (orden de atencion)

1. **S1** en modulos de alta prioridad.
2. **S2** en modulos de alta prioridad.
3. **S1/S2** en modulos secundarios.
4. **S3**.
5. **S4**.

## Que bloquea release (interna Android)

- Cualquier **S1** abierto.
- Cualquier **S2** abierto en:
  - login/sesion,
  - clases/reservas,
  - conectividad offline/online,
  - back button Android.
- Falta de evidencia reproducible para casos de alta prioridad.

## Que no bloquea release (interna Android)

- S3/S4 con workaround claro y ticket creado.
- Bugs en modulos no prioritarios para este ciclo, siempre documentados.
- Bloqueos iOS por falta de Xcode en este entorno (no bloquea Android interna).

## Tiempos esperados de correccion

- **S1:** hotfix en el mismo dia (objetivo: < 8h).
- **S2:** correccion en 24h.
- **S3:** correccion en 2-3 dias.
- **S4:** backlog de pulido, segun capacidad.

## Flujo de triage recomendado

1. Registrar bug en `ANDROID_BUG_LOG.md` con evidencia.
2. Asignar severidad inicial.
3. Confirmar reproducibilidad.
4. Corregir en rama de trabajo.
5. Ejecutar `mobile:rebuild`.
6. Revalidar en `ANDROID_SMOKE_TEST.md`.
7. Marcar `VERIFIED` o reabrir.

