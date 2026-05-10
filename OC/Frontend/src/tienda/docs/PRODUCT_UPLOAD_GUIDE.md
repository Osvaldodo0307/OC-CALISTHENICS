# Guía para cargar productos — Tienda OC

Esta tienda usa, en su versión MVP, un **catálogo estático en TypeScript**
ubicado en:

```
src/tienda/data/products.ts
```

Cuando integremos backend, este archivo se reemplazará por un fetch a la API
sin tocar la UI (los componentes ya consumen el tipo `Product`).

---

## 1. Anatomía de un producto

```ts
{
  id: 'oc-hoodie-elite-black',          // único, kebab-case
  slug: 'hoodie-elite-black',           // único, usado en /tienda/producto/:slug
  name: 'Hoodie Elite OC — Negro',
  shortDescription: '...',              // visible en tarjeta (1–2 líneas)
  longDescription: '...',               // visible en ficha de producto
  price: 1290,                          // entero o decimal en MXN
  compareAtPrice: 1490,                 // opcional; SIEMPRE > price
  currency: 'MXN',
  category: 'ropa',                     // slug de categoría existente
  tags: ['hoodie', 'oversize'],
  cover: { src: '/ruta.jpg', alt: '...' },
  gallery: [{ src: '/g1.jpg', alt: '...' }, ...],
  variants: [
    { id: 'm', label: 'M', axis: 'talla', available: true },
    ...
  ],
  inStock: true,
  badges: [{ kind: 'best-seller' }, { kind: 'descuento', label: '-13%' }],
  highlights: ['Fleece 480 gsm', 'Bordado OC'],
  seo: { title: '...', description: '...' },
}
```

---

## 2. Reglas obligatorias

1. **`id` y `slug` únicos.** Si subes dos productos con el mismo slug, el
   primero gana y el segundo queda inalcanzable.
2. **`slug` en kebab-case** y solo ASCII. Sin tildes, sin espacios, sin
   símbolos: `hoodie-elite-black`, no `Hoodie Élite Black`.
3. **`category` tiene que existir** en `src/tienda/data/categories.ts`.
   Categorías válidas hoy:
   `ropa`, `joyeria`, `suplementos`, `peluches`, `merch`, `entrenamiento`,
   `recovery`, `promo`.
4. **`compareAtPrice` debe ser mayor que `price`.** Si no hay descuento, omítelo.
5. **`cover.alt` siempre descriptivo.** Es accesibilidad y SEO.
6. **Si `inStock = false`**, agrega `badges: [{ kind: 'agotado' }]` para que la
   UX se mantenga consistente.
7. **Imágenes en `Frontend/public/`** (o subcarpetas). El path debe iniciar con `/`.

---

## 3. Cómo agregar un producto nuevo (paso a paso)

1. Ubica imágenes finales del producto. Recomendado:
   - Cover: 1200×1500 (proporción 4:5).
   - Galería: misma proporción, mismo encuadre.
   - Coloca los archivos en `Frontend/public/tienda/<slug>/cover.jpg`, etc.
2. Abre `src/tienda/data/products.ts` y agrega un objeto al final del array
   `PRODUCTS` siguiendo el patrón de los productos existentes.
3. Verifica que `category` y los `axis` de variantes (`talla` / `color` /
   `sabor` / `presentacion`) coincidan con los tipos definidos en
   `src/tienda/types/store.ts`.
4. Corre `npm run build`. Si TypeScript se queja, lee el error: casi siempre es
   un `slug` repetido o un valor de `category` inválido.
5. Revisa visualmente:
   - `/tienda` (verifica que aparezca si tiene badges destacados)
   - `/tienda/catalogo`
   - `/tienda/producto/<tu-slug>`

---

## 4. Variantes

Tipos de eje soportados:

| `axis`         | Cuándo usarlo                  | Ejemplo de `label`     |
|----------------|--------------------------------|------------------------|
| `talla`        | Ropa, anillos, gorras          | `S`, `M`, `9`, `10`    |
| `color`        | Colores definidos              | `Negro`, `Rojo`        |
| `sabor`        | Suplementos, snacks            | `Vainilla`, `Chocolate`|
| `presentacion` | Tamaño / cantidad              | `1 kg`, `2 kg`         |
| `otro`         | Cualquier otra cosa            | `Edición`, `Set`       |

Reglas:

- Si una variante está agotada → `available: false`. Aparece tachada y no
  seleccionable.
- Si TODAS las variantes están agotadas, marca también `inStock: false` a
  nivel producto.
- Para mezclar dos ejes (talla + color, por ejemplo) genera todas las
  combinaciones como variantes individuales hasta que tengamos un selector
  multi-eje real.

---

## 5. Badges editoriales

| `kind`              | Etiqueta default     | Cuándo usarlo                                         |
|---------------------|----------------------|-------------------------------------------------------|
| `nuevo`             | "Nuevo"              | Producto recién lanzado                               |
| `best-seller`       | "Best seller"        | Top de ventas (manual)                                |
| `edicion-limitada`  | "Edición limitada"   | Drops cortos / colaboraciones                         |
| `descuento`         | "Descuento"          | Si hay `compareAtPrice`. Puedes pasar `label: '-13%'` |
| `agotado`           | "Agotado"            | Cuando `inStock = false`                              |
| `pre-venta`         | "Pre-venta"          | Compra adelantada con fecha de envío posterior        |

Puedes apilar varios. La UI los pinta en orden:

```ts
badges: [{ kind: 'best-seller' }, { kind: 'descuento', label: '-13%' }],
```

---

## 6. Cómo crear una nueva categoría

1. Edita `src/tienda/data/categories.ts` y añade un objeto con `slug`, `name`,
   `tagline`, `cover` y `order`.
2. Agrega el nuevo `slug` a la unión `StoreCategorySlug` en
   `src/tienda/types/store.ts`.
3. Ya. Aparece automáticamente en:
   - `CategoryNav` (cards y pills)
   - `ProductFilters` (chips de categoría)
   - URL del catálogo: `?categoria=<nuevo-slug>`

---

## 7. Cómo cambiar moneda / formato

El único punto de verdad para el formato de moneda está en:

```
src/tienda/utils/formatCurrency.ts
```

Si en el futuro queremos USD o multi-moneda, ese archivo es el único que
hay que tocar. Todos los componentes consumen `formatCurrency()` y
`discountPercent()`.

---

## 8. Cuando llegue el backend

El paso de migración a backend será:

1. Reemplazar `PRODUCTS` por un `useProducts()` que haga `fetch('/api/store/products')`.
2. Reemplazar `findProductBySlug` por una llamada con caché.
3. Conservar `types/store.ts` como contrato. La forma del JSON del backend
   debe coincidir con `Product`.

Mientras llegue, esta guía es el manual oficial. Cualquier producto agregado
aquí queda versionado en git como contenido editorial.
