import { Link } from 'react-router-dom'
import WhatsAppLink from '../WhatsAppLink'

const PLANS = [
  {
    id: 'basico',
    title: 'OC GYM Básico',
    price: 'Desde $600 / mes',
    audience: 'Para quien entrena por su cuenta con apoyo de coach de piso.',
    benefit: 'Acceso al área de gimnasio, regaderas, agua y ambiente de club.',
    preset: 'basico' as const,
    featured: false,
  },
  {
    id: 'premium',
    title: 'OC GYM Premium',
    price: 'Desde $950 / mes',
    audience: 'Para quien quiere gimnasio + recuperación incluida en el club.',
    benefit: 'Todo lo del Básico más sauna y presoterapia Normatec.',
    preset: 'premium' as const,
    featured: true,
  },
  {
    id: 'acceso-total',
    title: 'Acceso Total',
    price: 'Desde $2,100 / mes',
    audience: 'Para atletas que quieren el club completo: clases, recovery y beneficios premium.',
    benefit: 'Clases, sauna, toalla, café, INBODY mensual y visitas para invitados.',
    preset: 'accesoTotal' as const,
    featured: false,
  },
] as const

export default function AnchorPlans() {
  return (
    <section id="planes" className="scroll-mt-24 py-16 md:py-20 bg-oc-carbon border-t border-white/[0.06]">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl mb-10 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oc-red/90">Membresías</p>
          <h2 className="mt-3 font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">
            Elige tu plan en Tlalpan
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Tres opciones claras para empezar. Los precios finales y promociones vigentes te los confirma el
            equipo por WhatsApp al agendar tu visita.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-lg border p-6 md:p-7 ${
                plan.featured
                  ? 'border-oc-red/60 bg-black/50 shadow-[0_0_40px_-12px_rgba(229,9,20,0.35)]'
                  : 'border-white/10 bg-black/30'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-6 rounded-sm bg-oc-red px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Más popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-white">{plan.title}</h3>
              <p className="mt-2 text-2xl font-bold text-oc-red">{plan.price}</p>
              <p className="mt-4 text-sm text-white/75 leading-relaxed">
                <span className="font-semibold text-white/90">Para quién es: </span>
                {plan.audience}
              </p>
              <p className="mt-3 text-sm text-white/65 leading-relaxed">
                <span className="font-semibold text-white/80">Incluye: </span>
                {plan.benefit}
              </p>
              <div className="mt-auto pt-6 flex flex-col gap-2">
                <WhatsAppLink
                  preset={plan.preset}
                  className="inline-flex w-full items-center justify-center rounded-sm bg-oc-red px-4 py-2.5 text-sm font-bold text-white hover:bg-oc-red-deep transition-colors"
                >
                  Consultar por WhatsApp
                </WhatsAppLink>
                <Link
                  to="/membresias"
                  className="inline-flex w-full items-center justify-center rounded-sm border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 transition-colors"
                >
                  Ver detalle de planes
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/50">
          También hay paquetes de clases y Recovery Lab (servicio adicional).{' '}
          <WhatsAppLink preset="recovery" className="text-oc-red hover:text-white transition-colors">
            Pregunta por Recovery Lab
          </WhatsAppLink>
        </p>
      </div>
    </section>
  )
}
