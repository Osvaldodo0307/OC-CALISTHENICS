import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import OcClubLogo from '../../components/brand/OcClubLogo'

interface Props {
  onOpenCart: () => void
}

const NAV_LINKS = [
  { to: '/tienda', label: 'Inicio', end: true },
  { to: '/tienda/catalogo', label: 'Catálogo' },
  { to: '/tienda/catalogo?categoria=ropa', label: 'Ropa' },
  { to: '/tienda/catalogo?categoria=suplementos', label: 'Suplementos' },
  { to: '/tienda/catalogo?categoria=joyeria', label: 'Joyería' },
  { to: '/tienda/catalogo?categoria=recovery', label: 'Recovery' },
]

export default function StoreNav({ onOpenCart }: Props) {
  const { totals } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    if (!q) {
      navigate('/tienda/catalogo')
      return
    }
    navigate(`/tienda/catalogo?q=${encodeURIComponent(q)}`)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="hidden bg-neutral-950 text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] sm:px-6 lg:px-10">
          <p className="max-w-[min(100%,52rem)] tracking-wide text-white/70">
            COMPRA ASISTIDA · ENVÍO Y PAGO SE CONFIRMAN CON EL EQUIPO OC
          </p>
          <div className="hidden items-center gap-4 md:flex">
            <Link to="/" className="text-white/70 hover:text-white">
              ← Volver al sitio OC
            </Link>
            <Link to="/app/login" className="text-white/70 hover:text-white">
              Soy socio
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link
          to="/tienda"
          className="flex items-center gap-2"
          aria-label="Tienda OC — inicio"
        >
          <OcClubLogo
            variant="nav"
            priority
            className="h-7 w-auto sm:h-8 [filter:invert(0)] mix-blend-multiply"
          />
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.25em] text-oc-red sm:inline">
            Store
          </span>
        </Link>

        <form
          onSubmit={submitSearch}
          className="ml-auto hidden flex-1 max-w-md md:flex"
          role="search"
        >
          <div className="relative w-full">
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-oc-red focus:bg-white"
              aria-label="Buscar productos"
            />
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
              />
            </svg>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-400"
            aria-label={`Abrir carrito (${totals.itemCount} artículos)`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l1 4m0 0 1.5 9a2 2 0 0 0 2 1.7h7.4a2 2 0 0 0 2-1.5L20 7H6Zm3 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
              />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {totals.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-oc-red px-1 text-[10px] font-bold text-white">
                {totals.itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-neutral-100 bg-white md:block" aria-label="Categorías">
        <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 sm:px-6 lg:px-10">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={`${l.to}-${l.label}`}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap py-3 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? 'text-oc-red'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={submitSearch} role="search" className="mb-3">
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-oc-red focus:bg-white"
              aria-label="Buscar productos"
            />
          </form>
          <div className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={`m-${l.to}-${l.label}`}
                to={l.to}
                end={l.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `border-b border-neutral-100 py-3 text-sm font-semibold ${
                    isActive ? 'text-oc-red' : 'text-neutral-800'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="border-b border-neutral-100 py-3 text-sm font-semibold text-neutral-500"
            >
              ← Volver al sitio OC
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
