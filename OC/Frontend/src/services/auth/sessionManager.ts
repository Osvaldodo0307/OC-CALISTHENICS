import axios from 'axios'
import { User } from '../../types'
import { runtime } from '../../config/runtime'
import { DEMO_ADMIN_USER, isDemoSessionToken } from '../../config/adminDemo'
import { sessionStorage } from '../storage/sessionStorage'

const API_URL = runtime.apiBaseUrl

export interface SessionSnapshot {
  token: string
  user: User | null
}

export const sessionManager = {
  async hydrate(): Promise<SessionSnapshot | null> {
    const token = await sessionStorage.getToken()
    if (!token) return null

    const user = await sessionStorage.getUser()
    return { token, user }
  },

  async validateToken(token: string): Promise<User | null> {
    if (isDemoSessionToken(token)) {
      const user = await sessionStorage.getUser()
      return user || DEMO_ADMIN_USER
    }
    try {
      const response = await axios.get<User>(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch {
      return null
    }
  },

  async persist(payload: { token: string; user: User }): Promise<void> {
    await sessionStorage.saveSession({
      token: payload.token,
      role: payload.user.role,
      user: payload.user,
    })
  },

  async clear(): Promise<void> {
    delete axios.defaults.headers.common.Authorization
    await sessionStorage.clearSession()
    localStorage.removeItem('token')
    localStorage.removeItem('user_role')
  },
}

