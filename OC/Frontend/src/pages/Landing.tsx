import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

const HERO_PANEL_ROWS: { label: string; value: string }[] = [
  { label: 'Ubicación', value: 'San Andrés Totoltepec, Tlalpan · CDMX' },
  { label: 'Formato', value: 'Clases grupales · 60 min · cupos controlados' },
  { label: 'Disciplinas', value: 'Calistenia · Powerlifting · Spartan' },
  { label: 'Enfoque', value: 'Estructura · comunidad · alto rendimiento' },
]

const HERO_BULLETS = [
  'Coaching en piso — sin depender solo de máquinas.',
  'Progresión clara para todos los niveles.',
  'Ambiente de club: orden, respeto y exigencia.',
]

export default function Landing() {
  return (
    <div className="oc-landing-page min-h-screen text-oc-light">
      <PublicNav />

      {/* Hero editorial: wordmark + contenido + panel de datos (sin cartel dominante) */}
      <section className="oc-landing-hero relative border-b border-white/[0.06]">
        <div className="oc-landing-hero__glow" aria-hidden />
        <div className="oc-landing-hero__grain" aria-hidden />
        <div className="oc-landing-hero__mesh" aria-hidden />

        <div className="relative z-10 landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch pt-9 pb-11 lg:py-12 xl:py-14 min-h-0 lg:min-h-[calc(100vh-4rem)]">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <OcClubLogo variant="heroMark" priority />
              <p className="mt-5 landing-overline-soft">
                Elite Training Community · Club deportivo · Tlalpan, CDMX
              </p>

              <h1 className="mt-6 landing-hero-display">
                <span className="block">Entrenamiento de élite</span>
                <span className="block landing-hero-accent mt-1">con identidad de club.</span>
              </h1>

              <p className="mt-6 landing-hero-lead">
                En <strong className="text-oc-light font-semibold">OC-CLUB</strong> unimos método, comunidad y estándares
                profesionales. Foco en{' '}
                <strong className="text-oc-red font-semibold">Calistenia</strong>,{' '}
                <strong className="text-oc-red font-semibold">Powerlifting</strong> y{' '}
                <strong className="text-oc-red font-semibold">Spartan</strong> — una misma exigencia, disciplinas
                complementarias.
              </p>

              <ul className="mt-5 landing-hero-bullets">
                {HERO_BULLETS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/membresias" className="landing-btn-primary text-center">
                  Membresías
                </Link>
                <Link to="/clases" className="landing-btn-outline text-center">
                  Horarios y clases
                </Link>
              </div>

              <blockquote className="landing-hero-quote mt-10">
                &ldquo;Cuando logres despertar tu impulso fitness, tu vida cambiará para siempre.&rdquo;
                <cite className="not-italic block mt-3 text-xs text-oc-muted tracking-wide">— OC-CLUB</cite>
              </blockquote>
            </div>

            <aside className="lg:col-span-5 flex flex-col justify-center">
              <div className="landing-hero-panel">
                <p className="landing-hero-panel__head">Datos del club</p>
                {HERO_PANEL_ROWS.map((row) => (
                  <div key={row.label} className="landing-hero-panel__row">
                    <span className="landing-hero-panel__label">{row.label}</span>
                    <span className="landing-hero-panel__value">{row.value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ¿Quiénes somos? — dos columnas + aside */}
      <section id="club" className="landing-section landing-section--dense landing-surface-base relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-7">
              <header className="mb-6 text-left">
                <p className="landing-eyebrow">Perfil del club</p>
                <h2 className="landing-heading-section">¿Quiénes somos?</h2>
                <p className="landing-subtitle !mx-0 !text-left !max-w-none mt-2">
                  Comunidad de entrenamiento con filosofía de club.
                </p>
              </header>
              <div className="landing-body space-y-4 text-[0.98rem]">
                <p>
                  <strong className="text-oc-red font-semibold">OC-CLUB</strong> mejora la calidad de vida con entrenamiento
                  basado en peso corporal y disciplinas complementarias: pérdida de grasa, masa muscular y estética funcional,
                  con enfoque profesional y seguimiento cercano.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {['Calistenia', 'Powerlifting', 'Spartan', 'Artes marciales', 'Defensa personal'].map((discipline) => (
                  <span key={discipline} className="landing-tag">
                    {discipline}
                  </span>
                ))}
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="landing-card landing-card--compact">
                <h3 className="landing-aside-title !mb-3">Por qué club</h3>
                <ul className="space-y-3 text-sm text-oc-muted leading-snug">
                  <li className="border-l border-oc-red/40 pl-3">Cupos y horarios definidos — no es “piso libre” anónimo.</li>
                  <li className="border-l border-white/10 pl-3">Coaching y progresión; técnica antes que volumen arbitrario.</li>
                  <li className="border-l border-white/10 pl-3">Cultura de constancia y respeto entre miembros.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Misión / Visión */}
      <section className="landing-section landing-section--dense landing-surface-elevated relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <article className="landing-card landing-card--compact">
              <h3 className="landing-card-title landing-card-title--sm">Misión</h3>
              <p className="landing-card-body text-[0.9375rem]">
                Entrenamiento personalizado y efectivo para hombres y mujeres, impulsando actividad física y cambio de hábitos
                con distintas disciplinas; priorizamos reducción de grasa, aumento de masa muscular y prevención de lesiones.
              </p>
            </article>
            <article className="landing-card landing-card--compact">
              <h3 className="landing-card-title landing-card-title--sm">Visión</h3>
              <p className="landing-card-body text-[0.9375rem]">
                Ser referente en Tlalpan por resultados, comunidad y estándares profesionales, con una identidad OC-CLUB
                reconocible por constancia y mentalidad competitiva sana.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Valores — grid compacto */}
      <section className="landing-section landing-section--dense landing-surface-base relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <header className="landing-section-header !mb-8 lg:!mb-10">
            <p className="landing-eyebrow">Cultura</p>
            <h2 className="landing-title">Valores</h2>
            <p className="landing-subtitle">Lo que sostiene al club día a día</p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              {
                title: 'Compromiso con calidad',
                desc: 'Mejora continua y camino hacia la excelencia en el servicio.',
              },
              {
                title: 'Orientación al cliente',
                desc: 'Tiempo para entender necesidades y cumplir expectativas con claridad.',
              },
              {
                title: 'Profesionalidad',
                desc: 'Equipo certificado; rigor, empatía y formación constante.',
              },
              {
                title: 'Transparencia',
                desc: 'Procesos visibles y comunicación honesta, especialmente con el cliente.',
              },
              {
                title: 'Bienestar social',
                desc: 'Programación que fortalece salud y vínculos entre miembros.',
              },
            ].map((valor) => (
              <article key={valor.title} className="landing-card landing-card--compact">
                <h3 className="landing-card-title landing-card-title--sm !mb-2">{valor.title}</h3>
                <p className="landing-card-body-muted !text-[0.8125rem] !leading-relaxed !mt-0">{valor.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas — layout en dos columnas */}
      <section className="landing-section landing-section--dense landing-surface-elevated relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="landing-eyebrow">Diferencia</p>
              <h2 className="landing-heading-section text-left">Ventajas competitivas</h2>
              <p className="landing-subtitle !mx-0 !text-left !max-w-none mt-2 text-sm">
                Entrenamiento con peso corporal y accesorios, con enfoque técnico.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <article className="landing-card landing-card--compact">
                <p className="landing-card-body text-[0.9375rem] mb-0">
                  Metodología <strong className="text-oc-red font-semibold">innovadora y exigente</strong> usando el peso
                  corporal como base, con progresiones que mantienen el entrenamiento efectivo y entretenido.
                </p>
              </article>
              <article className="landing-card landing-card--compact">
                <p className="landing-card-body text-[0.9375rem]">
                  <strong className="text-oc-red font-semibold">Accesorios especializados</strong> (bosu, TRX, barras,
                  etc.) para trabajar el cuerpo completo y reducir riesgos frente a rutinas solo en máquinas o peso libre sin
                  asesoría.
                </p>
                <p className="landing-card-body-muted !text-[0.8125rem] !mt-3">
                  Menos dependencia de aparatos integrados mal guiados; más control técnico y prevención.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Clases — fila editorial */}
      <section id="clases" className="landing-section landing-section--dense landing-surface-base relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <p className="landing-eyebrow">Servicio</p>
              <h2 className="landing-heading-section text-left">Clases y horarios</h2>
              <p className="landing-subtitle !mx-0 !text-left !max-w-none mt-2">
                Grupales 60 min · todos los niveles · estructura por bloques
              </p>
            </div>
            <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
              <p className="text-sm text-oc-muted max-w-md sm:text-right">
                Consulta disciplinas, niveles y cupos en la página de clases.
              </p>
              <Link to="/clases" className="landing-btn-outline shrink-0">
                Ver detalle →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Membresías · Convenios · Equipo — tres columnas compactas */}
      <section className="landing-section landing-section--dense landing-surface-base relative pb-6 sm:pb-8">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            <article id="precios" className="landing-card landing-card--compact scroll-mt-28">
              <h3 className="landing-card-title landing-card-title--sm">Membresías</h3>
              <p className="landing-card-body-muted !text-[0.8125rem] !mb-4">Planes y paquetes según tu objetivo.</p>
              <Link to="/membresias" className="landing-btn-outline w-full text-center !py-2.5 !text-[0.6875rem]">
                Ver planes
              </Link>
            </article>
            <article id="convenios" className="landing-card landing-card--compact scroll-mt-28">
              <h3 className="landing-card-title landing-card-title--sm">Convenios</h3>
              <p className="landing-card-body-muted !text-[0.8125rem] !mb-4">Aliados y beneficios para socios.</p>
              <Link to="/convenios" className="landing-btn-outline w-full text-center !py-2.5 !text-[0.6875rem]">
                Ver aliados
              </Link>
            </article>
            <article className="landing-card landing-card--compact scroll-mt-28">
              <h3 className="landing-card-title landing-card-title--sm">Equipo</h3>
              <p className="landing-card-body-muted !text-[0.8125rem] !mb-4">Staff, testimonios y comunidad.</p>
              <Link to="/equipo-comunidad" className="landing-btn-outline w-full text-center !py-2.5 !text-[0.6875rem]">
                Conocer equipo
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="landing-section landing-surface-elevated relative">
        <span className="landing-section__rule" aria-hidden />
        <div className="landing-section-shell landing-section-shell--narrow">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-5">
              <header className="text-left mb-6">
                <p className="landing-eyebrow">Visítanos</p>
                <h2 className="landing-heading-section">Contacto</h2>
                <p className="landing-subtitle !mx-0 !text-left !max-w-none mt-2">Agenda, dudas e informes</p>
              </header>
              <div className="space-y-5">
                <div>
                  <h3 className="landing-card-title !mb-2">OC-CLUB · Elite Training</h3>
                  <p className="landing-body text-[0.9375rem]">
                    Segunda Cda. de Cedral 2, San Andrés Totoltepec, Tlalpan, 14640 Ciudad de México, CDMX
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="landing-eyebrow mb-1">Teléfono</p>
                    <p className="text-oc-light font-semibold">55 6786 9589</p>
                  </div>
                  <div>
                    <p className="landing-eyebrow mb-1">Horario</p>
                    <p className="text-oc-light/95">L–V 7–10, 17–21 · Sáb 7–10</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <a href="https://wa.me/525567869589" target="_blank" rel="noopener noreferrer" className="landing-btn-primary">
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
            </div>
            <div className="lg:col-span-7 landing-card !p-0 overflow-hidden min-h-[320px] lg:min-h-[380px]">
              <iframe
                src="https://www.google.com/maps?q=Segunda+Cda.+de+Cedral+2,+San+Andrés+Totoltepec,+Tlalpan,+14640+Ciudad+de+México,+CDMX&output=embed"
                width="100%"
                height="100%"
                style={{ minHeight: '320px', border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full min-h-[320px] lg:min-h-full"
                title="Ubicación OC-CLUB"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-surface-accent relative py-10 sm:py-12">
        <div className="landing-section-shell landing-section-shell--narrow text-center max-w-2xl">
          <h2 className="landing-heading-section">¿Listo para entrenar como club?</h2>
          <p className="landing-body mt-3 mb-7 text-oc-muted text-[0.9375rem]">
            Pide informes por WhatsApp o entra al sistema (demo).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          <div className="grid sm:grid-cols-3 gap-8 lg:gap-10 mb-10">
            <div>
              <OcClubLogo variant="footer" />
              <p className="landing-support mt-4 leading-relaxed">
                Elite Training Community
                <br />
                <span className="text-oc-muted/85">Alto rendimiento · CDMX</span>
              </p>
            </div>
            <div>
              <h4 className="landing-aside-title">Enlaces</h4>
              <div className="space-y-1.5">
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
              <div className="space-y-1.5 landing-support text-sm">
                <p>Tel: 55 6786 9589</p>
                <p>WhatsApp disponible</p>
                <div className="flex flex-wrap gap-3 pt-2">
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
