import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

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
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`
}

function isOpenGymOrPowerlifting(title: string): boolean {
  const t = title.toUpperCase()
  return t.includes('OPEN GYM') || t.includes('POWERLIFTING')
}

function getGymHours(dateStr: string): { start: number; end: number } {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  if (day === 6) return { start: 8, end: 16 }
  if (day === 0) return { start: 6, end: 23 }
  return { start: 6, end: 23 }
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassWithBookings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
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

  const handleBook = async (classId: number, preferredHour?: number) => {
    setActionLoading(classId)
    try {
      const payload: Record<string, unknown> = { class_id: classId, status: 'booked' }
      if (preferredHour !== undefined) payload.preferred_hour = preferredHour
      await axios.post(`${API_URL}/bookings/`, payload)
      setExpandedCard(null)
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

  const regularClasses = classes.filter((c) => !isOpenGymOrPowerlifting(c.title))
  const specialClasses = classes.filter((c) => isOpenGymOrPowerlifting(c.title))

  const { start: gymStart, end: gymEnd } = getGymHours(selectedDate)
  const hourSlots = Array.from({ length: gymEnd - gymStart }, (_, i) => gymStart + i)

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
          <h1 className="text-xl font-bold text-white">{formatDateLabel(selectedDate)}</h1>
          {isToday && <span className="text-xs text-oc-red font-semibold">HOY</span>}
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
        <div className="space-y-4">
          {/* OPEN GYM / POWERLIFTING — expandable cards */}
          {specialClasses.map((cls) => {
            const isExpanded = expandedCard === cls.id
            const isBooked = cls.is_booked_by_me

            return (
              <div
                key={cls.id}
                className={`bg-oc-metal rounded-xl border overflow-hidden transition-all ${
                  isBooked
                    ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                    : 'border-gray-700/50'
                }`}
              >
                {/* Header — clickable to expand */}
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : cls.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isBooked ? 'bg-green-500' : 'bg-oc-red'
                    }`} />
                    <div>
                      <h3 className={`font-bold text-base ${
                        isBooked ? 'text-green-400' : 'text-white'
                      }`}>
                        {cls.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isBooked ? '✓ Ya tienes reserva' : 'Toca para elegir horario'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cls.bookings_count > 0 && (
                      <span className="text-gray-500 text-sm">{cls.bookings_count} 👤</span>
                    )}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded: hourly slots */}
                {isExpanded && (
                  <div className="border-t border-gray-700/50 p-4">
                    <p className="text-gray-400 text-xs mb-3">
                      Selecciona la hora a la que planeas asistir:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {hourSlots.map((hour) => (
                        <button
                          key={hour}
                          onClick={() => handleBook(cls.id, hour)}
                          disabled={actionLoading === cls.id || isBooked}
                          className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                            isBooked
                              ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-default'
                              : 'bg-oc-dark border border-gray-700 text-white hover:border-oc-red hover:bg-oc-red/10 active:bg-oc-red active:text-white'
                          }`}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </button>
                      ))}
                    </div>
                    {isBooked && cls.my_booking_id && (
                      <button
                        onClick={() => handleCancel(cls.my_booking_id!)}
                        disabled={actionLoading === cls.my_booking_id}
                        className="mt-3 w-full py-2 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-colors"
                      >
                        {actionLoading === cls.my_booking_id ? 'Cancelando...' : 'Cancelar reserva'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Separator */}
          {specialClasses.length > 0 && regularClasses.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-xs uppercase tracking-wide">Clases del día</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
          )}

          {/* Regular classes */}
          {regularClasses.map((cls) => {
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isBooked ? 'bg-green-500' : 'bg-gray-600'
                      }`} />
                      <h3 className={`font-bold text-base truncate ${
                        isBooked ? 'text-green-400' : 'text-white'
                      }`}>
                        {cls.title}
                      </h3>
                    </div>
                    {cls.bookings_count > 0 && (
                      <span className="text-gray-500 text-sm ml-2 flex-shrink-0">
                        {cls.bookings_count} 👤
                      </span>
                    )}
                  </div>

                  {/* Action button — always visible on protected route */}
                  {isBooked ? (
                    <button
                      onClick={() => cls.my_booking_id && handleCancel(cls.my_booking_id)}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Cancelando...' : '✓ Agendado — toca para cancelar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBook(cls.id)}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-lg bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Reservando...' : 'Agendar clase'}
                    </button>
                  )}

                  {cls.bookings_count > 0 && (
                    <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isBooked ? 'bg-green-500' : 'bg-oc-red'
                        }`}
                        style={{
                          width: `${Math.min((cls.bookings_count / Math.max(cls.capacity || 20, 1)) * 100, 100)}%`,
                          minWidth: '10%',
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
