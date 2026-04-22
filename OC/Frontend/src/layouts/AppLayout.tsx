import ProtectedRoute from '../components/ProtectedRoute'
import AppShell from '../components/AppShell'

export default function AppLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  )
}

