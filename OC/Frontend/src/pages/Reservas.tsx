import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { runtime } from '../config/runtime'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import InlineNotice from '../components/ui/InlineNotice'
import { toUserMessage } from '../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

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
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchBookings = useCallback(async () => {
    setError(null)
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
      setError(toUserMessage(error, 'No se pudieron cargar tus reservas.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancel = async (bookingId: number) => {
    if (cancelingId !== null) return
    if (!confirm('¿Cancelar esta reserva?')) return
    setCancelingId(bookingId)
    setNotice(null)
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`)
      setNotice('Reserva cancelada correctamente.')
      await fetchBookings()
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo cancelar la reserva.'))
    } finally {
      setCancelingId(null)
    }
  }

  const activeBookings = bookings.filter((b) => b.status === 'booked')
  const pastBookings = bookings.filter((b) => b.status === 'canceled')

  if (loading) {
    return <LoadingState message="Cargando reservas..." />
  }

  return (
    <div className="px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Mis Reservas</h1>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setLoading(true)
            void fetchBookings()
          }}
          className="touch-target px-3 py-2 rounded-lg border border-oc-border text-oc-light/90 text-sm hover:text-white hover:border-oc-red disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>
      {notice && <div className="mb-4"><InlineNotice type="success" message={notice} /></div>}
      {error && <div className="mb-4"><ErrorState message={error} onRetry={() => {
        setLoading(true)
        void fetchBookings()
      }} /></div>}

      {/* Active bookings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-oc-red mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-oc-red rounded-full" />
          Activas ({activeBookings.length})
        </h2>

        {activeBookings.length === 0 ? (
          <EmptyState
            title="No tienes reservas activas"
            message="Cuando reserves una clase aparecera aqui."
            actionLabel="Ver clases disponibles"
            onAction={() => navigate('/app/clases')}
          />
        ) : (
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-oc-metal rounded-xl border border-oc-red/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {booking.class_title || `Clase #${booking.class_id}`}
                    </h3>
                    {booking.class_datetime && (
                      <p className="text-sm text-oc-muted mt-1">
                        {booking.preferred_hour != null
                          ? `${formatDateTime(booking.class_datetime).split(' — ')[0]} — ${booking.preferred_hour.toString().padStart(2, '0')}:00`
                          : formatDateTime(booking.class_datetime)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelingId === booking.id}
                    className="text-oc-red hover:text-oc-light hover:bg-oc-red/20 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-oc-red/35 disabled:opacity-50 ml-3"
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
          <h2 className="text-lg font-semibold text-oc-muted mb-4">
            Canceladas ({pastBookings.length})
          </h2>
          <div className="space-y-2">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-oc-metal/50 rounded-xl border border-oc-border/30 p-4 opacity-60"
              >
                <h3 className="font-medium text-oc-muted truncate">
                  {booking.class_title || `Clase #${booking.class_id}`}
                </h3>
                {booking.class_datetime && (
                  <p className="text-xs text-oc-muted mt-1">
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
