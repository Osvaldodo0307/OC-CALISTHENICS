import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import CategoryNav from '../components/CategoryNav'
import StoreTrustBar from '../components/StoreTrustBar'
import StoreCertifications from '../components/StoreCertifications'
import ProductGrid from '../components/ProductGrid'
import StoreCTA from '../components/StoreCTA'
import ProductQuickView from '../components/ProductQuickView'
import { PRODUCTS } from '../data/products'
import type { Product } from '../types/store'

export default function StoreHome() {
  const [quickView, setQuickView] = useState<Product | null>(null)

  const featured = useMemo(
    () =>
      PRODUCTS.filter((p) =>
        p.badges?.some((b) => b.kind === 'best-seller' || b.kind === 'edicion-limitada'),
      ).slice(0, 8),
    [],
  )

  const newDrops = useMemo(
    () => PRODUCTS.filter((p) => p.badges?.some((b) => b.kind === 'nuevo')).slice(0, 4),
    [],
  )

  return (
    <>
      <StoreHero />
      <StoreTrustBar />
      <StoreCertifications />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
              Por categoría
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Encuentra lo tuyo
            </h2>
          </div>
          <Link
            to="/tienda/catalogo"
            className="text-[12px] font-bold uppercase tracking-wider text-neutral-700 hover:text-oc-red"
          >
            Ver todo →
          </Link>
        </header>
        <CategoryNav />
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
                Destacados
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Lo más vendido del mes
              </h2>
            </div>
            <Link
              to="/tienda/catalogo"
              className="text-[12px] font-bold uppercase tracking-wider text-neutral-700 hover:text-oc-red"
            >
              Ver catálogo →
            </Link>
          </header>
          <ProductGrid products={featured} onQuickView={setQuickView} />
        </div>
      </section>

      {newDrops.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
                Recién llegado
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Nuevos drops
              </h2>
            </div>
          </header>
          <ProductGrid products={newDrops} onQuickView={setQuickView} maxCols={4} />
        </section>
      )}

      <StoreCTA />

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
