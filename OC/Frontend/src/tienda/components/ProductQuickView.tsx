import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product, ProductVariant } from '../types/store'
import { formatCurrency, discountPercent } from '../utils/formatCurrency'
import ProductBadges from './ProductBadges'
import { useCart } from '../context/CartContext'

interface Props {
  product: Product | null
  onClose: () => void
}

export default function ProductQuickView({ product, onClose }: Props) {
  const { addProduct } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!product) {
      setSelectedVariant(undefined)
      setQuantity(1)
      setFeedback(null)
      return
    }
    const firstAvailable = product.variants?.find((v) => v.available)
    setSelectedVariant(firstAvailable)
    setQuantity(1)
    setFeedback(null)
  }, [product])

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, onClose])

  useEffect(() => {
    if (!product) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [product])

  const groupedVariants = useMemo(() => {
    const map = new Map<ProductVariant['axis'], ProductVariant[]>()
    product?.variants?.forEach((v) => {
      const arr = map.get(v.axis) ?? []
      arr.push(v)
      map.set(v.axis, arr)
    })
    return map
  }, [product])

  if (!product) return null

  const requiresVariantSelection =
    (product.variants?.length ?? 0) > 0 && !selectedVariant
  const discount = discountPercent(product.price, product.compareAtPrice)

  const handleAdd = () => {
    if (!product.inStock) return
    if (requiresVariantSelection) {
      setFeedback('Selecciona una variante para continuar.')
      return
    }
    addProduct(product, { variant: selectedVariant, quantity })
    setFeedback('Agregado al carrito.')
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Vista rápida: ${product.name}`}
        className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-neutral-700 backdrop-blur hover:bg-white"
          aria-label="Cerrar vista rápida"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid max-h-[88vh] grid-cols-1 overflow-y-auto sm:grid-cols-2">
          <div className="relative aspect-[4/5] w-full bg-neutral-100 sm:aspect-auto">
            <img
              src={product.cover.src}
              alt={product.cover.alt}
              className="h-full w-full object-cover"
              loading="eager"
            />
            {(product.badges?.length || discount) && (
              <div className="absolute left-3 top-3">
                <ProductBadges
                  size="sm"
                  badges={[
                    ...(product.badges ?? []),
                    ...(discount && !product.badges?.some((b) => b.kind === 'descuento')
                      ? [{ kind: 'descuento' as const, label: `-${discount}%` }]
                      : []),
                  ]}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-neutral-900">{product.name}</h3>
              <p className="mt-1 text-[13px] text-neutral-500">{product.shortDescription}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-neutral-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-[13px] text-neutral-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {[...groupedVariants.entries()].map(([axis, items]) => (
              <div key={axis} className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  {axis === 'talla'
                    ? 'Talla'
                    : axis === 'color'
                      ? 'Color'
                      : axis === 'sabor'
                        ? 'Sabor'
                        : axis === 'presentacion'
                          ? 'Presentación'
                          : 'Variante'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {items.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.available}
                      onClick={() => setSelectedVariant(v)}
                      className={`min-w-[2.5rem] rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        selectedVariant?.id === v.id
                          ? 'border-oc-red bg-oc-red text-white'
                          : v.available
                            ? 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500'
                            : 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 line-through'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Cantidad
              </span>
              <div className="inline-flex items-center rounded-full border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 text-neutral-700 hover:text-oc-red"
                  aria-label="Disminuir"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-9 w-9 text-neutral-700 hover:text-oc-red"
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>
            </div>

            {feedback && (
              <p
                className={`text-[12px] ${
                  feedback.startsWith('Agregado') ? 'text-emerald-600' : 'text-rose-600'
                }`}
                role="status"
              >
                {feedback}
              </p>
            )}

            <div className="mt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-wider transition-colors ${
                  product.inStock
                    ? 'bg-neutral-900 text-white hover:bg-oc-red'
                    : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                }`}
              >
                {product.inStock ? 'Añadir al carrito' : 'Agotado'}
              </button>
              <Link
                to={`/tienda/producto/${product.slug}`}
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-neutral-800 hover:border-neutral-500"
              >
                Ver detalle completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
