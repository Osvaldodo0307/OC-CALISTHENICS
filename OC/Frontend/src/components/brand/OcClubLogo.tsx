import type { ImgHTMLAttributes } from 'react'

const variantClass: Record<'nav' | 'hero' | 'heroFeature' | 'footer' | 'app' | 'auth', string> = {
  nav: 'h-[3.35rem] sm:h-14 md:h-[3.85rem] w-auto max-w-[min(100%,min(420px,62vw))] object-contain object-left',
  hero: 'w-full max-w-[min(100%,520px)] h-auto max-h-[min(55vh,420px)] object-contain object-center',
  heroFeature:
    'w-full max-w-[min(100%,min(92vw,700px))] lg:max-w-[min(100%,760px)] h-auto object-contain object-center lg:object-left',
  footer: 'h-14 sm:h-16 w-auto max-w-[min(100%,320px)] object-contain object-left',
  app: 'h-8 sm:h-9 w-auto max-w-[min(100%,200px)] object-contain object-left',
  auth: 'h-auto w-full max-w-[min(100%,300px)] mx-auto object-contain',
}

type Props = {
  variant: keyof typeof variantClass
  className?: string
  /** Above-the-fold: evita lazy load y mejora LCP */
  priority?: boolean
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>

export default function OcClubLogo({ variant, className = '', priority = false, ...imgProps }: Props) {
  return (
    <img
      alt="OC-CLUB — Elite Training Community"
      className={`${variantClass[variant]} ${className}`.trim()}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...imgProps}
      src="/OC-CLUB.png"
      onError={(e) => {
        const target = e.currentTarget
        if (target.src.includes('oc-club-logo.svg')) return
        target.src = '/oc-club-logo.svg'
      }}
    />
  )
}
