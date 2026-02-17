import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Membership } from '../types'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Perfil() {
  const { user } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'socio') {
      fetchMembership()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchMembership = async () => {
    try {
      const response = await axios.get(`${API_URL}/membership/me`)
      setMembership(response.data)
    } catch (error) {
      console.error('Error fetching membership:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Mi Perfil</h1>

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
        <h2 className="text-2xl font-semibold text-oc-red mb-4">Información Personal</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Nombre:</span>
            <span className="text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Usuario:</span>
            <span className="text-white">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rol:</span>
            <span className="text-white capitalize">{user?.role}</span>
          </div>
          {user?.phone && (
            <div className="flex justify-between">
              <span className="text-gray-400">Teléfono:</span>
              <span className="text-white">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {user?.role === 'socio' && membership && (
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
          <h2 className="text-2xl font-semibold text-oc-red mb-4">Membresía</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Estado:</span>
              <span
                className={`font-semibold ${
                  membership.status === 'active' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {membership.status === 'active' ? 'Activa' : 'Vencida'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Plan:</span>
              <span className="text-white capitalize">{membership.plan}</span>
            </div>
            {membership.expires_at && (
              <div className="flex justify-between">
                <span className="text-gray-400">Vence:</span>
                <span className="text-white">
                  {format(new Date(membership.expires_at), "dd/MM/yyyy")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
