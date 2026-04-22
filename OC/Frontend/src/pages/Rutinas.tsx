import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { runtime } from '../config/runtime'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import InlineNotice from '../components/ui/InlineNotice'
import { toUserMessage } from '../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

interface Student {
  id: number
  name: string
  username: string
}

export default function Rutinas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'ai' | 'exercise'>('exercise')
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    student_id: '',
    goal: 'fuerza',
    level: 'intermedio',
    days_per_week: 3,
    session_minutes: 60,
    preference: 'calistenia',
    equipment_json: {
      barra: false,
      anillas: false,
      paralelas: false,
      pesas: false,
      resistencia: false
    }
  })
  
  const [exerciseFormData, setExerciseFormData] = useState({
    student_id: '',
    categories: [] as string[],
    level: 1,
    days_per_week: 3,
    weeks: 4
  })
  
  const categories = [
    { value: 'T.S.E', label: 'Tren Superior Empuje (T.S.E)' },
    { value: 'T.S.J', label: 'Tren Superior Jalón (T.S.J)' },
    { value: 'T.I', label: 'Tren Inferior (T.I)' },
    { value: 'CORE', label: 'Core (CORE)' }
  ]
  
  const levels = [
    { value: 1, label: 'Principiante' },
    { value: 2, label: 'Intermedio' },
    { value: 3, label: 'Avanzado' },
    { value: 4, label: 'Elite' },
    { value: 5, label: 'OC' }
  ]
  
  useEffect(() => {
    if (user?.role === 'coach') {
      fetchStudents()
    }
  }, [user])
  
  const fetchStudents = async () => {
    setLoadingStudents(true)
    setError(null)
    try {
      const response = await axios.get<Student[]>(`${API_URL}/coaches/students`)
      setStudents(response.data)
    } catch (error) {
      setError(toUserMessage(error, 'No se pudieron cargar tus alumnos.'))
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.student_id) {
      setError('Selecciona un alumno antes de generar el plan.')
      return
    }

    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const response = await axios.post(`${API_URL}/routines/generate`, {
        student_id: Number(formData.student_id),
        goal: formData.goal,
        level: formData.level,
        days_per_week: formData.days_per_week,
        session_minutes: formData.session_minutes,
        preference: formData.preference,
        equipment_json: formData.equipment_json
      })
      setNotice(`Plan generado: ${response.data.title}`)
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo generar el plan.'))
    } finally {
      setLoading(false)
    }
  }

  const handleEquipmentChange = (equipment: string) => {
    setFormData({
      ...formData,
      equipment_json: {
        ...formData.equipment_json,
        [equipment]: !formData.equipment_json[equipment as keyof typeof formData.equipment_json]
      }
    })
  }
  
  const handleCategoryToggle = (category: string) => {
    const current = exerciseFormData.categories
    if (current.includes(category)) {
      setExerciseFormData({
        ...exerciseFormData,
        categories: current.filter(c => c !== category)
      })
    } else {
      setExerciseFormData({
        ...exerciseFormData,
        categories: [...current, category]
      })
    }
  }
  
  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exerciseFormData.student_id) {
      setError('Selecciona un alumno antes de generar la rutina.')
      return
    }
    if (exerciseFormData.categories.length === 0) {
      setError('Selecciona al menos una categoria.')
      return
    }
    
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const response = await axios.post(
        `${API_URL}/routines/generate-from-exercises`,
        {
          student_id: Number(exerciseFormData.student_id),
          categories: exerciseFormData.categories,
          level: exerciseFormData.level,
          days_per_week: exerciseFormData.days_per_week,
          weeks: exerciseFormData.weeks
        }
      )
      setNotice(`Rutina generada: ${response.data.title}`)
      // Reset form
      setExerciseFormData({
        student_id: '',
        categories: [],
        level: 1,
        days_per_week: 3,
        weeks: 4
      })
    } catch (error) {
      setError(toUserMessage(error, 'No se pudo generar la rutina.'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <EmptyState title="Sin sesion activa" message="Inicia sesion para acceder al modulo." />
  }

  if (user.role === 'socio') {
    return (
      <div className="px-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Rutinas</h1>
        <EmptyState
          title="Rutinas gestionadas por coach"
          message="Tu coach crea y ajusta tus rutinas. Revisa tu modulo Mi Plan para consultar tu entrenamiento actual."
          actionLabel="Ir a Mi Plan"
          onAction={() => navigate('/app/mi-plan')}
        />
      </div>
    )
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Generar Rutina</h1>
      {notice && <div className="mb-4"><InlineNotice type="success" message={notice} /></div>}
      {error && <div className="mb-4"><ErrorState message={error} onRetry={fetchStudents} /></div>}
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-oc-red/20">
        <button
          onClick={() => setActiveTab('exercise')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'exercise'
              ? 'text-oc-red border-b-2 border-oc-red'
              : 'text-oc-muted hover:text-white'
          }`}
        >
          Por Categorías y Nivel
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'ai'
              ? 'text-oc-red border-b-2 border-oc-red'
              : 'text-oc-muted hover:text-white'
          }`}
        >
          Con IA
        </button>
      </div>
      
      {/* Exercise-based form */}
      {activeTab === 'exercise' && (
        <form onSubmit={handleExerciseSubmit} className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">Alumno</label>
            {loadingStudents ? (
              <LoadingState message="Cargando alumnos..." />
            ) : (
              <select
                value={exerciseFormData.student_id}
                onChange={(e) => setExerciseFormData({ ...exerciseFormData, student_id: e.target.value })}
                required
                className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
              >
                <option value="">Seleccionar alumno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} (@{student.username})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">
              Categorías de Entrenamiento <span className="text-oc-red">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <label key={cat.value} className="flex items-center text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exerciseFormData.categories.includes(cat.value)}
                    onChange={() => handleCategoryToggle(cat.value)}
                    className="mr-2 w-4 h-4 text-oc-red bg-oc-dark border-oc-border rounded focus:ring-oc-red"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-oc-muted mt-2">Selecciona al menos una categoría</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">Nivel</label>
            <select
              value={exerciseFormData.level}
              onChange={(e) => setExerciseFormData({ ...exerciseFormData, level: Number(e.target.value) })}
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            >
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.value} - {level.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-oc-light/90 mb-2">Días por Semana</label>
              <input
                type="number"
                value={exerciseFormData.days_per_week}
                onChange={(e) => setExerciseFormData({ ...exerciseFormData, days_per_week: Number(e.target.value) })}
                min="1"
                max="7"
                className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oc-light/90 mb-2">Semanas</label>
              <input
                type="number"
                value={exerciseFormData.weeks}
                onChange={(e) => setExerciseFormData({ ...exerciseFormData, weeks: Number(e.target.value) })}
                min="1"
                max="12"
                className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || exerciseFormData.categories.length === 0}
            className="w-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Generando rutina...' : 'Generar Rutina'}
          </button>
        </form>
      )}
      
      {/* AI-based form */}
      {activeTab === 'ai' && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Generar Rutina con IA</h2>

      <form onSubmit={handleSubmit} className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-oc-light/90 mb-2">ID del Alumno</label>
          <input
            type="number"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            required
            className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            placeholder="Ej: 3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-oc-light/90 mb-2">Objetivo</label>
          <select
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
          >
            <option value="fuerza">Fuerza</option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="resistencia">Resistencia</option>
            <option value="spartan">Spartan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-oc-light/90 mb-2">Nivel</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">Días por Semana</label>
            <input
              type="number"
              value={formData.days_per_week}
              onChange={(e) => setFormData({ ...formData, days_per_week: Number(e.target.value) })}
              min="1"
              max="7"
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">Duración Sesión (min)</label>
            <input
              type="number"
              value={formData.session_minutes}
              onChange={(e) => setFormData({ ...formData, session_minutes: Number(e.target.value) })}
              min="30"
              max="120"
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-oc-light/90 mb-2">Preferencia</label>
          <select
            value={formData.preference}
            onChange={(e) => setFormData({ ...formData, preference: e.target.value })}
            className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
          >
            <option value="calistenia">Calistenia</option>
            <option value="powerlifting">Powerlifting</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-oc-light/90 mb-2">Equipo Disponible</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(formData.equipment_json).map((equipment) => (
              <label key={equipment} className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={formData.equipment_json[equipment as keyof typeof formData.equipment_json]}
                  onChange={() => handleEquipmentChange(equipment)}
                  className="mr-2"
                />
                {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Generando plan...' : 'Generar Plan Mensual'}
        </button>
      </form>
        </div>
      )}
    </div>
  )
}
