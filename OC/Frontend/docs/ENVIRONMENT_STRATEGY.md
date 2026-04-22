# ENVIRONMENT_STRATEGY

## Variables clave

- `VITE_API_URL`: URL base del backend.
- `VITE_APP_MODE`: `web` o `app`.
- `VITE_APP_VERSION`: etiqueta visible de version/build.

## Reglas de seguridad

1. En produccion, `VITE_API_URL` debe ser HTTPS.
2. No publicar build de release apuntando a localhost.
3. Si falta `VITE_API_URL` en produccion, el runtime marca error de configuracion.

## Escenarios soportados

### 1) Web local (desarrollo)

```env
VITE_API_URL=http://localhost:8000
VITE_APP_MODE=web
VITE_APP_VERSION=1.0.0-dev
```

### 2) Android Emulator

```env
VITE_API_URL=http://10.0.2.2:8000
VITE_APP_MODE=app
VITE_APP_VERSION=1.0.0-android-dev
```

### 3) iOS Simulator (macOS)

```env
VITE_API_URL=http://localhost:8000
VITE_APP_MODE=app
VITE_APP_VERSION=1.0.0-ios-dev
```

### 4) Dispositivo fisico (misma red local)

```env
VITE_API_URL=http://192.168.x.x:8000
VITE_APP_MODE=app
VITE_APP_VERSION=1.0.0-device-dev
```

### 5) Produccion real

```env
VITE_API_URL=https://api.tu-dominio.com
VITE_APP_MODE=app
VITE_APP_VERSION=1.0.0
```

## Flujo recomendado por entorno

1. Ajustar `.env`.
2. Ejecutar `npm run mobile:build`.
3. Ejecutar `npm run mobile:sync`.
4. Abrir plataforma nativa.
5. Validar login/sesion/red.

## Nota sobre fallback a localhost

En desarrollo existe fallback a `http://localhost:8000`.  
En produccion ese fallback queda deshabilitado (URL vacia y error de configuracion) para evitar dependencia accidental a localhost.

