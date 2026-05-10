# Backlog — Tienda OC

Lista priorizada de pasos siguientes después del MVP visual frontend.
La idea es que cada bloque pueda entrar en un sprint cerrado sin tocar el
resto de la app.

---

## Fase 1 · Cierre del MVP visual (post-entrega actual)

- [ ] Reemplazar imágenes placeholder por fotografía comercial real.
  - Cover 4:5, mínimo 1200×1500, fondo limpio.
  - Galería de mínimo 3 fotos por producto.
- [ ] Texto definitivo de cada producto (`shortDescription`, `longDescription`,
      `highlights`).
- [ ] Aprobar paleta y tipografía de la tienda con dirección OC.
- [ ] QA responsive en iPhone SE / Pixel / iPad / desktop 1440 y 1920.
- [ ] QA accesibilidad básica (focus rings, contraste, alt en imágenes).

## Fase 2 · Enlazado con el sitio principal

- [ ] Cambiar el item `OC Store` del menú a link real `/tienda`
      (`src/components/PublicNav.tsx`).
- [ ] CTA en la landing principal apuntando a `/tienda`.
- [ ] Mención de la tienda en `Membresias.tsx` y en el footer global.
- [ ] OG / metadatos sociales para `/tienda` (cuando se decida si va en
      subdominio o subruta).

## Fase 3 · Persistencia y backend

- [ ] Endpoint `GET /api/store/products` (catalog feed).
- [ ] Endpoint `GET /api/store/products/:slug`.
- [ ] Endpoint `POST /api/store/orders` (preorden, sin pago aún).
- [ ] Esquema en BD: `products`, `product_variants`, `categories`,
      `inventory`, `orders`, `order_items`, `shipping_addresses`.
- [ ] Migrar `data/products.ts` a fetch (mantener `types/store.ts` como contrato).

## Fase 4 · Pasarela de pago

- [ ] Decidir provider: **Stripe** vs **Mercado Pago** vs **Conekta**.
  - Recomendado en MX: Mercado Pago (cobertura) + Stripe (UX premium).
- [ ] Integrar Checkout drop-in en `CheckoutPreview.tsx` reemplazando el form mock.
- [ ] Backend: webhook de confirmación de pago + emisión de factura (CFDI 4.0).
- [ ] Email transaccional (Resend / Postmark / SES) con plantilla OC.
- [ ] Página de confirmación `/tienda/orden/:id`.

## Fase 5 · Cuenta del cliente (separada de "socio")

- [ ] Login / signup independiente del sistema del gym (o single sign-on).
- [ ] Página `/tienda/mi-cuenta` con historial de compras, direcciones,
      facturas.
- [ ] Lista de deseos (wishlist) por usuario.

## Fase 6 · Inventario y panel admin

- [ ] Panel admin para alta/edición/baja de productos (no tocar el panel
      del gimnasio: usar `/tienda/admin` o panel separado).
- [ ] Stock por variante con descuento automático en cada venta.
- [ ] Reportes: ventas por categoría, top productos, conversión, ticket
      promedio.

## Fase 7 · Crecimiento

- [ ] SEO: sitemap + structured data Product (Schema.org).
- [ ] Píxeles Meta / Google Ads / TikTok.
- [ ] Reseñas verificadas por compra.
- [ ] Cupones por correo / WhatsApp (campañas).
- [ ] Programa de referidos (descuento socio + cliente).
- [ ] Bundles ("Pack Iniciación HYROX": creatina + grips + bandas).

---

## Decisiones pendientes (a confirmar con dirección)

1. **¿Subdominio o subruta?**
   - Subdominio: `tienda.oc-calisthenics.com` → mejor para SEO de ecommerce.
   - Subruta: `oc-calisthenics.com/tienda` → más simple, más cohesionado con el club.
2. **¿Carrito persiste por usuario o por dispositivo?**
   - Hoy: por dispositivo (localStorage).
   - Cuando haya cuenta: sincronizar al hacer login.
3. **¿Envíos:** propios o paquetería integrada (Mienvio, Skydropx)?
4. **¿Inventario único** o por sede (Tlalpan / online)?
5. **¿Facturación inmediata** o bajo demanda?

---

## Riesgos conocidos

- **Imágenes placeholder reutilizadas del gym** comunican "tienda no terminada".
  Hay que prioritizar fotos de producto reales antes de lanzar al público.
- **Cupones demo:** el MVP ya no expone cupones de prueba en la UI; los descuentos reales se acordarán con OC o con backend cuando exista.
  cuando exista panel admin.
- **Carrito en localStorage** se pierde si el usuario limpia datos. Aceptable
  para MVP, no para producción a gran escala.
