# Analítica web — OC Club

Integración opcional de **Google Analytics 4** y **Meta Pixel** sin IDs hardcodeados.

## Variables de entorno (Netlify)

En **Site configuration → Environment variables**, agrega solo las que vayas a usar:

| Variable | Descripción |
|----------|-------------|
| `VITE_GA_MEASUREMENT_ID` | ID de medición GA4 (formato `G-XXXXXXXXXX`) |
| `VITE_META_PIXEL_ID` | ID numérico del pixel de Meta |

Después de agregar o cambiar variables, ejecuta **Trigger deploy → Clear cache and deploy site**. Vite solo inyecta `VITE_*` en tiempo de build.

## Dónde se carga

- Componente: `src/components/Analytics.tsx`
- Montado en: `src/main.tsx` (solo si no estás en modo app Capacitor nativo, o siempre en web — ver implementación)

Los scripts **no se cargan** si las variables están vacías o no definidas.

## Verificación

1. Abre el sitio en producción con las variables configuradas.
2. GA4: **Admin → DebugView** o extensión Google Analytics Debugger.
3. Meta: **Events Manager → Test events** con el pixel activo.

## Privacidad

- GA4 se inicializa con `anonymize_ip: true`.
- El aviso de privacidad (`/aviso-privacidad`) debe mencionar analítica si activas estas herramientas.
- No agregues IDs de prueba al repositorio.

## Eventos personalizados (comercial)

El helper `src/utils/analytics.ts` expone `trackEvent(eventName, params?)`. Solo envía datos si GA4 o Meta Pixel están configurados.

Eventos estándar:

| Evento | Cuándo se dispara |
|--------|-------------------|
| `whatsapp_visita` | Clic en CTA de agendar visita |
| `whatsapp_plan_basico` | Clic WhatsApp plan Básico |
| `whatsapp_plan_premium` | Clic WhatsApp plan Premium |
| `whatsapp_plan_acceso_total` | Clic WhatsApp Acceso Total |
| `whatsapp_recovery` | Clic WhatsApp Recovery Lab |
| `whatsapp_clases` | Clic WhatsApp clases |
| `whatsapp_tienda` | Clic WhatsApp tienda / checkout |
| `whatsapp_general` | Otros CTAs generales |
| `lead_form_success` | Envío exitoso del formulario `oc-lead-capture` |
| `lead_form_error` | Fallo al enviar el formulario |

Componente recomendado para enlaces: `src/components/WhatsAppLink.tsx` (incluye tracking automático).

## Eventos personalizados adicionales (futuro)

Para registrar otros clics, usa `trackEvent` desde componentes solo cuando `window.gtag` / `window.fbq` existan (el helper ya lo valida).
