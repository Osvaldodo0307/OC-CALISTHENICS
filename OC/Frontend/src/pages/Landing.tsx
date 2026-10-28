import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'
import AnchorPlans from '../components/landing/AnchorPlans'
import TrustBlock from '../components/landing/TrustBlock'
import LeadCaptureForm from '../components/landing/LeadCaptureForm'
import WhatsAppLink from '../components/WhatsAppLink'
import { featuredTestimonials } from '../data/testimonials'

const IMG_HERO = '/Actualizacion/StitchFotografias2026/hero-oc-club.webp'
const IMG_COMPETENCIA = '/Competencia.jpeg'
const IMG_COMUNIDAD = '/Actualizacion/StitchFotografias2026/comunidad-oc-club.webp'

const DISCIPLINES: {
  slug: string
  title: string
  blurb: string
  image: string
  label: string
  attribute: string
}[] = [
  {
    slug: 'hyrox',
    title: 'HYROX',
    blurb: 'Entrenamiento híbrido de resistencia, fuerza y rendimiento funcional.',
    image: '/Actualizacion/StitchFotografias2026/hyrox-oc-club.webp',
    label: 'HÍBRIDO / RACING',
    attribute: 'RESISTENCIA + FUERZA',
  },
  {
    slug: 'calistenia',
    title: 'Calistenia',
    blurb: 'Control corporal, fuerza relativa y progresiones técnicas.',
    image: '/Actualizacion/StitchFotografias2026/calistenia-oc-club.webp',
    label: 'GIMNÁSTICOS',
    attribute: 'CONTROL CORPORAL',
  },
  {
    slug: 'powerlifting',
    title: 'Powerlifting',
    blurb: 'Fuerza máxima en sentadilla, press banca y peso muerto.',
    image: '/Actualizacion/StitchFotografias2026/powerlifting-oc-club.webp',
    label: 'BARBELL CLUB',
    attribute: 'FUERZA PURA',
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
            alt="Atleta entrenando fuerza en un gimnasio de alto rendimiento; imagen conceptual"
            className="h-full w-full object-cover object-[64%_center] sm:object-center"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25 sm:via-black/70 sm:to-black/10"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/65" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-48 bg-gradient-to-t from-oc-carbon to-transparent" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[80rem] px-4 pb-6 pt-14 sm:px-6 sm:pb-12 sm:pt-24 lg:px-10 lg:pb-20">
          <div className="max-w-3xl">
            <OcClubLogo variant="heroMark" priority className="hidden sm:block opacity-95" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-white/75 tracking-wide">
              Gimnasio de alto rendimiento · <span className="text-white">Tlalpan, CDMX</span>
            </p>
            <h1 className="mt-3 sm:mt-4 font-hero text-[clamp(1.7rem,8.2vw,5.5rem)] leading-[0.96] text-white uppercase tracking-tight">
              OC Club
              <span className="block text-oc-red mt-0.5 sm:mt-1 text-[clamp(1.1rem,4.5vw,2.75rem)]">
                Gimnasio en Tlalpan
              </span>
            </h1>
            <p className="mt-3 text-[13px] sm:text-lg text-white/85 font-medium leading-snug max-w-xl">
              Club presencial en Ejidos de San Pedro Mártir, Tlalpan: calistenia, HYROX, powerlifting y Recovery Lab.
              <span className="text-white"> Planes de gimnasio desde $600/mes.</span> El canal principal para dudas y visitas es WhatsApp.
            </p>
            <div className="mt-4 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
              <WhatsAppLink
                preset="visita"
                className="inline-flex w-full sm:w-auto items-center justify-center px-5 sm:px-8 py-2.5 sm:py-3.5 bg-oc-red hover:bg-oc-red-deep text-white text-sm font-bold tracking-wide rounded-sm border border-white/10 transition-colors shadow-lg shadow-black/40"
              >
                Agendar visita por WhatsApp
              </WhatsAppLink>
              <Link
                to="/membresias"
                className="inline-flex w-full sm:w-auto items-center justify-center px-5 sm:px-8 py-2.5 sm:py-3.5 border border-white/25 text-white hover:bg-white/10 text-sm font-semibold rounded-sm transition-colors"
              >
                Conocer membresías
              </Link>
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

      <AnchorPlans />

      {/* 2 · Por qué OC Club */}
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
              <h2 className="font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">Entrena con propósito</h2>
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DISCIPLINES.map((d) => (
              <article
                key={d.slug}
                className="group overflow-hidden rounded-sm border border-white/10 bg-[#101010] transition-colors hover:border-oc-red/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                  <img
                    src={d.image}
                    alt={`Atleta practicando ${d.title}; fotografía conceptual`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" aria-hidden />
                  <span className="absolute left-4 top-4 border border-white/10 bg-oc-red px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    {d.label}
                  </span>
                </div>
                <div className="border-t-2 border-oc-red px-5 pb-5 pt-5 sm:px-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-hero text-2xl uppercase tracking-tight text-white">{d.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-oc-red">{d.attribute}</span>
                  </div>
                  <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-white/75">{d.blurb}</p>
                  <Link
                    to="/clases"
                    className="mt-5 inline-flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:text-oc-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oc-red"
                  >
                    Conocer la disciplina <span aria-hidden>→</span>
                  </Link>
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
                Entrenamientos orientados a competencia y rendimiento. Los resultados dependen de tu constancia,
                técnica y evaluación profesional; no garantizamos cambios físicos específicos.
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
                alt="Atletas realizando entrenamiento funcional en grupo; imagen conceptual"
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

      <TrustBlock />

      {/* 6 · Credibilidad + testimonios */}
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
            <WhatsAppLink
              preset="visita"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-oc-red font-bold text-sm rounded-sm hover:bg-white/90 transition-colors"
            >
              Agendar visita por WhatsApp
            </WhatsAppLink>
            <Link
              to="/membresias"
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-white/80 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors"
            >
              Ver membresías
            </Link>
            <Link
              to="/clases"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/25 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors"
            >
              Ver clases y horarios
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-oc-carbon border-t border-white/[0.06]" aria-labelledby="preguntas-gimnasio">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          <h2 id="preguntas-gimnasio" className="font-hero text-3xl sm:text-4xl text-white uppercase tracking-tight">
            Entrenar en OC-CLUB, Tlalpan
          </h2>
          <div className="mt-6 divide-y divide-white/10">
            <details className="py-4">
              <summary className="cursor-pointer font-semibold text-white">¿Dónde está el gimnasio OC-CLUB?</summary>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Estamos en Lázaro Cárdenas 8, Ejidos de San Pedro Mártir, C.P. 14400, Tlalpan, Ciudad de México.
                Puedes escribirnos al 55 6786 9589 para agendar una visita.
              </p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold text-white">¿Qué clases puedo tomar en Tlalpan?</summary>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                OC-CLUB ofrece calistenia, HYROX y powerlifting, además del acceso al gimnasio.
                Consulta las <Link to="/clases" className="underline hover:text-oc-red">clases y horarios</Link> para elegir tu disciplina.
              </p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold text-white">¿Necesito experiencia para empezar calistenia?</summary>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Las clases contemplan distintos niveles y progresiones. Comenta tus objetivos y experiencia con el equipo para elegir el grupo adecuado.
              </p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer font-semibold text-white">¿Cómo consulto las membresías y Recovery Lab?</summary>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                En <Link to="/membresias" className="underline hover:text-oc-red">membresías y servicios</Link> puedes revisar OC GYM,
                Acceso Total, clases y Recovery Lab. Confirma con el equipo los servicios incluidos y los costos adicionales.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Aviso comercial */}
      <section className="py-10 md:py-12 bg-oc-carbon border-t border-white/[0.06]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="rounded-lg border border-white/10 bg-black/30 p-6 md:p-8 text-sm text-white/65 leading-relaxed space-y-2">
            <p>
              <strong className="text-white/85">OC Club</strong> opera en Tlalpan, CDMX. Membresías de gimnasio desde
              $600/mes; clases y Recovery Lab son servicios adicionales con precios que confirmamos por WhatsApp.
            </p>
            <p>
              La tienda en línea muestra referencias de catálogo; disponibilidad y entrega se confirman con el equipo.
              No hay compra en línea activa en esta etapa.
            </p>
            <p>
              El entrenamiento no garantiza resultados corporales específicos. Consulta a un profesional de la salud si
              tienes condiciones médicas relevantes.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario de prospectos + contacto */}
      <section id="solicitud" className="scroll-mt-24 py-16 md:py-20 bg-[#111] border-t border-white/[0.06]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oc-red/90">Contacto</p>
              <h2 className="mt-3 font-hero text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Gimnasio en San Pedro Mártir, Tlalpan
              </h2>
              <p className="mt-4 text-white/70 leading-relaxed">
                Visítanos en Lázaro Cárdenas 8, Ejidos de San Pedro Mártir, C.P. 14400, Tlalpan, Ciudad de México.
                Abrimos de lunes a viernes de 6:00 a 23:00 y los sábados de 8:00 a 16:00.
                Escríbenos por WhatsApp para agendar una visita o déjanos tus datos y te llamamos.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=L%C3%A1zaro+C%C3%A1rdenas+8%2C+Ejidos+de+San+Pedro+M%C3%A1rtir%2C+14400%2C+Tlalpan%2C+Ciudad+de+M%C3%A9xico"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-white underline hover:text-oc-red"
              >
                Cómo llegar a OC-CLUB en Google Maps
              </a>
              <WhatsAppLink
                preset="visita"
                className="mt-6 inline-flex items-center justify-center rounded-sm bg-oc-red px-6 py-3 text-sm font-bold text-white hover:bg-oc-red-deep transition-colors"
              >
                Agendar visita por WhatsApp
              </WhatsAppLink>
            </div>
            <LeadCaptureForm />
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <WhatsAppLink preset="general" className="text-white/65 hover:text-oc-red transition-colors">
                  WhatsApp
                </WhatsAppLink>
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
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} OC Club. Todos los derechos reservados.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/aviso-privacidad" className="hover:text-oc-red transition-colors">
                Aviso de privacidad
              </Link>
              <Link to="/terminos" className="hover:text-oc-red transition-colors">
                Términos y condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
