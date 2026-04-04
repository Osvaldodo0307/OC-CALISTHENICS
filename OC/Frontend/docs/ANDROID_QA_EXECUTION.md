# ANDROID_QA_EXECUTION

## Objetivo

Ejecutar QA Android de forma reproducible y decidir GO/NO-GO para prueba interna.

## Build objetivo de esta ronda

- `applicationId`: `com.occalisthenics.app`
- `versionName`: `1.3.1-internal`
- `versionCode`: `100301`
- Tipo de build recomendado para QA: `debug` interno controlado.

## Precondiciones obligatorias

1. Backend disponible y accesible desde Android (IP o entorno remoto).
2. `.env` configurado para modo app:
   - `VITE_APP_MODE=app`
   - `VITE_API_URL` valido para emulador/dispositivo.
3. Android Studio instalado.
4. Emulador o dispositivo listo para pruebas.

## Flujo exacto de ejecucion

### Paso 1 — Gate tecnico

1. `npm install`
2. `npm run mobile:rebuild`
4. `npm run mobile:doctor`
5. Abrir Android Studio: `npm run mobile:android`

**Aprobacion:** build y sync exitosos + doctor Android OK.

### Paso 2 — Generar APK/AAB de prueba interna

Opcion A (recomendada, desde scripts npm):

```bash
npm run mobile:android:build
```

Opcional bundle:

```bash
npm run mobile:android:bundle
```

Opcion B (directo desde `Frontend/mobile/android`):

```bash
gradlew.bat assembleDebug
```

Opcional bundle:

```bash
gradlew.bat bundleDebug
```

**Evidencia esperada:**
- APK/BUNDLE generado en `app/build/outputs/`.
- Captura o log de consola con `BUILD SUCCESSFUL`.

### Paso 3 — Sesion QA-Auth (prioridad alta)

Ejecutar en orden:
- AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07.

**Evidencia esperada:**
- Capturas de pantallas de login/error/logout.
- Video corto del caso persistencia/reapertura.
- Nota del comportamiento ante token invalido/expirado.

### Paso 4 — Sesion QA-Modulos socio (prioridad alta)

Ejecutar en orden:
- CLS-01, CLS-02, CLS-03, RES-01, RES-02.

**Evidencia esperada:**
- Capturas antes/despues de reservar/cancelar.
- Confirmacion de bloqueo de doble accion.
- Registro de mensajes de error y exito.

### Paso 5 — Sesion QA-Red y ciclo de vida (prioridad alta)

Ejecutar en orden:
- NET-01, NET-02, NET-03, APP-01, APP-02.

**Evidencia esperada:**
- Captura de banner offline.
- Captura de `ErrorState` con retry.
- Video corto de back button Android.

### Paso 6 — Sesion QA-Complementaria

Ejecutar:
- PER-01, PLAN-01, PLAN-02, RUT-01, (RUT-02 opcional por rol coach).

## Criterio de aprobacion por bloque

- **AUTH:** todos los casos altos en PASS o PASS con observacion menor.
- **Clases/Reservas:** sin bloqueantes ni perdida de estado.
- **Red/App lifecycle:** sin crashes, sin pantallas en blanco, retry funcional.

## Criterio global GO/NO-GO para prueba interna Android

### GO

- Todos los casos de alta prioridad (AUTH + CLS/RES + NET/APP) en PASS.
- Sin bug critico abierto en `ANDROID_BUG_LOG.md`.
- Build interna instalable repetible.

### NO-GO

- Falla en persistencia de sesion.
- Falla en token invalido/expirado.
- Falla en reservas/clases con doble accion no controlada.
- Crashes en offline/online o back button.

## Notas iOS

- iOS no bloquea esta fase por falta de Xcode en entorno actual.
- Mantener trazabilidad de decisiones y evidencias para repetir matriz en macOS.

