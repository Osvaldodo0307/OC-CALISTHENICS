import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'socio' | 'coach'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-oc-dark flex items-center justify-center">
        <div className="text-oc-red text-xl">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/app/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirigir a login si el rol no coincide
    return <Navigate to="/app/login" replace />
  }

  return <>{children}</>
}
