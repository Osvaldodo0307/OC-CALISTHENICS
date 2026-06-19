import { useState } from 'react'
import type { ServiceItem } from '../../data/clubServices'
import WhatsAppLink from '../WhatsAppLink'

type ServiceCardProps = {
  item: ServiceItem
  showImage?: boolean
}

export default function ServiceCard({ item, showImage = false }: ServiceCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false)

  return (
    <>
      <article className="rounded-xl border border-oc-border bg-oc-dark/55 h-full flex flex-col p-4 sm:p-6">
      {showImage && item.image ? (
        <div className="relative h-44 sm:h-52 overflow-hidden rounded-lg">
          <button
            type="button"
            onClick={() => setIsImageOpen(true)}
            className="group/image block h-full w-full"
            aria-label={`Abrir imagen de ${item.title}`}
            title="Abrir imagen"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/image:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" aria-hidden />
            <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[11px] text-white/90 opacity-0 transition-opacity duration-200 group-hover/image:opacity-100">
              Abrir
            </span>
          </button>
        </div>
      ) : null}

      <div className={`flex-1 flex flex-col ${showImage && item.image ? 'pt-4 sm:pt-5' : ''}`}>
        <h3 className="text-lg sm:text-xl font-bold text-oc-light">{item.title}</h3>
        {item.price && <p className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-bold text-oc-red leading-none">{item.price}</p>}
        {item.subtitle && <p className="mt-1 text-sm text-oc-muted font-medium">{item.subtitle}</p>}
        <p className="mt-2.5 sm:mt-3 text-sm text-oc-muted leading-relaxed">{item.description}</p>

        {item.summaryChips && item.summaryChips.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 border-t border-oc-border pt-3 sm:pt-4">
            {item.summaryChips.map((chip) => (
              <span key={chip} className="rounded-full border border-white/20 bg-black/35 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs text-oc-light/90">
                {chip}
              </span>
            ))}
          </div>
        )}

        {item.details && item.details.length > 0 && (
          <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 border-t border-oc-border pt-3 sm:pt-4">
            {item.details.map((detail) => (
              <li key={detail} className="text-sm text-oc-light flex items-start gap-2">
                <span className="text-oc-red mt-0.5">■</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}

        {item.sections?.map((section) => (
          <div key={section.title} className="mt-3 sm:mt-4 border-t border-oc-border pt-3 sm:pt-4">
            <h4 className="text-sm uppercase tracking-wide text-oc-red font-semibold">{section.title}</h4>
            <ul className="mt-2 space-y-1.5">
              {section.lines.map((line) => (
                <li key={line} className="text-sm text-oc-light flex items-start gap-2">
                  <span className="text-oc-red mt-0.5">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {item.note && <p className="mt-3 sm:mt-4 text-sm text-amber-200/90 border-t border-oc-border pt-3 sm:pt-4">{item.note}</p>}

        {item.ctaLabel && (
          <WhatsAppLink
            preset="general"
            className="mt-auto pt-4 sm:pt-5 inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-oc-red/65 px-4 py-2 text-sm font-semibold text-oc-light hover:bg-oc-red/10 transition-colors"
          >
            {item.ctaLabel}
          </WhatsAppLink>
        )}
      </div>
      </article>

      {isImageOpen && item.image && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-[1px] p-4 sm:p-8 flex items-center justify-center"
          onClick={() => setIsImageOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${item.title}`}
        >
          <div className="relative max-h-[92vh] max-w-[96vw] sm:max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              className="absolute -top-11 right-0 rounded-full border border-white/25 bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 transition-colors"
            >
              Cerrar
            </button>
            <img src={item.image} alt={item.title} className="max-h-[88vh] w-auto max-w-full rounded-lg border border-white/15 shadow-2xl" />
          </div>
        </div>
      )}
    </>
  )
}
