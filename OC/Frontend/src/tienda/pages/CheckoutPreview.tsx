import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import EmptyState from '../components/EmptyState'
import { buildStoreOrderWhatsAppHref, OC_COMMERCIAL_DISCLAIMER } from '../utils/storeCopy'

const WHATSAPP_CONSULTA_HREF =
  'https://wa.me/525567869589?text=' +
  encodeURIComponent(
    'Hola OC, quiero consultar disponibilidad y opciones de compra en la tienda. Gracias.',
  )

/**
 * Compra asistida (sin pasarela de pago). El usuario arma el pedido en el navegador
 * y lo envía por WhatsApp para que el equipo OC confirme disponibilidad, entrega y pago.
 */
export default function CheckoutPreview() {
  const { lines, totals, isEmpty } = useCart()

  const whatsappPedidoHref = useMemo(
    () => buildStoreOrderWhatsAppHref(lines, totals.subtotal),
    [lines, totals.subtotal],
  )

  if (isEmpty) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Solicitud de compra
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          No tienes productos en el carrito todavía.
        </p>
        <div className="mt-8">
          <EmptyState
            title="Carrito vacío"
            message="Agrega productos al carrito para generar tu mensaje de solicitud."
            action={
              <Link
                to="/tienda/catalogo"
                className="inline-flex items-center justify-center rounded-full bg-oc-red px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
              >
                Ir al catálogo
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <header className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
          Compra asistida · sin pago en línea
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
          Revisa tu solicitud
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-relaxed text-neutral-800">
          {OC_COMMERCIAL_DISCLAIMER}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
          Esta pantalla no procesa pagos ni reserva stock. Los precios mostrados son de referencia;
          el equipo OC confirma totales finales, formas de pago y tiempos de entrega.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-[12px] leading-relaxed text-amber-950">
            <strong className="font-semibold">Importante:</strong> no ingreses datos bancarios aquí.
            El pago y la entrega se acuerdan directamente con OC por los canales oficiales.
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <p className="text-[12px] text-neutral-500">
              Los siguientes campos son opcionales: sirven para que completes tu mensaje con el
              equipo. Puedes enviar la solicitud solo con el resumen del carrito.
            </p>

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="col-span-full text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Datos de contacto (opcional)
              </legend>
              <Field label="Nombre" placeholder="Nombre" />
              <Field label="Apellido" placeholder="Apellido" />
              <Field label="Correo electrónico" placeholder="tu@correo.com" type="email" />
              <Field label="Teléfono" placeholder="55 1234 5678" type="tel" />
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="col-span-full text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Dirección de envío (opcional)
              </legend>
              <Field className="sm:col-span-2" label="Calle y número" placeholder="Av. Insurgentes 123" />
              <Field label="Colonia" placeholder="Colonia" />
              <Field label="Ciudad" placeholder="CDMX" />
              <Field label="Código postal" placeholder="14000" />
              <Field label="Estado" placeholder="Ciudad de México" />
            </fieldset>
          </form>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[12px] leading-relaxed text-neutral-700">
            <p className="font-semibold text-neutral-900">Formas de pago y entrega</p>
            <p className="mt-1">
              Se definen caso por caso con el equipo OC (por ejemplo: transferencia, pago en sede u
              otras opciones que OC comunique). No hay cobro automático en esta tienda web en este
              momento.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500">
              Tu pedido ({totals.itemCount})
            </h2>
            <ul className="mt-4 space-y-3">
              {lines.map((line) => (
                <li key={line.lineId} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <img
                      src={line.cover.src}
                      alt={line.cover.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-[13px]">
                    <p className="line-clamp-2 font-semibold text-neutral-900">{line.name}</p>
                    <p className="text-[12px] text-neutral-500">
                      {line.variant ? `${line.variant.label} · ` : ''}
                      Cant. {line.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold text-neutral-900">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-[14px]">
              <div className="flex justify-between text-neutral-700">
                <dt>Subtotal (productos)</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatCurrency(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-neutral-700">
                <dt>Envío</dt>
                <dd className="max-w-[11rem] text-right text-[12px] font-semibold text-neutral-600">
                  Por cotizar con OC
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-neutral-200 pt-3">
                <dt className="text-[12px] uppercase tracking-wider text-neutral-500">
                  Total referencia
                </dt>
                <dd className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(totals.total)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-neutral-500">
              Solo productos. Envío, impuestos o cargos adicionales los confirma el equipo OC.
            </p>

            <a
              href={whatsappPedidoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-oc-red px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-oc-red-deep"
            >
              Enviar solicitud por WhatsApp
            </a>
            <a
              href={WHATSAPP_CONSULTA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-neutral-800 transition-colors hover:border-neutral-500"
            >
              Consultar disponibilidad
            </a>
            <Link
              to="/tienda/carrito"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-transparent px-5 py-2 text-[12px] font-semibold text-neutral-600 underline-offset-2 hover:text-oc-red hover:underline"
            >
              Volver al carrito
            </Link>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-[12px] leading-relaxed text-neutral-600">
            <p className="font-semibold text-neutral-900">Atención OC</p>
            <p className="mt-1">
              Si prefieres otro canal, indícalo en el mensaje. El equipo revisará stock y te
              responderá con los siguientes pasos.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Field({
  label,
  placeholder,
  type = 'text',
  className,
}: {
  label: string
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-oc-red focus:bg-white"
      />
    </label>
  )
}
