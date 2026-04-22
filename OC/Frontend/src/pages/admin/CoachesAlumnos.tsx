import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl

interface CoachInfo {
  id: number
  name: string
  username: string
  phone?: string
  created_at: string
  students_count: number
  progress_entries_count: number
  students: Array<{
    id: number
    name: string
    username: string
  }>
}

interface StudentInfo {
  id: number
  name: string
  username: string
  phone?: string
  created_at: string
  membership: {
    status: string
    plan: string
    expires_at: string | null
  } | null
  coach: {
    id: number
    name: string
    username: string
  } | null
  progress_count: number
  active_bookings: number
  last_progress: {
    date: string
    metric_type: string
    value: number
  } | null
}

interface CoachDetails {
  coach: {
    id: number
    name: string
    username: string
    phone?: string
  }
  statistics: {
    total_students: number
    total_progress_entries: number
  }
  students: Array<{
    id: number
    name: string
    username: string
    membership_status?: string | null
    progress_count: number
    last_progress_date?: string | null
  }>
}

interface StudentDetails {
  student: {
    id: number
    name: string
    username: string
    phone?: string
  }
  membership: {
    status: string
    plan: string
    expires_at: string | null
    created_at: string | null
  } | null
  coach: {
    id: number
    name: string
    username: string
  } | null
  statistics: {
    total_progress_entries: number
    total_bookings: number
    active_bookings: number
  }
  recent_progress: Array<{
    id: number
    metric_type: string
    value: number
    notes?: string
    date: string
  }>
  recent_bookings: Array<{
    id: number
    class_title: string
    class_datetime?: string | null
    attendance_hour?: string | null
    preferred_hour?: number | null
    status: string
    created_at: string
  }>
}

export default function CoachesAlumnos() {
  const [coaches, setCoaches] = useState<CoachInfo[]>([])
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'coaches' | 'students'>('coaches')
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [coachDetails, setCoachDetails] = useState<CoachDetails | null>(null)
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [coachesRes, studentsRes] = await Promise.all([
        axios.get<CoachInfo[]>(`${API_URL}/admin/coaches-info`),
        axios.get<StudentInfo[]>(`${API_URL}/admin/students-info`)
      ])
      setCoaches(Array.isArray(coachesRes.data) ? coachesRes.data : [])
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : [])
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else if (status === 403) {
          alert('No tienes permisos para ver esta información.')
        } else {
          alert(`Error al cargar datos: ${error.response?.data?.detail || error.message}`)
        }
      } else {
        alert('Error al cargar datos.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleViewCoachDetails = async (coachId: number) => {
    try {
      const response = await axios.get<CoachDetails>(`${API_URL}/admin/coach/${coachId}/details`)
      setCoachDetails(response.data)
      setSelectedCoach(coachId)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al cargar detalles')
    }
  }

  const handleViewStudentDetails = async (studentId: number) => {
    try {
      const response = await axios.get<StudentDetails>(`${API_URL}/admin/student/${studentId}/details`)
      setStudentDetails(response.data)
      setSelectedStudent(studentId)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al cargar detalles')
    }
  }

  const handleActivateMembership = async (studentId: number, months: number) => {
    if (!confirm(`¿Activar membresía por ${months} ${months === 1 ? 'mes' : 'meses'}?`)) return

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)

    try {
      await axios.put(
        `${API_URL}/membership/${studentId}/renew`,
        {
          status: 'active',
          plan: 'grupal',
          expires_at: expiresAt.toISOString()
        }
      )
      alert('Membresía activada exitosamente')
      if (selectedStudent === studentId) {
        handleViewStudentDetails(studentId)
      }
      fetchData()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        try {
          await axios.post(
            `${API_URL}/membership`,
            {
              user_id: studentId,
              status: 'active',
              plan: 'grupal',
              expires_at: expiresAt.toISOString()
            }
          )
          alert('Membresía creada y activada exitosamente')
          if (selectedStudent === studentId) {
            handleViewStudentDetails(studentId)
          }
          fetchData()
        } catch (createError) {
          const message = axios.isAxiosError(createError)
            ? createError.response?.data?.detail
            : undefined
          alert(message || 'Error al crear membresía')
        }
      } else {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.detail
          : undefined
        alert(message || 'Error al activar membresía')
      }
    }
  }

  const handleDeactivateMembership = async (studentId: number) => {
    if (!confirm('¿Desactivar membresía de este alumno?')) return

    try {
      await axios.put(`${API_URL}/membership/${studentId}/deactivate`, {})
      alert('Membresía desactivada exitosamente')
      if (selectedStudent === studentId) {
        handleViewStudentDetails(studentId)
      }
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al desactivar membresía')
    }
  }

  if (loading) {
    return (
      <div className="px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Información de Coaches y Alumnos</h1>
        <div className="text-white text-center py-8">Cargando información...</div>
      </div>
    )
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Información de Coaches y Alumnos</h1>
        <button
          onClick={fetchData}
          className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm font-semibold"
        >
          🔄 Recargar
        </button>
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="mb-4 p-2 bg-oc-metal rounded text-xs text-oc-muted">
          Debug: Coaches={coaches.length}, Alumnos={students.length}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-oc-red/20">
        <button
          onClick={() => {
            setActiveTab('coaches')
            setSelectedCoach(null)
            setCoachDetails(null)
          }}
          className={`px-6 py-2 font-semibold ${
            activeTab === 'coaches'
              ? 'text-oc-red border-b-2 border-oc-red'
              : 'text-oc-muted hover:text-white'
          }`}
        >
          Coaches ({coaches.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('students')
            setSelectedStudent(null)
            setStudentDetails(null)
          }}
          className={`px-6 py-2 font-semibold ${
            activeTab === 'students'
              ? 'text-oc-red border-b-2 border-oc-red'
              : 'text-oc-muted hover:text-white'
          }`}
        >
          Alumnos ({students.length})
        </button>
      </div>

      {/* Coaches Tab */}
      {activeTab === 'coaches' && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-oc-metal p-8 rounded-lg border border-oc-red/20 text-center">
              <p className="text-oc-muted">Cargando coaches...</p>
            </div>
          ) : coaches.length === 0 ? (
            <div className="bg-oc-metal p-8 rounded-lg border border-oc-red/20 text-center">
              <p className="text-oc-muted">No hay coaches registrados</p>
              <p className="text-oc-muted text-sm mt-2">Los coaches aparecerán aquí cuando se creen usuarios con rol "coach"</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-oc-muted text-sm">
                  Total de coaches: <span className="text-white font-semibold">{coaches.length}</span>
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="bg-oc-metal p-6 rounded-lg border border-oc-red/20"
                  >
                    <h3 className="text-xl font-bold text-oc-red mb-2">{coach.name}</h3>
                    <p className="text-oc-muted text-sm mb-4">@{coach.username}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-oc-muted">Alumnos:</span>
                        <span className="text-white font-semibold">{coach.students_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-oc-muted">Progresos registrados:</span>
                        <span className="text-white font-semibold">{coach.progress_entries_count}</span>
                      </div>
                      {coach.phone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-oc-muted">Teléfono:</span>
                          <span className="text-white">{coach.phone}</span>
                        </div>
                      )}
                    </div>
                    {coach.students.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-oc-muted mb-2">Alumnos asignados:</p>
                        <div className="space-y-1">
                          {coach.students.map((student) => (
                            <p key={student.id} className="text-sm text-white">
                              • {student.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleViewCoachDetails(coach.id)}
                      className="w-full bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>

              {/* Coach Details Modal */}
              {selectedCoach && coachDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-oc-metal rounded-lg border border-oc-red/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-oc-red">
                          Detalles de {coachDetails.coach.name}
                        </h2>
                        <button
                          onClick={() => {
                            setSelectedCoach(null)
                            setCoachDetails(null)
                          }}
                          className="text-oc-muted hover:text-white text-2xl"
                        >
                          ×
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-2">Información Personal</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Usuario:</span>
                              <span className="text-white">@{coachDetails.coach.username}</span>
                            </div>
                            {coachDetails.coach.phone && (
                              <div className="flex justify-between">
                                <span className="text-oc-muted">Teléfono:</span>
                                <span className="text-white">{coachDetails.coach.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-2">Estadísticas</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Total Alumnos:</span>
                              <span className="text-white font-semibold">
                                {coachDetails.statistics.total_students}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Progresos Registrados:</span>
                              <span className="text-white font-semibold">
                                {coachDetails.statistics.total_progress_entries}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-oc-dark p-4 rounded border border-oc-border">
                        <h3 className="text-lg font-semibold text-white mb-4">Alumnos Asignados</h3>
                        {coachDetails.students.length === 0 ? (
                          <p className="text-oc-muted">No tiene alumnos asignados</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-oc-border">
                                  <th className="pb-2 text-oc-light/90">Nombre</th>
                                  <th className="pb-2 text-oc-light/90">Usuario</th>
                                  <th className="pb-2 text-oc-light/90">Membresía</th>
                                  <th className="pb-2 text-oc-light/90">Progresos</th>
                                  <th className="pb-2 text-oc-light/90">Último Progreso</th>
                                </tr>
                              </thead>
                              <tbody>
                                {coachDetails.students.map((student) => (
                                  <tr key={student.id} className="border-b border-oc-border">
                                    <td className="py-2 text-white">{student.name}</td>
                                    <td className="py-2 text-oc-light/90">@{student.username}</td>
                                    <td className="py-2">
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          student.membership_status === 'active'
                                            ? 'bg-oc-red text-white'
                                            : 'bg-oc-red text-white'
                                        }`}
                                      >
                                        {student.membership_status || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="py-2 text-oc-light/90">{student.progress_count}</td>
                                    <td className="py-2 text-oc-light/90 text-sm">
                                      {student.last_progress_date
                                        ? new Date(student.last_progress_date).toLocaleDateString()
                                        : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-oc-metal p-8 rounded-lg border border-oc-red/20 text-center">
              <p className="text-oc-muted">Cargando alumnos...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-oc-metal p-8 rounded-lg border border-oc-red/20 text-center">
              <p className="text-oc-muted">No hay alumnos registrados</p>
              <p className="text-oc-muted text-sm mt-2">Los alumnos aparecerán aquí cuando se creen usuarios con rol "socio"</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-oc-muted text-sm">
                  Total de alumnos: <span className="text-white font-semibold">{students.length}</span>
                </p>
              </div>
              <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-oc-border">
                        <th className="pb-2 text-oc-light/90">Nombre</th>
                        <th className="pb-2 text-oc-light/90">Usuario</th>
                        <th className="pb-2 text-oc-light/90">Membresía</th>
                        <th className="pb-2 text-oc-light/90">Coach</th>
                        <th className="pb-2 text-oc-light/90">Progresos</th>
                        <th className="pb-2 text-oc-light/90">Reservas Activas</th>
                        <th className="pb-2 text-oc-light/90">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-oc-border">
                          <td className="py-2 text-white">{student.name || 'Sin nombre'}</td>
                          <td className="py-2 text-oc-light/90">@{student.username || 'sin_usuario'}</td>
                          <td className="py-2">
                            {student.membership ? (
                              <div>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    student.membership.status === 'active'
                                      ? 'bg-oc-red text-white'
                                      : 'bg-oc-red text-white'
                                  }`}
                                >
                                  {student.membership.status === 'active' ? 'Activa' : 'Vencida'}
                                </span>
                                <p className="text-xs text-oc-muted mt-1">
                                  Plan: {student.membership.plan}
                                </p>
                                {student.membership.expires_at && (
                                  <p className="text-xs text-oc-muted">
                                    Vence: {new Date(student.membership.expires_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-oc-muted text-sm">Sin membresía</span>
                            )}
                          </td>
                          <td className="py-2 text-oc-light/90">
                            {student.coach ? (
                              <span>{student.coach.name}</span>
                            ) : (
                              <span className="text-oc-muted">Sin asignar</span>
                            )}
                          </td>
                          <td className="py-2 text-oc-light/90">{student.progress_count}</td>
                          <td className="py-2 text-oc-light/90">{student.active_bookings}</td>
                          <td className="py-2">
                            <button
                              onClick={() => handleViewStudentDetails(student.id)}
                              className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-sm"
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Student Details Modal */}
              {selectedStudent && studentDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-oc-metal rounded-lg border border-oc-red/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-oc-red">
                          Detalles de {studentDetails.student.name}
                        </h2>
                        <button
                          onClick={() => {
                            setSelectedStudent(null)
                            setStudentDetails(null)
                          }}
                          className="text-oc-muted hover:text-white text-2xl"
                        >
                          ×
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-2">Información Personal</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Usuario:</span>
                              <span className="text-white">@{studentDetails.student.username}</span>
                            </div>
                            {studentDetails.student.phone && (
                              <div className="flex justify-between">
                                <span className="text-oc-muted">Teléfono:</span>
                                <span className="text-white">{studentDetails.student.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-2">Membresía</h3>
                          {studentDetails.membership ? (
                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex justify-between">
                                <span className="text-oc-muted">Estado:</span>
                                <span
                                  className={`font-semibold ${
                                    studentDetails.membership.status === 'active'
                                      ? 'text-oc-light'
                                      : 'text-oc-red'
                                  }`}
                                >
                                  {studentDetails.membership.status === 'active' ? 'Activa' : 'Vencida'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-oc-muted">Plan:</span>
                                <span className="text-white capitalize">{studentDetails.membership.plan}</span>
                              </div>
                              {studentDetails.membership.created_at && (
                                <div className="flex justify-between">
                                  <span className="text-oc-muted">Creada:</span>
                                  <span className="text-white">
                                    {new Date(studentDetails.membership.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {studentDetails.membership.expires_at && (
                                <div className="flex justify-between">
                                  <span className="text-oc-muted">Vence:</span>
                                  <span className="text-white">
                                    {new Date(studentDetails.membership.expires_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-oc-muted text-sm mb-4">Sin membresía</p>
                          )}
                          <div className="border-t border-oc-border pt-3">
                            <p className="text-xs text-oc-muted mb-2">Activar membresía:</p>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <button
                                onClick={() => handleActivateMembership(studentDetails.student.id, 1)}
                                className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-2 rounded text-xs font-semibold"
                              >
                                1 Mes
                              </button>
                              <button
                                onClick={() => handleActivateMembership(studentDetails.student.id, 3)}
                                className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-2 rounded text-xs font-semibold"
                              >
                                3 Meses
                              </button>
                              <button
                                onClick={() => handleActivateMembership(studentDetails.student.id, 6)}
                                className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-2 rounded text-xs font-semibold"
                              >
                                6 Meses
                              </button>
                              <button
                                onClick={() => handleActivateMembership(studentDetails.student.id, 12)}
                                className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-2 rounded text-xs font-semibold"
                              >
                                1 Año
                              </button>
                            </div>
                            {studentDetails.membership && studentDetails.membership.status === 'active' && (
                              <button
                                onClick={() => handleDeactivateMembership(studentDetails.student.id)}
                                className="w-full bg-oc-red hover:bg-oc-red-deep text-white px-3 py-2 rounded text-xs font-semibold"
                              >
                                Desactivar Membresía
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-2">Coach Asignado</h3>
                          {studentDetails.coach ? (
                            <div className="text-sm">
                              <p className="text-white">{studentDetails.coach.name}</p>
                              <p className="text-oc-muted">@{studentDetails.coach.username}</p>
                            </div>
                          ) : (
                            <p className="text-oc-muted text-sm">Sin coach asignado</p>
                          )}
                        </div>

                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-2">Estadísticas</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Total Progresos:</span>
                              <span className="text-white font-semibold">
                                {studentDetails.statistics.total_progress_entries}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Total Reservas:</span>
                              <span className="text-white font-semibold">
                                {studentDetails.statistics.total_bookings}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-oc-muted">Reservas Activas:</span>
                              <span className="text-white font-semibold">
                                {studentDetails.statistics.active_bookings}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {studentDetails.recent_progress.length > 0 && (
                        <div className="bg-oc-dark p-4 rounded border border-oc-border mb-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Últimos Progresos</h3>
                          <div className="space-y-2">
                            {studentDetails.recent_progress.map((progress) => (
                              <div
                                key={progress.id}
                                className="bg-oc-metal p-3 rounded border border-oc-border"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-white font-semibold">{progress.metric_type}</p>
                                    <p className="text-oc-red text-lg font-bold">{progress.value}</p>
                                    {progress.notes && (
                                      <p className="text-oc-muted text-sm mt-1">{progress.notes}</p>
                                    )}
                                  </div>
                                  <span className="text-oc-muted text-sm">
                                    {new Date(progress.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {studentDetails.recent_bookings.length > 0 && (
                        <div className="bg-oc-dark p-4 rounded border border-oc-border">
                          <h3 className="text-lg font-semibold text-white mb-4">Últimas Reservas</h3>
                          <div className="space-y-2">
                            {studentDetails.recent_bookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-oc-metal p-3 rounded border border-oc-border flex justify-between items-center"
                              >
                                <div>
                                  <p className="text-white font-semibold">{booking.class_title}</p>
                                  {booking.attendance_hour && (
                                    <p className="text-xs text-oc-red mt-1">
                                      Horario de asistencia: {booking.attendance_hour}
                                    </p>
                                  )}
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      booking.status === 'booked'
                                        ? 'bg-oc-red text-white'
                                        : 'bg-oc-red text-white'
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>
                                <span className="text-oc-muted text-sm">
                                  {new Date(booking.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
