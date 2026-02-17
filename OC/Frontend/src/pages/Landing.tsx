import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-oc-dark/95 backdrop-blur-sm border-b border-oc-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo-oc.jpg"
                alt="OC Calisthenics"
                className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/oc-logo.png'
                }}
              />
              <div className="leading-tight">
                <span className="text-oc-red font-bold text-xl tracking-tight">OC</span>
                <span className="text-oc-light block text-xs tracking-[0.2em] font-medium">CALISTHENICS</span>
              </div>
            </Link>

            {/* Desktop Navigation Pills */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollToSection('club')}
                className="px-4 py-2 rounded-full text-sm font-medium text-oc-light hover:text-oc-red hover:bg-oc-metal/50 transition-colors"
              >
                Club
              </button>
              <Link
                to="/clases"
                className="px-4 py-2 rounded-full text-sm font-medium text-oc-light hover:text-oc-red hover:bg-oc-metal/50 transition-colors"
              >
                Clases
              </Link>
              <Link
                to="/membresias"
                className="px-4 py-2 rounded-full text-sm font-medium text-oc-light hover:text-oc-red hover:bg-oc-metal/50 transition-colors"
              >
                Membresías
              </Link>
              <Link
                to="/convenios"
                className="px-4 py-2 rounded-full text-sm font-medium text-oc-light hover:text-oc-red hover:bg-oc-metal/50 transition-colors"
              >
                Convenios
              </Link>
              <button
                onClick={() => scrollToSection('contacto')}
                className="px-4 py-2 rounded-full text-sm font-medium text-oc-light hover:text-oc-red hover:bg-oc-metal/50 transition-colors"
              >
                Contacto
              </button>
              <Link
                to="/app/login"
                className="ml-4 px-6 py-2 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-oc-red/50"
              >
                Entrar al Sistema
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-oc-light hover:text-oc-red transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-oc-border">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => scrollToSection('club')}
                  className="px-4 py-2 text-left text-oc-light hover:text-oc-red hover:bg-oc-metal/50 rounded-lg transition-colors"
                >
                  Club
                </button>
                <Link
                  to="/clases"
                  className="px-4 py-2 text-left text-oc-light hover:text-oc-red hover:bg-oc-metal/50 rounded-lg transition-colors block"
                >
                  Clases
                </Link>
                <Link
                  to="/membresias"
                  className="px-4 py-2 text-left text-oc-light hover:text-oc-red hover:bg-oc-metal/50 rounded-lg transition-colors block"
                >
                  Membresías
                </Link>
                                <Link
                                  to="/convenios"
                                  className="px-4 py-2 text-left text-oc-light hover:text-oc-red hover:bg-oc-metal/50 rounded-lg transition-colors block"
                                >
                                  Convenios
                                </Link>
                <button
                  onClick={() => scrollToSection('contacto')}
                  className="px-4 py-2 text-left text-oc-light hover:text-oc-red hover:bg-oc-metal/50 rounded-lg transition-colors"
                >
                  Contacto
                </button>
                <Link
                  to="/app/login"
                  className="mt-2 px-4 py-2 text-center rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-colors"
                >
                  Entrar al Sistema
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section - Imagen derecha, copy izquierda */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy izquierda */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-oc-red font-semibold text-sm uppercase tracking-wider">Club exclusivo · Alto rendimiento</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-oc-light">Desafía tus límites,</span>
                  <br />
                  <span className="text-oc-red">nada es imposible</span>
                </h1>
                <p className="text-lg sm:text-xl text-oc-muted leading-relaxed">
                  Un club de alto rendimiento enfocado en <strong className="text-oc-red">Calistenia</strong>, <strong className="text-oc-red">Powerlifting</strong> y <strong className="text-oc-red">Spartan</strong>.
                </p>
                <p className="text-base sm:text-lg text-oc-muted">
                  Entrena con estructura, comunidad y estándares profesionales.
                </p>
              </div>

                              {/* CTA Buttons */}
                              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                  to="/membresias"
                                  className="px-8 py-3 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
                                >
                                  Ver Membresías
                                </Link>
                                <Link
                                  to="/clases"
                                  className="px-8 py-3 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all inline-block"
                                >
                                  Explorar Clases
                                </Link>
                              </div>

              {/* Quote */}
              <div className="pt-6 border-l-4 border-oc-red pl-6">
                <p className="text-xl italic text-oc-light">
                  "Cuando logres despertar tu impulso fitness, tu vida cambiará para siempre"
                </p>
                <p className="text-sm text-oc-muted mt-2">~OC-CALISTHENICS</p>
              </div>
            </div>

            {/* Imagen derecha */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-oc-border shadow-2xl shadow-oc-red/20">
                <img
                  src="/hero-oc.png"
                  alt="OC-CALISTHENICS"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/logo-slogan.jpg'
                  }}
                />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-oc-red/20 blur-3xl rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="py-6 px-4 bg-oc-metal border-y border-oc-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <p className="text-xs text-oc-muted uppercase tracking-wider mb-1">Ubicación</p>
              <p className="text-sm text-oc-light font-medium">San Andrés Totoltepec, Tlalpan · CDMX</p>
            </div>
            <div>
              <p className="text-xs text-oc-muted uppercase tracking-wider mb-1">Enfoque</p>
              <p className="text-sm text-oc-light font-medium">Alto rendimiento + comunidad</p>
            </div>
            <div>
              <p className="text-xs text-oc-muted uppercase tracking-wider mb-1">Formato</p>
              <p className="text-sm text-oc-light font-medium">Clases por horario</p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Quiénes somos? */}
      <section id="club" className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-oc-red font-semibold text-sm uppercase tracking-wider mb-2">Perfil del club</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">¿Quiénes somos?</h2>
            <p className="text-oc-muted text-sm uppercase">Presentación institucional</p>
          </div>

          <div className="space-y-6 text-lg text-oc-light leading-relaxed">
            <p>
              <strong className="text-oc-red">OC-CALISTHENICS</strong> es una empresa dedicada a mejorar la calidad de vida de nuestros clientes con entrenamientos basados en su propio peso corporal, promoviendo la pérdida de grasa corporal, el aumento de masa muscular y la obtención de un cuerpo estético, con diferentes disciplinas de entrenamiento.
            </p>
          </div>

          {/* Disciplinas Tags */}
          <div className="mt-8 flex flex-wrap gap-3">
            {['Calistenia', 'Powerlifting', 'Spartan', 'Artes marciales', 'Defensa personal'].map((discipline) => (
              <span
                key={discipline}
                className="px-4 py-2 rounded-full bg-oc-metal border border-oc-red/30 text-oc-light text-sm font-medium hover:border-oc-red hover:bg-oc-red/10 transition-colors"
              >
                {discipline}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Misión Card */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20">
              <h3 className="text-2xl font-bold text-oc-red mb-4">Misión</h3>
              <p className="text-oc-light leading-relaxed">
                Brindar un entrenamiento personalizado, efectivo y entretenido para hombres y mujeres, así como impulsar la actividad física de los clientes, liderándolos a cambiar su calidad de vida con diferentes disciplinas de entrenamiento, enfocándonos a que el cliente logre disminuir su grasa corporal y aumentar su masa muscular de igual manera con estos ejercicios prevenimos lesiones musculares y en articulaciones.
              </p>
            </div>

            {/* Visión Card */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20">
              <h3 className="text-2xl font-bold text-oc-red mb-4">Visión</h3>
              <p className="text-oc-light leading-relaxed">
                Ser el club referente en Tlalpan por resultados, comunidad y estándares profesionales, creando una identidad OC reconocible por su constancia y mentalidad ganadora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Valores</h2>
            <p className="text-oc-muted">Los pilares que nos definen</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Compromiso con calidad', desc: 'Orientados hacia el proceso de mejora continua y camino hacia la excelencia.' },
              { title: 'Orientación al cliente', desc: 'Dedicamos nuestro tiempo a conocer y satisfacer las necesidades de nuestros clientes, proporcionándoles un servicio de calidad que cumpla con sus expectativas.' },
              { title: 'Profesionalidad', desc: 'Nuestra empresa está conformada por profesionales certificados que realizan su trabajo con eficacia, rigor y empatía, gracias al esfuerzo, trabajo en equipo y a la formación continua.' },
              { title: 'Transparencia', desc: 'Realizamos nuestro trabajo con la mayor claridad posible, informando con veracidad de los procesos, principalmente los relacionados con el cliente.' },
              { title: 'Bienestar social', desc: 'Ofrecemos una amplia programación deportiva, que contribuye a mejorar la salud y las relaciones interpersonales de nuestros clientes.' },
            ].map((valor) => (
              <div
                key={valor.title}
                className="bg-oc-metal/50 p-6 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10"
              >
                <h4 className="text-xl font-bold text-oc-red mb-2">{valor.title}</h4>
                <p className="text-oc-muted text-sm">{valor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas Competitivas */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Ventajas Competitivas</h2>
            <p className="text-oc-muted">Lo que nos distingue</p>
          </div>

          <div className="space-y-6">
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10">
              <p className="text-oc-light leading-relaxed text-lg">
                A lo largo de los años de entrenamiento, nuestra empresa ha diseñado una manera <strong className="text-oc-red">innovadora y divertida</strong> de ejercitarse ocupando tu propio peso corporal.
              </p>
            </div>
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10">
              <p className="text-oc-light leading-relaxed text-lg mb-4">
                Contamos con diferentes <strong className="text-oc-red">accesorios de trabajo</strong> (bosus, trx, pelotas de yoga, barras, etc), enfocándonos en cuidar cada parte de tu cuerpo, evitando lesiones innecesarias.
              </p>
              <p className="text-oc-muted leading-relaxed">
                A diferencia de un gimnasio tradicional que hace imprescindibles los aparatos de peso integrado o peso libre, en los cuales existe un riesgo a sufrir lesiones por un manejo poco apropiado del aparato o por falta de asesoría por parte de los entrenadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clases y Servicios */}
      <section id="clases" className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Clases y Servicios</h2>
            <p className="text-oc-muted mb-6">Clases grupales de 60 minutos · Todos los niveles</p>
            <Link
              to="/clases"
              className="inline-block px-6 py-2 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all text-sm"
            >
              Ver Clases y Horarios Completos →
            </Link>
          </div>
        </div>
      </section>

      {/* Membresías */}
      <section id="precios" className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Membresías</h2>
            <p className="text-oc-muted text-sm mb-6">Planes y paquetes disponibles</p>
            <Link
              to="/membresias"
              className="inline-block px-6 py-2 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all text-sm"
            >
              Ver Información Completa de Membresías →
            </Link>
          </div>
        </div>
      </section>

      {/* Convenios */}
      <section id="convenios" className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Convenios del Club</h2>
            <p className="text-oc-muted text-sm mb-6">Aliados y partners estratégicos</p>
            <Link
              to="/convenios"
              className="inline-block px-6 py-2 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all text-sm"
            >
              Ver Convenios Completos →
            </Link>
          </div>
        </div>
      </section>

      {/* Equipo y Comunidad */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Equipo y Comunidad</h2>
            <p className="text-oc-muted text-sm mb-6">Entrenadores · Testimonios · Galería</p>
            <Link
              to="/equipo-comunidad"
              className="inline-block px-6 py-2 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all text-sm"
            >
              Conocer al Equipo y Comunidad →
            </Link>
          </div>
        </div>
      </section>

      {/* Ubicación y Contacto */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Contacto</h2>
            <p className="text-oc-muted">Agenda, dudas e informes</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Información de contacto */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-oc-red mb-4">OC-CALISTHENICS · Club</h3>
                <p className="text-oc-light mb-6">
                  Segunda Cda. de Cedral 2, San Andrés Totoltepec, Tlalpan, 14640 Ciudad de México, CDMX
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-oc-muted text-sm mb-2">Teléfono</p>
                  <p className="text-oc-light font-semibold">55 6786 9589</p>
                </div>
                <div>
                  <p className="text-oc-muted text-sm mb-2">Horario</p>
                  <p className="text-oc-light">L–V 7–10 y 17–21 · Sáb 7–10</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="https://wa.me/525567869589"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                >
                  <span>WhatsApp: 55 6786 9589</span>
                </a>
                <a
                  href="https://instagram.com/oc_calisthenics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 font-semibold transition-all flex items-center gap-2"
                >
                  <span>Instagram: @oc_calisthenics</span>
                </a>
                <a
                  href="https://www.facebook.com/Oc_Calisthenics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 font-semibold transition-all flex items-center gap-2"
                >
                  <span>Facebook: Oc_Calisthenics</span>
                </a>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-oc-dark/50 rounded-2xl overflow-hidden border border-oc-border">
              <iframe
                src="https://www.google.com/maps?q=Segunda+Cda.+de+Cedral+2,+San+Andrés+Totoltepec,+Tlalpan,+14640+Ciudad+de+México,+CDMX&output=embed"
                width="100%"
                height="100%"
                style={{ minHeight: '400px', border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Ubicación OC-CALISTHENICS"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6">
            ¿Listo para entrenar como club?
          </h2>
          <p className="text-oc-muted text-lg mb-8">
            Pide informes o entra al sistema (demo).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/525567869589"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
            >
              Pedir info
            </a>
            <Link
              to="/app/login"
              className="px-8 py-4 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all"
            >
              Entrar al sistema
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-oc-dark border-t border-oc-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Logo y marca */}
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

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-oc-light font-semibold mb-4">Enlaces</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('club')} className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Club
                </button>
                <button onClick={() => scrollToSection('clases')} className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Clases
                </button>
                <button onClick={() => scrollToSection('precios')} className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Membresías
                </button>
                                <Link to="/convenios" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                                  Convenios
                                </Link>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-oc-light font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-oc-muted">
                <p>Tel: 55 6786 9589</p>
                <p>WhatsApp disponible</p>
                <div className="flex gap-4 pt-2">
                  <a href="https://wa.me/525567869589" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 transition-colors">
                    WhatsApp
                  </a>
                  <a href="https://instagram.com/oc_calisthenics" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 transition-colors">
                    Instagram
                  </a>
                  <a href="https://www.facebook.com/Oc_Calisthenics" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                    Facebook
                  </a>
                </div>
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
