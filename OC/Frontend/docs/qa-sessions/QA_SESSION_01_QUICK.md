# QA Session 01 — QUICK (Auth + Navegacion + Persistencia + Back Button)

> Alcance de esta sesion: solo auth/sesion/navegacion interna/back button Android.  
> No incluir validaciones de coach/admin en esta ronda.

## 1) Datos minimos

- **Fecha:** YYYY-MM-DD
- **Tester:**
- **Build evaluada:** `versionName` / `versionCode`
- **Dispositivo:** Marca / modelo / Android version
- **Entorno backend:** Local / QA / Produccion controlada
- **Red usada:** Wi-Fi / Datos / Mixta

## 2) Objetivo

- [ ] Smoke rapido auth
- [ ] Retest post-fix auth
- [ ] Validacion de navegacion protegida
- [ ] Validacion de persistencia/reapertura
- [ ] Validacion back button Android

## 3) Checklist critico (solo sesion 01)

- [ ] AUTH-01 Login valido
- [ ] AUTH-02 Login invalido
- [ ] AUTH-03 Logout
- [ ] AUTH-04 Persistencia de sesion (cerrar/reabrir app)
- [ ] AUTH-05 Token vencido
- [ ] AUTH-06 Token invalido/corrupto
- [ ] AUTH-07 Navegacion protegida sin token
- [ ] APP-02 Back button Android
- [ ] Arranque limpio sin loops de redireccion

## 4) Bugs observados (solo reales)

| Bug ID | Caso QA | Severidad | Resumen | Evidencia | Estado |
|---|---|---|---|---|---|
| BUG-XXX | AUTH/APP | S1/S2/S3/S4 | | captura/video | Open/Retest/Fixed |

> Registrar tambien en `ANDROID_BUG_LOG.md`.

## 5) Resultado y decision

- **Resultado sesion:** PASS / FAIL
- **GO para siguiente sesion:** Si / No
- **Siguiente accion inmediata (responsable + accion + fecha):**

