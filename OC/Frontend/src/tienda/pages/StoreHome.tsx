import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import CategoryNav from '../components/CategoryNav'
import StoreTrustBar from '../components/StoreTrustBar'
import ProductGrid from '../components/ProductGrid'
import StoreCTA from '../components/StoreCTA'
import StoreFeaturePacks from '../components/StoreFeaturePacks'
import ProductQuickView from '../components/ProductQuickView'
import { PRODUCTS } from '../data/products'
import type { Product } from '../types/store'
import { buildWhatsAppHref } from '../../utils/whatsapp'

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
        <strong>Catálogo en actualización.</strong> Equipamiento y suplementos son productos de referencia; especificaciones, precios,
        disponibilidad y entrega se confirman con el equipo OC. Certificaciones por consulta.
      </div>
      <StoreTrustBar />
      <StoreFeaturePacks />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
              Por categoría
            </p>
            <h2 className="font-hero text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
              TRES LÍNEAS, UN OBJETIVO
            </h2>
          </div>
          <Link
            to="/tienda/catalogo"
            className="text-[12px] font-bold uppercase tracking-wider text-white/75 hover:text-oc-red"
          >
            Ver productos →
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
                Equipamiento y suplementos
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
                En revisión
              </p>
              <h2 className="font-hero text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
                Novedades del catálogo
              </h2>
            </div>
          </header>
          <ProductGrid products={newDrops} onQuickView={setQuickView} maxCols={4} />
        </section>
      )}

      <section className="border-y border-white/10 bg-[#101010] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-oc-red">Equipamiento para espacios deportivos</p>
            <h2 className="mt-2 font-hero text-3xl uppercase text-white">¿BUSCAS MÁQUINAS O POLEAS?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              Consulta alternativas para gimnasios, estudios y entrenamiento personal.
              Te apoyamos con una cotización según tipo de equipo, cantidades y entrega.
            </p>
          </div>
          <a
            href={buildWhatsAppHref('Hola OC-STORE, quiero solicitar una cotización de máquinas, poleas o equipamiento para gimnasio.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center bg-oc-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
          >
            Solicitar cotización →
          </a>
        </div>
      </section>

      <StoreCTA />

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
