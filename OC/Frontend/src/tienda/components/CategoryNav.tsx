import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'

interface Props {
  /** Si está presente, marca esa categoría como activa. */
  activeSlug?: string
  variant?: 'pills' | 'cards'
}

export default function CategoryNav({ activeSlug, variant = 'cards' }: Props) {
  if (variant === 'pills') {
    return (
      <nav
        aria-label="Categorías de la tienda"
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        <Link
          to="/tienda/catalogo"
          className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors ${
            !activeSlug
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
          }`}
        >
          Todas
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to={`/tienda/catalogo?categoria=${c.slug}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors ${
              activeSlug === c.slug
                ? 'border-oc-red bg-oc-red text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          to={`/tienda/catalogo?categoria=${c.slug}`}
          className="group relative flex aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.18)]"
        >
          <img
            src={c.cover}
            alt={c.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden />
          <div className="relative z-10 mt-auto flex w-full flex-col gap-1 p-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-oc-red">
              Categoría
            </span>
            <span className="text-base font-bold text-white">{c.name}</span>
            <span className="line-clamp-1 text-[12px] text-white/70">{c.tagline}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
