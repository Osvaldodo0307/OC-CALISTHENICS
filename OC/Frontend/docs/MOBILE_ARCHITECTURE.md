# MOBILE_ARCHITECTURE

## Por que Capacitor

- Permite reutilizar la base React + TypeScript actual.
- Evita duplicar negocio y pantallas innecesarias.
- Agrega shells nativos separados para Android e iOS.
- Mantiene un solo backend FastAPI para ambas plataformas.

## Convivencia web publica + app privada

- **Web:** conserva experiencia publica institucional y experiencia privada interna.
- **App:** prioriza experiencia privada autenticada.
- En app mode, rutas publicas se redirigen a login interno para evitar que la app sea un "sitio publico empaquetado".

## Separacion de experiencia publica e interna

- Rutas organizadas por layouts:
  - `PublicLayout` (publico web)
  - `AuthLayout` (login/sesion)
  - `AppLayout` (privado autenticado)
- `runtime.isAppMode` controla el comportamiento de rutas y navegacion.

## Organizacion Android e iOS

- Frontend compartido: `Frontend/src`.
- Nativo Android: `Frontend/mobile/android`.
- Nativo iOS: `Frontend/mobile/ios`.
- Config central: `Frontend/capacitor.config.ts`.

## Entornos y configuracion

- `src/config/runtime.ts` centraliza:
  - nombre/version app,
  - entorno,
  - base URL de API,
  - modo web/app,
  - deteccion de plataforma nativa.
- Archivos de ejemplo:
  - `.env.example` (web/dev)
  - `.env.mobile.example` (movil/dev y referencias de emulador/dispositivo)

## Persistencia de sesion

- Adapter: `src/services/storage/sessionStorage.ts`.
- Web: `localStorage`.
- Movil: `@capacitor/preferences`.
- AuthContext:
  - inicializa sesion desde adapter,
  - revalida token con `/auth/me`,
  - limpia sesion expirada,
  - revalida al reanudar app.

## Comportamiento nativo minimo implementado

- `@capacitor/app`:
  - `appStateChange` para revalidar sesion al volver a foreground.
  - `backButton` Android con comportamiento controlado.
- `@capacitor/network`:
  - banner online/offline visible.

## Estado para publicacion

- Capacitor integrado.
- Proyectos nativos Android/iOS generados.
- Scripts de build/sync/open listos.
- Documentacion de release y runbook lista.

## Fase 2 propuesta

1. Hardening UX movil en modulos coach/admin priorizados.
2. Deep links (universal links / app links) de extremo a extremo.
3. QA automatizada smoke para rutas privadas en modo app.
4. Pipeline de build release por plataforma.

