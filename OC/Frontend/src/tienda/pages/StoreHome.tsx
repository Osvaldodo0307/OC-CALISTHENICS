import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import CategoryNav from '../components/CategoryNav'
import StoreTrustBar from '../components/StoreTrustBar'
import StoreCertifications from '../components/StoreCertifications'
import ProductGrid from '../components/ProductGrid'
import StoreCTA from '../components/StoreCTA'
import StoreFeaturePacks from '../components/StoreFeaturePacks'
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
    <div className="oc-store-stitch bg-[#060606] text-white">
      <StoreHero />
      <div className="border-b border-oc-red/35 bg-[#1b1213] px-4 py-3 text-center text-[12px] leading-relaxed text-white/80 sm:px-6">
        <strong>Catálogo en actualización.</strong> Los artículos mostrados son referencia; disponibilidad, tallas y
        entrega se confirman con el equipo OC por WhatsApp.
      </div>
      <StoreTrustBar />
      <StoreCertifications />
      <StoreFeaturePacks />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
              Por categoría
            </p>
            <h2 className="font-hero text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
              Encuentra lo tuyo
            </h2>
          </div>
          <Link
            to="/tienda/catalogo"
            className="text-[12px] font-bold uppercase tracking-wider text-white/75 hover:text-oc-red"
          >
            Ver todo →
          </Link>
        </header>
        <CategoryNav />
      </section>

      <section className="border-y border-white/10 bg-[#0c0c0c]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
                Destacados
              </p>
              <h2 className="font-hero text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
                Referencia de catálogo
              </h2>
            </div>
            <Link
              to="/tienda/catalogo"
              className="text-[12px] font-bold uppercase tracking-wider text-white/75 hover:text-oc-red"
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
              <h2 className="font-hero text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
                Nuevos drops
              </h2>
            </div>
          </header>
          <ProductGrid products={newDrops} onQuickView={setQuickView} maxCols={4} />
        </section>
      )}

      <StoreCTA />

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
