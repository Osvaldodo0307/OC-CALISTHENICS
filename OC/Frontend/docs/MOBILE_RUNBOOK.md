# MOBILE_RUNBOOK

## 1) Instalar dependencias

```bash
npm install
```

## 2) Levantar web (desarrollo)

```bash
npm run dev
```

## 3) Build web

```bash
npm run build
```

## 4) Build para movil (alias)

```bash
npm run mobile:build
```

## 5) Sincronizar Capacitor

```bash
npm run mobile:sync
```

## 6) Abrir Android Studio

```bash
npm run mobile:android
```

## 7) Abrir Xcode

```bash
npm run mobile:ios
```

## 8) Verificacion de entorno Capacitor

```bash
npm run mobile:doctor
```

## 9) Flujo recomendado de trabajo

1. Ajustar `.env` o `.env.mobile.example` segun entorno.
2. Ejecutar `npm run mobile:build`.
3. Ejecutar `npm run mobile:sync`.
4. Abrir plataforma (`mobile:android` o `mobile:ios`).
5. Correr en emulador/simulador o dispositivo.

## 10) Referencias de API en movil

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000` (en macOS)
- Dispositivo fisico: `http://<IP-LOCAL-HOST>:8000`
- Produccion: `https://<backend-oficial>`

## 11) Validacion basica (smoke checklist)

- [ ] Login exitoso.
- [ ] Sesion persiste al cerrar/reabrir app.
- [ ] Revalidacion de token en resume.
- [ ] Navegacion privada principal funciona.
- [ ] Banner offline aparece cuando no hay red.
- [ ] Back button Android se comporta correctamente.
- [ ] Web publica sigue operativa en navegador.

## 12) Notas de deep links (base preparada)

En esta fase no se implementaron deep links completos.  
Para fase siguiente:

1. Definir esquema y dominios oficiales.
2. Configurar App Links (Android) y Universal Links (iOS).
3. Ajustar rutas internas y fallback de autenticacion.
4. Validar seguridad de origen y expiracion de enlaces.

