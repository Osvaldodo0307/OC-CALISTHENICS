import type { ServiceItem } from '../../data/clubServices'

type ServiceCardProps = {
  item: ServiceItem
  showImage?: boolean
}

export default function ServiceCard({ item, showImage = false }: ServiceCardProps) {
  return (
    <article className="rounded-xl border border-oc-border bg-oc-dark/55 h-full flex flex-col p-5 sm:p-6">
      {showImage && item.image ? (
        <div className="relative h-44">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" aria-hidden />
        </div>
      ) : null}

      <div className={`flex-1 flex flex-col ${showImage && item.image ? 'pt-5' : ''}`}>
        <h3 className="text-xl font-bold text-oc-light">{item.title}</h3>
        {item.price && <p className="mt-2 text-4xl font-bold text-oc-red leading-none">{item.price}</p>}
        {item.subtitle && <p className="mt-1 text-sm text-oc-muted font-medium">{item.subtitle}</p>}
        <p className="mt-3 text-sm text-oc-muted leading-relaxed">{item.description}</p>

        {item.details && item.details.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-oc-border pt-4">
            {item.details.map((detail) => (
              <li key={detail} className="text-sm text-oc-light flex items-start gap-2">
                <span className="text-oc-red mt-0.5">■</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}

        {item.sections?.map((section) => (
          <div key={section.title} className="mt-4 border-t border-oc-border pt-4">
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

        {item.note && <p className="mt-4 text-sm text-amber-200/90 border-t border-oc-border pt-4">{item.note}</p>}

        {item.ctaLabel && (
          <a
            href="https://wa.me/525567869589"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-oc-red/65 px-4 py-2 text-sm font-semibold text-oc-light hover:bg-oc-red/10 transition-colors"
          >
            {item.ctaLabel}
          </a>
        )}
      </div>
    </article>
  )
}
