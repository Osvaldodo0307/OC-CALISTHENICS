import type { CatalogFilters, SortKey } from '../types/store'
import { CATEGORIES } from '../data/categories'

interface Props {
  filters: CatalogFilters
  onChange: (next: CatalogFilters) => void
  totalResults: number
  /** Rango global del catálogo, para mostrar hint en placeholder. */
  priceRange?: { min: number; max: number }
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'novedades', label: 'Novedades' },
  { value: 'precio-asc', label: 'Precio · menor' },
  { value: 'precio-desc', label: 'Precio · mayor' },
  { value: 'nombre-asc', label: 'Nombre · A→Z' },
]

export default function ProductFilters({ filters, onChange, totalResults, priceRange }: Props) {
  const update = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const placeholderMin = priceRange ? `Desde $${priceRange.min}` : 'Mín.'
  const placeholderMax = priceRange ? `Hasta $${priceRange.max}` : 'Máx.'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Buscar productos, marcas, sabores…"
            className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 pl-10 text-sm text-neutral-900 outline-none transition-colors focus:border-oc-red focus:bg-white"
            aria-label="Buscar productos"
          />
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
            />
          </svg>
        </div>

        <select
          aria-label="Ordenar"
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value as SortKey)}
          className="rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 outline-none transition-colors focus:border-oc-red"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => update('category', 'todas')}
          className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
            filters.category === 'todas'
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => update('category', c.slug)}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              filters.category === c.slug
                ? 'border-oc-red bg-oc-red text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[12px] text-neutral-700">
          <label className="font-semibold uppercase tracking-wider text-neutral-500">
            Precio
          </label>
          <input
            type="number"
            min={0}
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              update('minPrice', e.target.value === '' ? undefined : Number(e.target.value))
            }
            placeholder={placeholderMin}
            className="w-24 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-oc-red"
          />
          <span className="text-neutral-400">—</span>
          <input
            type="number"
            min={0}
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              update('maxPrice', e.target.value === '' ? undefined : Number(e.target.value))
            }
            placeholder={placeholderMax}
            className="w-24 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-oc-red"
          />
        </div>

        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-neutral-700">
          <input
            type="checkbox"
            checked={filters.onlyInStock}
            onChange={(e) => update('onlyInStock', e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-oc-red focus:ring-oc-red"
          />
          Solo en stock
        </label>

        <span className="text-[12px] text-neutral-500">
          {totalResults} {totalResults === 1 ? 'producto' : 'productos'}
        </span>
      </div>
    </div>
  )
}
