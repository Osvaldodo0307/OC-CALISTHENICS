import { Preferences } from '@capacitor/preferences'
import { runtime } from '../../config/runtime'
import { User } from '../../types'

const KEYS = {
  token: 'session.token',
  role: 'session.role',
  user: 'session.user',
} as const

const storage = {
  async get(key: string): Promise<string | null> {
    if (runtime.isCapacitorNative) {
      const { value } = await Preferences.get({ key })
      return value
    }

    return localStorage.getItem(key)
  },

  async set(key: string, value: string): Promise<void> {
    if (runtime.isCapacitorNative) {
      await Preferences.set({ key, value })
      return
    }

    localStorage.setItem(key, value)
  },

  async remove(key: string): Promise<void> {
    if (runtime.isCapacitorNative) {
      await Preferences.remove({ key })
      return
    }

    localStorage.removeItem(key)
  },

  async clear(): Promise<void> {
    if (runtime.isCapacitorNative) {
      await Preferences.clear()
      return
    }

    localStorage.removeItem(KEYS.token)
    localStorage.removeItem(KEYS.role)
    localStorage.removeItem(KEYS.user)
  },
}

export const sessionStorage = {
  async getToken(): Promise<string | null> {
    return storage.get(KEYS.token)
  },

  async setToken(token: string): Promise<void> {
    await storage.set(KEYS.token, token)
  },

  async getRole(): Promise<User['role'] | null> {
    const role = await storage.get(KEYS.role)
    if (!role) return null
    return role as User['role']
  },

  async setRole(role: User['role']): Promise<void> {
    await storage.set(KEYS.role, role)
  },

  async getUser(): Promise<User | null> {
    const raw = await storage.get(KEYS.user)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },

  async setUser(user: User): Promise<void> {
    await storage.set(KEYS.user, JSON.stringify(user))
  },

  async saveSession(payload: { token: string; role: User['role']; user: User }): Promise<void> {
    await Promise.all([
      this.setToken(payload.token),
      this.setRole(payload.role),
      this.setUser(payload.user),
    ])
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      storage.remove(KEYS.token),
      storage.remove(KEYS.role),
      storage.remove(KEYS.user),
    ])
  },
}

