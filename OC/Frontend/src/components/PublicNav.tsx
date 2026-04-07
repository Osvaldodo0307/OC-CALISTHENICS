import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import OcClubLogo from './brand/OcClubLogo'

const NAV_LINKS = [
  { label: 'Club', to: '/', hash: 'club' },
  { label: 'Clases', to: '/clases' },
  { label: 'Membresías', to: '/membresias' },
  { label: 'Convenios', to: '/convenios' },
  { label: 'Contacto', to: '/', hash: 'contacto' },
]

export default function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavClick = useCallback(
    (to: string, hash?: string) => {
      setMobileMenuOpen(false)

      if (hash) {
        if (location.pathname === '/') {
          const el = document.getElementById(hash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
            return
          }
        }
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById(hash)
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
        return
      }

      navigate(to)
    },
    [location.pathname, navigate],
  )

  const isActive = (to: string, hash?: string) => {
    if (hash) return false
    return location.pathname === to
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-oc-red/35 bg-oc-black/92 backdrop-blur-xl shadow-[0_14px_48px_-16px_rgba(0,0,0,0.9)]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-oc-red/50 to-transparent" aria-hidden />
      <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3 sm:gap-6 min-h-[5.5rem] lg:min-h-[6.25rem] py-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 sm:gap-4 min-w-0 max-w-[min(78vw,340px)] sm:max-w-[min(52vw,380px)] md:max-w-none group"
          >
            <span
              className="oc-landing-hero__chevrons hidden sm:block text-xl sm:text-2xl font-black leading-none select-none"
              aria-hidden
            >
              &gt;&gt;&gt;
            </span>
            <OcClubLogo variant="nav" priority className="drop-shadow-[0_0_24px_rgba(210,31,45,0.15)]" />
          </Link>

          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-end gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.to, link.hash)}
                className={`px-3 xl:px-4 py-2.5 rounded-md text-[11px] xl:text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  isActive(link.to, link.hash)
                    ? 'text-oc-red bg-oc-metal/70 ring-1 ring-oc-red/35'
                    : 'text-oc-light/90 hover:text-oc-red hover:bg-oc-metal/40'
                }`}
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/app/login"
              className="ml-3 xl:ml-5 inline-flex items-center justify-center px-6 xl:px-8 py-2.5 rounded-sm bg-oc-red hover:bg-oc-red-deep text-white text-xs font-bold uppercase tracking-[0.14em] transition-all ring-1 ring-white/10 hover:ring-oc-red/60 hover:shadow-lg hover:shadow-oc-red/30"
            >
              Entrar
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden shrink-0 p-2.5 rounded-md text-oc-light hover:text-oc-red hover:bg-oc-metal/50 border border-oc-border transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-5 pt-1 border-t border-oc-border/90">
            <p className="text-[10px] uppercase tracking-[0.28em] text-oc-muted px-1 pt-3 pb-2">Navegación</p>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.to, link.hash)}
                  className={`px-4 py-3 text-left rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActive(link.to, link.hash)
                      ? 'text-oc-red bg-oc-metal/70 ring-1 ring-oc-red/30'
                      : 'text-oc-light hover:bg-oc-metal/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/app/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 text-center px-4 py-3.5 rounded-sm bg-oc-red hover:bg-oc-red-deep text-white text-sm font-bold uppercase tracking-wider"
              >
                Entrar al sistema
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
