import type { StoreCategory } from '../types/store'
import { CATEGORIA_COVER } from './tiendaAssets'

/** Solo se comercializan equipo de gimnasio y suplementos en el catálogo. */
export const CATEGORIES: StoreCategory[] = [
  {
    slug: 'entrenamiento',
    name: 'Equipamiento',
    tagline: 'Máquinas, poleas, bandas, barras y accesorios de entrenamiento. Solicita cotización.',
    cover: CATEGORIA_COVER.entrenamiento,
    order: 1,
  },
  {
    slug: 'suplementos',
    name: 'Suplementos',
    tagline: 'Productos de nutrición deportiva, sujetos a disponibilidad e información del fabricante.',
    cover: CATEGORIA_COVER.suplementos,
    order: 2,
  },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<StoreCategory['slug'], StoreCategory>
