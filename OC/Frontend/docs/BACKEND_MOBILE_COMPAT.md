# BACKEND_MOBILE_COMPAT

## Objetivo

Validar compatibilidad del backend FastAPI actual para consumo desde web y app movil (Capacitor) sin rehacer negocio.

## CORS

- Backend usa `ALLOWED_ORIGINS` en `app/main.py`.
- En produccion **no** usar wildcard (`*`) para app/web productivas.
- Recomendacion:
  - listar dominio web productivo,
  - listar dominios de preproduccion,
  - mantener estrategia controlada para entornos internos de QA.

Ejemplo:

```env
ALLOWED_ORIGINS=https://tu-web.com,https://staging.tu-web.com
```

## HTTPS

- Produccion debe usar HTTPS en backend.
- `VITE_API_URL` de release debe apuntar a endpoint HTTPS publico.
- Evitar endpoints HTTP en builds distribuidas.

## JWT y sesion

- La app movil usa el mismo esquema JWT actual.
- Persistencia en movil se resuelve con `@capacitor/preferences`.
- Revalidacion de sesion al abrir/reanudar la app mediante `GET /auth/me`.
- Si token expira:
  - limpiar almacenamiento,
  - redirigir a login.

## Supuestos web-only a revisar

- Dependencias de UX de escritorio en modulos admin/coach.
- Mensajes y errores orientados a web que en movil requieren mejor feedback.
- Navegacion y long tables que no siempre escalan a pantallas pequenas.

## Ajustes backend minimos recomendados (sin cambiar negocio)

1. Confirmar `ALLOWED_ORIGINS` por ambiente.
2. Validar timeout/latencia de endpoints mas usados en movil.
3. Garantizar consistencia de `401/403` para flujo de sesion expirada.
4. Mantener endpoint liviano de health (`/health/db`) para diagnostico.

## No cambios en esta fase

- No se modifican modelos de datos.
- No se altera logica de negocio principal.
- No se agregan endpoints nuevos salvo necesidad critica (no detectada en esta fase).

