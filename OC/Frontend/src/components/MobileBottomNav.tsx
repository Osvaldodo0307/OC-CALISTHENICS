import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/app/inicio', label: 'Inicio' },
  { to: '/app/clases', label: 'Clases' },
  { to: '/app/reservas', label: 'Reservas' },
  { to: '/app/rutinas', label: 'Rutinas' },
  { to: '/app/perfil', label: 'Perfil' },
]

export default function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav className="mobile-bottom-nav bg-oc-metal border-t border-oc-red/20 sm:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={`flex h-14 items-center justify-center text-xs font-medium ${
                  isActive ? 'text-oc-red' : 'text-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

