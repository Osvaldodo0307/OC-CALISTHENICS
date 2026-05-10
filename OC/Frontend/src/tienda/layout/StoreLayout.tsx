import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import StoreNav from '../components/StoreNav'
import StoreFooter from '../components/StoreFooter'
import CartDrawer from '../components/CartDrawer'
import { OC_COMMERCIAL_DISCLAIMER } from '../utils/storeCopy'

/**
 * Shell visual y de estado para todas las rutas /tienda/*.
 * Inyecta su propio CartProvider para no acoplar el resto de la app.
 */
export default function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="oc-tienda flex min-h-screen flex-col overflow-x-hidden bg-neutral-50 text-neutral-900">
        <StoreNav onOpenCart={() => setCartOpen(true)} />
        <p
          className="border-b border-neutral-200 bg-neutral-100 px-3 py-2 text-center text-[10px] leading-snug text-neutral-600 sm:text-[11px]"
          role="note"
        >
          {OC_COMMERCIAL_DISCLAIMER}
        </p>
        <main className="flex-1 min-w-0">
          <Outlet context={{ openCart: () => setCartOpen(true) }} />
        </main>
        <StoreFooter />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  )
}

/** Helper para que las páginas hijas abran el drawer del carrito. */
export interface StoreOutletContext {
  openCart: () => void
}
