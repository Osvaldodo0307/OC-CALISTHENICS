import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useRef, useEffect } from 'react'
import OcClubLogo from './brand/OcClubLogo'

const ECOSISTEMA_LABEL = 'Ecosistema OC'

type NavLeaf = { label: string; to: string; hash?: string }

type NavEntry =
  | ({ kind: 'link' } & NavLeaf)
  | { kind: 'group'; label: string; items: NavLeaf[] }

const NAV_ENTRIES: NavEntry[] = [
  { kind: 'link', label: 'Club', to: '/club' },
  { kind: 'link', label: 'Clases', to: '/clases' },
  { kind: 'link', label: 'Membresías', to: '/membresias' },
  { kind: 'link', label: 'Convenios', to: '/convenios' },
  {
    kind: 'group',
    label: ECOSISTEMA_LABEL,
    items: [
      { label: 'Bolsa de trabajo', to: '/', hash: 'contacto' },
      { label: 'OC Store', to: '/tienda' },
    ],
  },
  { kind: 'link', label: 'Contacto', to: '/', hash: 'contacto' },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`ml-0.5 h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const groupDesktopRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!openGroup) return
    const onDocDown = (e: MouseEvent) => {
      if (groupDesktopRef.current && !groupDesktopRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [openGroup])

  const handleNavClick = useCallback(
    (to: string, hash?: string) => {
      setMobileMenuOpen(false)
      setOpenGroup(null)

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

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label))
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
            {NAV_ENTRIES.map((entry) =>
              entry.kind === 'link' ? (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => handleNavClick(entry.to, entry.hash)}
                  className={`px-3 xl:px-3.5 py-2 rounded-sm text-[11px] xl:text-[12px] font-semibold tracking-wide transition-colors border border-transparent ${
                    isActive(entry.to, entry.hash)
                      ? 'text-oc-light bg-white/[0.05] border-white/[0.07]'
                      : 'text-oc-muted hover:text-oc-light hover:bg-white/[0.03]'
                  }`}
                >
                  {entry.label}
                </button>
              ) : (
                <div key={entry.label} ref={entry.label === ECOSISTEMA_LABEL ? groupDesktopRef : undefined} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleGroup(entry.label)}
                    className={`inline-flex items-center px-3 xl:px-3.5 py-2 rounded-sm text-[11px] xl:text-[12px] font-semibold tracking-wide transition-colors border border-transparent ${
                      openGroup === entry.label
                        ? 'text-oc-light bg-white/[0.05] border-white/[0.07]'
                        : 'text-oc-muted hover:text-oc-light hover:bg-white/[0.03]'
                    }`}
                    aria-expanded={openGroup === entry.label}
                    aria-haspopup="true"
                  >
                    {entry.label}
                    <ChevronIcon open={openGroup === entry.label} />
                  </button>
                  {openGroup === entry.label && (
                    <div
                      className="absolute right-0 top-full z-[60] mt-1 min-w-[13rem] rounded-sm border border-white/10 bg-oc-carbon py-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)]"
                      role="menu"
                    >
                      {entry.items.map((item) =>
                        item.hash ? (
                          <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            onClick={() => handleNavClick(item.to, item.hash)}
                            className="block w-full px-3 py-2.5 text-left text-[11px] xl:text-[12px] font-medium text-oc-muted transition-colors hover:bg-white/[0.06] hover:text-oc-light"
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.to}
                            role="menuitem"
                            onClick={() => {
                              setMobileMenuOpen(false)
                              setOpenGroup(null)
                            }}
                            className="block w-full px-3 py-2.5 text-left text-[11px] xl:text-[12px] font-medium text-oc-muted transition-colors hover:bg-white/[0.06] hover:text-oc-light"
                          >
                            {item.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
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
              {NAV_ENTRIES.map((entry) =>
                entry.kind === 'link' ? (
                  <button
                    key={entry.label}
                    type="button"
                    onClick={() => handleNavClick(entry.to, entry.hash)}
                    className={`px-3 py-2.5 text-left rounded-sm text-sm font-medium tracking-wide transition-colors ${
                      isActive(entry.to, entry.hash) ? 'text-oc-light bg-white/[0.05]' : 'text-oc-muted hover:text-oc-light'
                    }`}
                  >
                    {entry.label}
                  </button>
                ) : (
                  <div key={entry.label} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleGroup(entry.label)}
                      className={`flex items-center justify-between px-3 py-2.5 text-left rounded-sm text-sm font-medium tracking-wide transition-colors ${
                        openGroup === entry.label ? 'text-oc-light bg-white/[0.05]' : 'text-oc-muted hover:text-oc-light'
                      }`}
                      aria-expanded={openGroup === entry.label}
                    >
                      <span>{entry.label}</span>
                      <ChevronIcon open={openGroup === entry.label} />
                    </button>
                    {openGroup === entry.label && (
                      <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3 py-1">
                        {entry.items.map((item) =>
                          item.hash ? (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => handleNavClick(item.to, item.hash)}
                              className="px-2 py-2 text-left text-sm text-white/70 hover:text-oc-light transition-colors rounded-sm hover:bg-white/[0.04]"
                            >
                              {item.label}
                            </button>
                          ) : (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setOpenGroup(null)
                              }}
                              className="px-2 py-2 text-left text-sm text-white/70 hover:text-oc-light transition-colors rounded-sm hover:bg-white/[0.04]"
                            >
                              {item.label}
                            </Link>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ),
              )}
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
