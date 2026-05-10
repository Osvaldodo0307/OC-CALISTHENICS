import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { CartLine, CartTotals, Product, ProductVariant } from '../types/store'

/**
 * Carrito local (frontend-only) con persistencia en localStorage.
 *
 * No depende de backend ni de auth. Cuando se integre la pasarela de pago,
 * este mismo estado puede serializarse hacia un endpoint real sin tocar UI.
 */

const STORAGE_KEY = 'oc-tienda-cart-v1'

interface CartState {
  lines: CartLine[]
}

type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; lineId: string }
  | { type: 'update-quantity'; lineId: string; quantity: number }
  | { type: 'clear' }
  | { type: 'hydrate'; state: CartState }

const initialState: CartState = {
  lines: [],
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'add': {
      const existing = state.lines.find((l) => l.lineId === action.line.lineId)
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.lineId === action.line.lineId
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        }
      }
      return { ...state, lines: [...state.lines, action.line] }
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) }
    case 'update-quantity':
      return {
        ...state,
        lines: state.lines
          .map((l) =>
            l.lineId === action.lineId
              ? { ...l, quantity: Math.max(1, action.quantity) }
              : l,
          )
          .filter((l) => l.quantity > 0),
      }
    case 'clear':
      return { ...state, lines: [] }
    default:
      return state
  }
}

interface CartContextValue {
  lines: CartLine[]
  totals: CartTotals
  isEmpty: boolean
  addProduct: (product: Product, opts?: { variant?: ProductVariant; quantity?: number }) => void
  removeLine: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function buildLineId(productId: string, variantId?: string): string {
  return variantId ? `${productId}__${variantId}` : productId
}

/**
 * Totales de referencia (solo mercancía). Envío y descuentos no se calculan aquí:
 * se confirman con el equipo OC según dirección, disponibilidad y políticas vigentes.
 */
function deriveTotals(state: CartState): CartTotals {
  const subtotal = state.lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0)
  const itemCount = state.lines.reduce((acc, l) => acc + l.quantity, 0)
  return {
    subtotal,
    shipping: 0,
    discount: 0,
    total: subtotal,
    itemCount,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<CartState> & { coupon?: unknown }
      if (parsed && Array.isArray(parsed.lines)) {
        const { lines } = parsed
        dispatch({ type: 'hydrate', state: { lines } })
      }
    } catch {
      // Persistencia best-effort. No interrumpe la sesión.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const addProduct = useCallback<CartContextValue['addProduct']>((product, opts) => {
    if (!product.inStock) return
    const variant = opts?.variant
    const quantity = Math.max(1, opts?.quantity ?? 1)
    const line: CartLine = {
      lineId: buildLineId(product.id, variant?.id),
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity,
      cover: product.cover,
      variant: variant
        ? { id: variant.id, label: variant.label, axis: variant.axis }
        : undefined,
    }
    dispatch({ type: 'add', line })
  }, [])

  const removeLine = useCallback((lineId: string) => {
    dispatch({ type: 'remove', lineId })
  }, [])

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    dispatch({ type: 'update-quantity', lineId, quantity })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const totals = useMemo(() => deriveTotals(state), [state])

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      totals,
      isEmpty: state.lines.length === 0,
      addProduct,
      removeLine,
      updateQuantity,
      clearCart,
    }),
    [state.lines, totals, addProduct, removeLine, updateQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }
  return ctx
}
