# QA Session Report — OC Mobile Android

## 1. Datos generales

- **Fecha:** YYYY-MM-DD
- **Hora de inicio:** HH:MM
- **Hora de fin:** HH:MM
- **Tester:** Nombre
- **Build evaluada:** `versionName` / `versionCode`
- **Commit / rama:**
- **Dispositivo:** Marca / modelo
- **Android:** Versión
- **Tipo de instalación:** APK / AAB / Android Studio
- **Entorno backend:** Local / QA / Producción controlada
- **Red usada:** Wi-Fi / Datos móviles / Mixta
- **Observaciones de entorno:**

---

## 2. Objetivo de la sesión

Marcar el enfoque principal de esta ronda:

- [ ] Smoke test rápido
- [ ] Autenticación y sesión
- [ ] Clases
- [ ] Reservas
- [ ] Perfil / Mi Plan / Rutinas
- [ ] Offline / reconectividad
- [ ] Back button Android
- [ ] Revalidación post-fix
- [ ] Validación general pre-GO
- [ ] Otro: __________

---

## 3. Resultado ejecutivo de la sesión

- **Resultado general:** PASS / PASS CON RESERVAS / FAIL
- **¿Hubo bloqueadores S1?** Sí / No
- **¿Hubo S2 en módulos críticos?** Sí / No
- **¿Se recomienda avanzar a siguiente ronda?** Sí / No
- **¿Se recomienda GO para prueba interna Android?** Sí / No

### Resumen breve
Escribe aquí un resumen de 4–8 líneas con lo más importante observado en la sesión.

---

## 4. Casos ejecutados

| ID caso | Módulo | Ejecutado | Resultado | Severidad si falla | Evidencia | Notas |
|---|---|---:|---|---|---|---|
| AUTH-01 | Login válido | Sí/No | PASS/FAIL | S1 | enlace/captura | |
| AUTH-03 | Logout | Sí/No | PASS/FAIL | S1 | enlace/captura | |
| AUTH-04 | Persistencia de sesión | Sí/No | PASS/FAIL | S1 | enlace/captura | |
| AUTH-05 | Token vencido | Sí/No | PASS/FAIL | S1/S2 | enlace/captura | |
| AUTH-06 | Token inválido/corrupto | Sí/No | PASS/FAIL | S1/S2 | enlace/captura | |
| CLS-01 | Carga de clases | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| CLS-02 | Reservar clase | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| CLS-03 | Cancelar clase | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| RES-01 | Ver reservas | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| RES-02 | Cancelar reserva | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| NET-01 | Offline | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| NET-02 | API caída / timeout | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| NET-03 | Cambio de red | Sí/No | PASS/FAIL | S2 | enlace/captura | |
| APP-02 | Back button Android | Sí/No | PASS/FAIL | S2 | enlace/video | |
| SMK-01..10 | Smoke test | Sí/No | PASS/FAIL | Variable | enlace | |

---

## 5. Bugs detectados en esta sesión

> Registrar aquí sólo bugs observados realmente en esta ronda.  
> Cada bug debe darse de alta también en `ANDROID_BUG_LOG.md`.

| Bug ID | Título | Severidad | Módulo | Reproducible | Estado | Evidencia |
|---|---|---|---|---|---|---|
| BUG-001 | | S1/S2/S3/S4 | | Sí/No | Open / Fixed / Retest | |
| BUG-002 | | S1/S2/S3/S4 | | Sí/No | Open / Fixed / Retest | |

### Detalle por bug

#### BUG-001 — Título
- **Severidad:** S1 / S2 / S3 / S4
- **Módulo:**
- **Precondiciones:**
- **Pasos para reproducir:**
  1.
  2.
  3.
- **Resultado esperado:**
- **Resultado observado:**
- **Frecuencia:** Siempre / Intermitente / 1 de N
- **Impacto:**
- **Workaround:** Sí / No. Describir si existe.
- **Evidencia:** captura / video / log
- **Decisión:** Bloquea / No bloquea

---

## 6. Evidencia adjunta

- **Capturas:**
  - [ ] Login
  - [ ] Error de auth
  - [ ] Reserva exitosa
  - [ ] Cancelación
  - [ ] Offline banner
  - [ ] Retry / recuperación
  - [ ] Logout
- **Videos:**
  - [ ] Back button Android
  - [ ] Persistencia de sesión
  - [ ] Flujo crítico fallando
- **Logs / notas técnicas:**
  - Build log:
  - Hora del evento:
  - Pantalla afectada:

---

## 7. Validación post-fix

Rellenar sólo si esta sesión fue de revalidación.

- **Build revalidada:**
- **Bug(s) corregidos:**
- **Smoke test ejecutado después del fix:** Sí / No
- **Resultado smoke test:** PASS / FAIL
- **Regresión detectada:** Sí / No
- **Detalle de regresión:**

---

## 8. Decisión GO / NO-GO de la sesión

### Estado sugerido
- [ ] GO
- [ ] GO con reservas
- [ ] NO-GO

### Motivo
Redacta en 3–6 líneas la razón principal de la decisión.

### Condiciones para cambiar de estado
- [ ] Cerrar todos los S1
- [ ] Cerrar S2 críticos
- [ ] Repetir smoke test completo
- [ ] Regenerar build
- [ ] Revalidar auth
- [ ] Revalidar clases / reservas
- [ ] Revalidar red / back button
- [ ] Otro: __________

---

## 9. Próxima acción inmediata

- **Responsable:**
- **Acción:**
- **Prioridad:** Alta / Media / Baja
- **Fecha objetivo:** YYYY-MM-DD

---

## 10. Firma de cierre de sesión

- **Tester:** __________________
- **Revisor técnico:** __________________
- **Decisión final de la ronda:** GO / GO con reservas / NO-GO

