import axios from 'axios'

export function toUserMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardo demasiado. Revisa tu conexion e intenta de nuevo.'
    }

    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica internet o la configuracion de red.'
    }

    const detail = error.response.data?.detail
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (error.response.status >= 500) {
      return 'El servidor presento un problema temporal. Intenta nuevamente en unos minutos.'
    }

    return fallback
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  return fallback
}
