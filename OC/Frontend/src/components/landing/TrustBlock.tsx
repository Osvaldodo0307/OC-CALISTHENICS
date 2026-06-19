const TRUST_ITEMS = [
  {
    title: 'Ubicación en Tlalpan',
    text: 'Lázaro Cárdenas 8, Ejidos de San Pedro Mártir. Club físico, no solo web.',
  },
  {
    title: 'Coaching en el piso',
    text: 'Corrección técnica y seguimiento durante tu sesión, no solo acceso a máquinas.',
  },
  {
    title: 'Comunidad real',
    text: 'Ambiente de club con gente que entrena en serio y se apoya en el piso.',
  },
  {
    title: 'Clases especializadas',
    text: 'HYROX, calistenia, powerlifting y más disciplinas con horario estructurado.',
  },
  {
    title: 'Recovery Lab',
    text: 'Sauna, presoterapia, INBODY y servicios de recuperación en el mismo club.',
  },
  {
    title: 'Atención por WhatsApp',
    text: 'Agenda visitas, cotiza planes y resuelve dudas con el equipo OC.',
  },
] as const

export default function TrustBlock() {
  return (
    <section className="py-14 md:py-16 bg-[#0c0c0c] border-y border-white/[0.06]">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl mb-10">
          <h2 className="font-hero text-3xl sm:text-4xl text-white uppercase tracking-tight">
            Por qué confiar en OC Club
          </h2>
          <p className="mt-3 text-white/65 leading-relaxed">
            Somos un gimnasio presencial en la zona sur de CDMX. Esto es lo que puedes esperar al visitarnos.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item.title}
              className="rounded-lg border border-white/[0.08] bg-black/30 p-5"
            >
              <h3 className="text-sm font-bold uppercase tracking-wide text-oc-red">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
