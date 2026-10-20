import type { StoreCategorySlug } from '../types/store'

/**
 * Rutas públicas bajo `public/tienda/imagenes/` (sirven como `/tienda/imagenes/...`).
 *
 * Categorías: paneles en `public/tienda/imagenes/categorias/` (copia normalizada desde
 * `src/tienda/Imágenes/`).
 *
 * Productos: coloca `<slug>.png|jpg|jpeg|webp` en `src/tienda/imagenes/productos/`.
 * Si no hay archivo para ese slug, se usa el placeholder SVG en público.
 */

export const PRODUCTO_IMAGEN_PENDIENTE = '/tienda/imagenes/pendiente.svg'

export const TIENDA_HERO_PRINCIPAL = '/tienda/stitch2026/equipamiento-stitch.webp'
export const TIENDA_HERO_EDITORIAL = '/tienda/stitch2026/ropa-stitch.webp'

/** Cover/banner para la tarjeta de Certificaciones en el home (en `public/tienda/imagenes/certificaciones/banner.png`). */
export const CERTIFICACIONES_BANNER = '/tienda/imagenes/certificaciones/banner.png'

/** Cover de categoría (paneles). */
export const CATEGORIA_COVER: Record<StoreCategorySlug, string> = {
  ropa: '/tienda/stitch2026/ropa-stitch.webp',
  joyeria: '/tienda/imagenes/categorias/joyeria.png',
  suplementos: '/tienda/stitch2026/suplementos-stitch.webp',
  peluches: '/tienda/imagenes/categorias/peluches.png',
  merch: '/tienda/imagenes/categorias/merch.png',
  entrenamiento: '/tienda/stitch2026/equipamiento-stitch.webp',
  recovery: '/tienda/stitch2026/recovery-stitch.webp',
  promo: '/tienda/imagenes/categorias/promo.png',
}

const productImageModules = import.meta.glob<string>(
  '../imagenes/productos/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' },
)

function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? ''
  return file.replace(/\.(png|jpg|jpeg|webp)$/i, '')
}

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {}
for (const [path, url] of Object.entries(productImageModules)) {
  PRODUCT_IMAGE_BY_SLUG[slugFromPath(path)] = url
}

export function productCoverSrc(slug: string): string {
  return PRODUCT_IMAGE_BY_SLUG[slug] ?? PRODUCTO_IMAGEN_PENDIENTE
}
