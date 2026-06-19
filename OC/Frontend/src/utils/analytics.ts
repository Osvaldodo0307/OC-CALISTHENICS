/** Nombres de eventos comerciales estándar. */
export const ANALYTICS_EVENTS = {
  whatsapp_visita: 'whatsapp_visita',
  whatsapp_plan_basico: 'whatsapp_plan_basico',
  whatsapp_plan_premium: 'whatsapp_plan_premium',
  whatsapp_plan_acceso_total: 'whatsapp_plan_acceso_total',
  whatsapp_recovery: 'whatsapp_recovery',
  whatsapp_clases: 'whatsapp_clases',
  whatsapp_tienda: 'whatsapp_tienda',
  whatsapp_general: 'whatsapp_general',
  lead_form_success: 'lead_form_success',
  lead_form_error: 'lead_form_error',
} as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS] | string

type EventParams = Record<string, string | number | boolean | undefined>

const hasGa = () => Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID?.trim())
const hasMeta = () => Boolean(import.meta.env.VITE_META_PIXEL_ID?.trim())

/**
 * Registra un evento en GA4 y/o Meta Pixel si están configurados.
 * Nunca lanza errores ni bloquea la navegación.
 */
export function trackEvent(eventName: AnalyticsEventName, params?: EventParams): void {
  if (typeof window === 'undefined') return

  const payload = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
      )
    : undefined

  try {
    if (hasGa() && typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload)
    }
    if (hasMeta() && typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, payload)
    }
  } catch {
    // Analítica opcional: no interrumpir UX.
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}
