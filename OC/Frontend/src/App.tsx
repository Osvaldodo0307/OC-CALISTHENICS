import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense, type ReactNode } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { AuthProvider } from './contexts/AuthContext'
import { runtime } from './config/runtime'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import NetworkStatusBanner from './components/NetworkStatusBanner'
import LoadingState from './components/ui/LoadingState'
import { useAuth } from './contexts/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import WebOnlyModule from './pages/app/WebOnlyModule'

const Landing = lazy(() => import('./pages/Landing'))
const Membresias = lazy(() => import('./pages/Membresias'))
const ClasesInfo = lazy(() => import('./pages/ClasesInfo'))
const EquipoComunidad = lazy(() => import('./pages/EquipoComunidad'))
const Convenios = lazy(() => import('./pages/Convenios'))
const DashboardSocio = lazy(() => import('./pages/DashboardSocio'))
const Classes = lazy(() => import('./pages/Classes'))
const Reservas = lazy(() => import('./pages/Reservas'))
const Perfil = lazy(() => import('./pages/Perfil'))
const MiPlan = lazy(() => import('./pages/MiPlan'))
const Rutinas = lazy(() => import('./pages/Rutinas'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsuarios = lazy(() => import('./pages/admin/Usuarios'))
const AdminClases = lazy(() => import('./pages/admin/Clases'))
const CoachesAlumnos = lazy(() => import('./pages/admin/CoachesAlumnos'))
const AdminAsistencia = lazy(() => import('./pages/admin/Asistencia'))
const CoachDashboard = lazy(() => import('./pages/coach/Dashboard'))
const CoachAlumnos = lazy(() => import('./pages/coach/Alumnos'))
const CoachAlumno = lazy(() => import('./pages/coach/Alumno'))
const AsistenciaVirtual = lazy(() => import('./pages/coach/AsistenciaVirtual'))

function AppRedirect() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="admin/dashboard" replace />
  if (user?.role === 'coach') return <Navigate to="coach/dashboard" replace />
  return <Navigate to="inicio" replace />
}

function NativeBackButtonHandler() {
  const location = useLocation()

  useEffect(() => {
    if (!runtime.isCapacitorNative) return

    let listener: { remove: () => Promise<void> } | null = null
    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
        return
      }

      if (location.pathname.startsWith('/app')) {
        void CapacitorApp.exitApp()
      }
    }).then((handle) => {
      listener = handle
    })

    return () => {
      if (listener) {
        void listener.remove()
      }
    }
  }, [location.pathname])

  return null
}

function AppOnlyRoleRoute({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  if (runtime.isAppMode) {
    return <WebOnlyModule title={title} />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <NetworkStatusBanner />
        <NativeBackButtonHandler />
        <Suspense fallback={<LoadingState message="Cargando modulo..." />}>
          <Routes>
          <Route path="/" element={runtime.isAppMode ? <Navigate to="/app/login" replace /> : <PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="membresias" element={<Membresias />} />
            <Route path="clases" element={<ClasesInfo />} />
            <Route path="equipo-comunidad" element={<EquipoComunidad />} />
            <Route path="convenios" element={<Convenios />} />
          </Route>

          <Route path="/app" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
          </Route>

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<AppRedirect />} />
            <Route path="inicio" element={<DashboardSocio />} />
            <Route path="clases" element={<Classes />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="mi-plan" element={<ProtectedRoute requiredRole="socio"><MiPlan /></ProtectedRoute>} />
            <Route path="rutinas" element={<Rutinas />} />
            <Route
              path="admin/dashboard"
              element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="admin/usuarios"
              element={<ProtectedRoute requiredRole="admin"><AdminUsuarios /></ProtectedRoute>}
            />
            <Route
              path="admin/clases"
              element={<ProtectedRoute requiredRole="admin"><AdminClases /></ProtectedRoute>}
            />
            <Route
              path="admin/asistencia"
              element={<ProtectedRoute requiredRole="admin"><AdminAsistencia /></ProtectedRoute>}
            />
            <Route
              path="admin/coaches-alumnos"
              element={<ProtectedRoute requiredRole="admin"><CoachesAlumnos /></ProtectedRoute>}
            />
            <Route
              path="coach/dashboard"
              element={<ProtectedRoute requiredRole="coach"><AppOnlyRoleRoute title="Dashboard de Coach"><CoachDashboard /></AppOnlyRoleRoute></ProtectedRoute>}
            />
            <Route
              path="coach/alumnos"
              element={<ProtectedRoute requiredRole="coach"><AppOnlyRoleRoute title="Alumnos"><CoachAlumnos /></AppOnlyRoleRoute></ProtectedRoute>}
            />
            <Route
              path="coach/alumno/:id"
              element={<ProtectedRoute requiredRole="coach"><AppOnlyRoleRoute title="Detalle de Alumno"><CoachAlumno /></AppOnlyRoleRoute></ProtectedRoute>}
            />
            <Route
              path="coach/asistencia-virtual/:id"
              element={<ProtectedRoute requiredRole="coach"><AppOnlyRoleRoute title="Asistencia Virtual"><AsistenciaVirtual /></AppOnlyRoleRoute></ProtectedRoute>}
            />
          </Route>

          <Route path="*" element={<Navigate to={runtime.isAppMode ? '/app/login' : '/'} replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
