# PHASE2_BASELINE_REVIEW

## Estado real heredado de Fase 1

### Implementado y comprobado en codigo

- Integracion de Capacitor con:
  - `capacitor.config.ts`
  - `mobile/android`
  - `mobile/ios`
- Separacion de rutas publico vs privado en `App.tsx`.
- `runtime.ts` para modo app/web y resolucion de API.
- Persistencia de sesion web/movil via adapter (`localStorage` / `Preferences`).
- Modo app que prioriza login + rutas privadas.
- Navegacion movil base (bottom nav socio).

### Implementado parcialmente

- UX movil en modulos socio:
  - existe base responsive, pero habia estados de error y vacio poco consistentes.
- Endurecimiento auth:
  - habia revalidacion al abrir/reanudar app,
  - faltaba estandarizar limpieza frente a 401 y errores de sesion corrupta.
- Manejo de red:
  - banner online/offline existente,
  - faltaba estandarizar feedback en acciones criticas.

### Solo documentado en Fase 1 (no validado en dispositivo dentro de este entorno)

- Flujo completo en iOS con Xcode.
- Pruebas end-to-end reales en dispositivo fisico.
- Checklist de release ejecutado en stores.

## Validaciones realmente ejecutadas en esta fase

- `npm run build` (OK).
- `npm run mobile:build` (OK).
- `npm run mobile:sync` (OK).
- `npm run mobile:doctor`:
  - Android OK.
  - iOS bloqueado por ausencia de Xcode en entorno Windows.

## Que requiere pruebas reales adicionales

- Login/logout en app Android instalada.
- Persistencia de sesion tras cerrar/reabrir app.
- Revalidacion en foreground con token vigente/expirado.
- Comportamiento real de red inestable (wifi/datos).
- Flujo back button Android en navegacion profunda.

## Riesgos tecnicos detectados al iniciar Fase 2

- Dependencia de UX de escritorio en modulos coach/admin.
- Uso de mensajes `alert` y errores heterogeneos en modulos clave.
- Riesgo de duplicidad de acciones por latencia en reservas/clases.
- Riesgo de mala configuracion de `VITE_API_URL` por entorno.

## Deuda tecnica prioritaria atendible ahora

1. Estandarizar estados `loading/error/empty`.
2. Endurecer flujo de sesion con limpieza centralizada.
3. Reducir carga inicial con lazy loading.
4. Mejorar documentacion operativa para QA movil y go/no-go.

