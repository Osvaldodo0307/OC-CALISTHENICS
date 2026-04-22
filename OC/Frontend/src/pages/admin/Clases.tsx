import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { addDaysToYmd, getMxDateString, ymdDayOfMonth, ymdWeekday } from '../../utils/datetimeMx'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl

interface ClassSession {
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
  bookings_count?: number
}

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatTime(dt: string): string {
  const [, timePart = '00:00:00'] = dt.split('T')
  return timePart.slice(0, 5)
}

function extractHourMinute(dt: string): { hour: number; minute: number } {
  const [, timePart = '00:00:00'] = dt.split('T')
  const [hour = '0', minute = '0'] = timePart.split(':')
  return { hour: Number(hour), minute: Number(minute) }
}

const DISCIPLINES = [
  'Calistenia', 'Explosive', 'HYROX', 'GAP', 'Karate',
  'Kickboxing', 'Funcional', 'Open Gym', 'Powerlifting', 'Otra'
]

type FormData = {
  title: string
  discipline: string
  hour: number
  minute: number
  duration_minutes: number
  capacity: number
  date: string
}

const EMPTY_FORM: FormData = {
  title: '',
  discipline: 'Calistenia',
  hour: 7,
  minute: 0,
  duration_minutes: 60,
  capacity: 999,
  date: '',
}

export default function AdminClases() {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(getMxDateString())
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get<ClassSession[]>(
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

  const openNewForm = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, date: selectedDate })
    setShowForm(true)
  }

  const openEditForm = (cls: ClassSession) => {
    const { hour, minute } = extractHourMinute(cls.start_datetime)
    setEditingId(cls.id)
    setForm({
      title: cls.title,
      discipline: cls.discipline,
      hour,
      minute,
      duration_minutes: cls.duration_minutes,
      capacity: cls.capacity,
      date: selectedDate,
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const startDt = `${form.date}T${form.hour.toString().padStart(2, '0')}:${form.minute.toString().padStart(2, '0')}:00`
      const payload = {
        title: form.title,
        discipline: form.discipline,
        description: null,
        intensity: 'med',
        level: 'all',
        duration_minutes: form.duration_minutes,
        capacity: form.capacity,
        start_datetime: startDt,
        coach_id: null,
      }
      if (editingId) {
        await axios.put(`${API_URL}/classes/${editingId}`, payload)
      } else {
        await axios.post(`${API_URL}/classes/`, payload)
      }
      setShowForm(false)
      setEditingId(null)
      await fetchClasses()
    } catch (error) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.detail : undefined
      alert(msg || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return
    try {
      await axios.delete(`${API_URL}/classes/${id}`)
      await fetchClasses()
    } catch (error) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.detail : undefined
      alert(msg || 'Error al eliminar')
    }
  }

  const handleGenerate = async () => {
    if (!confirm('Esto generará clases para los próximos 7 días (sin duplicar las existentes). ¿Continuar?')) return
    setGenerating(true)
    try {
      const r = await axios.post(`${API_URL}/classes/generate-schedule?days=7`)
      alert(`Listo: ${r.data.created} clases creadas, ${r.data.skipped} ya existían.`)
      await fetchClasses()
    } catch (error) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.detail : undefined
      alert(msg || 'Error al generar')
    } finally {
      setGenerating(false)
    }
  }

  const updateTitle = (disc: string, hour: number, min: number, dur: number) => {
    const h1 = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
    const endH = hour + Math.floor((min + dur) / 60)
    const endM = (min + dur) % 60
    const h2 = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
    if (disc === 'Open Gym') return 'OPEN GYM'
    if (disc === 'Powerlifting') return 'POWERLIFTING'
    return `${h1} - ${h2} ${disc}`
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDaysToYmd(getMxDateString(), i)
  })

  const selectedDayName = DAYS_ES[ymdWeekday(selectedDate)]

  return (
    <div className="px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Clases</h1>
          <p className="text-oc-muted text-sm">Agregar, editar o eliminar clases</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-oc-panel hover:bg-oc-border text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {generating ? 'Generando...' : 'Generar semana'}
        </button>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {weekDays.map((dateStr) => {
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-oc-red text-white'
                  : 'bg-oc-metal text-oc-muted hover:text-white border border-oc-border'
              }`}
            >
              <div>{DAYS_ES[ymdWeekday(dateStr)].slice(0, 3)}</div>
              <div className="text-lg font-bold">{ymdDayOfMonth(dateStr)}</div>
            </button>
          )
        })}
      </div>

      {/* Header for selected day */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {selectedDayName} — {classes.length} clase{classes.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={openNewForm}
          className="bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva clase
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-oc-metal rounded-xl border border-oc-red/30 p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">
            {editingId ? 'Editar clase' : 'Nueva clase'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-oc-muted mb-1">Disciplina</label>
                <select
                  value={form.discipline}
                  onChange={(e) => {
                    const disc = e.target.value
                    setForm((f) => ({
                      ...f,
                      discipline: disc,
                      title: updateTitle(disc, f.hour, f.minute, f.duration_minutes),
                    }))
                  }}
                  className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-oc-muted mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-oc-muted mb-1">Hora inicio</label>
                <select
                  value={form.hour}
                  onChange={(e) => {
                    const h = Number(e.target.value)
                    setForm((f) => ({
                      ...f,
                      hour: h,
                      title: updateTitle(f.discipline, h, f.minute, f.duration_minutes),
                    }))
                  }}
                  className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-oc-muted mb-1">Minutos</label>
                <select
                  value={form.minute}
                  onChange={(e) => {
                    const m = Number(e.target.value)
                    setForm((f) => ({
                      ...f,
                      minute: m,
                      title: updateTitle(f.discipline, f.hour, m, f.duration_minutes),
                    }))
                  }}
                  className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value={0}>:00</option>
                  <option value={15}>:15</option>
                  <option value={30}>:30</option>
                  <option value={45}>:45</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-oc-muted mb-1">Duración</label>
                <select
                  value={form.duration_minutes}
                  onChange={(e) => {
                    const dur = Number(e.target.value)
                    setForm((f) => ({
                      ...f,
                      duration_minutes: dur,
                      title: updateTitle(f.discipline, f.hour, f.minute, dur),
                    }))
                  }}
                  className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value={30}>30 min</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                  <option value={120}>2 horas</option>
                  <option value={720}>Todo el día</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-oc-muted mb-1">Capacidad</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-oc-muted mb-1">Título (se genera automático)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-oc-dark border border-oc-border rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-oc-red hover:bg-oc-red-deep text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear clase'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null) }}
                className="bg-oc-panel hover:bg-oc-border text-white text-sm px-5 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-oc-red border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-oc-muted">Cargando...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-oc-metal rounded-xl border border-oc-border/80">
          <p className="text-oc-muted mb-3">No hay clases para este día</p>
          <button
            onClick={openNewForm}
            className="text-oc-red hover:text-white text-sm font-medium transition-colors"
          >
            + Agregar una clase
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-oc-metal rounded-xl border border-oc-border/80 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-center flex-shrink-0 w-14">
                  <p className="text-oc-red font-bold text-sm">{formatTime(cls.start_datetime)}</p>
                  <p className="text-oc-muted text-[10px]">{cls.duration_minutes} min</p>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{cls.title}</h3>
                  <p className="text-oc-muted text-xs">{cls.discipline} · Cap: {cls.capacity}</p>
                </div>
                {cls.bookings_count != null && cls.bookings_count > 0 && (
                  <span className="bg-oc-red/20 text-oc-light text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                    {cls.bookings_count} 👤
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 ml-3 flex-shrink-0 justify-end">
                <Link
                  to={`/app/admin/asistencia?date=${encodeURIComponent(selectedDate)}&classId=${cls.id}`}
                  className="bg-oc-panel hover:bg-oc-border text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                  title="Registrar asistencia de alumnos con reserva en esta clase"
                >
                  Asistencia
                </Link>
                <button
                  onClick={() => openEditForm(cls)}
                  className="text-oc-muted hover:text-oc-red hover:bg-oc-red/10 p-2 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(cls.id, cls.title)}
                  className="text-oc-red hover:text-oc-light hover:bg-oc-red/20 p-2 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
