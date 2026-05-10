interface TrustItem {
  icon: React.ReactNode
  title: string
  text: string
}

const ITEMS: TrustItem[] = [
  {
    title: 'Producto oficial OC',
    text: 'Artículos de la marca y selección comercial OC-CALISTHENICS.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4m5.6 4a9 9 0 1 1-17.2 0 9 9 0 0 1 17.2 0Z" />
      </svg>
    ),
  },
  {
    title: 'Compra asistida',
    text: 'Sin pago en línea en este MVP: coordinas disponibilidad y pago directamente con OC.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7a4 4 0 1 0-8 0v4M5 11h14v10H5z" />
      </svg>
    ),
  },
  {
    title: 'Envíos',
    text: 'Cobertura y costo de envío se cotizan según dirección y servicio; el equipo OC te confirma.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h13v8H3zM16 13h4l1 3v2h-5zM6.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      </svg>
    ),
  },
  {
    title: 'Cambios y aclaraciones',
    text: 'Políticas de cambio o garantía según producto; consúltalas con el equipo OC antes de comprar.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10v4a8 8 0 0 0 14.5 4.7M21 14v-4a8 8 0 0 0-14.5-4.7M21 21l-3-3M3 3l3 3" />
      </svg>
    ),
  },
]

export default function StoreTrustBar() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 md:grid-cols-4 md:gap-6 md:py-8 lg:px-10">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-oc-red/10 text-oc-red">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-neutral-900">{item.title}</p>
              <p className="text-[12px] leading-snug text-neutral-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
