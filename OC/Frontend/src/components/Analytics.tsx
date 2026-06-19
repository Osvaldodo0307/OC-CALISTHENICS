import { useEffect } from 'react'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID?.trim()

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

/**
 * Carga analítica solo si hay IDs en variables de entorno.
 * Ver docs/ANALYTICS_SETUP.md para configuración en Netlify.
 */
export default function Analytics() {
  useEffect(() => {
    if (GA_ID) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer ?? []
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_ID, { anonymize_ip: true })
    }

    if (META_PIXEL_ID && !window.fbq) {
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      document.head.appendChild(script)

      const fbq = function fbq(...args: unknown[]) {
        const fn = fbq as typeof fbq & { queue?: unknown[] }
        fn.queue = fn.queue ?? []
        fn.queue.push(args)
      }
      ;(fbq as typeof fbq & { queue: unknown[] }).queue = []
      window.fbq = fbq

      window.fbq('init', META_PIXEL_ID)
      window.fbq('track', 'PageView')
    }
  }, [])

  return null
}
