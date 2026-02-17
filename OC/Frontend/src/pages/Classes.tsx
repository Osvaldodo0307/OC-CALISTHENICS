import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ClassWithBookings {
  id: number
  title: string
  discipline: string
  description?: string
  intensity: string
  level: string
  duration_minutes: number
  capacity: number
  start_datetime: string
  coach_id?: number
  created_at: string
  bookings_count: number
  is_booked_by_me: boolean
  my_booking_id?: number
}

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const dayName = DAYS_ES[d.getDay()]
  const dayNum = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  return `${dayName} ${dayNum} de ${month}`
}

function getTimeLabel(startDatetime: string): string {
  const d = new Date(startDatetime)
  const h = d.getHours()
  const m = d.getMinutes()
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function isOpenGymOrPowerlifting(title: string): boolean {
  const t = title.toUpperCase()
  return t.includes('OPEN GYM') || t.includes('POWERLIFTING')
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassWithBookings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { user } = useAuth()

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get<ClassWithBookings[]>(
        `${API_URL}/classes/?target_date=${selectedDate}`
      )
      setClasses(response.data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const handleBook = async (classId: number) => {
    setActionLoading(classId)
    try {
      await axios.post(`${API_URL}/bookings`, { class_id: classId, status: 'booked' })
      await fetchClasses()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al reservar')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (bookingId: number) => {
    setActionLoading(bookingId)
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`)
      await fetchClasses()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al cancelar reserva')
    } finally {
      setActionLoading(null)
    }
  }

  const navigateDate = (offset: number) => {
    const current = new Date(selectedDate + 'T12:00:00')
    current.setDate(current.getDate() + offset)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="px-4 max-w-2xl mx-auto">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateDate(-1)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-oc-metal transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-white">
            {formatDateLabel(selectedDate)}
          </h1>
          {isToday && (
            <span className="text-xs text-oc-red font-semibold">HOY</span>
          )}
        </div>

        <button
          onClick={() => navigateDate(1)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-oc-metal transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick date selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() + i)
          const dateStr = d.toISOString().split('T')[0]
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-oc-red text-white'
                  : 'bg-oc-metal text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <div>{DAYS_ES[d.getDay()].slice(0, 3)}</div>
              <div className="text-lg font-bold">{d.getDate()}</div>
            </button>
          )
        })}
      </div>

      {/* Classes list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-oc-red border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Cargando clases...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay clases programadas para este día</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const isSpecial = isOpenGymOrPowerlifting(cls.title)
            const isBooked = cls.is_booked_by_me
            const isProcessing = actionLoading === cls.id || actionLoading === cls.my_booking_id

            return (
              <div
                key={cls.id}
                className={`bg-oc-metal rounded-xl border transition-all ${
                  isBooked
                    ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                    : 'border-gray-700/50 hover:border-oc-red/30'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Booking indicator */}
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isBooked ? 'bg-green-500' : 'bg-gray-600'
                      }`} />

                      {/* Class info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold truncate ${
                          isBooked ? 'text-green-400' : 'text-white'
                        }`}>
                          {isSpecial ? cls.title : cls.title}
                        </h3>
                        {isSpecial && (
                          <p className="text-xs text-gray-500">Disponible todo el día</p>
                        )}
                      </div>
                    </div>

                    {/* Right side: people count + action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {cls.bookings_count > 0 && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          <span className="text-sm font-medium">{cls.bookings_count}</span>
                        </div>
                      )}

                      {user && (
                        isBooked ? (
                          <button
                            onClick={() => cls.my_booking_id && handleCancel(cls.my_booking_id)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {isProcessing ? '...' : '✓ Agendado'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBook(cls.id)}
                            disabled={isProcessing}
                            className="bg-oc-red hover:bg-oc-red-deep text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {isProcessing ? '...' : 'Agendar'}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {cls.bookings_count > 0 && (
                    <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isBooked ? 'bg-green-500' : 'bg-oc-red'
                        }`}
                        style={{
                          width: `${Math.min((cls.bookings_count / Math.max(cls.capacity || 20, 1)) * 100, 100)}%`,
                          minWidth: cls.bookings_count > 0 ? '10%' : '0%'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <span>Disponible</span>
        </div>
      </div>
    </div>
  )
}
