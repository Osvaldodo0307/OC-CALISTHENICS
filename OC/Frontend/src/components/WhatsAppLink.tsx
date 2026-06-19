import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { ANALYTICS_EVENTS, trackEvent } from '../utils/analytics'
import { buildWhatsAppHref, type WhatsAppPresetKey } from '../utils/whatsapp'

const PRESET_EVENTS: Record<WhatsAppPresetKey, string> = {
  visita: ANALYTICS_EVENTS.whatsapp_visita,
  basico: ANALYTICS_EVENTS.whatsapp_plan_basico,
  premium: ANALYTICS_EVENTS.whatsapp_plan_premium,
  accesoTotal: ANALYTICS_EVENTS.whatsapp_plan_acceso_total,
  recovery: ANALYTICS_EVENTS.whatsapp_recovery,
  clases: ANALYTICS_EVENTS.whatsapp_clases,
  tienda: ANALYTICS_EVENTS.whatsapp_tienda,
  general: ANALYTICS_EVENTS.whatsapp_general,
}

type WhatsAppLinkProps = {
  preset: WhatsAppPresetKey
  eventName?: string
  children: ReactNode
  className?: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'>

export default function WhatsAppLink({
  preset,
  eventName,
  children,
  className,
  onClick,
  ...rest
}: WhatsAppLinkProps) {
  const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>['onClick'] = (event) => {
    trackEvent(eventName ?? PRESET_EVENTS[preset], { preset, channel: 'whatsapp' })
    onClick?.(event)
  }

  return (
    <a
      href={buildWhatsAppHref(preset)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
}
