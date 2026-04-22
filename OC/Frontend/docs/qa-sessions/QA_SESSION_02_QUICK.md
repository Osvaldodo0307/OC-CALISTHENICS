# QA Session 02 — QUICK (Clases + Reservas + Red)

> Alcance de esta sesion: clases/reservas/conectividad y retry.  
> No incluir coach/admin en esta ronda.

## 1) Datos minimos

- **Fecha:** YYYY-MM-DD
- **Tester:**
- **Build evaluada:** `versionName` / `versionCode`
- **Dispositivo:** Marca / modelo / Android version
- **Entorno backend:** Local / QA / Produccion controlada
- **Red usada:** Wi-Fi / Datos / Mixta

## 2) Objetivo

- [ ] Smoke rapido modulos socio
- [ ] Retest post-fix clases/reservas
- [ ] Validacion de errores de red
- [ ] Validacion retry y recuperacion

## 3) Checklist critico (solo sesion 02)

- [ ] CLS-01 Carga de clases
- [ ] CLS-02 Reservar clase (sin doble envio)
- [ ] CLS-03 Cancelar clase
- [ ] RES-01 Ver reservas
- [ ] RES-02 Cancelar reserva
- [ ] NET-01 Offline banner + mensaje
- [ ] NET-02 API caida/timeout + ErrorState
- [ ] NET-03 Cambio de red + recuperacion
- [ ] Retry funcional tras reconexion

## 4) Bugs observados (solo reales)

| Bug ID | Caso QA | Severidad | Resumen | Evidencia | Estado |
|---|---|---|---|---|---|
| BUG-XXX | CLS/RES/NET | S1/S2/S3/S4 | | captura/video | Open/Retest/Fixed |

> Registrar tambien en `ANDROID_BUG_LOG.md`.

## 5) Resultado y decision

- **Resultado sesion:** PASS / FAIL
- **GO para sesion FULL de cierre:** Si / No
- **Siguiente accion inmediata (responsable + accion + fecha):**

