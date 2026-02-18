import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface BookingWithClass {
  id: number
  user_id: number
  class_id: number
  status: string
  preferred_hour?: number | null
  created_at: string
  class_title?: string
  class_discipline?: string
  class_datetime?: string
}

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const day = DAYS_ES[d.getDay()]
  const num = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${day} ${num} ${month} — ${h}:${m}`
}

export default function Reservas() {
  const [bookings, setBookings] = useState<BookingWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const navigate = useNavigate()

  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/my`)
      const rawBookings = response.data

      const enriched: BookingWithClass[] = await Promise.all(
        rawBookings.map(async (b: BookingWithClass) => {
          try {
            const classResp = await axios.get(`${API_URL}/classes/${b.class_id}`)
            return {
              ...b,
              class_title: classResp.data.title,
              class_discipline: classResp.data.discipline,
              class_datetime: classResp.data.start_datetime
            }
          } catch {
            return b
          }
        })
      )

      enriched.sort((a, b) => {
        const dateA = a.class_datetime || a.created_at
        const dateB = b.class_datetime || b.created_at
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })

      setBookings(enriched)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancel = async (bookingId: number) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    setCancelingId(bookingId)
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`)
      await fetchBookings()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al cancelar')
    } finally {
      setCancelingId(null)
    }
  }

  const activeBookings = bookings.filter((b) => b.status === 'booked')
  const pastBookings = bookings.filter((b) => b.status === 'canceled')

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-oc-red border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Cargando reservas...</p>
      </div>
    )
  }

  return (
    <div className="px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Mis Reservas</h1>

      {/* Active bookings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-oc-red mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          Activas ({activeBookings.length})
        </h2>

        {activeBookings.length === 0 ? (
          <div className="bg-oc-metal rounded-xl border border-gray-700/50 p-6 text-center">
            <p className="text-gray-400 mb-3">No tienes reservas activas</p>
            <button
              onClick={() => navigate('/app/clases')}
              className="bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Ver clases disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-oc-metal rounded-xl border border-green-500/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {booking.class_title || `Clase #${booking.class_id}`}
                    </h3>
                    {booking.class_datetime && (
                      <p className="text-sm text-gray-400 mt-1">
                        {booking.preferred_hour != null
                          ? `${formatDateTime(booking.class_datetime).split(' — ')[0]} — ${booking.preferred_hour.toString().padStart(2, '0')}:00`
                          : formatDateTime(booking.class_datetime)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelingId === booking.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-red-500/30 disabled:opacity-50 ml-3"
                  >
                    {cancelingId === booking.id ? '...' : 'Cancelar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canceled bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">
            Canceladas ({pastBookings.length})
          </h2>
          <div className="space-y-2">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-oc-metal/50 rounded-xl border border-gray-700/30 p-4 opacity-60"
              >
                <h3 className="font-medium text-gray-400 truncate">
                  {booking.class_title || `Clase #${booking.class_id}`}
                </h3>
                {booking.class_datetime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(booking.class_datetime)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
