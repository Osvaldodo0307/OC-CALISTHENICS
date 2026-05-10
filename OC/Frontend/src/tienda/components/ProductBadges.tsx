import type { ProductBadge, ProductBadgeKind } from '../types/store'

const STYLES: Record<ProductBadgeKind, { bg: string; fg: string; ring?: string; label: string }> = {
  nuevo: {
    bg: 'bg-emerald-500',
    fg: 'text-white',
    ring: 'ring-emerald-300/40',
    label: 'Nuevo',
  },
  'best-seller': {
    bg: 'bg-oc-red',
    fg: 'text-white',
    ring: 'ring-oc-red/30',
    label: 'Best seller',
  },
  'edicion-limitada': {
    bg: 'bg-neutral-900',
    fg: 'text-white',
    ring: 'ring-neutral-700/30',
    label: 'Edición limitada',
  },
  descuento: {
    bg: 'bg-amber-400',
    fg: 'text-neutral-900',
    ring: 'ring-amber-300/40',
    label: 'Descuento',
  },
  agotado: {
    bg: 'bg-neutral-200',
    fg: 'text-neutral-700',
    ring: 'ring-neutral-300/40',
    label: 'Agotado',
  },
  'pre-venta': {
    bg: 'bg-blue-500',
    fg: 'text-white',
    ring: 'ring-blue-300/40',
    label: 'Pre-venta',
  },
}

export function ProductBadges({
  badges,
  size = 'md',
}: {
  badges?: ProductBadge[]
  size?: 'sm' | 'md'
}) {
  if (!badges || badges.length === 0) return null
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((b, idx) => {
        const s = STYLES[b.kind]
        return (
          <span
            key={`${b.kind}-${idx}`}
            className={`${padding} ${s.bg} ${s.fg} ${s.ring ? `ring-1 ${s.ring}` : ''} inline-flex items-center rounded-full font-bold uppercase tracking-wider shadow-sm`}
          >
            {b.label ?? s.label}
          </span>
        )
      })}
    </div>
  )
}

export default ProductBadges
