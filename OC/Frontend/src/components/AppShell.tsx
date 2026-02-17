import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/app/login')
  }

  const isActive = (path: string) => location.pathname === path

  const socioNav = [
    { path: '/app/clases', label: 'Clases' },
    { path: '/app/reservas', label: 'Mis Reservas' }
  ]

  const coachNav = [
    { path: '/app/coach/dashboard', label: 'Dashboard' },
    { path: '/app/coach/alumnos', label: 'Mis Alumnos' },
    { path: '/app/rutinas', label: 'Generar Rutinas' }
  ]

  const adminNav = [
    { path: '/app/admin/dashboard', label: 'Agenda Semanal' }
  ]

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'coach' ? coachNav : socioNav

  return (
    <div className="min-h-screen bg-oc-dark">
      <nav className="bg-oc-metal border-b border-oc-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/app" className="flex items-center gap-2">
                <img
                  src="/oc-logo.png"
                  alt="OC Calisthenics"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-white text-sm tracking-widest hidden sm:block">CALISTHENICS</span>
              </Link>
              {/* Desktop nav */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.path)
                        ? 'border-oc-red text-oc-red'
                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1.5 rounded text-sm"
              >
                Salir
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden text-gray-300 hover:text-white p-1"
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
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-oc-red/20 text-oc-red'
                      : 'text-gray-300 hover:text-white hover:bg-oc-metal'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2 text-sm text-gray-500">
                {user?.name}
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
