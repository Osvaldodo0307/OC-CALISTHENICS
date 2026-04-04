# NATIVE_DEV_NOTES

## Estado nativo actual

- Android project generado en `mobile/android`.
- iOS project generado en `mobile/ios`.
- Plugins activos:
  - `@capacitor/app`
  - `@capacitor/network`
  - `@capacitor/preferences`

## Android: desarrollo con backend local

### Endpoint recomendado en emulador

- `http://10.0.2.2:8000` (host local visto desde emulador Android).

### Cleartext traffic (HTTP) en desarrollo

- Si se consume backend HTTP local y Android bloquea trafico claro, habilitarlo **solo para desarrollo**.
- Recomendacion:
  1. crear `src/debug/AndroidManifest.xml` con `usesCleartextTraffic=true`,
  2. no habilitar cleartext en `release`.

> En esta fase no se habilito cleartext global para no abrir riesgo en produccion.

## iOS

- En entorno actual (Windows) no se puede validar Xcode.
- `mobile:doctor` confirma bloqueo por falta de Xcode.
- El proyecto iOS queda listo para apertura en macOS.

## WebView y permisos

- Permiso `INTERNET` presente (necesario).
- No se agregaron permisos extra (camara, ubicacion, biometria, etc).
- Se mantiene superficie de permisos minima para esta fase.

## Recomendaciones antes de QA ampliado

1. Definir entorno backend QA con HTTPS.
2. Ejecutar smoke tests en Android emulador + dispositivo fisico.
3. Verificar manejo de red inestable y back button.
4. Revisar manifest/debug-only para cleartext si QA local lo requiere.

