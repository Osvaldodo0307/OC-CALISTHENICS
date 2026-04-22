import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, VirtualAssessment } from '../../types'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl
const defaultEquipment = {
  barra: false,
  anillas: false,
  paralelas: false,
  pesas: false,
  resistencia: false
}

export default function AsistenciaVirtual() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<User | null>(null)
  const [assessment, setAssessment] = useState<VirtualAssessment | null>(null)
  const [formData, setFormData] = useState({
    goal: 'fuerza',
    level: 'intermedio',
    days_per_week: 3,
    session_minutes: 60,
    equipment_json: defaultEquipment,
    restrictions: '',
    preference: 'calistenia'
  })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [studentRes, assessmentRes] = await Promise.all([
        axios.get(`${API_URL}/students/${id}`),
        axios.get(`${API_URL}/assessments/student/${id}`).catch(() => ({ data: [] }))
      ])
      setStudent(studentRes.data)
      if (assessmentRes.data.length > 0) {
        const latest = assessmentRes.data[0]
        setAssessment(latest)
        setFormData({
          goal: latest.goal || 'fuerza',
          level: latest.level || 'intermedio',
          days_per_week: latest.days_per_week || 3,
          session_minutes: latest.session_minutes || 60,
          equipment_json: latest.equipment_json || defaultEquipment,
          restrictions: latest.restrictions || '',
          preference: latest.preference || 'calistenia'
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (assessment) {
        // Actualizar evaluación existente (si hay endpoint para esto)
        alert('Actualización de evaluación no implementada en backend')
      } else {
        await axios.post(`${API_URL}/assessments`, {
          student_id: Number(id),
          ...formData
        })
        alert('Evaluación guardada exitosamente')
        fetchData()
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al guardar')
    }
  }

  const handleGeneratePlan = async () => {
    if (!assessment) {
      alert('Primero guarda la evaluación')
      return
    }

    try {
      const response = await axios.post(
        `${API_URL}/routines/generate-from-assessment/${assessment.id}`
      )
      alert(`Plan generado exitosamente: ${response.data.title}`)
      navigate(`/app/coach/alumno/${id}`)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al generar plan')
    }
  }

  const handleEquipmentChange = useCallback((equipment: keyof typeof defaultEquipment) => {
    setFormData((prev) => ({
      ...prev,
      equipment_json: {
        ...prev.equipment_json,
        [equipment]: !prev.equipment_json[equipment]
      }
    }))
  }, [])

  if (loading) {
    return <div className="text-white text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-white mb-6">
        Asistencia Virtual - {student?.name}
      </h1>

      <form onSubmit={handleSubmit} className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 space-y-6">
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
          <label className="block text-sm font-medium text-oc-light/90 mb-2">Equipo Disponible</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(formData.equipment_json).map((equipment) => (
              <label key={equipment} className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={formData.equipment_json[equipment as keyof typeof formData.equipment_json]}
                  onChange={() => handleEquipmentChange(equipment as keyof typeof defaultEquipment)}
                  className="mr-2"
                />
                {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
              </label>
            ))}
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
          <label className="block text-sm font-medium text-oc-light/90 mb-2">Restricciones/Lesiones</label>
          <textarea
            value={formData.restrictions}
            onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
            className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            rows={3}
            placeholder="Describir restricciones o lesiones..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
          >
            {assessment ? 'Actualizar Evaluación' : 'Guardar Evaluación'}
          </button>
          {assessment && (
            <button
              type="button"
              onClick={handleGeneratePlan}
              className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
            >
              Generar Plan Mensual (1 Click)
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
