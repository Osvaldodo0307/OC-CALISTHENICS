import type { CartLine } from '../types/store'
import { formatCurrency } from './formatCurrency'

/** Aviso legal/comercial obligatorio en el MVP (compra asistida, sin pasarela). */
export const OC_COMMERCIAL_DISCLAIMER =
  'La compra, disponibilidad, entrega y método de pago se confirman directamente con el equipo OC.'

/** WhatsApp comercial (mismo número que el sitio público OC). */
export const OC_STORE_WHATSAPP_TEL = '525567869589'

/**
 * Enlace para enviar la solicitud de compra por WhatsApp con el detalle del carrito.
 * No procesa pago; solo arma el mensaje para el equipo OC.
 */
export function buildStoreOrderWhatsAppHref(lines: CartLine[], subtotal: number): string {
  const items = lines
    .map((l) => {
      const v = l.variant ? ` (${l.variant.label})` : ''
      return `• ${l.name}${v} × ${l.quantity}`
    })
    .join('\n')

  const body = [
    'Hola OC,',
    '',
    'Quiero enviar una solicitud de compra / consultar disponibilidad:',
    '',
    items,
    '',
    `Subtotal de referencia (solo productos): ${formatCurrency(subtotal)}`,
    '',
    'Gracias.',
  ].join('\n')

  return `https://wa.me/${OC_STORE_WHATSAPP_TEL}?text=${encodeURIComponent(body)}`
}
