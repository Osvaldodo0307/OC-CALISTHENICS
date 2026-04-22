# ANDROID_INTERNAL_BUILD_NOTES

## Build de referencia

- Fecha base: 2026-03-10
- Version objetivo QA: `1.3.1-internal`
- Version code: `100301`
- Package/Application ID: `com.occalisthenics.app`

## Notas tecnicas del build

- Build web en modo produccion elimina `console` y `debugger` de bundles.
- Scripts disponibles:
  - `npm run mobile:rebuild`
  - `npm run mobile:build`
  - `npm run mobile:sync`
  - `npm run mobile:android:build`
  - `npm run mobile:android:bundle`
- Entorno recomendado:
  - `VITE_APP_MODE=app`
  - `VITE_API_URL` apuntando a backend QA (no localhost para pruebas compartidas).

## Artefactos esperados

- APK debug:
  - `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- Bundle debug (si aplica):
  - `mobile/android/app/build/outputs/bundle/debug/`

## Riesgos de build a vigilar

- URL de API incorrecta para emulador/dispositivo.
- Backend no accesible desde red de prueba.
- Dependencia de iOS no relevante para esta corrida Android.

