import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { User } from '../../types'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl

export default function CoachAlumnos() {
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newStudent, setNewStudent] = useState({
    username: '',
    name: '',
    password: '',
    phone: ''
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/coaches/students`)
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudent.username || !newStudent.name || !newStudent.password) {
      alert('Completa usuario, nombre y contraseña')
      return
    }

    try {
      setCreating(true)
      await axios.post(`${API_URL}/coaches/students`, newStudent)
      alert('Alumno creado y asignado exitosamente')
      setNewStudent({
        username: '',
        name: '',
        password: '',
        phone: ''
      })
      setShowCreateForm(false)
      fetchStudents()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al crear alumno')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Cargando alumnos...</div>
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Mis Alumnos</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm"
        >
          {showCreateForm ? 'Cancelar' : '+ Nuevo Alumno'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
          <h2 className="text-xl font-semibold text-oc-red mb-4">Registrar Alumno</h2>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-oc-light/90 mb-2">
                  Usuario <span className="text-oc-red">*</span>
                </label>
                <input
                  type="text"
                  value={newStudent.username}
                  onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
                  placeholder="alumno123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oc-light/90 mb-2">
                  Nombre completo <span className="text-oc-red">*</span>
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-oc-light/90 mb-2">
                  Contraseña <span className="text-oc-red">*</span>
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oc-light/90 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
                  placeholder="5512345678"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear Alumno'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewStudent({
                    username: '',
                    name: '',
                    password: '',
                    phone: ''
                  })
                }}
                className="bg-oc-border hover:bg-oc-panel text-white px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-oc-metal p-8 rounded-lg border border-oc-red/20 text-center">
          <p className="text-oc-muted text-lg">No tienes alumnos asignados</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-oc-metal p-6 rounded-lg border border-oc-red/20"
            >
              <h2 className="text-xl font-bold text-white mb-2">{student.name}</h2>
              <p className="text-oc-muted mb-4">{student.username}</p>
              <div className="flex gap-2">
                <Link
                  to={`/app/coach/alumno/${student.id}`}
                  className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm flex-1 text-center"
                >
                  Ver Progresos
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
