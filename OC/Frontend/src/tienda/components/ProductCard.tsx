import { Link } from 'react-router-dom'
import type { Product } from '../types/store'
import { formatCurrency, discountPercent } from '../utils/formatCurrency'
import ProductBadges from './ProductBadges'
import { useCart } from '../context/CartContext'

interface Props {
  product: Product
  /**
   * Si el componente padre quiere abrir el QuickView en vez de añadir directo,
   * puede pasar `onQuickView`.
   */
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: Props) {
  const { addProduct } = useCart()
  const discount = discountPercent(product.price, product.compareAtPrice)
  const hasVariants = (product.variants?.length ?? 0) > 0

  const handlePrimaryAction = () => {
    if (!product.inStock) return
    if (hasVariants && onQuickView) {
      onQuickView(product)
      return
    }
    addProduct(product, { quantity: 1 })
  }

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.18)]"
      aria-label={product.name}
    >
      <Link
        to={`/tienda/producto/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100"
      >
        <img
          src={product.cover.src}
          alt={product.cover.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            const t = e.currentTarget
            t.style.objectFit = 'contain'
            t.style.background = '#f5f5f5'
          }}
        />
        {(product.badges?.length || discount) ? (
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
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
        ) : null}
        {!product.inStock && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 backdrop-blur-[1px]"
            aria-hidden
          >
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Agotado
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-h-[2.75rem]">
          <Link
            to={`/tienda/producto/${product.slug}`}
            className="line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-900 transition-colors hover:text-oc-red"
          >
            {product.name}
          </Link>
        </div>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-[12px] text-neutral-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="text-[17px] font-bold text-neutral-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!product.inStock}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors ${
              product.inStock
                ? 'bg-neutral-900 text-white hover:bg-oc-red'
                : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
            }`}
          >
            {product.inStock ? (hasVariants ? 'Elegir' : 'Añadir') : 'Agotado'}
          </button>
        </div>
      </div>
    </article>
  )
}
