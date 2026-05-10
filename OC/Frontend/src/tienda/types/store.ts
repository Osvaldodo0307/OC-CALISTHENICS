/**
 * Tipos base del módulo TIENDA OC.
 *
 * Este módulo es independiente del resto de la app (gimnasio / membresías).
 * No comparte tipos con `src/types.ts` para evitar acoplamientos.
 *
 * Fuente de verdad de productos: `src/tienda/data/products.ts`
 */

/** Categorías comerciales soportadas en la primera versión. */
export type StoreCategorySlug =
  | 'ropa'
  | 'joyeria'
  | 'suplementos'
  | 'peluches'
  | 'merch'
  | 'entrenamiento'
  | 'recovery'
  | 'promo'

/** Línea editorial de un producto: dispara estilos visuales en el badge. */
export type ProductBadgeKind =
  | 'nuevo'
  | 'best-seller'
  | 'edicion-limitada'
  | 'descuento'
  | 'agotado'
  | 'pre-venta'

export interface ProductBadge {
  kind: ProductBadgeKind
  label?: string
}

/**
 * Variante de producto (talla, sabor, color).
 * Si un producto no maneja variantes, se omite el array.
 */
export interface ProductVariant {
  id: string
  /** Etiqueta legible: "M", "Vainilla", "Negro" */
  label: string
  /** Tipo lógico para agrupar selectores en la ficha de producto. */
  axis: 'talla' | 'color' | 'sabor' | 'presentacion' | 'otro'
  /** Stock simulado para UX (no es inventario real todavía). */
  available: boolean
}

export interface ProductImage {
  src: string
  alt: string
}

export interface Product {
  id: string
  /** Slug único usado en la URL: /tienda/producto/:slug */
  slug: string
  name: string
  /** Texto corto para tarjetas. */
  shortDescription: string
  /** Texto largo para la ficha de producto. */
  longDescription: string
  /** Precio base en MXN (centavos NO; valor entero o con decimales). */
  price: number
  /** Precio anterior si está en descuento (MXN). */
  compareAtPrice?: number
  currency: 'MXN'
  category: StoreCategorySlug
  /** Etiquetas libres para filtros y búsqueda. */
  tags: string[]
  /** Imagen principal usada en tarjetas. */
  cover: ProductImage
  /** Galería para la ficha de producto. */
  gallery?: ProductImage[]
  variants?: ProductVariant[]
  /** Stock global simulado. Si false → muestra "Agotado". */
  inStock: boolean
  badges?: ProductBadge[]
  /** Atributos largos: ingredientes, materiales, cuidado, etc. */
  highlights?: string[]
  /** Metadata SEO básica para futuras integraciones. */
  seo?: {
    title?: string
    description?: string
  }
}

export interface StoreCategory {
  slug: StoreCategorySlug
  name: string
  /** Frase corta de marketing para hero/sección. */
  tagline: string
  /** Imagen de portada para CategoryNav y catálogos. */
  cover: string
  /** Orden de aparición en navegación. */
  order: number
}

/* ─────────── Carrito ─────────── */

export interface CartLine {
  /** Identificador estable de la línea (productId + variantId). */
  lineId: string
  productId: string
  productSlug: string
  name: string
  unitPrice: number
  quantity: number
  cover: ProductImage
  variant?: {
    id: string
    label: string
    axis: ProductVariant['axis']
  }
}

export interface CartTotals {
  subtotal: number
  shipping: number
  discount: number
  total: number
  itemCount: number
}

/* ─────────── Filtros catálogo ─────────── */

export type SortKey =
  | 'destacados'
  | 'precio-asc'
  | 'precio-desc'
  | 'nombre-asc'
  | 'novedades'

export interface CatalogFilters {
  search: string
  category: StoreCategorySlug | 'todas'
  minPrice?: number
  maxPrice?: number
  onlyInStock: boolean
  sort: SortKey
}
