# Tienda OC — Módulo `src/tienda`

Tienda virtual de OC-CALISTHENICS. Es un módulo aislado del resto de la app
(gimnasio, membresías, panel admin) y vive completo bajo `OC/Frontend/src/tienda/`.

> **Estado actual:** MVP visual / prototipo funcional **solo frontend**.
> No hay backend, ni inventario real, ni pagos reales todavía.

---

## 1. Por qué `src/tienda` (y no una carpeta hermana)

La arquitectura actual del proyecto exige que todo el código viva bajo `src/`:

- **TypeScript**: `tsconfig.json` solo incluye `["src"]`.
- **Tailwind**: `tailwind.config.js` solo escanea `./src/**/*.{js,ts,jsx,tsx}`.
- **Vite + ESLint**: configurados para `src`.

Mover la tienda a `OC/Frontend/tienda` (fuera de `src/`) implicaba modificar
configuración global y ampliar superficie de cambios. Por eso se eligió la
ruta más limpia y aislada: `src/tienda/`.

---

## 2. Estructura de carpetas

```txt
src/tienda/
  layout/
    StoreLayout.tsx          # Shell de toda la tienda (CartProvider + nav + footer + drawer)

  pages/
    StoreHome.tsx            # /tienda
    StoreCatalog.tsx         # /tienda/catalogo
    ProductDetail.tsx        # /tienda/producto/:slug
    CartPage.tsx             # /tienda/carrito
    CheckoutPreview.tsx      # /tienda/checkout (preview, sin pago real)

  components/
    StoreNav.tsx             # Header + buscador + carrito
    StoreFooter.tsx          # Footer comercial
    StoreHero.tsx            # Hero principal
    CategoryNav.tsx          # Navegación por categorías (cards y pills)
    ProductGrid.tsx          # Grid responsive
    ProductCard.tsx          # Tarjeta de producto
    ProductQuickView.tsx     # Modal de vista rápida (con variantes)
    ProductGallery.tsx       # Galería con miniaturas
    ProductFilters.tsx       # Filtros: búsqueda, categoría, precio, stock, orden
    ProductBadges.tsx        # Badges (nuevo, best-seller, descuento, etc.)
    CartDrawer.tsx           # Carrito lateral
    CartItem.tsx             # Línea de carrito
    StoreTrustBar.tsx        # Banda de confianza (envío, devoluciones, etc.)
    StoreCTA.tsx             # CTA final
    EmptyState.tsx           # Estado vacío reutilizable

  context/
    CartContext.tsx          # Estado del carrito + persistencia localStorage

  data/
    products.ts              # Productos seed (demo)
    categories.ts            # Categorías comerciales

  types/
    store.ts                 # Tipos del módulo (Product, CartLine, etc.)

  utils/
    formatCurrency.ts        # Formato MXN consistente
    productFilters.ts        # Filtros + ordenamiento puros

  docs/
    README_TIENDA.md         # Este archivo
    PRODUCT_UPLOAD_GUIDE.md  # Cómo cargar / editar productos
    STORE_BACKLOG.md         # Próximos pasos y roadmap
```

---

## 3. Rutas registradas

Las rutas se registran en `src/App.tsx` de forma **aditiva** (no se modifican rutas
existentes). Se cargan con `React.lazy` para no afectar el bundle inicial del resto
del sitio:

```
/tienda                 → StoreHome
/tienda/catalogo        → StoreCatalog (acepta ?categoria=slug y ?q=texto)
/tienda/producto/:slug  → ProductDetail
/tienda/carrito         → CartPage
/tienda/checkout        → CheckoutPreview (sin pago real)
```

> En modo App (Capacitor / `runtime.isAppMode`) las rutas de tienda se
> deshabilitan automáticamente. La tienda es **solo web por ahora**.

---

## 4. Stack y convenciones

- **React 18 + TypeScript + Vite + Tailwind** (los del proyecto).
- **No se agregaron dependencias nuevas.**
- Componentes funcionales con tipos explícitos en props.
- Hook `useCart()` para todo lo relacionado con el carrito.
- Carrito persistido en `localStorage` con clave `oc-tienda-cart-v1`.
- Imágenes: se reutilizan las que ya viven en `Frontend/public/` (HYROX.jpeg,
  Calistenia.jpeg, etc.) como placeholders mientras se carga la fotografía
  comercial real.

---

## 5. Identidad visual

La tienda mantiene **identidad OC** (rojo `#E50914`, tipografía Oswald/Bebas/Montserrat,
logo OC-CLUB) pero usa una **superficie clara** (gris muy claro / blanco / negro
premium puntual) para que la fotografía de producto se lea bien. Esto fue
intencional: la landing del gym es 100% oscura, pero un catálogo oscuro al 100%
mata la legibilidad y las conversiones.

Tokens Tailwind reutilizados (ya existentes en `tailwind.config.js`):

- `oc-red`, `oc-red-deep`, `oc-red-glow`
- `oc-light`, `oc-muted`, `oc-border`
- `oc-black`, `oc-dark`, `oc-metal`, `oc-panel`
- `font-display`, `font-hero`, `font-sans`

---

## 6. Cómo enlazar la tienda desde la landing principal

> Esto **no se hace** en esta primera entrega para no tocar la landing.
> Cuando se quiera enlazar, basta con cambiar el item `OC Store` del menú
> público (`src/components/PublicNav.tsx`) por un link real a `/tienda`:

```tsx
// src/components/PublicNav.tsx
{
  kind: 'group',
  label: 'Ecosistema OC',
  items: [
    { label: 'Bolsa de trabajo', to: '/', hash: 'bolsa-trabajo-oc' },
    // ANTES: { label: 'OC Store', to: '/', hash: 'proximamente-store' },
    { label: 'OC Store', to: '/tienda' }, // <-- DESPUÉS
  ],
},
```

También se puede agregar un CTA en la home y en `Membresias.tsx`. La opción
recomendada es publicar la tienda como subdominio o en `/tienda` y enlazarla
desde el footer + el menú "Ecosistema OC".

---

## 7. Build y desarrollo

Comandos del proyecto raíz `OC/Frontend`:

```bash
npm run dev       # desarrollo
npm run build     # tsc + vite build
npm run lint      # ESLint
```

La tienda se sirve en `http://localhost:5173/tienda` durante `npm run dev`.

---

## 8. Roadmap inmediato

Ver [`STORE_BACKLOG.md`](./STORE_BACKLOG.md) para la lista priorizada de pasos
siguientes (pasarela de pago, panel admin de productos, autenticación de cliente,
inventario real, etc.).
