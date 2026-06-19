import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { runtime } from '../config/runtime'
import { isAdminDemoMode } from '../config/adminDemo'
import InlineNotice from '../components/ui/InlineNotice'
import OcClubLogo from '../components/brand/OcClubLogo'
import { toUserMessage } from '../services/api/errorMessages'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginAsAdminDemo, authError } = useAuth()
  const navigate = useNavigate()
  const demoEnabled = isAdminDemoMode()

  const handleDemoLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginAsAdminDemo()
      navigate('/app/admin/membresias')
    } catch (err) {
      setError(toUserMessage(err, 'No se pudo iniciar sesion demo'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(username, password)
      if (user.role === 'admin') {
        navigate('/app/admin/dashboard')
      } else if (user.role === 'coach') {
        navigate('/app/coach/dashboard')
      } else {
        navigate('/app/clases')
      }
    } catch (error) {
      setError(toUserMessage(error, 'Error al iniciar sesion'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-oc-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-oc-metal p-8 rounded-lg border border-oc-red/20">
        <div className="text-center mb-8">
          <Link to={runtime.isAppMode ? '/app/login' : '/'} className="inline-flex flex-col items-center gap-2 w-full">
            <OcClubLogo variant="auth" priority />
          </Link>
          <p className="text-oc-muted mt-2">Iniciar Sesión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {authError && <InlineNotice type="error" message={authError} />}
          {error && (
            <div className="bg-oc-red/20 border border-oc-red/50 text-oc-light px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white focus:outline-none focus:border-oc-red"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white focus:outline-none focus:border-oc-red"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {demoEnabled && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleDemoLogin()}
              className="w-full border border-amber-600/60 bg-amber-950/30 hover:bg-amber-900/40 text-amber-100 font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Entrar como admin demo
            </button>
          )}
        </form>

        {demoEnabled && (
          <p className="mt-4 text-xs text-amber-200/90 text-center bg-amber-950/20 border border-amber-800/40 rounded px-3 py-2">
            Modo demo/local activo — datos de prueba, sin backend real
          </p>
        )}

        <div className="mt-6 text-sm text-oc-muted text-center">
          <p>Ingresa con tu usuario y contraseña proporcionados.</p>
        </div>

        {!runtime.isAppMode && (
          <div className="mt-6 text-center">
            <Link to="/" className="text-oc-red hover:text-oc-muted text-sm">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
