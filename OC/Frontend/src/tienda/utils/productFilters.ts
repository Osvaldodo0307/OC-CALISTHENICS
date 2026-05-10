import type { CatalogFilters, Product, SortKey } from '../types/store'

/**
 * Aplica búsqueda + filtros + orden a un arreglo de productos.
 * Pura: no muta el input. Pensada para usarse con `useMemo`.
 */
export function applyCatalogFilters(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  const term = filters.search.trim().toLowerCase()

  let result = products.filter((p) => {
    if (filters.category !== 'todas' && p.category !== filters.category) return false
    if (filters.onlyInStock && !p.inStock) return false
    if (typeof filters.minPrice === 'number' && p.price < filters.minPrice) return false
    if (typeof filters.maxPrice === 'number' && p.price > filters.maxPrice) return false
    if (term.length === 0) return true

    const haystack = [p.name, p.shortDescription, p.longDescription, ...(p.tags ?? [])]
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })

  result = sortProducts(result, filters.sort)
  return result
}

/** Orden estable según la clave seleccionada. */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const arr = [...products]
  switch (sort) {
    case 'precio-asc':
      return arr.sort((a, b) => a.price - b.price)
    case 'precio-desc':
      return arr.sort((a, b) => b.price - a.price)
    case 'nombre-asc':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    case 'novedades':
      return arr.sort((a, b) => weightNew(b) - weightNew(a))
    case 'destacados':
    default:
      return arr.sort((a, b) => weightFeatured(b) - weightFeatured(a))
  }
}

function weightFeatured(p: Product): number {
  let w = 0
  if (p.badges?.some((b) => b.kind === 'best-seller')) w += 4
  if (p.badges?.some((b) => b.kind === 'edicion-limitada')) w += 2
  if (p.badges?.some((b) => b.kind === 'descuento')) w += 1
  if (!p.inStock) w -= 5
  return w
}

function weightNew(p: Product): number {
  if (p.badges?.some((b) => b.kind === 'nuevo')) return 2
  if (p.badges?.some((b) => b.kind === 'pre-venta')) return 1
  return 0
}

/** Rango global de precios del catálogo (útil para el slider de filtros). */
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 }
  let min = Infinity
  let max = -Infinity
  for (const p of products) {
    if (p.price < min) min = p.price
    if (p.price > max) max = p.price
  }
  return { min: Math.floor(min), max: Math.ceil(max) }
}
