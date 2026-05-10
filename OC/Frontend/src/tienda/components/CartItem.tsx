import { Link } from 'react-router-dom'
import type { CartLine } from '../types/store'
import { formatCurrency } from '../utils/formatCurrency'
import { useCart } from '../context/CartContext'

interface Props {
  line: CartLine
  /** Variante visual: drawer (compacta) o page (full). */
  variant?: 'drawer' | 'page'
}

export default function CartItem({ line, variant = 'drawer' }: Props) {
  const { updateQuantity, removeLine } = useCart()
  const totalLine = line.unitPrice * line.quantity
  const isPage = variant === 'page'

  return (
    <div
      className={`flex gap-3 ${
        isPage ? 'border-b border-neutral-200 py-5' : 'border-b border-neutral-200 py-4'
      }`}
    >
      <Link
        to={`/tienda/producto/${line.productSlug}`}
        className={`block shrink-0 overflow-hidden rounded-lg bg-neutral-100 ${
          isPage ? 'h-24 w-20 sm:h-28 sm:w-24' : 'h-20 w-16'
        }`}
      >
        <img
          src={line.cover.src}
          alt={line.cover.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              to={`/tienda/producto/${line.productSlug}`}
              className="line-clamp-2 text-[14px] font-semibold text-neutral-900 hover:text-oc-red"
            >
              {line.name}
            </Link>
            {line.variant && (
              <p className="mt-0.5 text-[12px] text-neutral-500">
                {line.variant.axis === 'talla'
                  ? `Talla ${line.variant.label}`
                  : line.variant.label}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeLine(line.lineId)}
            className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 hover:text-oc-red"
            aria-label={`Eliminar ${line.name} del carrito`}
          >
            Eliminar
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
            <button
              type="button"
              onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
              className="h-8 w-8 text-neutral-700 hover:text-oc-red disabled:opacity-50"
              disabled={line.quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-[13px] font-semibold text-neutral-900">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
              className="h-8 w-8 text-neutral-700 hover:text-oc-red"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-bold text-neutral-900">{formatCurrency(totalLine)}</p>
            {line.quantity > 1 && (
              <p className="text-[11px] text-neutral-400">
                {formatCurrency(line.unitPrice)} c/u
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
