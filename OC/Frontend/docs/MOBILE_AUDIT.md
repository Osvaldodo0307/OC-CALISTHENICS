# MOBILE_AUDIT

## Mapa general del frontend

- **Entrada principal:** `src/main.tsx` -> `src/App.tsx`.
- **Segmentos funcionales:**
  - **Publico web:** `Landing`, `Membresias`, `ClasesInfo`, `EquipoComunidad`, `Convenios`.
  - **Autenticacion:** `Login`.
  - **Privado interno:** `Classes`, `Reservas`, `Perfil`, `MiPlan`, `Rutinas`, modulos `admin/*`, `coach/*`.
- **Layout actual posterior a refactor:**
  - `PublicLayout` para experiencia publica web.
  - `AuthLayout` para flujo de login.
  - `AppLayout` para experiencia autenticada privada.

## Archivos criticos

- `src/App.tsx`: frontera de rutas publicas vs privadas, modo app, bloqueo de contenido publico en app.
- `src/contexts/AuthContext.tsx`: login, persistencia y revalidacion de sesion.
- `src/services/storage/sessionStorage.ts`: adapter de almacenamiento (web/movil).
- `src/config/runtime.ts`: configuracion central de entorno/API/modo app.
- `src/components/AppShell.tsx`: shell de navegacion interna.
- `src/components/MobileBottomNav.tsx`: navegacion inferior para socio en app mode.
- `src/components/NetworkStatusBanner.tsx`: estado online/offline.

## Dependencias criticas

- `react`, `react-router-dom`, `axios`.
- `@capacitor/core`, `@capacitor/cli`.
- Plugins: `@capacitor/app`, `@capacitor/preferences`, `@capacitor/network`.
- Plataformas: `@capacitor/android`, `@capacitor/ios`.

## Riesgos detectados

- Varias pantallas de admin/coach no estan optimizadas para experiencia movil completa.
- El backend usa JWT y CORS configurable; una configuracion incorrecta de `ALLOWED_ORIGINS` puede bloquear la app.
- Hay deuda tecnica previa en endpoints que asumen UX de escritorio.
- Existen cambios de esquema en backend aplicados en runtime (no migraciones versionadas), relevante para despliegues estrictos.

## Pantallas publicas encontradas

- `/` -> `Landing`.
- `/membresias` -> `Membresias`.
- `/clases` -> `ClasesInfo`.
- `/equipo-comunidad` -> `EquipoComunidad`.
- `/convenios` -> `Convenios`.

## Pantallas privadas encontradas

- `/app/login`.
- `/app` (redirige por rol).
- Socio: `/app/clases`, `/app/reservas`, `/app/perfil`, `/app/mi-plan`, `/app/rutinas`.
- Admin: `/app/admin/dashboard`, `/app/admin/asistencia`, `/app/admin/clases`, `/app/admin/usuarios`, `/app/admin/coaches-alumnos`.
- Coach: `/app/coach/dashboard`, `/app/coach/alumnos`, `/app/coach/alumno/:id`, `/app/coach/asistencia-virtual/:id`.

## Decisiones arquitectonicas recomendadas

- Mantener **una sola base frontend** con modo de ejecucion:
  - **web mode:** publico + privado.
  - **app mode:** privado/autenticado como experiencia dominante.
- Centralizar runtime y almacenamiento para evitar divergencia web/movil.
- Evitar duplicar pantallas: reutilizar modulos privados ya existentes.
- Marcar temporalmente como web-only modulos internos que no esten listos para movil.

## Que ira a web publica

- Landing y contenido institucional/promocional.
- Navegacion de marketing.
- CTAs de captacion y secciones informativas abiertas.

## Que ira a la app

- Flujo interno autenticado:
  - login y restauracion/revalidacion de sesion,
  - dashboard interno por rol,
  - clases, reservas, perfil, plan, rutinas,
  - modulos internos permitidos de coach/admin segun madurez movil.

