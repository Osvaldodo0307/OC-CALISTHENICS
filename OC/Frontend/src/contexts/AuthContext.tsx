import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { App as CapacitorApp } from '@capacitor/app'
import { User } from '../types'
import { runtime } from '../config/runtime'
import { DEMO_ADMIN_USER, DEMO_SESSION_TOKEN, isAdminDemoMode, isDemoSessionToken } from '../config/adminDemo'
import { resetDemoStore } from '../mocks/adminDemoData'
import { setupAdminDemoInterceptor } from '../mocks/setupAdminDemoInterceptor'
import { sessionManager } from '../services/auth/sessionManager'
import { toUserMessage } from '../services/api/errorMessages'

if (isAdminDemoMode()) {
  setupAdminDemoInterceptor()
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<User>
  loginAsAdminDemo: () => Promise<User>
  logout: () => Promise<void>
  loading: boolean
  authError: string | null
  isDemoSession: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_URL = runtime.apiBaseUrl
const LOGIN_REQUEST_TIMEOUT_MS = 45000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isDemoSession, setIsDemoSession] = useState(false)

  const clearSession = useCallback(async () => {
    const wasDemo = isDemoSession
    setUser(null)
    setToken(null)
    setIsDemoSession(false)
    setAuthError(null)
    await sessionManager.clear()
    if (wasDemo && isAdminDemoMode()) {
      resetDemoStore()
    }
  }, [isDemoSession])

  const fetchUser = useCallback(async (authToken: string): Promise<User | null> => {
    if (isDemoSessionToken(authToken) && isAdminDemoMode()) {
      const snapshot = await sessionManager.hydrate()
      const demoUser = snapshot?.user || DEMO_ADMIN_USER
      setUser(demoUser)
      setIsDemoSession(true)
      return demoUser
    }
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
    const snapshot = await sessionManager.hydrate()
    if (!snapshot?.token) {
      await clearSession()
      return
    }

    if (isDemoSessionToken(snapshot.token) && isAdminDemoMode()) {
      setToken(snapshot.token)
      setIsDemoSession(true)
      setUser(snapshot.user || DEMO_ADMIN_USER)
      axios.defaults.headers.common['Authorization'] = `Bearer ${snapshot.token}`
      return
    }

    if (!API_URL) {
      setAuthError('Configuracion incompleta: falta VITE_API_URL.')
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
        if (error?.response?.status === 401 && !isDemoSession) {
          await clearSession()
          setAuthError('Tu sesion ya no es valida. Inicia sesion nuevamente.')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptorId)
    }
  }, [clearSession, isDemoSession])

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

  const loginAsAdminDemo = async () => {
    if (!isAdminDemoMode()) {
      throw new Error('Modo demo no habilitado')
    }
    setAuthError(null)
    resetDemoStore()
    setToken(DEMO_SESSION_TOKEN)
    setUser(DEMO_ADMIN_USER)
    setIsDemoSession(true)
    await sessionManager.persist({ token: DEMO_SESSION_TOKEN, user: DEMO_ADMIN_USER })
    axios.defaults.headers.common['Authorization'] = `Bearer ${DEMO_SESSION_TOKEN}`
    return DEMO_ADMIN_USER
  }

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
    setIsDemoSession(false)
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
    <AuthContext.Provider value={{ user, token, login, loginAsAdminDemo, logout, loading, authError, isDemoSession }}>
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
