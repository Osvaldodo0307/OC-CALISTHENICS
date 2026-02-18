import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'

export default function EquipoComunidad() {
  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      <PublicNav />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-oc-dark to-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-oc-light">Equipo y</span>{' '}
            <span className="text-oc-red">Comunidad</span>
          </h1>
          <p className="text-xl text-oc-muted mb-8">
            Conoce a nuestro equipo y la comunidad OC-CALISTHENICS
          </p>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Nuestro Equipo</h2>
            <p className="text-oc-muted">Profesionales certificados comprometidos con tu éxito</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Head Coach - Octavio Brambila */}
            <div className="bg-oc-metal/50 p-6 rounded-xl border-2 border-oc-red/50 hover:border-oc-red transition-all text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full border-2 border-oc-red/50 overflow-hidden bg-oc-dark">
                <img
                  src="/octavio-brambila.png"
                  alt="Octavio Brambila"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = '<span class="text-oc-red text-4xl flex items-center justify-center h-full">👤</span>'
                  }}
                />
              </div>
              <h3 className="text-xl font-bold text-oc-red mb-1">Octavio Brambila</h3>
              <p className="text-oc-muted text-sm mb-4 font-semibold">Head Coach</p>
              <div className="space-y-2 text-oc-light text-sm text-left">
                <p>
                  Nutriólogo y entrenador con más de <strong className="text-oc-red">8 años de experiencia</strong> en calistenia y alto rendimiento.
                </p>
                <p className="text-oc-muted text-xs">
                  Licenciado en Nutrición (UIC), certificado por la <strong>World Calisthenics Organization</strong>.
                </p>
                <p className="text-oc-muted text-xs">
                  Especialista en recomposición corporal, fuerza y programas personalizados.
                </p>
              </div>
            </div>

            <div className="bg-oc-metal/50 p-6 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-oc-dark rounded-full border-2 border-oc-red/30 flex items-center justify-center">
                <span className="text-oc-red text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-oc-light mb-2">Coach</h3>
              <p className="text-oc-muted text-sm mb-4">Especialización</p>
              <p className="text-oc-light text-sm">
                Entrenador especializado en diferentes disciplinas y metodologías de entrenamiento.
              </p>
            </div>

            <div className="bg-oc-metal/50 p-6 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-oc-dark rounded-full border-2 border-oc-red/30 flex items-center justify-center">
                <span className="text-oc-red text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-oc-light mb-2">Coach</h3>
              <p className="text-oc-muted text-sm mb-4">Acompañamiento</p>
              <p className="text-oc-light text-sm">
                Comprometido con el progreso y bienestar de cada miembro de la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reseñas y Testimonios */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Reseñas y Testimonios</h2>
            <p className="text-oc-muted">Lo que dice nuestra comunidad</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Placeholder para testimonios */}
            <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border">
              <div className="flex items-center gap-1 mb-4 text-oc-red">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-oc-light mb-4 italic">
                "Excelente ambiente y entrenadores profesionales. He visto resultados increíbles en poco tiempo."
              </p>
              <p className="text-oc-muted text-sm">— Miembro de la comunidad</p>
            </div>

            <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border">
              <div className="flex items-center gap-1 mb-4 text-oc-red">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-oc-light mb-4 italic">
                "La mejor decisión que tomé. El club tiene todo lo necesario y el equipo es increíble."
              </p>
              <p className="text-oc-muted text-sm">— Miembro de la comunidad</p>
            </div>

            <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border">
              <div className="flex items-center gap-1 mb-4 text-oc-red">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-oc-light mb-4 italic">
                "Comunidad increíble, entrenamientos desafiantes y resultados reales. Totalmente recomendado."
              </p>
              <p className="text-oc-muted text-sm">— Miembro de la comunidad</p>
            </div>
          </div>

          {/* Sección para fotografías de satisfacción */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-oc-light mb-6 text-center">Fotografías de Satisfacción</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="bg-oc-dark/50 rounded-xl border border-oc-border aspect-square flex items-center justify-center overflow-hidden hover:border-oc-red/50 transition-all"
                >
                  <div className="text-center p-4">
                    <span className="text-oc-red text-4xl mb-2 block">📸</span>
                    <p className="text-oc-muted text-xs">Foto de satisfacción</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-oc-muted text-sm mt-6">
              Próximamente: Galería de resultados y momentos de nuestros miembros
            </p>
          </div>
        </div>
      </section>

      {/* Galería del Establecimiento */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Galería del Establecimiento</h2>
            <p className="text-oc-muted">Conoce nuestras instalaciones y espacios de entrenamiento</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <div
                key={item}
                className="bg-oc-metal/50 rounded-xl border border-oc-border aspect-[4/3] flex items-center justify-center overflow-hidden hover:border-oc-red/50 transition-all group"
              >
                <div className="text-center p-4">
                  <span className="text-oc-red text-5xl mb-2 block group-hover:scale-110 transition-transform">🏋️</span>
                  <p className="text-oc-muted text-xs">Instalación</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-oc-muted text-sm mt-6">
            Próximamente: Fotografías de nuestras instalaciones, equipamiento y espacios de entrenamiento
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6">
            ¿Quieres formar parte de nuestra comunidad?
          </h2>
          <p className="text-oc-muted text-lg mb-8">
            Únete a OC-CALISTHENICS y comienza tu transformación
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
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo-plano.jpg"
                  alt="OC Calisthenics"
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/oc-logo.png'
                  }}
                />
                <div>
                  <span className="text-oc-red font-bold text-xl">OC</span>
                  <span className="text-oc-light block text-xs tracking-wider">CALISTHENICS</span>
                </div>
              </div>
              <p className="text-oc-muted text-sm">
                Club exclusivo de alto rendimiento
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
                <Link to="/clases" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Clases
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
              © 2024 OC-CALISTHENICS. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
