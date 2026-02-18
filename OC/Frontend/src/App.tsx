import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Membresias from './pages/Membresias'
import ClasesInfo from './pages/ClasesInfo'
import EquipoComunidad from './pages/EquipoComunidad'
import Convenios from './pages/Convenios'
import AppShell from './components/AppShell'
import Classes from './pages/Classes'
import Reservas from './pages/Reservas'
import Perfil from './pages/Perfil'
import MiPlan from './pages/MiPlan'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminClases from './pages/admin/Clases'
import CoachesAlumnos from './pages/admin/CoachesAlumnos'
import CoachDashboard from './pages/coach/Dashboard'
import CoachAlumnos from './pages/coach/Alumnos'
import CoachAlumno from './pages/coach/Alumno'
import AsistenciaVirtual from './pages/coach/AsistenciaVirtual'
import Rutinas from './pages/Rutinas'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { useAuth } from './contexts/AuthContext'

function AppRedirect() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="admin/dashboard" replace />
  if (user?.role === 'coach') return <Navigate to="coach/dashboard" replace />
  return <Navigate to="clases" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/membresias" element={<Membresias />} />
          <Route path="/clases" element={<ClasesInfo />} />
          <Route path="/equipo-comunidad" element={<EquipoComunidad />} />
          <Route path="/convenios" element={<Convenios />} />
          <Route path="/app/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<AppRedirect />} />
            <Route path="clases" element={<Classes />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="mi-plan" element={<ProtectedRoute requiredRole="socio"><MiPlan /></ProtectedRoute>} />
            <Route path="rutinas" element={<Rutinas />} />
            <Route path="admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/usuarios" element={<ProtectedRoute requiredRole="admin"><AdminUsuarios /></ProtectedRoute>} />
            <Route path="admin/clases" element={<ProtectedRoute requiredRole="admin"><AdminClases /></ProtectedRoute>} />
            <Route path="admin/coaches-alumnos" element={<ProtectedRoute requiredRole="admin"><CoachesAlumnos /></ProtectedRoute>} />
            <Route path="coach/dashboard" element={<ProtectedRoute requiredRole="coach"><CoachDashboard /></ProtectedRoute>} />
            <Route path="coach/alumnos" element={<ProtectedRoute requiredRole="coach"><CoachAlumnos /></ProtectedRoute>} />
            <Route path="coach/alumno/:id" element={<ProtectedRoute requiredRole="coach"><CoachAlumno /></ProtectedRoute>} />
            <Route path="coach/asistencia-virtual/:id" element={<ProtectedRoute requiredRole="coach"><AsistenciaVirtual /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
