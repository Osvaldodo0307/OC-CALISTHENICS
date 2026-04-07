import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

export default function Landing() {
  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      <PublicNav />

      {/* Hero rediseñado: marca como pilar (no tarjeta); copy y CTAs en columna propia */}
      <section className="oc-landing-hero relative border-b border-oc-border">
        <div className="oc-landing-hero__glow" aria-hidden />
        <div className="oc-landing-hero__grain" aria-hidden />

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-stretch min-h-0 lg:min-h-[calc(100vh-6.5rem)]">
            {/* Columna marca: protagonismo real del logo, integrado al fondo de marca */}
            <div className="relative flex flex-col justify-center items-center lg:items-start pt-10 pb-8 lg:py-16 lg:pr-10 xl:pr-14 order-1">
              <div
                className="absolute top-6 left-0 lg:left-2 oc-landing-hero__chevrons text-2xl sm:text-3xl font-black select-none hidden sm:block"
                aria-hidden
              >
                &gt;&gt;&gt;
              </div>
              <div className="w-full flex flex-col items-center lg:items-start gap-4 lg:gap-5">
                <p className="text-center lg:text-left text-[11px] sm:text-xs font-bold uppercase tracking-[0.32em] text-oc-red">
                  OC-CLUB
                </p>
                <div className="w-full flex justify-center lg:justify-start">
                  <OcClubLogo
                    variant="heroFeature"
                    priority
                    className="drop-shadow-[0_0_40px_rgba(210,31,45,0.25)] lg:translate-x-0"
                  />
                </div>
                <div className="text-center lg:text-left space-y-1 max-w-md">
                  <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.26em] text-oc-light/95">
                    Elite Training Community
                  </p>
                  <p className="text-oc-muted text-sm">Club exclusivo · Tlalpan, CDMX</p>
                </div>
              </div>
              <div className="hidden lg:block absolute right-0 top-[12%] bottom-[12%] w-px bg-gradient-to-b from-transparent via-oc-border to-transparent" aria-hidden />
            </div>

            {/* Columna narrativa */}
            <div className="flex flex-col justify-center pb-12 lg:py-16 lg:pl-10 xl:pl-16 order-2 border-t border-oc-border/80 lg:border-t-0 pt-10 lg:pt-0">
              <div className="space-y-5 sm:space-y-6 max-w-xl lg:max-w-none">
                <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-oc-muted">
                  <span className="text-oc-red">Alto rendimiento</span>
                  <span className="text-oc-border text-lg leading-none" aria-hidden>
                    |
                  </span>
                  <span>Comunidad</span>
                  <span className="text-oc-border text-lg leading-none" aria-hidden>
                    |
                  </span>
                  <span>Estándar de club</span>
                </div>

                <h1 className="text-[2.1rem] leading-[1.05] sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold tracking-tight">
                  <span className="block text-oc-light">Entrenamiento de élite</span>
                  <span className="block text-oc-red mt-1 lg:mt-2">con identidad de club.</span>
                </h1>

                <p className="text-base sm:text-lg text-oc-muted leading-relaxed">
                  En <strong className="text-oc-light font-semibold">OC-CLUB</strong> combinamos método, comunidad y exigencia real.
                  Somos un club de alto rendimiento con foco en{' '}
                  <strong className="text-oc-red">Calistenia</strong>, <strong className="text-oc-red">Powerlifting</strong> y{' '}
                  <strong className="text-oc-red">Spartan</strong> — disciplinas complementarias bajo un mismo estándar.
                </p>
                <p className="text-sm sm:text-base text-oc-muted/90 leading-relaxed">
                  Clases por horario · coaching profesional · ambiente ordenado y competitivo.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/membresias"
                  className="text-center px-8 py-4 rounded-sm bg-oc-red hover:bg-oc-red-deep text-white text-sm font-bold uppercase tracking-wider transition-all ring-1 ring-white/10 hover:shadow-lg hover:shadow-oc-red/40"
                >
                  Membresías
                </Link>
                <Link
                  to="/clases"
                  className="text-center px-8 py-4 rounded-sm border-2 border-oc-red/90 text-oc-light hover:bg-oc-red/10 text-sm font-bold uppercase tracking-wider transition-colors"
                >
                  Horarios y clases
                </Link>
              </div>

              <figure className="mt-10 pl-4 border-l-2 border-oc-red/80 bg-oc-metal/25 py-4 pr-4 rounded-r-md">
                <blockquote className="text-base sm:text-lg italic text-oc-light/90 leading-snug">
                  &ldquo;Cuando logres despertar tu impulso fitness, tu vida cambiará para siempre.&rdquo;
                </blockquote>
                <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-oc-muted">OC-CLUB</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Franja de señales rápidas (tratamiento de marca) */}
      <section className="oc-landing-strip py-7 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 text-center sm:text-left">
            <div className="sm:border-r sm:border-oc-border/60 sm:pr-6">
              <p className="text-xs text-oc-red font-bold uppercase tracking-[0.2em] mb-2">Ubicación</p>
              <p className="text-sm text-oc-light font-medium leading-snug">San Andrés Totoltepec, Tlalpan · CDMX</p>
            </div>
            <div className="sm:border-r sm:border-oc-border/60 sm:pr-6">
              <p className="text-xs text-oc-red font-bold uppercase tracking-[0.2em] mb-2">Enfoque</p>
              <p className="text-sm text-oc-light font-medium leading-snug">Alto rendimiento · comunidad · exigencia</p>
            </div>
            <div>
              <p className="text-xs text-oc-red font-bold uppercase tracking-[0.2em] mb-2">Formato</p>
              <p className="text-sm text-oc-light font-medium leading-snug">Clases por horario · cupos controlados</p>
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
            <p className="text-oc-muted text-sm uppercase tracking-wider">Elite Training Community · filosofía de club</p>
          </div>

          <div className="space-y-6 text-lg text-oc-light leading-relaxed">
            <p>
              <strong className="text-oc-red">OC-CLUB</strong> es una empresa dedicada a mejorar la calidad de vida de nuestros clientes con entrenamientos basados en su propio peso corporal, promoviendo la pérdida de grasa corporal, el aumento de masa muscular y la obtención de un cuerpo estético, con diferentes disciplinas de entrenamiento.
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
                Ser el club referente en Tlalpan por resultados, comunidad y estándares profesionales, creando una identidad OC-CLUB reconocible por su constancia y mentalidad ganadora.
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
                <h3 className="text-xl font-bold text-oc-red mb-4">OC-CLUB · Elite Training</h3>
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
                  className="px-6 py-3 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                >
                  <span>WhatsApp: 55 6786 9589</span>
                </a>
                <a
                  href="https://instagram.com/oc_calisthenics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all flex items-center gap-2"
                >
                  <span>Instagram: @oc_calisthenics</span>
                </a>
                <a
                  href="https://www.facebook.com/Oc_Calisthenics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border-2 border-oc-border text-oc-light hover:border-oc-red hover:text-oc-red font-semibold transition-all flex items-center gap-2"
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
                title="Ubicación OC-CLUB"
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
              <div className="mb-4">
                <OcClubLogo variant="footer" />
              </div>
              <p className="text-oc-muted text-sm leading-relaxed">
                Elite Training Community
                <br />
                <span className="text-oc-muted/80">Alto rendimiento · CDMX</span>
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-oc-light font-semibold mb-4">Enlaces</h4>
              <div className="space-y-2">
                <button onClick={() => document.getElementById('club')?.scrollIntoView({ behavior: 'smooth' })} className="block text-oc-muted hover:text-oc-red text-sm transition-colors text-left">
                  Club
                </button>
                <Link to="/clases" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Clases
                </Link>
                <Link to="/membresias" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Membresías
                </Link>
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
                  <a href="https://wa.me/525567869589" target="_blank" rel="noopener noreferrer" className="text-oc-red hover:text-oc-light transition-colors">
                    WhatsApp
                  </a>
                  <a href="https://instagram.com/oc_calisthenics" target="_blank" rel="noopener noreferrer" className="text-oc-muted hover:text-oc-red transition-colors">
                    Instagram
                  </a>
                  <a href="https://www.facebook.com/Oc_Calisthenics" target="_blank" rel="noopener noreferrer" className="text-oc-muted hover:text-oc-red transition-colors">
                    Facebook
                  </a>
                </div>
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
