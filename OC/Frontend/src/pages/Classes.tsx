import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { runtime } from '../config/runtime'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import InlineNotice from '../components/ui/InlineNotice'
import { toUserMessage } from '../services/api/errorMessages'
import {
  addDaysToYmd,
  getMxDateString,
  ymdDayOfMonth,
  ymdMonthIndex,
  ymdWeekday,
} from '../utils/datetimeMx'

const API_URL = runtime.apiBaseUrl

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
  my_booking_preferred_hour?: number | null
}

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatDateLabel(dateStr: string): string {
  return `${DAYS_ES[ymdWeekday(dateStr)]} ${ymdDayOfMonth(dateStr)} de ${MONTHS_ES[ymdMonthIndex(dateStr)]}`
}

function isOpenGymOrPowerlifting(title: string): boolean {
  const t = title.toUpperCase()
  return t.includes('OPEN GYM') || t.includes('POWERLIFTING')
}

function getGymHours(dateStr: string): { start: number; end: number } {
  const day = ymdWeekday(dateStr)
  if (day === 6) return { start: 10, end: 12 }
  return { start: 6, end: 23 }
}

function isDayPast(dateStr: string): boolean {
  return dateStr < getMxDateString()
}

function isSunday(dateStr: string): boolean {
  return ymdWeekday(dateStr) === 0
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassWithBookings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const todayMx = getMxDateString()
    return isSunday(todayMx) ? addDaysToYmd(todayMx, 1) : todayMx
  })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get<ClassWithBookings[]>(
        `${API_URL}/classes/?target_date=${selectedDate}`
      )
      setClasses(response.data)
    } catch (error) {
      setError(toUserMessage(error, 'No se pudieron cargar las clases.'))
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const handleBook = async (classId: number, preferredHour?: number) => {
    if (actionLoading !== null) return
    setActionLoading(classId)
    setNotice(null)
    try {
      const payload: Record<string, unknown> = { class_id: classId, status: 'booked' }
      if (preferredHour !== undefined) payload.preferred_hour = preferredHour
      await axios.post(`${API_URL}/bookings/`, payload)
      setExpandedCard(null)
      setNotice('Reserva creada correctamente.')
      await fetchClasses()
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo crear la reserva.'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (bookingId: number) => {
    if (actionLoading !== null) return
    if (!confirm('¿Cancelar esta reserva?')) return
    setActionLoading(bookingId)
    setNotice(null)
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`)
      setNotice('Reserva cancelada correctamente.')
      await fetchClasses()
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo cancelar la reserva.'))
    } finally {
      setActionLoading(null)
    }
  }

  const navigateDate = (offset: number) => {
    const newDate = addDaysToYmd(selectedDate, offset)
    if (isDayPast(newDate)) return
    if (isSunday(newDate)) {
      const skipped = addDaysToYmd(newDate, offset > 0 ? 1 : -1)
      if (isDayPast(skipped)) return
      setSelectedDate(skipped)
      return
    }
    setSelectedDate(newDate)
  }

  const dayIsPast = isDayPast(selectedDate)
  const dayIsSunday = isSunday(selectedDate)
  const isToday = selectedDate === getMxDateString()

  const selectedDayOfWeek = ymdWeekday(selectedDate)
  const isSaturday = selectedDayOfWeek === 6

  const SATURDAY_ALLOWED = ['10:00 - 11:00 Calistenia', '11:00 - 12:00 Calistenia']
  const filteredClasses = isSaturday
    ? classes.filter((c) => SATURDAY_ALLOWED.includes(c.title))
    : classes

  const regularClasses = filteredClasses.filter((c) => !isOpenGymOrPowerlifting(c.title))
  const specialClasses = filteredClasses.filter((c) => isOpenGymOrPowerlifting(c.title))

  const { start: gymStart, end: gymEnd } = getGymHours(selectedDate)
  const hourSlots = Array.from({ length: gymEnd - gymStart }, (_, i) => gymStart + i)

  return (
    <div className="px-4 max-w-2xl mx-auto">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateDate(-1)}
          className="text-oc-muted hover:text-white p-2 rounded-lg hover:bg-oc-metal transition-colors"
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
          className="text-oc-muted hover:text-white p-2 rounded-lg hover:bg-oc-metal transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => fetchClasses()}
          disabled={loading}
          className="touch-target px-3 py-2 rounded-lg border border-oc-border text-oc-light/90 text-sm hover:text-white hover:border-oc-red disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>
      {notice && <div className="mb-4"><InlineNotice type="success" message={notice} /></div>}
      {error && <div className="mb-4"><ErrorState message={error} onRetry={fetchClasses} /></div>}

      {/* Quick date selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 7 }, (_, i) => {
          const dateStr = addDaysToYmd(getMxDateString(), i)
          const isSelected = dateStr === selectedDate
          const past = isDayPast(dateStr)
          const sunday = isSunday(dateStr)
          const disabled = past || sunday
          return (
            <button
              key={dateStr}
              onClick={() => !disabled && setSelectedDate(dateStr)}
              disabled={disabled}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                disabled
                  ? 'bg-oc-panel/50 text-oc-muted cursor-not-allowed border border-oc-border'
                  : isSelected
                    ? 'bg-oc-red text-white'
                    : 'bg-oc-metal text-oc-muted hover:text-white border border-oc-border'
              }`}
            >
              <div>{DAYS_ES[ymdWeekday(dateStr)].slice(0, 3)}</div>
              <div className="text-lg font-bold">{ymdDayOfMonth(dateStr)}</div>
              {sunday && <div className="text-[9px] mt-0.5">Cerrado</div>}
            </button>
          )
        })}
      </div>

      {/* Sunday message */}
      {dayIsSunday ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏖️</div>
          <p className="text-white text-lg font-semibold mb-2">Día de descanso</p>
          <p className="text-oc-muted">No hay clases los domingos</p>
        </div>
      ) : dayIsPast ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-white text-lg font-semibold mb-2">Día cerrado</p>
          <p className="text-oc-muted">Las reservas para este día ya cerraron</p>
        </div>
      ) : loading ? (
        <LoadingState message="Cargando clases..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchClasses} />
      ) : classes.length === 0 ? (
        <EmptyState
          title="Sin clases disponibles"
          message="No hay clases programadas para este dia."
          actionLabel="Actualizar"
          onAction={fetchClasses}
        />
      ) : (
        <div className="space-y-4">
          {/* Saturday info banner */}
          {isSaturday && (
            <div className="bg-oc-red/10 border border-oc-red/30 rounded-xl p-3 text-center">
              <p className="text-oc-red text-sm font-medium">Sábado — Horario especial de Calistenia</p>
            </div>
          )}

          {/* OPEN GYM / POWERLIFTING — only on weekdays */}
          {!isSaturday && specialClasses.map((cls) => {
            const isExpanded = expandedCard === cls.id
            const isBooked = cls.is_booked_by_me
            const selectedHour = cls.my_booking_preferred_hour ?? null

            return (
              <div
                key={cls.id}
                className={`bg-oc-metal rounded-xl border overflow-hidden transition-all ${
                  isBooked
                    ? 'border-oc-red/40 shadow-lg shadow-oc-red/15'
                    : 'border-oc-border/80'
                }`}
              >
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : cls.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isBooked ? 'bg-oc-red' : 'bg-oc-red'
                    }`} />
                    <div>
                      <h3 className={`font-bold text-base ${
                        isBooked ? 'text-oc-light' : 'text-white'
                      }`}>
                        {cls.title}
                      </h3>
                      <p className="text-xs text-oc-muted">
                        {isBooked ? '✓ Ya tienes reserva' : 'Toca para elegir horario'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cls.bookings_count > 0 && (
                      <span className="text-oc-muted text-sm">{cls.bookings_count} 👤</span>
                    )}
                    <svg
                      className={`w-5 h-5 text-oc-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-oc-border/80 p-4">
                    <p className="text-oc-muted text-xs mb-3">
                      Selecciona la hora a la que planeas asistir:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {hourSlots.map((hour) => (
                        <button
                          key={hour}
                          onClick={() => handleBook(cls.id, hour)}
                          disabled={actionLoading === cls.id || isBooked}
                          className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                            isBooked && selectedHour === hour
                              ? 'bg-oc-red/15 text-oc-light border border-oc-red/35 cursor-default'
                              : isBooked
                                ? 'bg-oc-dark/60 border border-oc-border text-oc-muted cursor-default'
                              : 'bg-oc-dark border border-oc-border text-white hover:border-oc-red hover:bg-oc-red/10 active:bg-oc-red active:text-white'
                          }`}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </button>
                      ))}
                    </div>
                    {isBooked && selectedHour != null && (
                      <p className="text-xs text-oc-light mt-2">
                        Tu horario registrado es: {selectedHour.toString().padStart(2, '0')}:00
                      </p>
                    )}
                    {isBooked && cls.my_booking_id && (
                      <button
                        onClick={() => handleCancel(cls.my_booking_id!)}
                        disabled={actionLoading === cls.my_booking_id}
                        className="mt-3 w-full py-2 rounded-lg bg-oc-red/15 border border-oc-red/40 text-oc-light text-sm font-medium hover:bg-oc-red/25 transition-colors"
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
          {!isSaturday && specialClasses.length > 0 && regularClasses.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-oc-panel" />
              <span className="text-oc-muted text-xs uppercase tracking-wide">Clases del día</span>
              <div className="flex-1 h-px bg-oc-panel" />
            </div>
          )}

          {/* Regular classes */}
          {regularClasses.map((cls) => {
            const isBooked = cls.is_booked_by_me
            const isProcessing = actionLoading !== null && (actionLoading === cls.id || actionLoading === cls.my_booking_id)

            return (
              <div
                key={cls.id}
                className={`bg-oc-metal rounded-xl border transition-all ${
                  isBooked
                    ? 'border-oc-red/40 shadow-lg shadow-oc-red/15'
                    : 'border-oc-border/80 hover:border-oc-red/30'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isBooked ? 'bg-oc-red' : 'bg-oc-border'
                      }`} />
                      <h3 className={`font-bold text-base truncate ${
                        isBooked ? 'text-oc-light' : 'text-white'
                      }`}>
                        {cls.title}
                      </h3>
                    </div>
                    {cls.bookings_count > 0 && (
                      <span className="text-oc-muted text-sm ml-2 flex-shrink-0">
                        {cls.bookings_count} 👤
                      </span>
                    )}
                  </div>

                  {isBooked ? (
                    <button
                      onClick={() => cls.my_booking_id && handleCancel(cls.my_booking_id)}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-lg bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold transition-colors disabled:opacity-50"
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
                    <div className="mt-3 h-1.5 bg-oc-panel rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isBooked ? 'bg-oc-red' : 'bg-oc-red'
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
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-oc-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-oc-red" />
          <span>Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-oc-border" />
          <span>Disponible</span>
        </div>
      </div>
    </div>
  )
}
