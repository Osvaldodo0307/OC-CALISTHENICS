import { useEffect, useState } from 'react'
import { Network } from '@capacitor/network'
import { runtime } from '../config/runtime'

export default function NetworkStatusBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    if (runtime.isCapacitorNative) {
      let listener: { remove: () => Promise<void> } | null = null

      void Network.getStatus().then((status) => {
        setOnline(status.connected)
      })

      void Network.addListener('networkStatusChange', (status) => {
        setOnline(status.connected)
      }).then((handle) => {
        listener = handle
      })

      return () => {
        if (listener) {
          void listener.remove()
        }
      }
    }

    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    setOnline(window.navigator.onLine)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] bg-yellow-500 px-4 py-2 text-center text-sm font-semibold text-black">
      Sin conexion a internet. Algunas funciones pueden no estar disponibles.
    </div>
  )
}

