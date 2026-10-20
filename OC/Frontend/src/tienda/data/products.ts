import type { Product } from '../types/store'
import { productCoverSrc } from './tiendaAssets'

/** Imagen de producto: archivo `src/tienda/imagenes/productos/<slug>.*` o placeholder. */
function pc(slug: string, alt: string) {
  return { src: productCoverSrc(slug), alt }
}

/**
 * Catálogo ilustrativo de OC-STORE: únicamente equipamiento y suplementos.
 *
 * Datos demo, sujetos a confirmación de existencia, precio y disponibilidad antes de comercializar.
 * Cómo agregar / editar productos: ver `src/tienda/docs/PRODUCT_UPLOAD_GUIDE.md`.
 *
 * Reglas mínimas para mantener la UI consistente:
 *  - `slug` único, kebab-case.
 *  - `cover.alt` siempre descriptivo (accesibilidad + SEO).
 *  - Si `compareAtPrice` está presente, debe ser MAYOR que `price`.
 *  - Si `inStock = false`, agregar badge `agotado` para reforzar la UX.
 */
export const PRODUCTS: Product[] = [
  {
      id: 'oc-whey-iso-vainilla',
      slug: 'whey-iso-vainilla',
      name: 'Whey Isolate OC — Vainilla',
      shortDescription: 'Aislado de suero con proteína por porción según etiqueta; sin lactosa.',
      longDescription:
        'Aislado microfiltrado; la información nutrimental por porción (proteína, carbohidratos, etc.) aparece en el empaque oficial. Endulzado con sucralosa. Sabor vainilla. Los suplementos no sustituyen una alimentación variada; ante dudas de salud, consulta a un médico o nutriólogo.',
      price: 1290,
      currency: 'MXN',
      category: 'suplementos',
      tags: ['proteina', 'whey', 'isolate'],
      cover: pc('whey-iso-vainilla', 'Whey Isolate OC sabor vainilla'),
      variants: [
        { id: '1kg', label: '1 kg', axis: 'presentacion', available: true },
        { id: '2kg', label: '2 kg', axis: 'presentacion', available: true },
      ],
      inStock: true,
      badges: [{ kind: 'best-seller' }],
      highlights: ['Consulta datos en etiqueta', 'Sin lactosa', 'Microfiltrado'],
    },
  {
      id: 'oc-creatina-mono',
      slug: 'creatina-monohidratada',
      name: 'Creatina Monohidratada OC',
      shortDescription: 'Creapure® micronizada; porción sugerida según empaque.',
      longDescription:
        'Creapure® micronizada de origen alemán. Sin sabor, pensada para mezclarse en bebidas. Sigue las indicaciones del fabricante en el empaque. No está destinada a diagnosticar, tratar, curar ni prevenir enfermedades.',
      price: 690,
      currency: 'MXN',
      category: 'suplementos',
      tags: ['creatina', 'fuerza'],
      cover: pc('creatina-monohidratada', 'Creatina monohidratada OC'),
      inStock: true,
      badges: [{ kind: 'nuevo' }],
      highlights: ['Creapure®', 'Sin sabor', 'Mezcla en líquidos'],
    },
  {
      id: 'oc-pre-workout-tropical',
      slug: 'pre-workout-tropical',
      name: 'Pre-Workout OC — Tropical',
      shortDescription: 'Bebida en polvo con cafeína e ingredientes habituales en pre-entreno.',
      longDescription:
        'Fórmula con cafeína e ingredientes típicos de categoría pre-entreno; los valores exactos figuran en el empaque. No apta para menores ni personas sensibles a estimulantes sin orientación profesional. Consulta a un médico si tienes condiciones cardiovasculares o tomas medicamentos.',
      price: 990,
      currency: 'MXN',
      category: 'suplementos',
      tags: ['preworkout', 'cafeina'],
      cover: pc('pre-workout-tropical', 'Pre-workout OC tropical'),
      inStock: false,
      badges: [{ kind: 'agotado' }],
    },
  {
      id: 'oc-bandas-resistencia',
      slug: 'bandas-resistencia-set',
      name: 'Set de Bandas de Resistencia',
      shortDescription: '5 niveles de resistencia para asistencia y progreso.',
      longDescription:
        'Set de 5 bandas en látex natural con resistencias de 5 a 50 kg. Ideales para muscle-up, dominadas asistidas, prehab y movilidad.',
      price: 590,
      compareAtPrice: 790,
      currency: 'MXN',
      category: 'entrenamiento',
      tags: ['bandas', 'progreso'],
      cover: pc('bandas-resistencia-set', 'Set de bandas de resistencia OC'),
      inStock: true,
      badges: [{ kind: 'descuento', label: '-25%' }],
      highlights: ['Látex natural', 'Resistencias 5–50 kg', 'Bolsa incluida'],
    },
  {
      id: 'oc-grips-calistenia',
      slug: 'grips-calistenia',
      name: 'Grips de Calistenia OC',
      shortDescription: 'Grips de cuero para barra fija y anillas.',
      longDescription:
        'Cuero curtido natural con costura doble. Velcro reforzado de 3 capas. Pensados para sesiones de alto volumen sin abrir piel.',
      price: 390,
      currency: 'MXN',
      category: 'entrenamiento',
      tags: ['grips', 'calistenia'],
      cover: pc('grips-calistenia', 'Grips de calistenia OC'),
      inStock: true,
      badges: [{ kind: 'nuevo' }],
    },
]

/** Devuelve el producto por slug, o `undefined` si no existe. */
export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}
