# APP_SCOPE

## Frontera funcional

La app movil (Capacitor) se define como **portal privado autenticado**.  
La web mantiene doble objetivo: experiencia publica + experiencia privada.

## Pertenece a web publica

- `/`
- `/membresias`
- `/clases` (informativa publica)
- `/equipo-comunidad`
- `/convenios`
- Navegacion promocional/institucional.

## Pertenece a app privada

- `/app/login`
- `/app` (redirect por rol)
- Socio:
  - `/app/clases`
  - `/app/reservas`
  - `/app/perfil`
  - `/app/mi-plan`
  - `/app/rutinas`
- Admin/Coach: rutas internas existentes, con control de disponibilidad movil.

## Modulos fuera de app por ahora

- Flujo publico de marketing/landing.
- Modulos de admin/coach no optimizados para movil: se muestran como **web-only temporal** en app mode.
- Pagos nativos.
- Push notifications.
- Geolocalizacion, biometria, camara.

## Modulos prioritarios si para app

1. Login y sesion.
2. Dashboard interno (rol socio).
3. Clases.
4. Reservas.
5. Perfil.
6. Mi plan.
7. Rutinas.

## Como se implementa el modo app

- Configurable desde `runtime`:
  - modo app por plataforma nativa (`Capacitor.isNativePlatform()`).
  - soporte de forcing con `VITE_APP_MODE=app`.
- En app mode:
  - rutas publicas redirigen a `/app/login`,
  - navegacion publica no se usa como principal,
  - la experiencia interna autenticada se vuelve el punto de entrada.

