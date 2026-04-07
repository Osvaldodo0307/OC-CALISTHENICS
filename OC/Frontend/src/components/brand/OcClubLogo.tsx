import type { ImgHTMLAttributes } from 'react'

/**
 * Marca web: SVG horizontal (wordmark) y PNG cartel solo donde tenga sentido.
 * — nav / footer / heroMark: wordmark limpio, escalable
 * — poster: imagen promocional opcional (no cabecera)
 */
const variantClass: Record<'nav' | 'footer' | 'heroMark' | 'heroPoster' | 'app' | 'auth', string> = {
  /** Barra: legible, proporción horizontal real */
  nav: 'h-8 sm:h-9 w-auto max-w-[200px] sm:max-w-[220px] object-contain object-left shrink-0',
  footer: 'h-9 sm:h-10 w-auto max-w-[200px] object-contain object-left',
  /** Hero: wordmark pequeño (no cartel) */
  heroMark: 'h-10 sm:h-11 w-auto max-w-[240px] object-left object-contain',
  /** Solo uso decorativo secundario si se requiere */
  heroPoster:
    'w-full max-w-[min(100%,280px)] h-auto max-h-[220px] object-contain object-center opacity-90',
  app: 'h-7 sm:h-8 w-auto max-w-[160px] object-contain object-left',
  auth: 'h-auto w-full max-w-[260px] mx-auto object-contain',
}

type Props = {
  variant: keyof typeof variantClass
  className?: string
  /** Above-the-fold: evita lazy load y mejora LCP */
  priority?: boolean
  /** Por defecto wordmark SVG; poster fuerza PNG */
  usePoster?: boolean
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>

export default function OcClubLogo({
  variant,
  className = '',
  priority = false,
  usePoster = false,
  ...imgProps
}: Props) {
  const isPoster = usePoster && variant === 'heroPoster'
  const src = isPoster ? '/OC-CLUB.png' : '/oc-club-wordmark.svg'

  return (
    <img
      alt="OC-CLUB — Elite Training Community"
      className={`${variantClass[variant]} ${className}`.trim()}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...imgProps}
      src={src}
      onError={(e) => {
        const target = e.currentTarget
        if (target.src.includes('oc-club-logo.svg')) return
        if (!isPoster && !target.src.includes('oc-club-logo.svg')) {
          target.src = '/oc-club-logo.svg'
        }
      }}
    />
  )
}
