import { useEffect } from 'react'
import { syncUtmAttribution } from '../utils/utm'

/** Persiste UTMs de la URL al iniciar la sesión web pública. */
export default function UtmCapture() {
  useEffect(() => {
    syncUtmAttribution()
  }, [])

  return null
}
