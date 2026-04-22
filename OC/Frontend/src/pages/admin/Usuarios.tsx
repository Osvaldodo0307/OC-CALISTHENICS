import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { User } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { runtime } from '../../config/runtime'

const API_URL = runtime.apiBaseUrl

export default function AdminUsuarios() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [coaches, setCoaches] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showMembershipMenu, setShowMembershipMenu] = useState<number | null>(null)
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    password: '',
    role: 'socio' as User['role'],
    phone: ''
  })

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get<User[]>(`${API_URL}/users`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCoaches = useCallback(async () => {
    try {
      const response = await axios.get<User[]>(`${API_URL}/users/coaches`)
      setCoaches(response.data)
    } catch (error) {
      console.error('Error fetching coaches:', error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchCoaches()
  }, [fetchUsers, fetchCoaches])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMembershipMenu !== null) {
        const target = event.target as HTMLElement
        const menuElement = target.closest('[data-membership-menu]')
        const buttonElement = target.closest('[data-membership-button]')
        if (!menuElement && !buttonElement) {
          setShowMembershipMenu(null)
        }
      }
    }
    if (showMembershipMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMembershipMenu])

  const handleAssign = async () => {
    if (!selectedStudent || !selectedCoach) {
      alert('Selecciona un alumno y un coach')
      return
    }

    try {
      await axios.post(`${API_URL}/coaches/assign`, {
        student_id: selectedStudent,
        coach_id: selectedCoach
      })
      alert('Alumno asignado exitosamente')
      setSelectedStudent(null)
      setSelectedCoach(null)
      fetchUsers()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al asignar')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.username || !newUser.name || !newUser.password) {
      alert('Completa todos los campos obligatorios')
      return
    }

    try {
      await axios.post(`${API_URL}/users`, newUser)
      alert('Usuario creado exitosamente' + (newUser.role === 'socio' ? '. Recuerda activar su membresía.' : ''))
      setNewUser({
        username: '',
        name: '',
        password: '',
        role: 'socio',
        phone: ''
      })
      setShowCreateForm(false)
      fetchUsers()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al crear usuario')
    }
  }

  const handleActivateMembership = async (userId: number, months: number) => {
    if (!confirm(`¿Activar membresía por ${months} ${months === 1 ? 'mes' : 'meses'}?`)) return

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)

    try {
      // Intentar renovar primero (si ya existe)
      await axios.put(`${API_URL}/membership/${userId}/renew`, {
        status: 'active',
        plan: 'grupal',
        expires_at: expiresAt.toISOString()
      })
      alert('Membresía activada exitosamente')
      fetchUsers()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // No tiene membresía, crear una
        try {
          await axios.post(`${API_URL}/membership`, {
            user_id: userId,
            status: 'active',
            plan: 'grupal',
            expires_at: expiresAt.toISOString()
          })
          alert('Membresía creada y activada exitosamente')
          fetchUsers()
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

  const handleDeactivateMembership = async (userId: number) => {
    if (!confirm('¿Desactivar membresía de este socio?')) return

    try {
      await axios.put(`${API_URL}/membership/${userId}/deactivate`)
      alert('Membresía desactivada exitosamente')
      fetchUsers()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al desactivar membresía')
    }
  }

  const handleDeleteUser = async (userId: number, name: string) => {
    if (!confirm(`¿Dar de baja a ${name}? Esta acción no se puede deshacer.`)) return

    try {
      await axios.delete(`${API_URL}/users/${userId}`)
      alert('Usuario dado de baja')
      fetchUsers()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al dar de baja')
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Cargando usuarios...</div>
  }

  const socios = users.filter((u) => u.role === 'socio')

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
        >
          {showCreateForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
          <h2 className="text-2xl font-semibold text-oc-red mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-oc-light/90 mb-2">
                  Usuario <span className="text-oc-red">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
                  placeholder="usuario123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oc-light/90 mb-2">
                  Nombre Completo <span className="text-oc-red">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
                  placeholder="5512345678"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-oc-light/90 mb-2">
                Rol <span className="text-oc-red">*</span>
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
              >
                <option value="socio">Socio (Alumno)</option>
                <option value="coach">Coach</option>
                <option value="admin">Administrador</option>
              </select>
              {newUser.role === 'socio' && (
                <p className="text-xs text-oc-muted mt-1">
                  Se creará automáticamente una membresía inactiva. Actívala después desde la gestión de membresías.
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
              >
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewUser({
                    username: '',
                    name: '',
                    password: '',
                    role: 'socio',
                    phone: ''
                  })
                }}
                className="bg-oc-border hover:bg-oc-panel text-white px-6 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
        <h2 className="text-2xl font-semibold text-oc-red mb-4">Asignar Alumno a Coach</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">Alumno</label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => {
                const value = e.target.value
                setSelectedStudent(value ? Number(value) : null)
              }}
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            >
              <option value="">Seleccionar alumno</option>
              {socios.map((socio) => (
                <option key={socio.id} value={socio.id}>
                  {socio.name} ({socio.username})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-oc-light/90 mb-2">Coach</label>
            <select
              value={selectedCoach || ''}
              onChange={(e) => {
                const value = e.target.value
                setSelectedCoach(value ? Number(value) : null)
              }}
              className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
            >
              <option value="">Seleccionar coach</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name} ({coach.username})
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAssign}
          className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded font-semibold"
        >
          Asignar
        </button>
      </div>

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
        <h2 className="text-2xl font-semibold text-oc-red mb-4">Todos los Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-oc-border">
                <th className="pb-2 text-oc-light/90">Nombre</th>
                <th className="pb-2 text-oc-light/90">Usuario</th>
                <th className="pb-2 text-oc-light/90">Rol</th>
                <th className="pb-2 text-oc-light/90">Teléfono</th>
                <th className="pb-2 text-oc-light/90">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-oc-border">
                  <td className="py-2 text-white">{user.name}</td>
                  <td className="py-2 text-oc-light/90">{user.username}</td>
                  <td className="py-2 text-oc-light/90 capitalize">{user.role}</td>
                  <td className="py-2 text-oc-light/90">{user.phone || '-'}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2 relative">
                      {user.role === 'socio' && (
                        <div className="relative" data-membership-menu>
                          <button
                            data-membership-button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMembershipMenu(showMembershipMenu === user.id ? null : user.id)
                            }}
                            className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-sm"
                          >
                            Membresía ▼
                          </button>
                          {showMembershipMenu === user.id && (
                            <div 
                              className="absolute top-full left-0 mt-1 bg-oc-metal border border-oc-red/20 rounded shadow-lg z-50 min-w-[140px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-2 space-y-1">
                                <button
                                  onClick={() => {
                                    handleActivateMembership(user.id, 1)
                                    setShowMembershipMenu(null)
                                  }}
                                  className="w-full text-left bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-xs"
                                >
                                  1 Mes
                                </button>
                                <button
                                  onClick={() => {
                                    handleActivateMembership(user.id, 3)
                                    setShowMembershipMenu(null)
                                  }}
                                  className="w-full text-left bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-xs"
                                >
                                  3 Meses
                                </button>
                                <button
                                  onClick={() => {
                                    handleActivateMembership(user.id, 6)
                                    setShowMembershipMenu(null)
                                  }}
                                  className="w-full text-left bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-xs"
                                >
                                  6 Meses
                                </button>
                                <button
                                  onClick={() => {
                                    handleActivateMembership(user.id, 12)
                                    setShowMembershipMenu(null)
                                  }}
                                  className="w-full text-left bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-xs"
                                >
                                  1 Año
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeactivateMembership(user.id)
                                    setShowMembershipMenu(null)
                                  }}
                                  className="w-full text-left bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-xs mt-1"
                                >
                                  Desactivar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="bg-oc-red hover:bg-oc-red-deep text-white px-3 py-1 rounded text-sm"
                        >
                          Dar de baja
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
