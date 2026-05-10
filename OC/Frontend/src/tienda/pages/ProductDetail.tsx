import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { findProductBySlug, PRODUCTS } from '../data/products'
import { CATEGORY_BY_SLUG } from '../data/categories'
import { formatCurrency, discountPercent } from '../utils/formatCurrency'
import { useCart } from '../context/CartContext'
import ProductGallery from '../components/ProductGallery'
import ProductBadges from '../components/ProductBadges'
import ProductGrid from '../components/ProductGrid'
import type { ProductVariant } from '../types/store'
import type { StoreOutletContext } from '../layout/StoreLayout'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addProduct } = useCart()
  const { openCart } = useOutletContext<StoreOutletContext>()

  const product = useMemo(() => (slug ? findProductBySlug(slug) : undefined), [slug])

  const firstAvailable = useMemo(
    () => product?.variants?.find((v) => v.available),
    [product],
  )
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    firstAvailable,
  )
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setSelectedVariant(firstAvailable)
    setQuantity(1)
    setFeedback(null)
  }, [firstAvailable, product?.id])

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
          Producto no encontrado
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-neutral-900">
          No tenemos ese producto disponible.
        </h1>
        <p className="mt-2 text-neutral-500">
          Es posible que el enlace haya cambiado o el producto haya salido del catálogo.
        </p>
        <button
          type="button"
          onClick={() => navigate('/tienda/catalogo')}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-oc-red px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
        >
          Volver al catálogo
        </button>
      </section>
    )
  }

  const groupedVariants = new Map<ProductVariant['axis'], ProductVariant[]>()
  product.variants?.forEach((v) => {
    const arr = groupedVariants.get(v.axis) ?? []
    arr.push(v)
    groupedVariants.set(v.axis, arr)
  })

  const requiresVariantSelection =
    (product.variants?.length ?? 0) > 0 && !selectedVariant
  const discount = discountPercent(product.price, product.compareAtPrice)
  const category = CATEGORY_BY_SLUG[product.category]
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4)

  const handleAdd = (openDrawer = false) => {
    if (!product.inStock) return
    if (requiresVariantSelection) {
      setFeedback('Selecciona una variante para continuar.')
      return
    }
    addProduct(product, { variant: selectedVariant, quantity })
    setFeedback('Agregado al carrito.')
    if (openDrawer) openCart()
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-neutral-500">
          <Link to="/tienda" className="hover:text-oc-red">Tienda</Link>
          <span>/</span>
          <Link to="/tienda/catalogo" className="hover:text-oc-red">Catálogo</Link>
          <span>/</span>
          <Link to={`/tienda/catalogo?categoria=${product.category}`} className="hover:text-oc-red">
            {category?.name}
          </Link>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery cover={product.cover} gallery={product.gallery} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <ProductBadges
                badges={[
                  ...(product.badges ?? []),
                  ...(discount && !product.badges?.some((b) => b.kind === 'descuento')
                    ? [{ kind: 'descuento' as const, label: `-${discount}%` }]
                    : []),
                ]}
              />
              <h1 className="font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-[15px] leading-relaxed text-neutral-600">
                {product.shortDescription}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-[14px] text-neutral-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {discount && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-900">
                  Ahorra {discount}%
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
                      className={`min-w-[2.75rem] rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
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
                  className="h-10 w-10 text-neutral-700 hover:text-oc-red"
                  aria-label="Disminuir"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-10 w-10 text-neutral-700 hover:text-oc-red"
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

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => handleAdd(false)}
                disabled={!product.inStock}
                className={`flex-1 inline-flex items-center justify-center rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-wider transition-colors ${
                  product.inStock
                    ? 'bg-neutral-900 text-white hover:bg-oc-red'
                    : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                }`}
              >
                {product.inStock ? 'Añadir al carrito' : 'Agotado'}
              </button>
              <button
                type="button"
                onClick={() => handleAdd(true)}
                disabled={!product.inStock}
                className="flex-1 inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-neutral-800 transition-colors hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Revisar en carrito
              </button>
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <ul className="mt-2 space-y-1.5 rounded-2xl border border-neutral-200 bg-white p-4">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[13px] text-neutral-700">
                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-oc-red" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-2 rounded-2xl bg-neutral-100 p-4 text-[13px] leading-relaxed text-neutral-700">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Descripción
              </p>
              <p className="mt-2">{product.longDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
            <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
                  Relacionados
                </p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  También te puede gustar
                </h2>
              </div>
              <Link
                to={`/tienda/catalogo?categoria=${product.category}`}
                className="text-[12px] font-bold uppercase tracking-wider text-neutral-700 hover:text-oc-red"
              >
                Ver más en {category?.name} →
              </Link>
            </header>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  )
}
