import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { isAdminDemoMode } from '../config/adminDemo'
import { isAdminDemoApiPath, resolveAdminDemoResponse } from './adminDemoApi'

let installed = false

export function setupAdminDemoInterceptor(): void {
  if (!isAdminDemoMode() || installed) return
  installed = true

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!isAdminDemoMode()) return config

    const mock = resolveAdminDemoResponse(config)
    if (mock) {
      config.adapter = async () => mock
    }
    return config
  })

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (!isAdminDemoMode()) return Promise.reject(error)
      const config = error.config
      if (!config || !isAdminDemoApiPath(config)) return Promise.reject(error)

      const mock = resolveAdminDemoResponse(config)
      if (mock) return mock

      return Promise.reject(error)
    },
  )
}
