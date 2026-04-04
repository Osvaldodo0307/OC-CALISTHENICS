# QA Sessions Folder

## Proposito

Centralizar reportes de ejecucion QA por sesion para mantener trazabilidad de:
- que se probo,
- que fallo,
- que se corrigio,
- y cuando se puede decidir GO/NO-GO.

Archivos base de esta carpeta:
- `QA_SESSION_01_QUICK.md`
- `QA_SESSION_02_QUICK.md`
- `QA_SESSION_03_FULL.md`
- `QA_ROUND_SUMMARY.md`
- `QA_REPORT_FILLING_GUIDE.md`
- `QA_LIVE_DASHBOARD.md`

## Convencion de nombres sugerida

- `QA_SESSION_01_QUICK.md`
- `QA_SESSION_02_QUICK.md`
- `QA_SESSION_03_FULL.md`
- `QA_ROUND_SUMMARY.md`

## Cuando usar QUICK

Usar `QA_SESSION_REPORT_QUICK.md` para:
- smoke test rapido,
- retest post-fix,
- validacion corta de build,
- sesiones de 5-10 minutos.

## Cuando usar FULL

Usar `QA_SESSION_REPORT_FULL.md` para:
- cierre formal de ronda,
- consolidacion de evidencia,
- handoff tester <-> responsable tecnico,
- decision de release interna.

## Relacion con ANDROID_BUG_LOG.md

Regla operativa:
1. Si una sesion detecta bug real, se registra en el reporte QUICK/FULL.
2. Ese bug tambien se agrega a `ANDROID_BUG_LOG.md`.
3. No cerrar bug sin evidencia de retest.

## Como cerrar una ronda QA

1. Ejecutar casos segun `ANDROID_QA_EXECUTION.md`.
2. Registrar sesion(es) QUICK durante fix/retest.
3. Cerrar con una sesion FULL.
4. Validar smoke final en `ANDROID_SMOKE_TEST.md`.
5. Confirmar severidades y blockers en:
   - `BUG_TRIAGE_RULES.md`
   - `RELEASE_BLOCKERS.md`
   - `GO_NO_GO_CHECKLIST.md`

