import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Membership } from '../types'
import { format } from 'date-fns'
import { runtime } from '../config/runtime'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { toUserMessage } from '../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

export default function Perfil() {
  const { user } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'socio') {
      fetchMembership()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchMembership = async () => {
    setError(null)
    try {
      const response = await axios.get(`${API_URL}/membership/me`)
      setMembership(response.data)
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo cargar tu membresia.'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return (
      <EmptyState
        title="Sin sesion activa"
        message="Inicia sesion para ver tu perfil."
      />
    )
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Mi Perfil</h1>
      {error && (
        <div className="mb-4">
          <ErrorState message={error} onRetry={fetchMembership} />
        </div>
      )}

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
        <h2 className="text-2xl font-semibold text-oc-red mb-4">Información Personal</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-oc-muted">Nombre:</span>
            <span className="text-white">{user.name || 'Sin nombre'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-oc-muted">Usuario:</span>
            <span className="text-white">{user.username || 'Sin usuario'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-oc-muted">Rol:</span>
            <span className="text-white capitalize">{user.role}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between">
              <span className="text-oc-muted">Teléfono:</span>
              <span className="text-white">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {user.role === 'socio' && membership && (
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
          <h2 className="text-2xl font-semibold text-oc-red mb-4">Membresía</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-oc-muted">Estado:</span>
              <span
                className={`font-semibold ${
                  membership.status === 'active' ? 'text-oc-light' : 'text-oc-red'
                }`}
              >
                {membership.status === 'active' ? 'Activa' : 'Vencida'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-oc-muted">Plan:</span>
              <span className="text-white capitalize">{membership.plan}</span>
            </div>
            {membership.expires_at && (
              <div className="flex justify-between">
                <span className="text-oc-muted">Vence:</span>
                <span className="text-white">
                  {format(new Date(membership.expires_at), "dd/MM/yyyy")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {user.role === 'socio' && !membership && !error && (
        <EmptyState
          title="Sin membresia registrada"
          message="No encontramos una membresia asociada a tu cuenta."
        />
      )}
    </div>
  )
}
