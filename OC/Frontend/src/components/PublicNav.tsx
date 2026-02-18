import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'

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
    <header className="sticky top-0 z-50 bg-oc-dark/95 backdrop-blur-sm border-b border-oc-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-oc.jpg"
              alt="OC Calisthenics"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/oc-logo.png'
              }}
            />
            <div className="leading-tight">
              <span className="text-oc-red font-bold text-xl tracking-tight">OC</span>
              <span className="text-oc-light block text-xs tracking-[0.2em] font-medium">
                CALISTHENICS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.to, link.hash)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(link.to, link.hash)
                    ? 'text-oc-red bg-oc-metal/50'
                    : 'text-oc-light hover:text-oc-red hover:bg-oc-metal/50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/app/login"
              className="ml-4 px-6 py-2 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-oc-red/50"
            >
              Entrar al Sistema
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-oc-light hover:text-oc-red transition-colors"
            aria-label="Menu"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-oc-border">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.to, link.hash)}
                  className={`px-4 py-2 text-left rounded-lg transition-colors ${
                    isActive(link.to, link.hash)
                      ? 'text-oc-red bg-oc-metal/50'
                      : 'text-oc-light hover:text-oc-red hover:bg-oc-metal/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/app/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-2 text-center rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-colors"
              >
                Entrar al Sistema
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
