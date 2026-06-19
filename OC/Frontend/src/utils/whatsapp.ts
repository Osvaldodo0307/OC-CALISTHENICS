/** Número comercial OC Club (WhatsApp, sin +). */
export const OC_WHATSAPP_TEL = '525567869589'

export const WHATSAPP_PRESETS = {
  visita: 'Hola, quiero agendar una visita a OC Club.',
  basico: 'Hola, me interesa el plan OC GYM Básico de $600.',
  premium: 'Hola, me interesa el plan OC GYM Premium de $950.',
  accesoTotal: 'Hola, me interesa el Acceso Total.',
  recovery: 'Hola, quiero información sobre Recovery Lab.',
  clases: 'Hola, quiero información sobre las clases de OC Club.',
  tienda: 'Hola, quiero consultar disponibilidad de productos de la tienda OC Club.',
  general: 'Hola, quiero información sobre OC Club.',
} as const

export const MEMBERSHIP_WHATSAPP_PRESETS = {
  membresiaVenceHoy:
    'Hola, te recordamos que tu membresía de OC Club vence hoy. ¿Te apoyamos con la renovación?',
  membresiaPorVencer:
    'Hola, te recordamos que tu membresía de OC Club está próxima a vencer. ¿Deseas renovarla?',
  membresiaAdeudo: 'Hola, tienes un pago pendiente registrado en OC Club. ¿Te apoyamos a revisarlo?',
  membresiaVencida:
    'Hola, tu membresía de OC Club aparece vencida. ¿Deseas renovarla para continuar con tu acceso?',
  membresiaSeguimiento: 'Hola, te escribimos de OC Club para dar seguimiento a tu membresía.',
} as const

export type WhatsAppPresetKey = keyof typeof WHATSAPP_PRESETS
export type MembershipWhatsAppPreset = keyof typeof MEMBERSHIP_WHATSAPP_PRESETS

/**
 * Genera un enlace wa.me con mensaje precargado.
 * @param message Texto literal o clave de WHATSAPP_PRESETS.
 */
export function buildWhatsAppHref(message?: string | WhatsAppPresetKey): string {
  const text =
    message === undefined
      ? WHATSAPP_PRESETS.general
      : message in WHATSAPP_PRESETS
        ? WHATSAPP_PRESETS[message as WhatsAppPresetKey]
        : message
  return `https://wa.me/${OC_WHATSAPP_TEL}?text=${encodeURIComponent(text)}`
}

function normalizeMemberPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return `52${digits}`
  if (digits.startsWith('52') && digits.length >= 12) return digits
  return digits
}

/** Enlace wa.me al teléfono del socio con mensaje de recordatorio de membresía. */
export function whatsappPresetForInboxItem(status: string, priorityCategory?: string): MembershipWhatsAppPreset {
  if (status === 'vence_hoy' || priorityCategory === 'vence_hoy') return 'membresiaVenceHoy'
  if (status === 'proxima_a_vencer' || priorityCategory === 'por_vencer') return 'membresiaPorVencer'
  if (priorityCategory === 'vencidos_con_adeudo' || status === 'con_adeudo' || priorityCategory === 'con_adeudo') {
    return 'membresiaAdeudo'
  }
  if (status === 'vencida' || priorityCategory?.startsWith('vencido')) return 'membresiaVencida'
  return 'membresiaSeguimiento'
}

export function buildMemberWhatsAppHref(
  phone: string | null | undefined,
  preset: MembershipWhatsAppPreset,
): string | null {
  const normalized = phone ? normalizeMemberPhone(phone) : null
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(MEMBERSHIP_WHATSAPP_PRESETS[preset])}`
}
