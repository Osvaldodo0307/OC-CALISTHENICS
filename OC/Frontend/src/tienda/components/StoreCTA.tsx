import { Link } from 'react-router-dom'

export default function StoreCTA() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute -left-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-oc-red/30 blur-[140px]" />
        <div className="absolute right-[-100px] top-[-80px] h-[360px] w-[360px] rounded-full bg-rose-500/20 blur-[140px]" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-oc-red">
            Únete al ecosistema OC
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Comprar en OC es más que un drop: es entrar al club.
          </h2>
          <p className="mt-3 text-[14px] text-white/70 sm:text-[15px]">
            Cada compra apoya a los atletas OC, las clínicas, los seminarios y la comunidad
            OC-CALISTHENICS. Nuestros socios reciben acceso prioritario a nuevos lanzamientos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/tienda/catalogo"
            className="inline-flex items-center justify-center rounded-full bg-oc-red px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_-10px_rgba(229,9,20,0.7)] transition-colors hover:bg-oc-red-deep"
          >
            Ver catálogo
          </Link>
          <Link
            to="/membresias"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
          >
            Conocer membresías
          </Link>
        </div>
      </div>
    </section>
  )
}
