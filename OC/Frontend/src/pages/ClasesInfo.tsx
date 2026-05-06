import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

export default function ClasesInfo() {
  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      <PublicNav />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-oc-dark to-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-oc-light">Clases y</span>{' '}
            <span className="text-oc-red">Servicios</span>
          </h1>
          <p className="text-xl text-oc-muted mb-8">
            Clases grupales de 60 minutos · Todos los niveles
          </p>
        </div>
      </section>

      {/* Clases Disponibles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Nuestras Clases</h2>
            <p className="text-oc-muted">Diversidad de disciplinas para todos los objetivos</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Calistenia',
                image: '/Actualizacion/Clases/Paneles/CALISTENIA.png',
                imageContainsText: true,
              },
              {
                name: 'Funcional',
                image: '/Actualizacion/Clases/Paneles/Funcional.png',
                imageContainsText: true,
              },
              {
                name: 'HYROX',
                image: '/Actualizacion/Clases/Paneles/HYROX.png',
                imageContainsText: true,
              },
              {
                name: 'Karate',
                image: '/Actualizacion/Clases/Paneles/Karate.png',
                imageContainsText: true,
              },
              {
                name: 'Defensa personal',
                image: '/Actualizacion/Clases/Paneles/Defensa Personal.png',
                imageContainsText: true,
              },
              {
                name: 'OPEN GYM',
                image: '/Actualizacion/Clases/Paneles/Open Gym.png',
                imageContainsText: true,
              },
            ].map((clase) => (
              <div
                key={clase.name}
                className="bg-oc-metal/50 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10 group overflow-hidden"
              >
                <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden">
                  <img src={clase.image} alt={`Panel de ${clase.name}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" aria-hidden />
                </div>
                <div className="p-4 sm:p-5">
                  {clase.imageContainsText && (
                    <p className="text-xs text-oc-muted mb-3">Clase disponible en OC-CLUB</p>
                  )}
                  <a
                    href="https://wa.me/525567869589"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full border border-oc-red/60 px-4 py-2.5 text-sm font-semibold text-oc-light hover:bg-oc-red/10 transition-colors"
                  >
                    Solicitar información
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horarios Detallados */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Horarios</h2>
            <p className="text-oc-muted text-sm">Se ajusta conforme crece el club</p>
          </div>

          <div className="space-y-8">
            {/* Turno Matutino */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border">
              <h3 className="text-2xl font-bold text-oc-red mb-6">Turno Matutino</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-oc-border">
                  <div>
                    <span className="text-oc-red font-semibold text-lg">7:00 - 8:00 AM</span>
                    <span className="text-oc-light ml-3">Calistenia</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-oc-border">
                  <div>
                    <span className="text-oc-red font-semibold text-lg">8:00 - 9:00 AM</span>
                    <span className="text-oc-light ml-3">Funcional</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-oc-red font-semibold text-lg">9:00 - 10:00 AM</span>
                    <span className="text-oc-light ml-3">HYROX</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Turno Vespertino */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border">
              <h3 className="text-2xl font-bold text-oc-red mb-6">Turno Vespertino</h3>
              
              {/* Lunes, Miércoles y Viernes */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-oc-light mb-4">Lunes, Miércoles y Viernes</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-oc-border">
                    <div>
                      <span className="text-oc-red font-semibold text-lg">5:00 - 6:00 PM</span>
                      <span className="text-oc-light ml-3">Karate</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-oc-red font-semibold text-lg">6:00 - 7:00 PM</span>
                      <span className="text-oc-light ml-3">Defensa Personal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lunes a Viernes */}
              <div>
                <h4 className="text-lg font-semibold text-oc-light mb-4">Lunes a Viernes</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-oc-border">
                    <div>
                      <span className="text-oc-red font-semibold text-lg">7:00 - 8:00 PM</span>
                      <span className="text-oc-light ml-3">Calistenia</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-oc-border">
                    <div>
                      <span className="text-oc-red font-semibold text-lg">8:00 - 9:00 PM</span>
                      <span className="text-oc-light ml-3">HYROX</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-oc-red font-semibold text-lg">9:00 - 10:00 PM</span>
                      <span className="text-oc-light ml-3">Funcional</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OPEN GYM */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border-2 border-oc-red">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-oc-red mb-4">OPEN GYM</h3>
                <div className="mb-4">
                  <span className="text-oc-red font-semibold text-2xl">7:00 AM - 10:00 PM</span>
                </div>
                <p className="text-oc-light mb-2">Acceso libre para entrenamiento personal</p>
                <p className="text-oc-muted text-sm">Lunes a Viernes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Información Adicional */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto">
          <div className="bg-oc-metal/50 p-8 rounded-2xl border border-oc-border">
            <h3 className="text-2xl font-bold text-oc-red mb-6 text-center">Información Importante</h3>
            <div className="space-y-4 text-oc-light">
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Duración de Clases</h4>
                <p className="text-oc-muted text-sm">
                  Todas las clases grupales tienen una duración de 60 minutos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Niveles</h4>
                <p className="text-oc-muted text-sm">
                  Todas las clases están diseñadas para adaptarse a todos los niveles, desde principiantes hasta avanzados.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Reservaciones</h4>
                <p className="text-oc-muted text-sm">
                  Las clases grupales están sujetas a disponibilidad de cupo. Se recomienda llegar con anticipación.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-oc-red mb-2">OPEN GYM</h4>
                <p className="text-oc-muted text-sm">
                  El acceso a OPEN GYM está disponible para todos los socios con membresía activa. Puedes entrenar libremente durante el horario establecido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-oc-muted text-lg mb-8">
            Contáctanos para más información o agenda una clase de prueba
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/525567869589"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
            >
              Contactar por WhatsApp
            </a>
            <Link
              to="/"
              className="px-8 py-4 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-oc-dark border-t border-oc-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <OcClubLogo variant="footer" />
              </div>
              <p className="text-oc-muted text-sm">
                Elite Training Community · Alto rendimiento
              </p>
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
                <a
                  href="https://wa.me/525567869589"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-oc-muted hover:text-oc-red text-sm transition-colors"
                >
                  Contacto
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-oc-border pt-8 text-center">
            <p className="text-oc-muted text-sm">
              © {new Date().getFullYear()} OC-CLUB. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
