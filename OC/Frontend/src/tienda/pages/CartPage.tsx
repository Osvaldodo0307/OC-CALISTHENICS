import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import EmptyState from '../components/EmptyState'
import { formatCurrency } from '../utils/formatCurrency'
import { OC_COMMERCIAL_DISCLAIMER } from '../utils/storeCopy'

export default function CartPage() {
  const { lines, totals, isEmpty, clearCart } = useCart()

  if (isEmpty) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Tu carrito</h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          Aún no agregas productos. Explora la tienda para encontrar tu próximo equipo OC.
        </p>
        <div className="mt-8">
          <EmptyState
            title="Carrito vacío"
            message="Empieza por elegir un drop nuevo o un esencial OC."
            action={
              <Link
                to="/tienda/catalogo"
                className="inline-flex items-center justify-center rounded-full bg-oc-red px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
              >
                Explorar tienda
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <header className="mb-8 flex flex-col gap-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
          Tu pedido
        </p>
        <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
          Carrito ({totals.itemCount})
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-neutral-600">
          {OC_COMMERCIAL_DISCLAIMER}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-neutral-200 bg-white px-5 sm:px-6">
          {lines.map((line) => (
            <CartItem key={line.lineId} line={line} variant="page" />
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <Link
              to="/tienda/catalogo"
              className="text-[12px] font-bold uppercase tracking-wider text-neutral-700 hover:text-oc-red"
            >
              ← Seguir comprando
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-[12px] font-medium text-neutral-400 hover:text-oc-red"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500">
              Resumen
            </h2>
            <dl className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between text-neutral-700">
                <dt>Subtotal (productos)</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatCurrency(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-neutral-700">
                <dt>Envío</dt>
                <dd className="max-w-[14rem] text-right text-[13px] font-semibold text-neutral-600">
                  Se cotiza con OC según dirección y paquetería
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-neutral-200 pt-3">
              <span className="text-[12px] uppercase tracking-wider text-neutral-500">
                Total referencia
              </span>
              <span className="text-2xl font-bold text-neutral-900">
                {formatCurrency(totals.total)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              Solo suma de productos. No incluye envío ni cargos hasta confirmación con el equipo.
            </p>

            <Link
              to="/tienda/checkout"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-oc-red"
            >
              Solicitud de compra
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              El siguiente paso es una vista de compra asistida: podrás enviar tu lista por
              WhatsApp al equipo OC. No hay pago en línea activo en este MVP.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
