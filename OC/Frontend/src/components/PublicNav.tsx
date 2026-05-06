import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import OcClubLogo from './brand/OcClubLogo'

const NAV_LINKS = [
  { label: 'Club', to: '/club' },
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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-oc-carbon/95 backdrop-blur-md">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-oc-red/18 to-transparent" aria-hidden />
      <nav className="landing-container flex flex-col" aria-label="Principal">
        <div className="flex items-center justify-between gap-4 min-h-[4rem] py-2">
          <Link
            to="/"
            className="flex shrink-0 items-center min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-oc-red/50 rounded-sm"
          >
            <OcClubLogo variant="nav" priority />
          </Link>

          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-end gap-0.5 xl:gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.to, link.hash)}
                className={`px-3 xl:px-3.5 py-2 rounded-sm text-[11px] xl:text-[12px] font-semibold tracking-wide transition-colors border border-transparent ${
                  isActive(link.to, link.hash)
                    ? 'text-oc-light bg-white/[0.05] border-white/[0.07]'
                    : 'text-oc-muted hover:text-oc-light hover:bg-white/[0.03]'
                }`}
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/app/login"
              className="ml-4 xl:ml-6 inline-flex items-center justify-center px-5 py-2 rounded-sm bg-oc-red hover:bg-oc-red-deep text-white text-[11px] font-bold uppercase tracking-wider transition-colors border border-white/10"
            >
              Entrar
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden shrink-0 p-2 rounded-sm text-oc-light hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
          <div className="lg:hidden pb-4 pt-1 border-t border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-wider text-oc-muted px-0.5 pt-3 pb-2">Menú</p>
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.to, link.hash)}
                  className={`px-3 py-2.5 text-left rounded-sm text-sm font-medium tracking-wide transition-colors ${
                    isActive(link.to, link.hash) ? 'text-oc-light bg-white/[0.05]' : 'text-oc-muted hover:text-oc-light'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/app/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 text-center px-3 py-3 rounded-sm bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold border border-white/10"
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
