import { User } from '../types'

/** Solo activo si VITE_ENABLE_ADMIN_DEMO=true en el entorno de build/dev. */
export function isAdminDemoMode(): boolean {
  return import.meta.env.VITE_ENABLE_ADMIN_DEMO === 'true'
}

export const DEMO_SESSION_TOKEN = 'demo:oc-club-admin-local'

export const DEMO_ADMIN_USER: User = {
  id: 1,
  username: 'admin_demo',
  name: 'Admin Demo (local)',
  role: 'admin',
  phone: '5511111111',
  created_at: '2024-01-01T00:00:00.000Z',
}

export function isDemoSessionToken(token: string | null | undefined): boolean {
  return Boolean(token && token === DEMO_SESSION_TOKEN)
}
