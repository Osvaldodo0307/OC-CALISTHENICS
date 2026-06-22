import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Component, useEffect, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
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
const Club = lazy(() => import('./pages/Club'))
const EquipoComunidad = lazy(() => import('./pages/EquipoComunidad'))
const Convenios = lazy(() => import('./pages/Convenios'))
const Experiencias = lazy(() => import('./pages/Experiencias'))
const AvisoPrivacidad = lazy(() => import('./pages/AvisoPrivacidad'))
const Terminos = lazy(() => import('./pages/Terminos'))
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
const AdminMembresiasControl = lazy(() => import('./pages/admin/MembresiasControl'))
const AdminRecordatorios = lazy(() => import('./pages/admin/Recordatorios'))
const AdminImportarPagos = lazy(() => import('./pages/admin/ImportarPagos'))
const AdminImportarVisitas = lazy(() => import('./pages/admin/ImportarVisitas'))
const AdminSocioExpediente = lazy(() => import('./pages/admin/SocioExpediente'))
const CoachDashboard = lazy(() => import('./pages/coach/Dashboard'))
const CoachAlumnos = lazy(() => import('./pages/coach/Alumnos'))
const CoachAlumno = lazy(() => import('./pages/coach/Alumno'))
const AsistenciaVirtual = lazy(() => import('./pages/coach/AsistenciaVirtual'))

// ─── Tienda OC (módulo aislado bajo /tienda/*) ─────────────────────────
const StoreLayout = lazy(() => import('./tienda/layout/StoreLayout'))
const StoreHome = lazy(() => import('./tienda/pages/StoreHome'))
const StoreCatalog = lazy(() => import('./tienda/pages/StoreCatalog'))
const ProductDetail = lazy(() => import('./tienda/pages/ProductDetail'))
const CartPage = lazy(() => import('./tienda/pages/CartPage'))
const CheckoutPreview = lazy(() => import('./tienda/pages/CheckoutPreview'))
const Certifications = lazy(() => import('./tienda/pages/Certifications'))

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

interface RootErrorBoundaryState {
  error: Error | null
}

class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('[OC] Runtime error:', error, info)
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen bg-oc-carbon text-oc-light flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full rounded-lg border border-white/10 bg-black/40 p-6 shadow-xl">
          <h1 className="text-lg font-bold text-oc-light">Algo salió mal cargando esta vista.</h1>
          <p className="mt-2 text-sm text-oc-muted">
            Recargar suele resolverlo. Si persiste, escríbenos por WhatsApp.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded bg-black/60 p-3 text-[11px] leading-snug text-white/70">
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center justify-center rounded-sm bg-oc-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <NetworkStatusBanner />
        <NativeBackButtonHandler />
        <RootErrorBoundary>
          <Suspense fallback={<LoadingState message="Cargando modulo..." />}>
            <Routes>
          <Route path="/" element={runtime.isAppMode ? <Navigate to="/app/login" replace /> : <PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="membresias" element={<Membresias />} />
            <Route path="clases" element={<ClasesInfo />} />
            <Route path="club" element={<Club />} />
            <Route path="equipo-comunidad" element={<EquipoComunidad />} />
            <Route path="convenios" element={<Convenios />} />
            <Route path="experiencias" element={<Experiencias />} />
            <Route path="aviso-privacidad" element={<AvisoPrivacidad />} />
            <Route path="terminos" element={<Terminos />} />
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
              path="admin/membresias"
              element={<ProtectedRoute requiredRole="admin"><AdminMembresiasControl /></ProtectedRoute>}
            />
            <Route
              path="admin/recordatorios"
              element={<ProtectedRoute requiredRole="admin"><AdminRecordatorios /></ProtectedRoute>}
            />
            <Route
              path="admin/importar-pagos"
              element={<ProtectedRoute requiredRole="admin"><AdminImportarPagos /></ProtectedRoute>}
            />
            <Route
              path="admin/importar-visitas"
              element={<ProtectedRoute requiredRole="admin"><AdminImportarVisitas /></ProtectedRoute>}
            />
            <Route
              path="admin/socios/:id"
              element={<ProtectedRoute requiredRole="admin"><AdminSocioExpediente /></ProtectedRoute>}
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

          {!runtime.isAppMode && (
            <Route path="/tienda" element={<StoreLayout />}>
              <Route index element={<StoreHome />} />
              <Route path="catalogo" element={<StoreCatalog />} />
              <Route path="producto/:slug" element={<ProductDetail />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPreview />} />
              <Route path="certificaciones" element={<Certifications />} />
            </Route>
          )}

          <Route path="*" element={<Navigate to={runtime.isAppMode ? '/app/login' : '/'} replace />} />
            </Routes>
          </Suspense>
        </RootErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
