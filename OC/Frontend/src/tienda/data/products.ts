import type { Product } from '../types/store'
import { productCoverSrc } from './tiendaAssets'

/** Imagen de producto: archivo `src/tienda/imagenes/productos/<slug>.*` o placeholder. */
function pc(slug: string, alt: string) {
  return { src: productCoverSrc(slug), alt }
}

/**
 * Catálogo seed de productos OC.
 *
 * Estos productos son demo/prototipo para validar diseño y flujo.
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
    id: 'oc-hoodie-elite-black',
    slug: 'hoodie-elite-black',
    name: 'Hoodie Elite OC — Negro',
    shortDescription: 'Sudadera oversized con fleece premium y bordado OC.',
    longDescription:
      'Hoodie de corte oversized en fleece de 480 gsm, con bordado OC en pecho y refuerzo en costuras. Diseñada para sesiones largas y para llevarla todos los días sin perder forma.',
    price: 1290,
    compareAtPrice: 1490,
    currency: 'MXN',
    category: 'ropa',
    tags: ['hoodie', 'oversize', 'lifestyle'],
    cover: pc('hoodie-elite-black', 'Hoodie Elite OC negro'),
    gallery: [
      pc('hoodie-elite-black', 'Hoodie Elite OC — foto adicional pendiente'),
    ],
    variants: [
      { id: 's', label: 'S', axis: 'talla', available: true },
      { id: 'm', label: 'M', axis: 'talla', available: true },
      { id: 'l', label: 'L', axis: 'talla', available: true },
      { id: 'xl', label: 'XL', axis: 'talla', available: false },
    ],
    inStock: true,
    badges: [{ kind: 'best-seller' }, { kind: 'descuento', label: '-13%' }],
    highlights: [
      'Fleece 480 gsm con interior cepillado',
      'Bordado OC resistente a lavados intensos',
      'Cordón con herraje metálico',
    ],
    seo: {
      title: 'Hoodie Elite OC | Tienda OC-CALISTHENICS',
      description: 'Sudadera oversize de fleece premium con bordado OC.',
    },
  },
  {
    id: 'oc-tee-club-white',
    slug: 'tee-club-white',
    name: 'Playera Club OC — Blanco',
    shortDescription: 'Playera oversize 100% algodón peinado con print OC.',
    longDescription:
      'Algodón peinado 220 gsm, corte oversize, hombro caído. Print OC de alta densidad con tinta plastisol elástica de larga duración.',
    price: 590,
    currency: 'MXN',
    category: 'ropa',
    tags: ['playera', 'tee', 'lifestyle'],
    cover: pc('tee-club-white', 'Playera Club OC blanca'),
    variants: [
      { id: 's', label: 'S', axis: 'talla', available: true },
      { id: 'm', label: 'M', axis: 'talla', available: true },
      { id: 'l', label: 'L', axis: 'talla', available: true },
      { id: 'xl', label: 'XL', axis: 'talla', available: true },
    ],
    inStock: true,
    badges: [{ kind: 'nuevo' }],
    highlights: ['Algodón peinado 220 gsm', 'Print plastisol de alta densidad'],
  },
  {
    id: 'oc-short-perform-red',
    slug: 'short-perform-red',
    name: 'Short Performance OC — Rojo',
    shortDescription: 'Short técnico con tejido stretch y bolsillo trasero seguro.',
    longDescription:
      'Tejido stretch 4-way con secado rápido. Pretina elástica con cordón antitorsión. Bolsillo trasero con cierre invisible para llaves o tarjeta.',
    price: 690,
    currency: 'MXN',
    category: 'ropa',
    tags: ['short', 'training', 'performance'],
    cover: pc('short-perform-red', 'Short Performance OC rojo'),
    variants: [
      { id: 's', label: 'S', axis: 'talla', available: true },
      { id: 'm', label: 'M', axis: 'talla', available: true },
      { id: 'l', label: 'L', axis: 'talla', available: false },
    ],
    inStock: true,
    badges: [{ kind: 'best-seller' }],
    highlights: ['Tejido stretch 4-way', 'Bolsillo seguro en zipper'],
  },
  {
    id: 'oc-leggings-power-black',
    slug: 'leggings-power-black',
    name: 'Leggings Power OC — Negro',
    shortDescription: 'Leggings de compresión técnica con cintura alta moldeadora.',
    longDescription:
      'Compresión gradual con poliamida de alta tenacidad. Cintura alta de 5 pulgadas con bolsillo interior para tarjeta. No transparenta en sentadilla.',
    price: 890,
    currency: 'MXN',
    category: 'ropa',
    tags: ['leggings', 'mujer', 'training'],
    cover: pc('leggings-power-black', 'Leggings Power OC negros'),
    variants: [
      { id: 'xs', label: 'XS', axis: 'talla', available: true },
      { id: 's', label: 'S', axis: 'talla', available: true },
      { id: 'm', label: 'M', axis: 'talla', available: true },
      { id: 'l', label: 'L', axis: 'talla', available: true },
    ],
    inStock: true,
    highlights: ['Squat-proof', 'Cintura alta moldeadora', 'Bolsillo interior'],
  },
  {
    id: 'oc-cap-strap-back',
    slug: 'cap-strap-back',
    name: 'Gorra OC Strap Back',
    shortDescription: 'Gorra estructurada con bordado 3D y broche metálico.',
    longDescription:
      'Six-panel estructurada, bordado 3D del logo OC y broche metálico ajustable. Material premium tipo deadstock con textura suave.',
    price: 490,
    currency: 'MXN',
    category: 'ropa',
    tags: ['gorra', 'lifestyle'],
    cover: pc('cap-strap-back', 'Gorra OC negra con bordado'),
    inStock: true,
    badges: [{ kind: 'nuevo' }],
  },
  {
    id: 'oc-cadena-oc-steel',
    slug: 'cadena-oc-steel',
    name: 'Cadena OC — Acero inoxidable 316L',
    shortDescription: 'Eslabón cubano de 6 mm con dije OC en acero inoxidable 316L.',
    longDescription:
      'Acero inoxidable 316L, material habitual en joyería, resistente al uso diario y al sudor. Eslabón cubano 6 mm, 60 cm de largo, dije OC con grabado láser.',
    price: 990,
    compareAtPrice: 1190,
    currency: 'MXN',
    category: 'joyeria',
    tags: ['cadena', 'acero', 'unisex'],
    cover: pc('cadena-oc-steel', 'Cadena OC en acero inoxidable'),
    inStock: true,
    badges: [{ kind: 'edicion-limitada' }, { kind: 'descuento', label: '-17%' }],
    highlights: ['Acero 316L', 'Resistente a sudor y agua', 'Dije con grabado láser'],
  },
  {
    id: 'oc-anillo-signet',
    slug: 'anillo-signet',
    name: 'Anillo Signet OC',
    shortDescription: 'Anillo signet con sello OC en acero pulido.',
    longDescription:
      'Anillo unisex inspirado en piezas signet clásicas, en acero pulido espejo con sello OC en relieve. Acabado premium para uso diario.',
    price: 690,
    currency: 'MXN',
    category: 'joyeria',
    tags: ['anillo', 'unisex'],
    cover: pc('anillo-signet', 'Anillo Signet OC en acero'),
    variants: [
      { id: '8', label: '8', axis: 'talla', available: true },
      { id: '9', label: '9', axis: 'talla', available: true },
      { id: '10', label: '10', axis: 'talla', available: true },
      { id: '11', label: '11', axis: 'talla', available: true },
    ],
    inStock: true,
  },
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
    id: 'oc-peluche-mascota',
    slug: 'peluche-mascota-oc',
    name: 'Peluche Mascota OC',
    shortDescription: 'Mascota oficial OC, 30 cm, edición Club.',
    longDescription:
      'Peluche de la mascota oficial OC en edición Club. Bordado en hocico y patches OC. Relleno hipoalergénico, 30 cm.',
    price: 390,
    currency: 'MXN',
    category: 'peluches',
    tags: ['peluche', 'coleccionable'],
    cover: pc('peluche-mascota-oc', 'Peluche Mascota OC'),
    inStock: true,
    badges: [{ kind: 'edicion-limitada' }],
  },
  {
    id: 'oc-tote-bag-canvas',
    slug: 'tote-bag-canvas',
    name: 'Tote Bag OC Canvas',
    shortDescription: 'Tote en canvas grueso para gym + diario.',
    longDescription:
      'Canvas 14 oz, asas reforzadas, bolsillo interno con zipper y print OC en pecho. Capacidad para laptop 15".',
    price: 290,
    currency: 'MXN',
    category: 'merch',
    tags: ['bolsa', 'canvas'],
    cover: pc('tote-bag-canvas', 'Tote bag OC canvas'),
    inStock: true,
  },
  {
    id: 'oc-bottle-shaker',
    slug: 'bottle-shaker',
    name: 'Shaker OC 700 ml',
    shortDescription: 'Shaker hermético con malla mezcladora.',
    longDescription:
      'PP libre de BPA, malla mezcladora de acero inoxidable, escala graduada en oz y ml. Tapa con seguro a presión.',
    price: 190,
    currency: 'MXN',
    category: 'merch',
    tags: ['shaker', 'gym'],
    cover: pc('bottle-shaker', 'Shaker OC 700 ml'),
    inStock: true,
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
  {
    id: 'oc-foam-roller',
    slug: 'foam-roller-pro',
    name: 'Foam Roller Pro OC',
    shortDescription: 'Roller texturizado de alta densidad para SMR.',
    longDescription:
      'EVA de alta densidad con textura para automasaje y apoyo en rutinas de movilidad. 33 cm; capacidad de carga según uso e indicaciones del fabricante.',
    price: 490,
    currency: 'MXN',
    category: 'recovery',
    tags: ['recovery', 'movilidad'],
    cover: pc('foam-roller-pro', 'Foam Roller Pro OC'),
    inStock: true,
  },
  {
    id: 'oc-massage-gun',
    slug: 'massage-gun-mini',
    name: 'Massage Gun Mini OC',
    shortDescription: 'Pistola de percusión portátil con 4 cabezales.',
    longDescription:
      'Motor brushless, varios niveles de intensidad y cabezales intercambiables. La autonomía de batería depende del nivel de uso; consulta especificaciones en el empaque del producto.',
    price: 1490,
    compareAtPrice: 1890,
    currency: 'MXN',
    category: 'recovery',
    tags: ['recovery', 'electronico'],
    cover: pc('massage-gun-mini', 'Massage gun mini OC'),
    inStock: true,
    badges: [{ kind: 'descuento', label: '-21%' }],
  },
  {
    id: 'oc-llavero-metal',
    slug: 'llavero-metal',
    name: 'Llavero Metálico OC',
    shortDescription: 'Llavero en zinc con esmaltado a mano.',
    longDescription:
      'Llavero de aleación de zinc con esmaltado a mano y argolla reforzada. Pieza promocional resistente al uso diario.',
    price: 90,
    currency: 'MXN',
    category: 'promo',
    tags: ['promo', 'accesorio'],
    cover: pc('llavero-metal', 'Llavero metálico OC'),
    inStock: true,
  },
]

/** Devuelve el producto por slug, o `undefined` si no existe. */
export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}
