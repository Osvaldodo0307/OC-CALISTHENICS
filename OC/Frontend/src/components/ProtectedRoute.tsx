import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingState from './ui/LoadingState'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'socio' | 'coach'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation()
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Validando sesion..." />
  }

  if (!user) {
    return <Navigate to="/app/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
