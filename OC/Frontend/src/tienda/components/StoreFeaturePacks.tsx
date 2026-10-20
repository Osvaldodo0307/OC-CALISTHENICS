import { Link } from 'react-router-dom'

const FOCUS = [
  {
    number: '01',
    eyebrow: 'FUERZA Y TÉCNICA',
    title: 'ENTRENAMIENTO SIN CONCESIONES',
    description: 'Herramientas para entrenar con intención: equipos, agarres, bandas y accesorios.',
    image: '/tienda/stitch2026/equipamiento-stitch.webp',
    to: '/tienda/catalogo?categoria=entrenamiento',
    action: 'EXPLORAR EQUIPAMIENTO',
    alt: 'Fotografía conceptual de barra y rack de gimnasio',
  },
  {
    number: '02',
    eyebrow: 'NUTRICIÓN Y RENDIMIENTO',
    title: 'PREPARA TU SIGUIENTE SESIÓN',
    description: 'Explora la categoría de suplementos y confirma productos, uso y disponibilidad con el equipo OC.',
    image: '/tienda/stitch2026/suplementos-stitch.webp',
    to: '/tienda/catalogo?categoria=suplementos',
    action: 'EXPLORAR SUPLEMENTOS',
    alt: 'Fotografía conceptual de recipientes y accesorios de suplementación',
  },
]

export default function StoreFeaturePacks() {
  return (
    <section className="border-y border-white/10 bg-[#0d0d0d] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <header className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-oc-red">EQUIPA TU OBJETIVO</p>
            <h2 className="font-hero text-3xl uppercase leading-tight text-white sm:text-4xl">SELECCIONES <span className="text-oc-red">DE RENDIMIENTO</span></h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-white/55">Explora nuestras categorías. Los artículos y precios se confirman antes de realizar el pedido.</p>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          {FOCUS.map((item) => (
            <article key={item.number} className="grid overflow-hidden border border-white/15 bg-[#141414] sm:grid-cols-[44%_56%]">
              <Link to={item.to} className="group relative block aspect-[16/9] overflow-hidden sm:aspect-auto" aria-label={item.action}>
                <img src={item.image} alt={item.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                <span className="absolute left-3 top-3 bg-oc-red px-2 py-1 font-hero text-lg text-white">{item.number}</span>
              </Link>
              <div className="flex flex-col p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-oc-red">{item.eyebrow}</p>
                <h3 className="mt-2 font-hero text-2xl uppercase leading-tight text-white">{item.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-white/65">{item.description}</p>
                <Link to={item.to} className="mt-auto border-t border-white/10 pt-5 text-[11px] font-bold uppercase tracking-wider text-white hover:text-oc-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oc-red">
                  {item.action} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
