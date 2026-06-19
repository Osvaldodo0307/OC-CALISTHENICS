import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'
import { featuredTestimonials } from '../data/testimonials'

export default function Experiencias() {
  return (
    <div className="min-h-screen bg-oc-carbon text-oc-light">
      <PublicNav />
      <main className="py-16 md:py-20">
        <section className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <OcClubLogo variant="heroMark" className="opacity-95" />
            <h1 className="mt-6 font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">
              Experiencias OC-CLUB
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed">
              Opiniones de socios del club en Tlalpan. Si entrenas con nosotros, podrás compartir la tuya desde tu
              perfil en el portal cuando esté disponible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTestimonials.map((item, index) => (
              <article
                key={`${item.name}-${index}`}
                className="rounded-lg border border-white/10 bg-black/35 p-6"
              >
                <p className="text-sm uppercase tracking-wider text-oc-red">{item.discipline}</p>
                <p className="mt-3 text-white/85 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm text-oc-muted">— {item.name}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
