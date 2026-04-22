import axios from 'axios'

export function toUserMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'El servidor tardo demasiado en responder. Si es el primer intento, espera unos segundos y vuelve a intentar.'
    }

    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica internet o la configuracion de red.'
    }

    if (error.response.status === 401) {
      return 'Usuario o contraseña incorrectos.'
    }

    if (error.response.status === 503) {
      return 'El servidor esta despertando o no disponible temporalmente. Intenta de nuevo en unos segundos.'
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
