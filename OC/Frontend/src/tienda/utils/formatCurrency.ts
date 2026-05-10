/**
 * Formato de moneda MXN consistente para toda la tienda.
 * Centralizado aquí para que cuando integremos pasarela de pago real
 * no haya que tocar precios en mil componentes.
 */

const MXN_FORMATTER = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00 MXN'
  return MXN_FORMATTER.format(amount)
}

/** Devuelve el porcentaje de descuento entre `compareAt` y `price`. */
export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null
  const pct = ((compareAt - price) / compareAt) * 100
  return Math.round(pct)
}
