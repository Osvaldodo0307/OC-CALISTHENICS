import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { addDaysToYmd, getMxDateString, startOfWeekMondayYmd } from '../../utils/datetimeMx'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl

interface AttendanceRecord {
  booking_id: number
  date: string
  class_id: number
  class_title: string
  discipline: string
  attendance_hour: string
  preferred_hour?: number | null
}

interface AttendanceStudent {
  user_id: number
  name: string
  username: string
  total: number
  by_day: Record<string, number>
  records: AttendanceRecord[]
}

interface AttendanceResponse {
  from: string
  to: string
  total_records: number
  daily_totals: Array<{ date: string; count: number }>
  students: AttendanceStudent[]
}

interface AttendanceSummaryResponse extends AttendanceResponse {
  month: string
  discipline_totals: Array<{ discipline: string; count: number }>
}

interface ClassOption {
  id: number
  title: string
  start_datetime: string
}

type RollMark = 'present' | 'absent' | 'clear'

interface SocioRosterEntry {
  booking_id: number
  user_id: number
  name: string
  attended: boolean | null
}

interface SocioRosterResponse {
  class_id: number
  role: 'socio'
  title: string
  start_datetime: string
  entries: SocioRosterEntry[]
}

interface CoachRosterResponse {
  class_id: number
  role: 'coach'
  title: string
  start_datetime: string
  coach_attended: boolean | null
  coach: { user_id: number; name: string } | null
}

function formatTime(dt: string): string {
  const [, timePart = '00:00:00'] = dt.split('T')
  return timePart.slice(0, 5)
}

function attendedToMark(v: boolean | null | undefined): RollMark {
  if (v === true) return 'present'
  if (v === false) return 'absent'
  return 'clear'
}

export default function AdminAsistencia() {
  const [weekStart, setWeekStart] = useState<string>(startOfWeekMondayYmd(getMxDateString()))
  const [month, setMonth] = useState<string>(getMxDateString().slice(0, 7))
  const [weekData, setWeekData] = useState<AttendanceResponse | null>(null)
  const [monthData, setMonthData] = useState<AttendanceSummaryResponse | null>(null)
  const [loadingWeek, setLoadingWeek] = useState<boolean>(true)
  const [loadingMonth, setLoadingMonth] = useState<boolean>(true)

  const [rollDate, setRollDate] = useState<string>(getMxDateString())
  const [dayClasses, setDayClasses] = useState<ClassOption[]>([])
  const [loadingDayClasses, setLoadingDayClasses] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('')
  const [rollRole, setRollRole] = useState<'socio' | 'coach'>('socio')
  const [socioEntries, setSocioEntries] = useState<SocioRosterEntry[]>([])
  const [socioMarks, setSocioMarks] = useState<Record<number, RollMark>>({})
  const [coachRoster, setCoachRoster] = useState<CoachRosterResponse | null>(null)
  const [coachMark, setCoachMark] = useState<RollMark>('clear')
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [savingRoll, setSavingRoll] = useState(false)
  const [rollMessage, setRollMessage] = useState<string | null>(null)

  const weekEnd = useMemo(() => addDaysToYmd(weekStart, 6), [weekStart])

  useEffect(() => {
    const fetchWeek = async () => {
      setLoadingWeek(true)
      try {
        const response = await axios.get<AttendanceResponse>(
          `${API_URL}/admin/attendance?from=${weekStart}&to=${weekEnd}`,
        )
        setWeekData(response.data)
      } catch (error) {
        console.error('Error fetching weekly attendance:', error)
      } finally {
        setLoadingWeek(false)
      }
    }
    fetchWeek()
  }, [weekStart, weekEnd])

  useEffect(() => {
    const fetchMonth = async () => {
      setLoadingMonth(true)
      try {
        const response = await axios.get<AttendanceSummaryResponse>(
          `${API_URL}/admin/attendance/summary?month=${month}`,
        )
        setMonthData(response.data)
      } catch (error) {
        console.error('Error fetching monthly attendance summary:', error)
      } finally {
        setLoadingMonth(false)
      }
    }
    fetchMonth()
  }, [month])

  const fetchDayClasses = useCallback(async () => {
    setLoadingDayClasses(true)
    setRollMessage(null)
    try {
      const response = await axios.get<ClassOption[]>(`${API_URL}/classes/?target_date=${rollDate}`)
      setDayClasses(response.data)
      setSelectedClassId((prev) => {
        if (prev === '') return prev
        const still = response.data.some((c) => c.id === prev)
        return still ? prev : ''
      })
    } catch (e) {
      console.error(e)
      setDayClasses([])
      setRollMessage('No se pudieron cargar las clases del día.')
    } finally {
      setLoadingDayClasses(false)
    }
  }, [rollDate])

  useEffect(() => {
    void fetchDayClasses()
  }, [fetchDayClasses])

  const fetchRoster = useCallback(async () => {
    if (selectedClassId === '') {
      setSocioEntries([])
      setSocioMarks({})
      setCoachRoster(null)
      return
    }
    setLoadingRoster(true)
    setRollMessage(null)
    try {
      if (rollRole === 'socio') {
        const { data } = await axios.get<SocioRosterResponse>(
          `${API_URL}/admin/attendance/session/${selectedClassId}/roster?role=socio`,
        )
        setSocioEntries(data.entries)
        const next: Record<number, RollMark> = {}
        for (const e of data.entries) {
          next[e.booking_id] = attendedToMark(e.attended)
        }
        setSocioMarks(next)
        setCoachRoster(null)
      } else {
        const { data } = await axios.get<CoachRosterResponse>(
          `${API_URL}/admin/attendance/session/${selectedClassId}/roster?role=coach`,
        )
        setCoachRoster(data)
        setCoachMark(attendedToMark(data.coach_attended))
        setSocioEntries([])
        setSocioMarks({})
      }
    } catch (e) {
      console.error(e)
      setRollMessage('No se pudo cargar la lista de la clase.')
      setSocioEntries([])
      setCoachRoster(null)
    } finally {
      setLoadingRoster(false)
    }
  }, [selectedClassId, rollRole])

  useEffect(() => {
    void fetchRoster()
  }, [fetchRoster])

  const saveRoll = async () => {
    if (selectedClassId === '') return
    setSavingRoll(true)
    setRollMessage(null)
    try {
      if (rollRole === 'socio') {
        const marks = socioEntries.map((e) => ({
          booking_id: e.booking_id,
          mark: socioMarks[e.booking_id] ?? 'clear',
        }))
        await axios.patch(`${API_URL}/admin/attendance/session/${selectedClassId}`, {
          role: 'socio',
          marks,
        })
        setRollMessage('Lista de alumnos guardada.')
      } else {
        await axios.patch(`${API_URL}/admin/attendance/session/${selectedClassId}`, {
          role: 'coach',
          coach_mark: coachMark,
        })
        setRollMessage('Asistencia del coach guardada.')
      }
      await fetchRoster()
    } catch (e) {
      console.error(e)
      setRollMessage('No se pudo guardar. Revisa la consola o intenta de nuevo.')
    } finally {
      setSavingRoll(false)
    }
  }

  return (
    <div className="px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Asistencia</h1>
      <p className="text-gray-500 text-sm mb-6">Pasar lista por clase y consulta histórica</p>

      <section className="bg-oc-metal rounded-xl border border-gray-700/50 p-4 mb-8">
        <h2 className="text-white font-semibold mb-1">Pasar lista por clase</h2>
        <p className="text-gray-500 text-sm mb-4">
          Elige la fecha, la clase y si registrarás alumnos (reservas activas) o al coach asignado.
        </p>

        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <input
              type="date"
              value={rollDate}
              onChange={(e) => setRollDate(e.target.value)}
              className="bg-oc-dark border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="block text-xs text-gray-400 mb-1">Clase</label>
            <select
              value={selectedClassId === '' ? '' : String(selectedClassId)}
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-oc-dark border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
              disabled={loadingDayClasses || dayClasses.length === 0}
            >
              <option value="">
                {loadingDayClasses ? 'Cargando…' : dayClasses.length === 0 ? 'Sin clases este día' : 'Selecciona una clase'}
              </option>
              {dayClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatTime(c.start_datetime)} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-400">Lista para:</span>
          <button
            type="button"
            onClick={() => setRollRole('socio')}
            className={`px-3 py-1.5 rounded text-sm ${
              rollRole === 'socio' ? 'bg-oc-red text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            Alumno
          </button>
          <button
            type="button"
            onClick={() => setRollRole('coach')}
            className={`px-3 py-1.5 rounded text-sm ${
              rollRole === 'coach' ? 'bg-oc-red text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            Coach
          </button>
        </div>

        {rollMessage && (
          <p className={`text-sm mb-3 ${rollMessage.startsWith('No ') ? 'text-amber-400' : 'text-green-400'}`}>
            {rollMessage}
          </p>
        )}

        {selectedClassId !== '' && loadingRoster && (
          <p className="text-gray-400 text-sm">Cargando lista…</p>
        )}

        {selectedClassId !== '' && !loadingRoster && rollRole === 'socio' && (
          <>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-300">ID</th>
                    <th className="text-left py-2 text-gray-300">Nombre</th>
                    <th className="text-left py-2 text-gray-300">Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {socioEntries.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-3 text-gray-500">
                        No hay reservas activas en esta clase.
                      </td>
                    </tr>
                  ) : (
                    socioEntries.map((row) => (
                      <tr key={row.booking_id} className="border-b border-gray-800">
                        <td className="py-2 text-gray-300 font-mono">{row.user_id}</td>
                        <td className="py-2 text-white">{row.name}</td>
                        <td className="py-2">
                          <select
                            value={socioMarks[row.booking_id] ?? 'clear'}
                            onChange={(e) =>
                              setSocioMarks((m) => ({
                                ...m,
                                [row.booking_id]: e.target.value as RollMark,
                              }))
                            }
                            className="bg-oc-dark border border-gray-700 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="clear">Sin marcar</option>
                            <option value="present">Presente</option>
                            <option value="absent">Ausente</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => void saveRoll()}
              disabled={savingRoll || socioEntries.length === 0}
              className="bg-oc-red hover:bg-oc-red-deep disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {savingRoll ? 'Guardando…' : 'Guardar lista de alumnos'}
            </button>
          </>
        )}

        {selectedClassId !== '' && !loadingRoster && rollRole === 'coach' && (
          <>
            {!coachRoster?.coach ? (
              <p className="text-gray-500 text-sm mb-3">Esta clase no tiene coach asignado.</p>
            ) : (
              <>
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-300">ID</th>
                        <th className="text-left py-2 text-gray-300">Nombre</th>
                        <th className="text-left py-2 text-gray-300">Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="py-2 text-gray-300 font-mono">{coachRoster.coach.user_id}</td>
                        <td className="py-2 text-white">{coachRoster.coach.name}</td>
                        <td className="py-2">
                          <select
                            value={coachMark}
                            onChange={(e) => setCoachMark(e.target.value as RollMark)}
                            className="bg-oc-dark border border-gray-700 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="clear">Sin marcar</option>
                            <option value="present">Presente</option>
                            <option value="absent">Ausente</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => void saveRoll()}
                  disabled={savingRoll}
                  className="bg-oc-red hover:bg-oc-red-deep disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
                >
                  {savingRoll ? 'Guardando…' : 'Guardar asistencia del coach'}
                </button>
              </>
            )}
          </>
        )}
      </section>

      <h2 className="text-lg font-semibold text-white mb-4">Histórico</h2>
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-oc-metal rounded-xl border border-gray-700/50 p-4">
          <h2 className="text-white font-semibold mb-3">Vista semanal</h2>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setWeekStart(addDaysToYmd(weekStart, -7))}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Semana anterior
            </button>
            <button
              onClick={() => setWeekStart(addDaysToYmd(weekStart, 7))}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Semana siguiente
            </button>
            <button
              onClick={() => setWeekStart(startOfWeekMondayYmd(getMxDateString()))}
              className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1.5 rounded text-sm"
            >
              Semana actual
            </button>
          </div>
          <p className="text-sm text-gray-300">Rango: {weekStart} a {weekEnd}</p>
        </div>

        <div className="bg-oc-metal rounded-xl border border-gray-700/50 p-4">
          <h2 className="text-white font-semibold mb-3">Resumen mensual</h2>
          <label className="text-sm text-gray-400 mr-2">Mes</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-oc-dark border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-oc-metal rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-oc-red font-semibold mb-3">Detalle semanal</h3>
          {loadingWeek ? (
            <p className="text-gray-400 text-sm">Cargando asistencia semanal...</p>
          ) : !weekData ? (
            <p className="text-gray-400 text-sm">No se pudo cargar la semana.</p>
          ) : (
            <>
              <p className="text-sm text-gray-300 mb-3">Reservas registradas: {weekData.total_records}</p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-300">Alumno</th>
                      <th className="text-left py-2 text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.students.map((student) => (
                      <tr key={student.user_id} className="border-b border-gray-800">
                        <td className="py-2 text-white">{student.name}</td>
                        <td className="py-2 text-gray-300">{student.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2">
                {weekData.daily_totals.map((row) => (
                  <div key={row.date} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{row.date}</span>
                    <span className="text-white font-semibold">{row.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="bg-oc-metal rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-oc-red font-semibold mb-3">Resumen mensual</h3>
          {loadingMonth ? (
            <p className="text-gray-400 text-sm">Cargando resumen mensual...</p>
          ) : !monthData ? (
            <p className="text-gray-400 text-sm">No se pudo cargar el mes.</p>
          ) : (
            <>
              <p className="text-sm text-gray-300 mb-3">Reservas registradas: {monthData.total_records}</p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-300">Alumno</th>
                      <th className="text-left py-2 text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.students.map((student) => (
                      <tr key={student.user_id} className="border-b border-gray-800">
                        <td className="py-2 text-white">{student.name}</td>
                        <td className="py-2 text-gray-300">{student.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 className="text-white text-sm font-semibold mb-2">Disciplinas</h4>
              <div className="space-y-2">
                {monthData.discipline_totals.map((row) => (
                  <div key={row.discipline} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{row.discipline}</span>
                    <span className="text-white font-semibold">{row.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
