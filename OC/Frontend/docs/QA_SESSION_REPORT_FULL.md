# QA Session Report — FULL (Android)

Version formal para cierre de ronda QA, evidencia completa y decision tecnica de release.

Referencias de alineacion:
- `ANDROID_QA_EXECUTION.md`
- `MOBILE_TEST_MATRIX.md`
- `ANDROID_BUG_LOG.md`
- `ANDROID_SMOKE_TEST.md`
- `BUG_TRIAGE_RULES.md`
- `QA_EVIDENCE_CHECKLIST.md`

## 1. Datos generales

- **Fecha:** YYYY-MM-DD
- **Hora de inicio:** HH:MM
- **Hora de fin:** HH:MM
- **Tester:** Nombre
- **Build evaluada:** `versionName` / `versionCode`
- **Commit / rama:**
- **Dispositivo:** Marca / modelo
- **Android:** Version
- **Tipo de instalación:** APK / AAB / Android Studio
- **Entorno backend:** Local / QA / Produccion controlada
- **Red usada:** Wi-Fi / Datos moviles / Mixta
- **Observaciones de entorno:**

---

## 2. Objetivo de la sesion

Marcar el enfoque principal:

- [ ] Smoke test rapido
- [ ] Autenticacion y sesion
- [ ] Clases
- [ ] Reservas
- [ ] Perfil / Mi Plan / Rutinas
- [ ] Offline / reconectividad
- [ ] Back button Android
- [ ] Revalidacion post-fix
- [ ] Validacion general pre-GO
- [ ] Otro: __________

---

## 3. Resultado ejecutivo de la sesion

- **Resultado general:** PASS / PASS CON RESERVAS / FAIL
- **¿Hubo bloqueadores S1?** Si / No
- **¿Hubo S2 en modulos criticos?** Si / No
- **¿Se recomienda avanzar a siguiente ronda?** Si / No
- **¿Se recomienda GO para prueba interna Android?** Si / No

### Resumen breve
Escribe aqui un resumen de 4-8 lineas con lo mas importante observado.

---

## 4. Casos ejecutados

| ID caso | Modulo | Ejecutado | Resultado | Severidad si falla | Evidencia | Notas |
|---|---|---:|---|---|---|---|
| AUTH-01 | Login valido | Si/No | PASS/FAIL | S1 | enlace/captura | |
| AUTH-03 | Logout | Si/No | PASS/FAIL | S1 | enlace/captura | |
| AUTH-04 | Persistencia de sesion | Si/No | PASS/FAIL | S1 | enlace/captura | |
| AUTH-05 | Token vencido | Si/No | PASS/FAIL | S1/S2 | enlace/captura | |
| AUTH-06 | Token invalido/corrupto | Si/No | PASS/FAIL | S1/S2 | enlace/captura | |
| CLS-01 | Carga de clases | Si/No | PASS/FAIL | S2 | enlace/captura | |
| CLS-02 | Reservar clase | Si/No | PASS/FAIL | S2 | enlace/captura | |
| CLS-03 | Cancelar clase | Si/No | PASS/FAIL | S2 | enlace/captura | |
| RES-01 | Ver reservas | Si/No | PASS/FAIL | S2 | enlace/captura | |
| RES-02 | Cancelar reserva | Si/No | PASS/FAIL | S2 | enlace/captura | |
| NET-01 | Offline | Si/No | PASS/FAIL | S2 | enlace/captura | |
| NET-02 | API caida / timeout | Si/No | PASS/FAIL | S2 | enlace/captura | |
| NET-03 | Cambio de red | Si/No | PASS/FAIL | S2 | enlace/captura | |
| APP-02 | Back button Android | Si/No | PASS/FAIL | S2 | enlace/video | |
| SMK-01..10 | Smoke test | Si/No | PASS/FAIL | Variable | enlace | |

---

## 5. Bugs detectados en esta sesion

> Registrar aqui solo bugs observados realmente en esta ronda.  
> Cada bug debe darse de alta tambien en `ANDROID_BUG_LOG.md`.

| Bug ID | Titulo | Severidad | Modulo | Reproducible | Estado | Evidencia |
|---|---|---|---|---|---|---|
| BUG-001 | | S1/S2/S3/S4 | | Si/No | Open / Fixed / Retest | |
| BUG-002 | | S1/S2/S3/S4 | | Si/No | Open / Fixed / Retest | |

### Detalle por bug

#### BUG-001 - Titulo
- **Severidad:** S1 / S2 / S3 / S4
- **Modulo:**
- **Precondiciones:**
- **Pasos para reproducir:**
  1.
  2.
  3.
- **Resultado esperado:**
- **Resultado observado:**
- **Frecuencia:** Siempre / Intermitente / 1 de N
- **Impacto:**
- **Workaround:** Si / No. Describir si existe.
- **Evidencia:** captura / video / log
- **Decision:** Bloquea / No bloquea

---

## 6. Evidencia adjunta

- **Capturas:**
  - [ ] Login
  - [ ] Error de auth
  - [ ] Reserva exitosa
  - [ ] Cancelacion
  - [ ] Offline banner
  - [ ] Retry / recuperacion
  - [ ] Logout
- **Videos:**
  - [ ] Back button Android
  - [ ] Persistencia de sesion
  - [ ] Flujo critico fallando
- **Logs / notas tecnicas:**
  - Build log:
  - Hora del evento:
  - Pantalla afectada:

---

## 7. Validacion post-fix

Rellenar solo si esta sesion fue de revalidacion.

- **Build revalidada:**
- **Bug(s) corregidos:**
- **Smoke test ejecutado despues del fix:** Si / No
- **Resultado smoke test:** PASS / FAIL
- **Regresion detectada:** Si / No
- **Detalle de regresion:**

---

## 8. Decision GO / NO-GO de la sesion

### Estado sugerido
- [ ] GO
- [ ] GO con reservas
- [ ] NO-GO

### Motivo
Redacta en 3-6 lineas la razon principal de la decision.

### Condiciones para cambiar de estado
- [ ] Cerrar todos los S1
- [ ] Cerrar S2 criticos
- [ ] Repetir smoke test completo
- [ ] Regenerar build
- [ ] Revalidar auth
- [ ] Revalidar clases / reservas
- [ ] Revalidar red / back button
- [ ] Otro: __________

---

## 9. Proxima accion inmediata

- **Responsable:**
- **Accion:**
- **Prioridad:** Alta / Media / Baja
- **Fecha objetivo:** YYYY-MM-DD

---

## 10. Firma de cierre de sesion

- **Tester:** __________________
- **Revisor tecnico:** __________________
- **Decision final de la ronda:** GO / GO con reservas / NO-GO

