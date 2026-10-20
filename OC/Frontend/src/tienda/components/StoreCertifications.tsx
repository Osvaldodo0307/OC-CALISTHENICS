import { Link } from 'react-router-dom'
import { CERTIFICACIONES_BANNER } from '../data/tiendaAssets'

/**
 * Tarjeta clickeable de "Certificaciones" para el home de la tienda.
 *
 * Reemplaza al panel grande anterior. Mantiene la misma identidad visual
 * que las tarjetas de categoría (cover + overlay + label rojo OC) pero en
 * un formato horizontal/wide para destacar el acceso a la vista dedicada.
 *
 * Link: /tienda/certificaciones
 */
export default function StoreCertifications() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 pt-2 pb-10 sm:px-6 lg:px-10 lg:pb-14"
      aria-labelledby="tienda-certificaciones-card"
    >
      <Link
        to="/tienda/certificaciones"
        className="group relative flex aspect-[16/9] overflow-hidden rounded-sm border border-white/10 bg-[#111] transition-colors hover:border-oc-red/60 sm:aspect-[21/9]"
      >
        <img
          src={CERTIFICACIONES_BANNER}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 mt-auto flex w-full flex-col gap-1 p-5 sm:p-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-oc-red">Formación</span>
          <span
            id="tienda-certificaciones-card"
            className="text-base font-bold text-white sm:text-lg"
          >
            Certificaciones
          </span>
          <span className="line-clamp-1 text-[12px] text-white/75">
            Consulta programas, requisitos, fechas y costos
          </span>
          <span
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white"
            aria-hidden
          >
            Consultar certificaciones <span>→</span>
          </span>
        </div>
      </Link>
    </section>
  )
}
