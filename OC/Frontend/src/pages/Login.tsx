import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { runtime } from '../config/runtime'
import InlineNotice from '../components/ui/InlineNotice'
import { toUserMessage } from '../services/api/errorMessages'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, authError } = useAuth()
  const navigate = useNavigate()

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
          <Link to={runtime.isAppMode ? '/app/login' : '/'} className="inline-flex flex-col items-center gap-2">
            <img
              src="/oc-logo.png"
              alt="OC Calisthenics"
              className="h-20 w-20 object-contain"
            />
            <span className="text-white text-sm tracking-widest">CALISTHENICS</span>
          </Link>
          <p className="text-gray-400 mt-2">Iniciar Sesión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {authError && <InlineNotice type="error" message={authError} />}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-oc-red"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-oc-red"
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
        </form>

        <div className="mt-6 text-sm text-gray-500 text-center">
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
