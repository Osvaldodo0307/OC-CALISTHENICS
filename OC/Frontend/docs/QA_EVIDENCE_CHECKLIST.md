# QA_EVIDENCE_CHECKLIST

## Objetivo

Estandarizar evidencia minima por caso QA para trazabilidad completa.

## Evidencia minima obligatoria por caso

- [ ] **ID del caso** (ej. AUTH-04, CLS-02).
- [ ] **Build version** (`versionName` + `versionCode`).
- [ ] **Dispositivo** (modelo + Android version + emulador/fisico).
- [ ] **Red usada** (WiFi, datos moviles, offline, cambio de red).
- [ ] **Fecha y hora** de ejecucion.
- [ ] **Pasos exactos** ejecutados.
- [ ] **Resultado esperado**.
- [ ] **Resultado observado**.
- [ ] **Estatus** (PASS / FAIL / BLOCKED).

## Evidencia visual recomendada

- [ ] Screenshot del estado final del caso.
- [ ] Screen recording para:
  - persistencia/reapertura,
  - token invalido/expirado,
  - back button Android,
  - flujo offline/online.

## Formato sugerido por registro

```text
Caso: AUTH-04
Build: 1.3.1-internal (100301)
Dispositivo: Pixel 6 / Android 14 / Fisico
Red: WiFi
Fecha: 2026-03-11 10:42
Pasos:
1) ...
2) ...
Esperado:
...
Observado:
...
Estatus: PASS/FAIL/BLOCKED
Evidencia:
- screenshot_auth04.png
- video_auth04.mp4
Notas:
...
```

## Reglas de calidad de evidencia

1. No cerrar bug sin evidencia posterior al fix.
2. Si el caso falla, registrar en `ANDROID_BUG_LOG.md`.
3. Si el caso queda bloqueado por entorno, marcar `BLOCKED` y describir bloqueo real.

