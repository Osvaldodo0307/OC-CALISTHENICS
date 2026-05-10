import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import CartItem from './CartItem'
import EmptyState from './EmptyState'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { lines, totals, isEmpty } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[80] ${open ? '' : 'pointer-events-none'}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-label="Carrito de compra"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 sm:max-w-md ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-oc-red">
              Tu carrito
            </p>
            <p className="text-base font-semibold text-neutral-900">
              {totals.itemCount} {totals.itemCount === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Cerrar carrito"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {isEmpty ? (
            <div className="py-10">
              <EmptyState
                title="Tu carrito está vacío"
                message="Empieza por elegir un drop nuevo o un esencial OC."
                action={
                  <Link
                    to="/tienda/catalogo"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-full bg-oc-red px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
                  >
                    Explorar tienda
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col">
              {lines.map((line) => (
                <CartItem key={line.lineId} line={line} variant="drawer" />
              ))}
            </div>
          )}
        </div>

        {!isEmpty && (
          <footer className="border-t border-neutral-200 bg-white px-5 py-4">
            <dl className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-neutral-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatCurrency(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-2 text-neutral-600">
                <dt className="shrink-0">Envío</dt>
                <dd className="text-right text-[12px] font-semibold text-neutral-600">
                  Se cotiza con OC
                </dd>
              </div>
              <div className="mt-2 flex items-end justify-between border-t border-neutral-200 pt-2">
                <dt className="text-[12px] uppercase tracking-wider text-neutral-500">
                  Total ref.
                </dt>
                <dd className="text-lg font-bold text-neutral-900">
                  {formatCurrency(totals.total)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[10px] leading-snug text-neutral-500">
              Precio de productos. Envío y pago se confirman con el equipo OC.
            </p>
            <Link
              to="/tienda/checkout"
              onClick={onClose}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-oc-red"
            >
              Solicitud de compra
            </Link>
            <Link
              to="/tienda/carrito"
              onClick={onClose}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-neutral-800 transition-colors hover:border-neutral-500"
            >
              Ver carrito completo
            </Link>
          </footer>
        )}
      </aside>
    </div>
  )
}
