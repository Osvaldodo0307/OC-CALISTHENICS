# RELEASE_BLOCKERS

Listado exclusivo de bloqueadores reales al momento (sin inventar bugs no observados).

## 1) Blockers tecnicos reales

- No se detectan blockers tecnicos de build para Android interno:
  - `build` OK
  - `mobile:rebuild` operable
  - `mobile:android:build` disponible por script
- Endurecimiento de logs en build production activo (`drop console/debugger`).

## 2) Blockers de entorno

- **iOS/Xcode no instalado** en entorno actual Windows.
  - Impacto: no se puede validar corrida iOS aqui.
  - No bloquea QA Android interna.

## 3) Blockers de QA

- Falta ejecucion manual completa de:
  - `MOBILE_TEST_MATRIX.md` (casos de alta prioridad),
  - `ANDROID_SMOKE_TEST.md` post-fix.
- Sin esta evidencia, no hay GO final para prueba interna controlada.

## 4) Blockers para iOS

- Toolchain incompleta (Xcode ausente).
- Falta corrida de matriz en simulador/dispositivo iOS.

## 5) Blockers para tiendas

- Sin evidencia QA cerrada en Android/iOS.
- Sin pipeline final de firma/publicacion documentado como ejecutado.
- Sin validacion final en cuentas de store para esta ronda.

## Estado recomendado actual

- **Android interna:** NO-GO temporal hasta completar QA manual y smoke.
- **iOS interna:** NO-GO por bloqueo de entorno.
- **Publicacion stores:** NO-GO.

