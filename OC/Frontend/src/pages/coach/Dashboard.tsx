import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl

interface StudentData {
  id: number
  name: string
  last_progress: {
    date: string | null
    metric: string | null
    value: number | null
  }
  consistency: number
}

export default function CoachDashboard() {
  const [data, setData] = useState<{ students: StudentData[]; total_students: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/coach`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching coach dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Cargando dashboard...</div>
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard Coach</h1>

      {data && (
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
          <h2 className="text-2xl font-semibold text-oc-red mb-2">Total de Alumnos</h2>
          <p className="text-4xl font-bold text-white">{data.total_students}</p>
        </div>
      )}

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
        <h2 className="text-2xl font-semibold text-oc-red mb-4">Mis Alumnos</h2>
        {data && data.students.length === 0 ? (
          <p className="text-oc-muted">No tienes alumnos asignados</p>
        ) : (
          <div className="space-y-4">
            {data?.students.map((student) => (
              <div
                key={student.id}
                className="bg-oc-dark p-4 rounded border border-oc-border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/app/coach/alumno/${student.id}`}
                      className="text-xl font-bold text-white hover:text-oc-red"
                    >
                      {student.name}
                    </Link>
                    {student.last_progress.date && (
                      <p className="text-sm text-oc-muted mt-1">
                        Último progreso: {student.last_progress.metric} = {student.last_progress.value}
                        {' '}
                        ({new Date(student.last_progress.date).toLocaleDateString()})
                      </p>
                    )}
                    <p className="text-sm text-oc-muted">
                      Consistencia (últimos 30 días): {student.consistency} registros
                    </p>
                  </div>
                  <Link
                    to={`/app/coach/alumno/${student.id}`}
                    className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
