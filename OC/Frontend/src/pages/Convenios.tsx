import { Link } from 'react-router-dom'

export default function Convenios() {
  const aliados = [
    { name: 'Dentistas (Dr. Ortiz)', category: 'Salud Dental' },
    { name: 'Nutrición', category: 'Salud y Bienestar' },
    { name: 'Masajista', category: 'Recuperación' },
    { name: 'CCDF (Certificaciones)', category: 'Educación' },
    { name: 'Team Youri Yeshua (World Strong Man)', category: 'Deporte' },
    { name: 'Barbershop Richard', category: 'Belleza y Cuidado Personal' },
    { name: 'Team Wolf', category: 'Deporte' },
    { name: 'Resilience (accesorios / joyería)', category: 'Accesorios' },
  ]

  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      {/* Header */}
      <header className="bg-oc-metal border-b border-oc-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo-oc.jpg"
                alt="OC Calisthenics"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/oc-logo.png'
                }}
              />
              <div className="leading-tight">
                <span className="text-oc-red font-bold text-xl">OC</span>
                <span className="text-oc-light block text-xs tracking-[0.2em]">CALISTHENICS</span>
              </div>
            </Link>
            <Link
              to="/app/login"
              className="bg-oc-red hover:bg-oc-red-deep text-white px-6 py-2 rounded-full font-semibold text-sm transition-all"
            >
              Entrar al Sistema
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-oc-dark to-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-oc-light">Convenios y</span>{' '}
            <span className="text-oc-red">Aliados</span>
          </h1>
          <p className="text-xl text-oc-muted mb-8">
            Aliados estratégicos y partners que complementan tu experiencia en OC-CALISTHENICS
          </p>
        </div>
      </section>

      {/* Aliados */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Nuestros Aliados</h2>
            <p className="text-oc-muted">Partners estratégicos para tu bienestar integral</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aliados.map((aliado, index) => (
              <div
                key={index}
                className="bg-oc-metal/50 p-6 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10 group"
              >
                {/* Espacio para logo */}
                <div className="w-full h-32 mb-4 bg-oc-dark rounded-lg border-2 border-oc-border flex items-center justify-center overflow-hidden group-hover:border-oc-red/50 transition-colors">
                  <span className="text-oc-muted text-sm">Logo</span>
                </div>
                <h3 className="text-lg font-bold text-oc-light mb-2 group-hover:text-oc-red transition-colors text-center">
                  {aliado.name}
                </h3>
                <p className="text-oc-muted text-xs text-center">{aliado.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Información sobre Convenios */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-4xl mx-auto">
          <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border">
            <h3 className="text-2xl font-bold text-oc-red mb-6 text-center">Beneficios de Nuestros Convenios</h3>
            <div className="space-y-4 text-oc-light">
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Salud Integral</h4>
                <p className="text-oc-muted text-sm">
                  Acceso a servicios de salud dental, nutrición y recuperación física con descuentos especiales para miembros de OC-CALISTHENICS.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Desarrollo Profesional</h4>
                <p className="text-oc-muted text-sm">
                  Oportunidades de certificación y desarrollo profesional a través de nuestros aliados educativos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Comunidad y Networking</h4>
                <p className="text-oc-muted text-sm">
                  Conexión con otros equipos y comunidades deportivas para expandir tu red y participar en eventos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-oc-red mb-2">Bienestar Completo</h4>
                <p className="text-oc-muted text-sm">
                  Desde cuidado personal hasta accesorios especializados, nuestros aliados cubren todas tus necesidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6">
            ¿Quieres ser parte de nuestros aliados?
          </h2>
          <p className="text-oc-muted text-lg mb-8">
            Si tienes un negocio o servicio que complemente nuestra comunidad, contáctanos
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
      <footer className="bg-oc-metal border-t border-oc-border py-12 px-4 sm:px-6 lg:px-8">
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
