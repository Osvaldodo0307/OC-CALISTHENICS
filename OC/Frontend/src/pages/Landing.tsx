import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

export default function Landing() {
  return (
    <div className="oc-landing-page min-h-screen text-oc-light">
      <PublicNav />

      {/* Hero */}
      <section className="oc-landing-hero relative border-b border-white/[0.06]">
        <div className="oc-landing-hero__glow" aria-hidden />
        <div className="oc-landing-hero__grain" aria-hidden />

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-stretch min-h-0 lg:min-h-[calc(100vh-6.5rem)]">
            <div className="relative flex flex-col justify-center items-center lg:items-start pt-10 pb-8 lg:py-16 lg:pr-10 xl:pr-14 order-1">
              <div
                className="absolute top-6 left-0 lg:left-2 oc-landing-hero__chevrons text-2xl sm:text-3xl font-black select-none hidden sm:block"
                aria-hidden
              >
                &gt;&gt;&gt;
              </div>
              <div className="w-full flex flex-col items-center lg:items-start gap-4 lg:gap-5">
                <p className="landing-eyebrow mb-0 text-center lg:text-left">OC-CLUB</p>
                <div className="w-full flex justify-center lg:justify-start">
                  <OcClubLogo
                    variant="heroFeature"
                    priority
                    className="drop-shadow-[0_0_32px_rgba(210,31,45,0.18)] lg:translate-x-0"
                  />
                </div>
                <div className="text-center lg:text-left space-y-1 max-w-md">
                  <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.26em] text-oc-light/95">
                    Elite Training Community
                  </p>
                  <p className="landing-support text-center lg:text-left">Club exclusivo · Tlalpan, CDMX</p>
                </div>
              </div>
              <div className="hidden lg:block absolute right-0 top-[12%] bottom-[12%] w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" aria-hidden />
            </div>

            <div className="flex flex-col justify-center pb-12 lg:py-16 lg:pl-10 xl:pl-16 order-2 border-t border-white/[0.06] lg:border-t-0 pt-10 lg:pt-0">
              <div className="space-y-5 sm:space-y-6 max-w-xl lg:max-w-none">
                <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-oc-muted">
                  <span className="text-oc-red">Alto rendimiento</span>
                  <span className="text-white/[0.12] text-lg leading-none" aria-hidden>
                    |
                  </span>
                  <span>Comunidad</span>
                  <span className="text-white/[0.12] text-lg leading-none" aria-hidden>
                    |
                  </span>
                  <span>Estándar de club</span>
                </div>

                <h1 className="font-display text-[2.1rem] leading-[1.05] sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold tracking-tight">
                  <span className="block text-oc-light">Entrenamiento de élite</span>
                  <span className="block text-oc-red mt-1 lg:mt-2">con identidad de club.</span>
                </h1>

                <p className="landing-body sm:text-lg">
                  En <strong className="text-oc-light font-semibold">OC-CLUB</strong> combinamos método, comunidad y exigencia real.
                  Somos un club de alto rendimiento con foco en{' '}
                  <strong className="text-oc-red font-semibold">Calistenia</strong>,{' '}
                  <strong className="text-oc-red font-semibold">Powerlifting</strong> y{' '}
                  <strong className="text-oc-red font-semibold">Spartan</strong> — disciplinas complementarias bajo un mismo estándar.
                </p>
                <p className="landing-support sm:text-base">
                  Clases por horario · coaching profesional · ambiente ordenado y competitivo.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/membresias" className="landing-btn-primary text-center">
                  Membresías
                </Link>
                <Link to="/clases" className="landing-btn-outline text-center">
                  Horarios y clases
                </Link>
              </div>

              <figure className="landing-card mt-10 pl-4 border-l-2 border-oc-red/70 py-4 pr-4 !rounded-sm">
                <blockquote className="text-base sm:text-lg italic text-oc-light/90 leading-snug font-sans">
                  &ldquo;Cuando logres despertar tu impulso fitness, tu vida cambiará para siempre.&rdquo;
                </blockquote>
                <figcaption className="mt-2 landing-eyebrow mb-0 text-oc-muted tracking-[0.2em]">OC-CLUB</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="oc-landing-strip relative py-8 px-4 sm:px-6 lg:px-10 z-10">
        <div className="landing-section-shell max-w-7xl relative z-10">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 text-center sm:text-left">
            <div className="sm:border-r sm:border-white/[0.08] sm:pr-6">
              <p className="landing-eyebrow mb-2">Ubicación</p>
              <p className="text-sm text-oc-light font-medium leading-snug">San Andrés Totoltepec, Tlalpan · CDMX</p>
            </div>
            <div className="sm:border-r sm:border-white/[0.08] sm:pr-6">
              <p className="landing-eyebrow mb-2">Enfoque</p>
              <p className="text-sm text-oc-light font-medium leading-snug">Alto rendimiento · comunidad · exigencia</p>
            </div>
            <div>
              <p className="landing-eyebrow mb-2">Formato</p>
              <p className="text-sm text-oc-light font-medium leading-snug">Clases por horario · cupos controlados</p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Quiénes somos? */}
      <section id="club" className="landing-section landing-surface-base relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <header className="landing-section-header">
            <p className="landing-eyebrow">Perfil del club</p>
            <h2 className="landing-title">¿Quiénes somos?</h2>
            <p className="landing-subtitle">Elite Training Community · filosofía de club</p>
          </header>

          <div className="landing-body text-lg max-w-none space-y-6">
            <p>
              <strong className="text-oc-red font-semibold">OC-CLUB</strong> es una empresa dedicada a mejorar la calidad de
              vida de nuestros clientes con entrenamientos basados en su propio peso corporal, promoviendo la pérdida de grasa
              corporal, el aumento de masa muscular y la obtención de un cuerpo estético, con diferentes disciplinas de
              entrenamiento.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2.5">
            {['Calistenia', 'Powerlifting', 'Spartan', 'Artes marciales', 'Defensa personal'].map((discipline) => (
              <span key={discipline} className="landing-tag">
                {discipline}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="landing-section landing-surface-elevated relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <article className="landing-card h-full">
              <h3 className="landing-card-title">Misión</h3>
              <p className="landing-card-body">
                Brindar un entrenamiento personalizado, efectivo y entretenido para hombres y mujeres, así como impulsar la
                actividad física de los clientes, liderándolos a cambiar su calidad de vida con diferentes disciplinas de
                entrenamiento, enfocándonos a que el cliente logre disminuir su grasa corporal y aumentar su masa muscular de
                igual manera con estos ejercicios prevenimos lesiones musculares y en articulaciones.
              </p>
            </article>
            <article className="landing-card h-full">
              <h3 className="landing-card-title">Visión</h3>
              <p className="landing-card-body">
                Ser el club referente en Tlalpan por resultados, comunidad y estándares profesionales, creando una identidad
                OC-CLUB reconocible por su constancia y mentalidad ganadora.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="landing-section landing-surface-base relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <header className="landing-section-header">
            <h2 className="landing-title">Valores</h2>
            <p className="landing-subtitle">Los pilares que nos definen</p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Compromiso con calidad',
                desc: 'Orientados hacia el proceso de mejora continua y camino hacia la excelencia.',
              },
              {
                title: 'Orientación al cliente',
                desc: 'Dedicamos nuestro tiempo a conocer y satisfacer las necesidades de nuestros clientes, proporcionándoles un servicio de calidad que cumpla con sus expectativas.',
              },
              {
                title: 'Profesionalidad',
                desc: 'Nuestra empresa está conformada por profesionales certificados que realizan su trabajo con eficacia, rigor y empatía, gracias al esfuerzo, trabajo en equipo y a la formación continua.',
              },
              {
                title: 'Transparencia',
                desc: 'Realizamos nuestro trabajo con la mayor claridad posible, informando con veracidad de los procesos, principalmente los relacionados con el cliente.',
              },
              {
                title: 'Bienestar social',
                desc: 'Ofrecemos una amplia programación deportiva, que contribuye a mejorar la salud y las relaciones interpersonales de nuestros clientes.',
              },
            ].map((valor) => (
              <article key={valor.title} className="landing-card">
                <h3 className="landing-card-title !text-lg">{valor.title}</h3>
                <p className="landing-card-body-muted !mt-0">{valor.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas competitivas */}
      <section className="landing-section landing-surface-elevated relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <header className="landing-section-header">
            <h2 className="landing-title">Ventajas competitivas</h2>
            <p className="landing-subtitle">Lo que nos distingue</p>
          </header>

          <div className="space-y-5">
            <article className="landing-card">
              <p className="landing-card-body text-lg">
                A lo largo de los años de entrenamiento, nuestra empresa ha diseñado una manera{' '}
                <strong className="text-oc-red font-semibold">innovadora y divertida</strong> de ejercitarse ocupando tu propio
                peso corporal.
              </p>
            </article>
            <article className="landing-card">
              <p className="landing-card-body text-lg mb-0">
                Contamos con diferentes <strong className="text-oc-red font-semibold">accesorios de trabajo</strong> (bosus,
                trx, pelotas de yoga, barras, etc), enfocándonos en cuidar cada parte de tu cuerpo, evitando lesiones
                innecesarias.
              </p>
              <p className="landing-card-body-muted">
                A diferencia de un gimnasio tradicional que hace imprescindibles los aparatos de peso integrado o peso libre,
                en los cuales existe un riesgo a sufrir lesiones por un manejo poco apropiado del aparato o por falta de
                asesoría por parte de los entrenadores.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Clases */}
      <section id="clases" className="landing-section landing-surface-base relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell">
          <header className="landing-section-header !mb-8">
            <h2 className="landing-title">Clases y servicios</h2>
            <p className="landing-subtitle">Clases grupales de 60 minutos · Todos los niveles</p>
            <Link to="/clases" className="landing-btn-outline mt-8">
              Ver clases y horarios completos →
            </Link>
          </header>
        </div>
      </section>

      {/* Membresías, convenios y equipo: un solo bloque para evitar cortes repetidos */}
      <section className="landing-section landing-surface-base relative pb-8 sm:pb-10 lg:pb-12">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow space-y-14 sm:space-y-16 lg:space-y-20">
          <div id="precios" className="scroll-mt-28 text-center">
            <header className="landing-section-header !mb-8">
              <h2 className="landing-title">Membresías</h2>
              <p className="landing-subtitle">Planes y paquetes disponibles</p>
              <Link to="/membresias" className="landing-btn-outline mt-8">
                Ver información completa de membresías →
              </Link>
            </header>
          </div>

          <div id="convenios" className="scroll-mt-28 text-center border-t border-white/[0.06] pt-14 sm:pt-16">
            <header className="landing-section-header !mb-8">
              <h2 className="landing-title">Convenios del club</h2>
              <p className="landing-subtitle">Aliados y partners estratégicos</p>
              <Link to="/convenios" className="landing-btn-outline mt-8">
                Ver convenios completos →
              </Link>
            </header>
          </div>

          <div className="scroll-mt-28 text-center border-t border-white/[0.06] pt-14 sm:pt-16">
            <header className="landing-section-header !mb-8">
              <h2 className="landing-title">Equipo y comunidad</h2>
              <p className="landing-subtitle">Entrenadores · Testimonios · Galería</p>
              <Link to="/equipo-comunidad" className="landing-btn-outline mt-8">
                Conocer al equipo y comunidad →
              </Link>
            </header>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="landing-section landing-surface-elevated relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <header className="landing-section-header">
            <h2 className="landing-title">Contacto</h2>
            <p className="landing-subtitle">Agenda, dudas e informes</p>
          </header>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="landing-card-title">OC-CLUB · Elite Training</h3>
                <p className="landing-body">
                  Segunda Cda. de Cedral 2, San Andrés Totoltepec, Tlalpan, 14640 Ciudad de México, CDMX
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="landing-eyebrow mb-1.5">Teléfono</p>
                  <p className="text-oc-light font-semibold">55 6786 9589</p>
                </div>
                <div>
                  <p className="landing-eyebrow mb-1.5">Horario</p>
                  <p className="landing-body !text-oc-light">L–V 7–10 y 17–21 · Sáb 7–10</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://wa.me/525567869589"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn-primary"
                >
                  WhatsApp: 55 6786 9589
                </a>
                <a
                  href="https://instagram.com/oc_calisthenics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn-outline"
                >
                  Instagram: @oc_calisthenics
                </a>
                <a
                  href="https://www.facebook.com/Oc_Calisthenics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn-outline border-white/15 hover:border-oc-red/50"
                >
                  Facebook: Oc_Calisthenics
                </a>
              </div>
            </div>

            <div className="landing-card !p-0 overflow-hidden min-h-[400px]">
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
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA final: acento puntual */}
      <section className="landing-section landing-surface-accent relative py-12 sm:py-16 lg:py-20">
        <div className="landing-section-shell landing-section-shell--narrow text-center max-w-3xl">
          <h2 className="landing-title">¿Listo para entrenar como club?</h2>
          <p className="landing-body text-lg mt-4 mb-8 text-oc-muted">Pide informes o entra al sistema (demo).</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="https://wa.me/525567869589" target="_blank" rel="noopener noreferrer" className="landing-btn-primary">
              Pedir info
            </a>
            <Link to="/app/login" className="landing-btn-outline">
              Entrar al sistema
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="landing-footer__rule" />
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="mb-4">
                <OcClubLogo variant="footer" />
              </div>
              <p className="landing-support leading-relaxed">
                Elite Training Community
                <br />
                <span className="text-oc-muted/85">Alto rendimiento · CDMX</span>
              </p>
            </div>

            <div>
              <h4 className="landing-aside-title">Enlaces</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('club')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block landing-support hover:text-oc-red transition-colors text-left w-full"
                >
                  Club
                </button>
                <Link to="/clases" className="block landing-support hover:text-oc-red transition-colors">
                  Clases
                </Link>
                <Link to="/membresias" className="block landing-support hover:text-oc-red transition-colors">
                  Membresías
                </Link>
                <Link to="/convenios" className="block landing-support hover:text-oc-red transition-colors">
                  Convenios
                </Link>
              </div>
            </div>

            <div>
              <h4 className="landing-aside-title">Contacto</h4>
              <div className="space-y-2 landing-support">
                <p>Tel: 55 6786 9589</p>
                <p>WhatsApp disponible</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a href="https://wa.me/525567869589" target="_blank" rel="noopener noreferrer" className="text-oc-red hover:text-oc-light transition-colors">
                    WhatsApp
                  </a>
                  <a
                    href="https://instagram.com/oc_calisthenics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-oc-muted hover:text-oc-red transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/Oc_Calisthenics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-oc-muted hover:text-oc-red transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 text-center">
            <p className="landing-support text-sm">© {new Date().getFullYear()} OC-CLUB. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
