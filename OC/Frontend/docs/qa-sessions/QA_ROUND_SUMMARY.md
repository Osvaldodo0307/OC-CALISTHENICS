# QA Round Summary — Android

Documento de consolidacion final de una ronda QA.

## 1) Identificacion de la ronda

- **Ronda:** QA_ROUND_XX
- **Rango de fechas:** YYYY-MM-DD a YYYY-MM-DD
- **Responsable tecnico:**
- **Tester(es):**
- **Objetivo de ronda:**

## 2) Builds probadas

| Build | versionName | versionCode | Rama/Commit | Entorno backend | Resultado general |
|---|---|---|---|---|---|
| Build-01 | | | | | PASS/FAIL |
| Build-02 | | | | | PASS/FAIL |

## 3) Sesiones ejecutadas

| Sesion | Tipo | Archivo | Alcance | Estado |
|---|---|---|---|---|
| Session-01 | QUICK | `QA_SESSION_01_QUICK.md` | Auth/Navegacion/Persistencia/Back | PASS/FAIL |
| Session-02 | QUICK | `QA_SESSION_02_QUICK.md` | Clases/Reservas/Red | PASS/FAIL |
| Session-03 | FULL | `QA_SESSION_03_FULL.md` | Consolidacion | PASS/FAIL |

## 4) Bugs abiertos / cerrados

### Resumen numerico

- **Total bugs detectados:**
- **S1 abiertos:**
- **S2 abiertos:**
- **S3 abiertos:**
- **S4 abiertos:**
- **Bugs cerrados/verificados en la ronda:**

### Detalle consolidado

| Bug ID | Severidad | Modulo | Estado inicial | Estado final | Bloquea release |
|---|---|---|---|---|---|
| AND-XXX | S1/S2/S3/S4 | | Open | Fixed/Verified/Open | Si/No |

## 5) Severidades y riesgo

- **Riesgo auth/sesion:** Bajo / Medio / Alto
- **Riesgo clases/reservas:** Bajo / Medio / Alto
- **Riesgo conectividad/back button:** Bajo / Medio / Alto
- **Riesgo general Android interna:** Bajo / Medio / Alto

## 6) Evidencia consolidada

- **Carpeta/base de evidencias:** (ruta o enlace)
- **Capturas clave consolidadas:**
  - Login:
  - Reserva:
  - Cancelacion:
  - Offline/retry:
  - Logout:
- **Videos clave consolidados:**
  - Persistencia:
  - Back button:
  - Fallo critico (si aplica):
- **Logs tecnicos:**
  - Build:
  - Sync:
  - Smoke:

## 7) Resultado de smoke final

- **Smoke ejecutado:** Si / No
- **Build del smoke final:**
- **Resultado:** PASS / FAIL
- **Casos fallidos (si aplica):**

## 8) Decision final GO/NO-GO

### Estado final
- [ ] GO
- [ ] GO con reservas
- [ ] NO-GO

### Motivo
Redactar decision en 4-8 lineas con foco tecnico y de riesgo real.

### Condiciones de salida pendientes (si NO-GO o GO con reservas)

- [ ] Cerrar S1
- [ ] Cerrar S2 criticos
- [ ] Repetir smoke completo
- [ ] Revalidar auth
- [ ] Revalidar clases/reservas
- [ ] Revalidar red/back button
- [ ] Otro:

## 9) Proxima accion

- **Responsable:**
- **Accion inmediata:**
- **Prioridad:** Alta / Media / Baja
- **Fecha objetivo:** YYYY-MM-DD

