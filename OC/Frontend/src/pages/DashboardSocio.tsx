import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { runtime } from '../config/runtime'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import { toUserMessage } from '../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

interface MembershipResponse {
  status: 'active' | 'expired'
  expires_at?: string | null
}

interface BookingResponse {
  id: number
  status: string
}

export default function DashboardSocio() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeBookings, setActiveBookings] = useState(0)
  const [membershipStatus, setMembershipStatus] = useState<string>('Sin datos')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bookingsRes, membershipRes] = await Promise.all([
        axios.get<BookingResponse[]>(`${API_URL}/bookings/my`),
        axios.get<MembershipResponse>(`${API_URL}/membership/me`).catch(() => ({ data: null as never })),
      ])

      const active = bookingsRes.data.filter((item) => item.status === 'booked').length
      setActiveBookings(active)
      if (membershipRes.data?.status) {
        setMembershipStatus(membershipRes.data.status === 'active' ? 'Activa' : 'Vencida')
      } else {
        setMembershipStatus('No registrada')
      }
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo cargar tu panel.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (loading) return <LoadingState message="Cargando panel..." />

  return (
    <div className="px-4 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Inicio</h1>
        <p className="text-sm text-gray-400 mt-1">Resumen rapido de tu cuenta.</p>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-oc-metal border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Reservas activas</p>
          <p className="text-white text-2xl font-bold mt-1">{activeBookings}</p>
        </div>
        <div className="bg-oc-metal border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Membresia</p>
          <p className="text-white text-lg font-semibold mt-2">{membershipStatus}</p>
        </div>
      </div>

      <div className="bg-oc-metal border border-oc-red/20 rounded-xl p-4">
        <p className="text-sm text-gray-300 mb-3">Accesos rapidos</p>
        <div className="flex flex-wrap gap-2">
          <Link className="touch-target px-3 py-2 rounded-lg bg-oc-red text-white text-sm font-medium" to="/app/clases">Clases</Link>
          <Link className="touch-target px-3 py-2 rounded-lg border border-gray-600 text-gray-200 text-sm font-medium" to="/app/reservas">Reservas</Link>
          <Link className="touch-target px-3 py-2 rounded-lg border border-gray-600 text-gray-200 text-sm font-medium" to="/app/mi-plan">Mi plan</Link>
        </div>
      </div>
    </div>
  )
}

