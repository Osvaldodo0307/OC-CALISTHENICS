import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { App as CapacitorApp } from '@capacitor/app'
import { User } from '../types'
import { runtime } from '../config/runtime'
import { sessionManager } from '../services/auth/sessionManager'
import { toUserMessage } from '../services/api/errorMessages'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
  loading: boolean
  authError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_URL = runtime.apiBaseUrl
const LOGIN_REQUEST_TIMEOUT_MS = 45000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const clearSession = useCallback(async () => {
    setUser(null)
    setToken(null)
    setAuthError(null)
    await sessionManager.clear()
  }, [])

  const fetchUser = useCallback(async (authToken: string): Promise<User | null> => {
    try {
      const currentUser = await sessionManager.validateToken(authToken)
      if (!currentUser) {
        await clearSession()
        setAuthError('Tu sesion expiro. Inicia sesion nuevamente.')
        return null
      }
      setUser(currentUser)
      await sessionManager.persist({
        token: authToken,
        user: currentUser,
      })
      return currentUser
    } catch {
      await clearSession()
      setAuthError('No fue posible restaurar la sesion.')
      return null
    }
  }, [clearSession])

  const revalidateSession = useCallback(async () => {
    if (!API_URL) {
      setAuthError('Configuracion incompleta: falta VITE_API_URL.')
      await clearSession()
      return
    }
    const snapshot = await sessionManager.hydrate()
    if (!snapshot?.token) {
      await clearSession()
      return
    }

    setToken(snapshot.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${snapshot.token}`
    await fetchUser(snapshot.token)
  }, [clearSession, fetchUser])

  useEffect(() => {
    const bootstrapSession = async () => {
      await revalidateSession()
      setLoading(false)
    }

    void bootstrapSession()
  }, [revalidateSession])

  useEffect(() => {
    axios.defaults.timeout = 15000
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          await clearSession()
          setAuthError('Tu sesion ya no es valida. Inicia sesion nuevamente.')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptorId)
    }
  }, [clearSession])

  useEffect(() => {
    if (!runtime.isCapacitorNative) return

    let listener: { remove: () => Promise<void> } | null = null
    void CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        void revalidateSession()
      }
    }).then((handle) => {
      listener = handle
    })

    return () => {
      if (listener) {
        void listener.remove()
      }
    }
  }, [revalidateSession])

  const login = async (username: string, password: string) => {
    if (!API_URL) {
      const message = 'Configuracion incompleta: falta VITE_API_URL.'
      setAuthError(message)
      throw new Error(message)
    }
    setAuthError(null)
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    let response
    try {
      response = await axios.post<{
        access_token: string
        token_type: string
        user: User
      }>(`${API_URL}/auth/login`, formData, {
        timeout: LOGIN_REQUEST_TIMEOUT_MS,
      })
    } catch (error) {
      setAuthError(toUserMessage(error, 'No se pudo iniciar sesion.'))
      throw error
    }
    
    const { access_token, user } = response.data

    setToken(access_token)
    setUser(user)
    await sessionManager.persist({
      token: access_token,
      user,
    })
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    return user
  }

  const logout = () => {
    return clearSession()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, authError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
