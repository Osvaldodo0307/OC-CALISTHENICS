import { Link } from 'react-router-dom'
import { TIENDA_HERO_PRINCIPAL, TIENDA_HERO_EDITORIAL } from '../data/tiendaAssets'

/**
 * Cabecera editorial de OC-STORE: mantiene el flujo de compra asistida.
 * Imágenes conceptuales independientes, no fotos de productos/stock confirmados.
 */
export default function StoreHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#060606] text-white">
      <div className="absolute inset-0" aria-hidden>
        <img src={TIENDA_HERO_PRINCIPAL} alt="" className="h-full w-full object-cover object-center opacity-45" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/85 to-[#060606]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-oc-red">
            <span className="h-[2px] w-9 bg-oc-red" aria-hidden /> OC-STORE · CATÁLOGO OFICIAL
          </p>
          <h1 className="font-hero text-[clamp(3rem,7vw,6.5rem)] uppercase leading-[0.95] tracking-tight">
            HARDWARE <span className="text-oc-red">&</span> ATHLETIC GEAR
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Equípate con la actitud de OC-CLUB. Explora ropa, equipamiento, recuperación
            y suplementos. Consulta disponibilidad y precios antes de confirmar tu pedido.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/tienda/catalogo" className="inline-flex items-center justify-center bg-oc-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-oc-red-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Explorar catálogo →
            </Link>
            <Link to="/tienda/catalogo?categoria=entrenamiento" className="inline-flex items-center justify-center border border-white/65 bg-black/25 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oc-red">
              Ver equipamiento
            </Link>
          </div>
          <p className="mt-6 border-l-2 border-oc-red pl-3 text-xs text-white/65">
            Pedidos coordinados por WhatsApp. No se procesan pagos en línea.
          </p>
        </div>
        <Link to="/tienda/catalogo?categoria=ropa" className="group relative hidden aspect-[4/3] overflow-hidden border border-white/15 bg-[#111] lg:block" aria-label="Explorar ropa deportiva en OC-STORE">
          <img src={TIENDA_HERO_EDITORIAL} alt="Selección conceptual de ropa deportiva negra" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-oc-red">Ropa deportiva</p>
            <p className="mt-1 font-hero text-3xl uppercase">VISTE LA DISCIPLINA</p>
            <span className="mt-2 inline-block text-xs font-bold uppercase text-white">Explorar ropa →</span>
          </div>
        </Link>
      </div>
    </section>
  )
}
