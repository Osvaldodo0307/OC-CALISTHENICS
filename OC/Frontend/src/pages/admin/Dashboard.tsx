import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Student {
  id: number
  name: string
  username: string
  phone?: string
}

interface ClassData {
  id: number
  title: string
  discipline: string
  start_datetime: string
  bookings_count: number
  students: Student[]
}

interface DayData {
  date: string
  day_name: string
  is_today: boolean
  bookings_count: number
  classes: ClassData[]
}

interface WeeklyData {
  week_start: string
  week_end: string
  total_bookings: number
  total_unique_students: number
  days: DayData[]
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatWeekRange(startStr: string, endStr: string): string {
  const s = new Date(startStr + 'T12:00:00')
  const e = new Date(endStr + 'T12:00:00')
  return `${s.getDate()} ${MONTHS_ES[s.getMonth()]} — ${e.getDate()} ${MONTHS_ES[e.getMonth()]} ${e.getFullYear()}`
}

export default function AdminDashboard() {
  const [weekData, setWeekData] = useState<WeeklyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [expandedClass, setExpandedClass] = useState<number | null>(null)

  const getWeekStart = useCallback(() => {
    const today = new Date()
    const monday = getMonday(new Date(today))
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday.toISOString().split('T')[0]
  }, [weekOffset])

  const fetchWeekData = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = getWeekStart()
      const response = await axios.get<WeeklyData>(
        `${API_URL}/dashboard/admin/weekly-schedule?start_date=${startDate}`
      )
      setWeekData(response.data)

      // Auto-expand today
      const today = response.data.days.find(d => d.is_today)
      if (today) {
        setExpandedDay(today.date)
      } else if (response.data.days.length > 0) {
        setExpandedDay(response.data.days[0].date)
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error)
    } finally {
      setLoading(false)
    }
  }, [getWeekStart])

  useEffect(() => {
    fetchWeekData()
  }, [fetchWeekData])

  const toggleDay = (dateStr: string) => {
    setExpandedDay(expandedDay === dateStr ? null : dateStr)
    setExpandedClass(null)
  }

  const toggleClass = (classId: number) => {
    setExpandedClass(expandedClass === classId ? null : classId)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-oc-red border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Cargando agenda semanal...</p>
      </div>
    )
  }

  if (!weekData) {
    return <div className="text-center py-12 text-gray-400">Error al cargar datos</div>
  }

  return (
    <div className="px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Agenda Semanal</h1>
        <p className="text-gray-500 text-sm">Reservas de alumnos por clase y día</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6 bg-oc-metal rounded-xl border border-gray-700/50 p-4">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-white font-semibold">
            {formatWeekRange(weekData.week_start, weekData.week_end)}
          </p>
          {weekOffset === 0 && (
            <span className="text-xs text-oc-red font-medium">Semana actual</span>
          )}
        </div>

        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-oc-metal rounded-xl border border-gray-700/50 p-4 text-center">
          <p className="text-3xl font-bold text-oc-red">{weekData.total_bookings}</p>
          <p className="text-xs text-gray-500 mt-1">Reservas totales</p>
        </div>
        <div className="bg-oc-metal rounded-xl border border-gray-700/50 p-4 text-center">
          <p className="text-3xl font-bold text-white">{weekData.total_unique_students}</p>
          <p className="text-xs text-gray-500 mt-1">Alumnos activos</p>
        </div>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {weekData.days.map((day) => {
          const isExpanded = expandedDay === day.date
          const dateObj = new Date(day.date + 'T12:00:00')
          const dayNum = dateObj.getDate()

          return (
            <div key={day.date} className="bg-oc-metal rounded-xl border border-gray-700/50 overflow-hidden">
              {/* Day header */}
              <button
                onClick={() => toggleDay(day.date)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    day.is_today
                      ? 'bg-oc-red text-white'
                      : 'bg-gray-700/50 text-gray-400'
                  }`}>
                    {dayNum}
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${day.is_today ? 'text-oc-red' : 'text-white'}`}>
                      {day.day_name}
                      {day.is_today && <span className="text-xs ml-2 text-oc-red/70">HOY</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {day.bookings_count} reserva{day.bookings_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {day.bookings_count > 0 && (
                    <span className="bg-oc-red/20 text-oc-red text-xs font-bold px-2 py-1 rounded-full">
                      {day.bookings_count}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Day classes */}
              {isExpanded && (
                <div className="border-t border-gray-700/50">
                  {day.classes.length === 0 ? (
                    <p className="px-4 py-6 text-center text-gray-500 text-sm">
                      Sin clases programadas
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-700/30">
                      {day.classes.map((cls) => {
                        const isClassExpanded = expandedClass === cls.id
                        const hasStudents = cls.bookings_count > 0

                        return (
                          <div key={cls.id}>
                            <button
                              onClick={() => hasStudents && toggleClass(cls.id)}
                              className={`w-full px-4 py-3 flex items-center justify-between ${
                                hasStudents ? 'hover:bg-gray-700/20 cursor-pointer' : 'cursor-default'
                              } transition-colors`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  hasStudents ? 'bg-green-500' : 'bg-gray-600'
                                }`} />
                                <span className="text-sm text-white truncate">{cls.title}</span>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {hasStudents && (
                                  <>
                                    <div className="flex items-center gap-1 text-gray-400">
                                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                      </svg>
                                      <span className="text-xs font-medium">{cls.bookings_count}</span>
                                    </div>
                                    <svg
                                      className={`w-4 h-4 text-gray-500 transition-transform ${isClassExpanded ? 'rotate-180' : ''}`}
                                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </>
                                )}
                                {!hasStudents && (
                                  <span className="text-xs text-gray-600">0</span>
                                )}
                              </div>
                            </button>

                            {/* Student list */}
                            {isClassExpanded && hasStudents && (
                              <div className="px-4 pb-3">
                                <div className="ml-5 space-y-1.5">
                                  {cls.students.map((student) => (
                                    <div
                                      key={student.id}
                                      className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-oc-red/30 flex items-center justify-center">
                                          <span className="text-[10px] font-bold text-oc-red">
                                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                          </span>
                                        </div>
                                        <span className="text-sm text-gray-300">{student.name}</span>
                                      </div>
                                      {student.phone && (
                                        <a
                                          href={`https://wa.me/52${student.phone}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-500 hover:text-green-400 transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick today button */}
      {weekOffset !== 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setWeekOffset(0)}
            className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold transition-colors"
          >
            Ir a esta semana
          </button>
        </div>
      )}
    </div>
  )
}
