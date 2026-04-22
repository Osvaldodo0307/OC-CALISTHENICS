# QA Session Report — QUICK (Android)

Plantilla compacta para sesiones de 5–10 minutos:
- smoke test,
- retest post-fix,
- validacion corta de build.

## 1) Datos minimos

- **Fecha:** YYYY-MM-DD
- **Tester:**
- **Build evaluada:** `versionName` / `versionCode`
- **Dispositivo:** Marca / modelo / Android version
- **Objetivo de la sesion:** Smoke / Retest / Build validation / Otro

## 2) Checklist critico rapido

- [ ] Login valido
- [ ] Persistencia de sesion (cerrar/reabrir app)
- [ ] Token invalido/expirado (redirect limpio a login)
- [ ] Carga de clases
- [ ] Reservar/cancelar sin doble envio
- [ ] Carga de reservas
- [ ] Offline banner + mensaje claro
- [ ] Retry tras reconexion/API
- [ ] Back button Android
- [ ] Logout + arranque limpio

## 3) Bugs observados (solo reales)

| Bug ID | Caso QA | Severidad | Resumen | Evidencia | Estado |
|---|---|---|---|---|---|
| BUG-XXX | AUTH/CLS/RES/NET/APP | S1/S2/S3/S4 | | captura/video | Open/Retest/Fixed |

> Si aparece bug, registrar tambien en `ANDROID_BUG_LOG.md`.

## 4) Resultado y decision

- **Resultado sesion:** PASS / FAIL
- **GO para siguiente ronda:** Si / No
- **GO para prueba interna Android:** Si / No
- **Siguiente accion inmediata:** (responsable + accion + fecha)

