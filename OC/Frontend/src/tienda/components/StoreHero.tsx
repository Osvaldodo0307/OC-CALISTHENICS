import { Link } from 'react-router-dom'
import { productCoverSrc, TIENDA_HERO_PRINCIPAL } from '../data/tiendaAssets'

/**
 * Hero comercial de la tienda OC.
 * Mantiene identidad de marca (rojo OC) pero con una superficie más
 * luminosa que la landing del gimnasio para que el producto se lea bien.
 */
export default function StoreHero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Mobile/tablet: la imagen vive como bloque visible arriba (no como fondo absoluto)
          para que la foto completa quepa, mantenga su tamaño y no recorte al sujeto. */}
      <div className="relative w-full lg:hidden">
        <img
          src={TIENDA_HERO_PRINCIPAL}
          alt="OC Store — imagen principal de la tienda"
          className="block h-auto w-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neutral-950 via-neutral-950/55 to-transparent"
          aria-hidden
        />
      </div>

      {/* Desktop: fondo absoluto + degradados para superponer el texto en la columna izquierda. */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <img
          src={TIENDA_HERO_PRINCIPAL}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-center opacity-60"
          loading="eager"
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:flex-row lg:items-center lg:gap-12 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-oc-red shadow-[0_0_10px_rgba(229,9,20,0.7)]" />
            Tienda oficial OC
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Equípate como un{' '}
            <span className="bg-gradient-to-br from-oc-red via-oc-red to-rose-400 bg-clip-text text-transparent">
              atleta OC
            </span>
            .
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            Ropa técnica, accesorios premium, suplementos seleccionados por nuestro staff y
            artículos oficiales de OC-CALISTHENICS. Diseñados para entrenar duro y vivir mejor.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/tienda/catalogo"
              className="inline-flex items-center justify-center rounded-full bg-oc-red px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_-10px_rgba(229,9,20,0.7)] transition-all hover:bg-oc-red-deep"
            >
              Ver catálogo
            </Link>
            <Link
              to="/tienda/catalogo?categoria=ropa"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
            >
              Ver ropa nueva
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            <li className="flex flex-col">
              <span className="text-2xl font-bold text-white">30+</span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">
                productos
              </span>
            </li>
            <li className="flex flex-col">
              <span className="text-2xl font-bold text-white">8</span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">
                categorías
              </span>
            </li>
            <li className="flex flex-col">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">
                oficial OC
              </span>
            </li>
          </ul>
        </div>

        <div className="relative hidden flex-1 lg:block">
          <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
            <img
              src={productCoverSrc('hoodie-elite-black')}
              alt="Hoodie Elite OC — imagen de producto o pendiente"
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-oc-red/90">
                Drop nuevo
              </p>
              <p className="mt-1 text-lg font-bold">Hoodie Elite OC</p>
              <p className="text-[12px] text-white/70">Fleece premium · Edición Club</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
