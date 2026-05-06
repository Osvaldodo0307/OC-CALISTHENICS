import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

const GYM_IMAGES = [
  '/Actualizacion/CLUB/Gimnasio.jpeg',
  '/Actualizacion/CLUB/2do piso.jpeg',
  '/Actualizacion/CLUB/GYM_LuzAzul.jpeg',
]

export default function Club() {
  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      <PublicNav />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-oc-dark to-oc-metal">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="text-oc-light">Conoce</span> <span className="text-oc-red">El Club</span>
          </h1>
          <p className="mt-5 text-lg text-oc-muted max-w-3xl mx-auto">
            Un recorrido por las zonas de entrenamiento que hacen de OC-CLUB una experiencia real de alto rendimiento.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-7xl mx-auto space-y-6">
          <article className="rounded-2xl border border-oc-border bg-oc-metal/35 overflow-hidden p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-oc-light">Gimnasio</h2>
              <p className="mt-2 text-sm text-oc-muted leading-relaxed">
                El mismo espacio OC desde tres ángulos: área principal, segundo piso y ambiente del club.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GYM_IMAGES.map((image) => (
                <div key={image} className="group relative h-56 w-full overflow-hidden rounded-xl">
                  <img
                    src={image}
                    alt="Espacio del gimnasio OC-CLUB"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
                </div>
              ))}
            </div>
          </article>

          <div className="grid md:grid-cols-2 gap-6">
            <article className="group rounded-2xl border border-oc-border bg-oc-metal/35 overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src="/Actualizacion/CLUB/Calishtenic_zone.jpeg"
                  alt="Zona de calistenia OC-CLUB"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-oc-light">Zona de calistenia</h2>
                <p className="mt-2 text-sm text-oc-muted leading-relaxed">
                  Espacio dedicado al trabajo técnico de peso corporal, progresiones y control de movimiento.
                </p>
              </div>
            </article>

            <article className="group rounded-2xl border border-oc-border bg-oc-metal/35 overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src="/Actualizacion/CLUB/POWER_ZONE.jpeg"
                  alt="Powerlifting Zone OC-CLUB"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-oc-light">Power Zone</h2>
                <p className="mt-2 text-sm text-oc-muted leading-relaxed">
                  Área orientada a fuerza y rendimiento con un entorno pensado para trabajo específico.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light">Vive el club por dentro</h2>
          <p className="mt-4 text-oc-muted text-lg">Agenda una visita y conoce cada zona en persona.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/525567869589"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all"
            >
              Agendar visita
            </a>
            <Link
              to="/"
              className="px-8 py-4 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-oc-dark border-t border-oc-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <OcClubLogo variant="footer" />
              </div>
              <p className="text-oc-muted text-sm">OC-CLUB · Elite Training Community</p>
            </div>
            <div>
              <h4 className="text-oc-light font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-oc-muted">
                <p>Tel: 55 6786 9589</p>
                <p>WhatsApp disponible</p>
              </div>
            </div>
            <div>
              <h4 className="text-oc-light font-semibold mb-4">Enlaces</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Inicio
                </Link>
                <Link to="/membresias" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Membresías
                </Link>
                <Link to="/clases" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Clases
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-oc-border pt-8 text-center">
            <p className="text-oc-muted text-sm">© {new Date().getFullYear()} OC-CLUB. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
