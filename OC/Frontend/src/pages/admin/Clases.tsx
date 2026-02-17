import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { ClassSession } from '../../types'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type ClassFormData = {
  title: string
  discipline: string
  description: string
  intensity: ClassSession['intensity']
  level: ClassSession['level']
  duration_minutes: number
  capacity: number
  start_datetime: string
  coach_id: number | null
}

export default function AdminClases() {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null)
  const [formData, setFormData] = useState<ClassFormData>({
    title: '',
    discipline: '',
    description: '',
    intensity: 'med' as 'low' | 'med' | 'high',
    level: 'all' as 'all' | 'inter' | 'adv',
    duration_minutes: 60,
    capacity: 20,
    start_datetime: '',
    coach_id: null as number | null
  })

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.get<ClassSession[]>(`${API_URL}/classes`)
      setClasses(response.data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingClass) {
        await axios.put(`${API_URL}/classes/${editingClass.id}`, {
          ...formData,
          start_datetime: new Date(formData.start_datetime).toISOString()
        })
      } else {
        await axios.post(`${API_URL}/classes`, {
          ...formData,
          start_datetime: new Date(formData.start_datetime).toISOString()
        })
      }
      fetchClasses()
      setShowForm(false)
      setEditingClass(null)
      resetForm()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al guardar')
    }
  }

  const handleEdit = (classSession: ClassSession) => {
    setEditingClass(classSession)
    setFormData({
      title: classSession.title,
      discipline: classSession.discipline,
      description: classSession.description || '',
      intensity: classSession.intensity,
      level: classSession.level,
      duration_minutes: classSession.duration_minutes,
      capacity: classSession.capacity,
      start_datetime: new Date(classSession.start_datetime).toISOString().slice(0, 16),
      coach_id: classSession.coach_id || null
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return
    try {
      await axios.delete(`${API_URL}/classes/${id}`)
      fetchClasses()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al eliminar')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      discipline: '',
      description: '',
      intensity: 'med',
      level: 'all',
      duration_minutes: 60,
      capacity: 20,
      start_datetime: '',
      coach_id: null
    })
  }

  if (loading) {
    return <div className="text-white text-center py-8">Cargando clases...</div>
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Clases</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingClass(null)
            resetForm()
          }}
          className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
        >
          Nueva Clase
        </button>
      </div>

      {showForm && (
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
          <h2 className="text-2xl font-semibold text-oc-red mb-4">
            {editingClass ? 'Editar Clase' : 'Nueva Clase'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Disciplina</label>
                <input
                  type="text"
                  value={formData.discipline}
                  onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Intensidad</label>
                <select
                  value={formData.intensity}
                  onChange={(e) =>
                    setFormData({ ...formData, intensity: e.target.value as ClassSession['intensity'] })
                  }
                  className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                >
                  <option value="low">Baja</option>
                  <option value="med">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nivel</label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value as ClassSession['level'] })
                  }
                  className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                >
                  <option value="all">Todos</option>
                  <option value="inter">Intermedio</option>
                  <option value="adv">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duración (min)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                  className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capacidad</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha y Hora</label>
              <input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                required
                className="w-full bg-oc-dark border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
              >
                {editingClass ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingClass(null)
                  resetForm()
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classSession) => (
          <div
            key={classSession.id}
            className="bg-oc-metal p-6 rounded-lg border border-oc-red/20"
          >
            <h2 className="text-xl font-bold text-oc-red mb-2">{classSession.title}</h2>
            <p className="text-gray-300 mb-2">{classSession.discipline}</p>
            <p className="text-sm text-gray-400 mb-4">
              {format(new Date(classSession.start_datetime), "dd/MM/yyyy HH:mm")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(classSession)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(classSession.id)}
                className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
