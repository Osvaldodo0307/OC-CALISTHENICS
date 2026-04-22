# QA Live Dashboard — OC Mobile Android

Actualiza este archivo al final de cada sesion QUICK/FULL para ver el estado en una sola pantalla.

## 1) Estado actual de ronda

- **Ronda:** QA_ROUND_01
- **Estado:** EN_PROGRESO
- **Ultima actualizacion:** 2026-03-11
- **Owner tecnico:** Equipo OC (Lead + QA)
- **Tester activo:** Pendiente de asignacion para corrida en dispositivo

## 2) Decision provisional

- **GO interno Android:** CONDICIONAL
- **GO con usuarios controlados:** NO
- **Motivo corto (3 lineas):**
  1. Build/sync y hardening tecnico verificados.
  2. Falta ejecutar QA manual real en Android (sesiones 01 y 02).
  3. Sin evidencia de dispositivo, no procede GO final.

## 3) Resumen de builds

| Build | versionName | versionCode | Commit/Rama | Fecha | Estado |
|---|---|---|---|---|---|
| Build-01 | 1.3.1-internal | 100301 | `a0feb3a` / `feat/mobile-app-internal-system` | 2026-03-11 | PASS (build + sync + doctor Android) |
| Build-02 | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

## 4) Progreso de sesiones

| Sesion | Archivo | Alcance | Estado | Resultado |
|---|---|---|---|---|
| S01 | `QA_SESSION_01_QUICK.md` | Auth + navegacion + persistencia + back | PENDIENTE | Pendiente |
| S02 | `QA_SESSION_02_QUICK.md` | Clases + reservas + red | PENDIENTE | Pendiente |
| S03 | `QA_SESSION_03_FULL.md` | Consolidacion formal | PENDIENTE | Pendiente |

## 5) Casos criticos (semáforo)

| Caso | Estado |
|---|---|
| AUTH-01 Login valido | 🟡 |
| AUTH-04 Persistencia de sesion | 🟡 |
| AUTH-05 Token vencido | 🟡 |
| AUTH-06 Token invalido/corrupto | 🟡 |
| CLS-02 Reservar clase | 🟡 |
| RES-02 Cancelar reserva | 🟡 |
| NET-01 Offline | 🟡 |
| NET-02 API caida/timeout | 🟡 |
| APP-02 Back button Android | 🟡 |
| SMK-01..10 Smoke | 🟡 |

> Convencion sugerida:
> - 🟢 PASS
> - 🟡 PASS CON RESERVAS / PENDIENTE DE RETEST
> - 🔴 FAIL / BLOQUEADO

## 6) Severidades abiertas (snapshot)

- **S1 abiertas:** 0
- **S2 abiertas:** 0
- **S3 abiertas:** 0
- **S4 abiertas:** 0

### Bugs abiertos clave

| Bug ID | Severidad | Modulo | Estado | Bloquea |
|---|---|---|---|---|
| Ninguno reportado en dispositivo | - | - | - | - |

## 7) Evidencia consolidada

- **Capturas clave:** Pendiente de QA en dispositivo
- **Videos clave:** Pendiente de QA en dispositivo
- **Build logs:** salida verificada de `mobile:rebuild` y `mobile:doctor` en esta ronda
- **Reporte de ronda:** `QA_ROUND_SUMMARY.md`

## 8) Checklist rapido GO/NO-GO

- [x] Sin S1 abiertos reportados
- [x] Sin S2 criticos abiertos reportados
- [ ] Smoke final PASS
- [ ] Auth revalidado
- [ ] Clases/reservas revalidadas
- [ ] Red/back revalidados
- [ ] Evidencia minima completa

## 9) Siguiente accion inmediata

- **Responsable:** QA Android
- **Accion:** Ejecutar `QA_SESSION_01_QUICK.md` en dispositivo real y registrar evidencia minima
- **Fecha objetivo:** YYYY-MM-DD

