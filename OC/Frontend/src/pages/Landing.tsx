import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'
import { featuredTestimonials } from '../data/testimonials'

const IMG_HERO = '/Actualizacion/Front/IA (2).png'
const IMG_COMPETENCIA = '/Competencia.jpeg'
const IMG_COMUNIDAD = '/Comunidad.jpeg'

const DISCIPLINES: {
  slug: string
  title: string
  blurb: string
  image: string
}[] = [
  {
    slug: 'hyrox',
    title: 'HYROX',
    blurb: 'Entrenamiento híbrido de resistencia, fuerza y rendimiento funcional.',
    image: '/HYROX.jpeg',
  },
  {
    slug: 'calistenia',
    title: 'Calistenia',
    blurb: 'Control corporal, fuerza relativa y progresiones técnicas.',
    image: '/Calistenia.jpeg',
  },
  {
    slug: 'powerlifting',
    title: 'Powerlifting',
    blurb: 'Fuerza máxima en sentadilla, press banca y peso muerto.',
    image: '/Powerlifting.jpeg',
  },
]

const WHY_US: { title: string; text: string }[] = [
  {
    title: 'Estructura real',
    text: 'Clases por horario, niveles y progresión. No es un piso suelto sin rumbo.',
  },
  {
    title: 'Comunidad que empuja',
    text: 'Exigencia sana: entrenas con gente que compite contigo, no contra ti.',
  },
  {
    title: 'Coaching en el piso',
    text: 'Corrección técnica y seguimiento; no solo “entrar y hacer máquinas”.',
  },
  {
    title: 'Cupos y foco',
    text: 'Aforo controlado para que el staff vea tu progreso de verdad.',
  },
]

const KEY_METRICS: { label: string; value: string }[] = [
  { label: 'Trayectoria', value: '8 años en Tlalpan' },
  { label: 'Clases por semana', value: 'Programacion viva' },
  { label: 'Enfoque', value: 'Competencia y comunidad' },
  { label: 'Staff coaching', value: 'Certificado / formacion continua' },
]

export default function Landing() {
  return (
    <div className="oc-home min-h-screen bg-oc-carbon text-oc-light">
      <PublicNav />

      {/* 1 · Hero alto impacto: full-bleed imagen + overlay + contenido comercial */}
      <section className="relative min-h-[62vh] sm:min-h-[78vh] lg:min-h-[min(92vh,900px)] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={IMG_HERO}
            alt="Interior real del gimnasio OC-CLUB en Tlalpan"
            className="h-full w-full object-cover object-[74%_center] sm:object-right scale-105 sm:scale-100"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55 sm:to-black/35"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/65" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-48 bg-gradient-to-t from-oc-carbon to-transparent" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[80rem] px-4 pb-6 pt-14 sm:px-6 sm:pb-12 sm:pt-24 lg:px-10 lg:pb-20">
          <div className="max-w-3xl">
            <OcClubLogo variant="heroMark" priority className="hidden sm:block opacity-95" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-white/75 tracking-wide">
              Elite Training Community · <span className="text-white">Tlalpan, CDMX</span>
            </p>
            <h1 className="mt-3 sm:mt-4 font-hero text-[clamp(1.7rem,8.2vw,5.5rem)] leading-[0.96] text-white uppercase tracking-tight">
              OC-CLUB
              <span className="block text-oc-red mt-0.5 sm:mt-1">Elite Training Community</span>
            </h1>
            <p className="mt-3 text-[13px] sm:text-lg text-white/85 font-medium leading-snug max-w-xl">
              Entrena con estructura, comunidad y seguimiento real.
              <span className="text-white"> Te guiamos en el piso para competir contigo mismo.</span>
            </p>
            <div className="mt-4 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
              <Link
                to="/membresias"
                className="inline-flex w-full sm:w-auto items-center justify-center px-5 sm:px-8 py-2.5 sm:py-3.5 bg-oc-red hover:bg-oc-red-deep text-white text-sm font-bold tracking-wide rounded-sm border border-white/10 transition-colors shadow-lg shadow-black/40"
              >
                Conocer membresías
              </Link>
              <a
                href="https://wa.me/525567869589"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center px-5 sm:px-8 py-2.5 sm:py-3.5 border border-white/25 text-white hover:bg-white/10 text-sm font-semibold rounded-sm transition-colors"
              >
                Agendar visita
              </a>
            </div>
          </div>

          <dl className="mt-5 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8 max-w-4xl border-t border-white/15 pt-4 sm:pt-10">
            <div>
              <dt className="text-[11px] sm:text-xs text-white/50 font-medium">Clases</dt>
              <dd className="mt-0.5 text-[15px] sm:text-lg font-hero text-white tracking-wide">60 min</dd>
              <dd className="text-[10px] sm:text-xs text-white/55 mt-0.5">Grupales estructuradas</dd>
            </div>
            <div>
              <dt className="text-[11px] sm:text-xs text-white/50 font-medium">Zona</dt>
              <dd className="mt-0.5 text-[15px] sm:text-lg font-hero text-white tracking-wide">Tlalpan</dd>
              <dd className="text-[10px] sm:text-xs text-white/55 mt-0.5">Ejidos de San Pedro Mártir</dd>
            </div>
            <div>
              <dt className="text-[11px] sm:text-xs text-white/50 font-medium">Formato</dt>
              <dd className="mt-0.5 text-[15px] sm:text-lg font-hero text-white tracking-wide">Cupos</dd>
              <dd className="text-[10px] sm:text-xs text-white/55 mt-0.5">Seguimiento real</dd>
            </div>
            <div>
              <dt className="text-[11px] sm:text-xs text-white/50 font-medium">Enfoque</dt>
              <dd className="mt-0.5 text-[15px] sm:text-lg font-hero text-oc-red tracking-wide">Técnica</dd>
              <dd className="text-[10px] sm:text-xs text-white/55 mt-0.5">Progresión y orden</dd>
            </div>
          </dl>

          <ul className="mt-4 sm:mt-10 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-3 sm:gap-x-8 gap-y-1.5 sm:gap-y-2 text-[11px] sm:text-sm text-white/80 max-w-2xl">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-sm bg-oc-red shrink-0" aria-hidden />
              Progresión por niveles
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-sm bg-oc-red shrink-0" aria-hidden />
              Coach en el piso
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-sm bg-oc-red shrink-0" aria-hidden />
              Ambiente de club
            </li>
          </ul>
        </div>
      </section>

      {/* 2 · Por qué OC-CLUB */}
      <section id="por-que" className="scroll-mt-24 border-t border-oc-red/25 bg-[#0c0c0c] py-16 md:py-20">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 md:mb-14">
            <h2 className="font-hero text-4xl sm:text-5xl text-oc-red uppercase tracking-tight">
              Por qué OC-CLUB
            </h2>
            <p className="mt-4 text-lg text-white/70 leading-relaxed">
              No es solo un gym: es un club con reglas claras, comunidad y coaching que te mira entrenar.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="relative pl-4 border-l-2 border-oc-red/70 hover:border-oc-red transition-colors"
              >
                <h3 className="font-display text-lg font-semibold text-white tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · Disciplinas / oferta */}
      <section className="py-16 md:py-24 bg-oc-carbon border-t border-white/[0.06]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
            <div>
              <h2 className="font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">Qué entrenas</h2>
              <p className="mt-3 text-white/65 max-w-xl leading-relaxed">
                Oferta clara por disciplina. Cada bloque tiene su lenguaje; el club unifica estándar y respeto.
              </p>
            </div>
            <Link
              to="/clases"
              className="shrink-0 text-sm font-semibold text-oc-red hover:text-white transition-colors self-start md:self-auto"
            >
              Ver todas las clases →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCIPLINES.map((d) => (
              <article
                key={d.slug}
                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900"
              >
                <img
                  src={d.image}
                  alt={`Entrenamiento de ${d.title} en OC-CLUB`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10"
                  aria-hidden
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                  <h3 className="font-display text-xl font-bold text-white tracking-tight">{d.title}</h3>
                  <p className="mt-2 text-sm text-white/75 leading-snug">{d.blurb}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Preparación para competencia */}
      <section className="py-16 md:py-24 bg-[#111] border-y border-white/[0.05]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10">
              <img
                src={IMG_COMPETENCIA}
                alt="Atletas de OC-CLUB en preparación para competencia"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oc-red/90">Rendimiento</p>
              <h2 className="mt-3 font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">
                Preparación para competencia
              </h2>
              <p className="mt-5 text-white/75 leading-relaxed">
                Entrenamientos diseñados para llevar tu rendimiento a escenarios reales: fuerza, técnica,
                resistencia y mentalidad competitiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Comunidad */}
      <section className="py-16 md:py-24 bg-oc-carbon border-b border-white/[0.06]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oc-red/90">Cultura OC-CLUB</p>
              <h2 className="mt-3 font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">
                Una comunidad que entrena contigo
              </h2>
              <p className="mt-5 text-white/75 leading-relaxed">
                OC-CLUB no es solo un gimnasio. Es una comunidad enfocada en disciplina, progreso y
                acompañamiento.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10">
              <img
                src={IMG_COMUNIDAD}
                alt="Comunidad de entrenamiento en OC-CLUB"
                className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-black/20"
                style={{ top: '130px', left: '-3px' }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6 · Credibilidad + testimonios (placeholders marcados) */}
      <section className="py-16 md:py-20 bg-[#111] border-y border-white/[0.05]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-oc-red/85 mb-8">
            8 anos impulsando entrenamiento en Tlalpan
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 md:mb-20">
            {KEY_METRICS.map((m) => (
              <div key={m.label}>
                <p className="text-xs text-white/45">{m.label}</p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight text-white">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <h2 className="font-hero text-3xl sm:text-4xl text-white uppercase tracking-tight">Voces del club</h2>
            <Link
              to="/experiencias"
              className="text-sm font-semibold text-oc-red hover:text-white transition-colors"
            >
              Ver mas experiencias →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTestimonials.map((t, i) => (
              <figure
                key={i}
                className="rounded-lg border border-white/[0.08] bg-black/40 p-6 md:p-8"
              >
                <blockquote className="text-white/85 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm text-oc-muted not-italic">
                  — {t.name}, {t.discipline}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · El club (apartado independiente) */}
      <section className="py-16 md:py-20 bg-oc-carbon border-t border-white/[0.06]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-8 md:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-oc-red/90">Nuevo apartado</p>
              <h2 className="mt-3 font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">El Club</h2>
              <p className="mt-4 text-white/70 leading-relaxed">
                Conoce en detalle los espacios del club: gimnasio principal, segundo piso, zonas especializadas y ambiente OC.
              </p>
            </div>
            <Link
              to="/club"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-oc-red hover:bg-oc-red-deep text-white text-sm font-bold tracking-wide rounded-sm border border-white/10 transition-colors shadow-lg shadow-black/40"
            >
              Explorar El Club
            </Link>
          </div>
        </div>
      </section>

      {/* 8 · Membresías / CTA cierre */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-oc-red-deep/90 via-oc-black to-oc-carbon"
          aria-hidden
        />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_rgba(210,31,45,0.35),_transparent_50%)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10 text-center">
          <h2 className="font-hero text-4xl sm:text-6xl text-white uppercase tracking-tight max-w-3xl mx-auto">
            Tu siguiente paso
          </h2>
          <p className="mt-5 text-lg text-white/85 max-w-xl mx-auto">
            Elige cómo empezar: revisa planes, mira horarios o escríbenos por WhatsApp.
          </p>
          <ol className="mt-12 grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-left">
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-hero text-white">
                1
              </span>
              <div>
                <p className="font-semibold text-white">Revisa membresías</p>
                <p className="text-sm text-white/65 mt-1">Planes y beneficios alineados a tu objetivo.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-hero text-white">
                2
              </span>
              <div>
                <p className="font-semibold text-white">Confirma clase</p>
                <p className="text-sm text-white/65 mt-1">Horarios, disciplinas y cupos en la página de clases.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-hero text-white">
                3
              </span>
              <div>
                <p className="font-semibold text-white">Contacto directo</p>
                <p className="text-sm text-white/65 mt-1">WhatsApp para dudas y agenda.</p>
              </div>
            </li>
          </ol>
          <div className="mt-12 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link
              to="/membresias"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-oc-red font-bold text-sm rounded-sm hover:bg-white/90 transition-colors"
            >
              Ver membresías
            </Link>
            <Link
              to="/clases"
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-white/80 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors"
            >
              Ver clases y horarios
            </Link>
            <a
              href="https://wa.me/525567869589"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/25 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer simple */}
      <footer id="contacto" className="scroll-mt-24 border-t border-white/[0.08] bg-black py-12 md:py-14">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div>
              <OcClubLogo variant="footer" />
              <p className="mt-4 text-sm text-white/55 leading-relaxed">
                Elite Training Community
                <br />
                Tlalpan, CDMX
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Navegación</p>
              <ul className="space-y-2 text-sm text-white/65">
                <li>
                  <Link to="/club" className="hover:text-oc-red transition-colors">
                    El club
                  </Link>
                </li>
                <li>
                  <Link to="/clases" className="hover:text-oc-red transition-colors">
                    Clases
                  </Link>
                </li>
                <li>
                  <Link to="/membresias" className="hover:text-oc-red transition-colors">
                    Membresías
                  </Link>
                </li>
                <li>
                  <Link to="/convenios" className="hover:text-oc-red transition-colors">
                    Convenios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Contacto</p>
              <p className="text-sm text-white/70">55 6786 9589</p>
              <p className="text-sm text-white/55 mt-2">
                Lázaro Cárdenas 8, Ejidos de San Pedro Mártir, 14400, Tlalpan
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Redes</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="https://wa.me/525567869589" className="text-white/65 hover:text-oc-red transition-colors" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com/oc_calisthenics"
                  className="text-white/65 hover:text-oc-red transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/Oc_Calisthenics"
                  className="text-white/65 hover:text-oc-red transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
          <p className="mt-12 pt-8 border-t border-white/[0.06] text-center text-xs text-white/40">
            © {new Date().getFullYear()} OC-CLUB. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
