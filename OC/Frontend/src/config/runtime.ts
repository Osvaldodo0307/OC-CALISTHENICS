import { Capacitor } from '@capacitor/core'

const normalizeUrl = (value: string) => value.replace(/\/+$/, '')

const envApiUrl = import.meta.env.VITE_API_URL?.trim()
const isProduction = import.meta.env.PROD
const isCapacitorNative = Capacitor.isNativePlatform()
const forcedAppMode = import.meta.env.VITE_APP_MODE === 'app'
const enableHistoricalVisitsImport =
  import.meta.env.VITE_ENABLE_HISTORICAL_VISITS_IMPORT === 'true'

const fallbackApiUrl = isProduction ? '' : 'http://localhost:8000'
const resolvedApiBaseUrl = normalizeUrl(envApiUrl || fallbackApiUrl)

if (isProduction && (!envApiUrl || !resolvedApiBaseUrl)) {
  console.error('[runtime] VITE_API_URL no esta configurada en produccion.')
}

export const runtime = {
  appName: 'OC-CLUB',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  env: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction,
  isWeb: !isCapacitorNative,
  isCapacitorNative,
  isAppMode: isCapacitorNative || forcedAppMode,
  apiBaseUrl: resolvedApiBaseUrl,
  enableHistoricalVisitsImport,
} as const

