import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import ProductFilters from '../components/ProductFilters'
import CategoryNav from '../components/CategoryNav'
import EmptyState from '../components/EmptyState'
import ProductQuickView from '../components/ProductQuickView'
import { PRODUCTS } from '../data/products'
import { CATEGORY_BY_SLUG } from '../data/categories'
import { applyCatalogFilters, getPriceRange } from '../utils/productFilters'
import type {
  CatalogFilters,
  Product,
  StoreCategorySlug,
} from '../types/store'

const CATEGORY_SLUGS: StoreCategorySlug[] = [
  'ropa',
  'joyeria',
  'suplementos',
  'peluches',
  'merch',
  'entrenamiento',
  'recovery',
  'promo',
]

function isStoreCategory(value: string | null): value is StoreCategorySlug {
  return !!value && (CATEGORY_SLUGS as string[]).includes(value)
}

export default function StoreCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('categoria')
  const initialQuery = searchParams.get('q') ?? ''

  const [filters, setFilters] = useState<CatalogFilters>(() => ({
    search: initialQuery,
    category: isStoreCategory(initialCategory) ? initialCategory : 'todas',
    onlyInStock: false,
    sort: 'destacados',
  }))

  const [quickView, setQuickView] = useState<Product | null>(null)

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (filters.category === 'todas') {
      next.delete('categoria')
    } else {
      next.set('categoria', filters.category)
    }
    if (filters.search.trim().length > 0) {
      next.set('q', filters.search.trim())
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.search])

  const priceRange = useMemo(() => getPriceRange(PRODUCTS), [])

  const filtered = useMemo(() => applyCatalogFilters(PRODUCTS, filters), [filters])

  const categoryMeta =
    filters.category !== 'todas' ? CATEGORY_BY_SLUG[filters.category] : null

  return (
    <>
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
          <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-neutral-500">
            <Link to="/tienda" className="hover:text-oc-red">Tienda</Link>
            <span>/</span>
            <Link to="/tienda/catalogo" className="hover:text-oc-red">Catálogo</Link>
            {categoryMeta && (
              <>
                <span>/</span>
                <span className="text-neutral-900">{categoryMeta.name}</span>
              </>
            )}
          </nav>

          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {categoryMeta ? categoryMeta.name : 'Catálogo completo'}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-neutral-500">
            {categoryMeta
              ? categoryMeta.tagline
              : 'Explora todos los artículos oficiales OC. Filtra por categoría, precio y disponibilidad.'}
          </p>

          <div className="mt-5">
            <CategoryNav variant="pills" activeSlug={categoryMeta?.slug} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            totalResults={filtered.length}
            priceRange={priceRange}
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="No encontramos productos"
              message="Ajusta los filtros o limpia la búsqueda para ver más resultados."
              action={
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      search: '',
                      category: 'todas',
                      onlyInStock: false,
                      sort: 'destacados',
                    })
                  }
                  className="inline-flex items-center justify-center rounded-full bg-oc-red px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
                >
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <ProductGrid products={filtered} onQuickView={setQuickView} />
          )}
        </div>
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
