import type { StoreCategory } from '../types/store'
import { CATEGORIA_COVER } from './tiendaAssets'

/**
 * Catálogo de categorías comerciales.
 * Los covers usan los paneles en `public/tienda/imagenes/categorias/`
 * (copiados desde `src/tienda/Imágenes/`).
 */
export const CATEGORIES: StoreCategory[] = [
  {
    slug: 'ropa',
    name: 'Ropa deportiva',
    tagline: 'Hecho para entrenar duro y verse limpio fuera del gimnasio.',
    cover: CATEGORIA_COVER.ropa,
    order: 1,
  },
  {
    slug: 'joyeria',
    name: 'Joyería & accesorios',
    tagline: 'Piezas en acero y plata con el sello OC.',
    cover: CATEGORIA_COVER.joyeria,
    order: 2,
  },
  {
    slug: 'suplementos',
    name: 'Suplementos',
    tagline:
      'Selección comercial para acompañar tu entrenamiento. Consulta uso e indicaciones con un profesional.',
    cover: CATEGORIA_COVER.suplementos,
    order: 3,
  },
  {
    slug: 'peluches',
    name: 'Peluches',
    tagline: 'Mascotas oficiales y figuras coleccionables.',
    cover: CATEGORIA_COVER.peluches,
    order: 4,
  },
  {
    slug: 'merch',
    name: 'Merch oficial',
    tagline: 'Merchandising oficial OC-CALISTHENICS.',
    cover: CATEGORIA_COVER.merch,
    order: 5,
  },
  {
    slug: 'entrenamiento',
    name: 'Entrenamiento',
    tagline: 'Bandas, lastres, agarres y herramientas de progreso.',
    cover: CATEGORIA_COVER.entrenamiento,
    order: 6,
  },
  {
    slug: 'recovery',
    name: 'Recovery',
    tagline: 'Movilidad, descanso activo y bienestar entre sesiones.',
    cover: CATEGORIA_COVER.recovery,
    order: 7,
  },
  {
    slug: 'promo',
    name: 'Promocionales',
    tagline: 'Ediciones especiales y artículos promocionales.',
    cover: CATEGORIA_COVER.promo,
    order: 8,
  },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<StoreCategory['slug'], StoreCategory>
