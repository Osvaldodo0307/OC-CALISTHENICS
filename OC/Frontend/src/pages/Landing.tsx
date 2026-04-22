import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

/** Visuales de stock (Unsplash) — reemplazar por fotografía real del club cuando exista. */
const IMG_HERO =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=85'
const IMG_CLUB_INTERIOR =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=82'

const DISCIPLINES: {
  slug: string
  title: string
  blurb: string
  image: string
}[] = [
  {
    slug: 'calistenia',
    title: 'Calistenia',
    blurb: 'Fuerza y control con el peso corporal. Progresiones claras.',
    image:
      'https://images.unsplash.com/photo-1599058945522-734bedebfa09?auto=format&fit=crop&w=900&q=82',
  },
  {
    slug: 'powerlifting',
    title: 'Powerlifting',
    blurb: 'Bases sólidas: técnica, líneas de fuerza y seguridad.',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=82',
  },
  {
    slug: 'spartan',
    title: 'Spartan',
    blurb: 'Resistencia y mentalidad. Entrenamiento que exige constancia.',
    image:
      'https://images.unsplash.com/photo-1552674605-db6ffd1643d5?auto=format&fit=crop&w=900&q=82',
  },
  {
    slug: 'marcial',
    title: 'Artes marciales / defensa',
    blurb: 'Movimiento, coordinación y aplicación práctica según programación.',
    image:
      'https://images.unsplash.com/photo-1549714876-bbe2cc9efad1?auto=format&fit=crop&w=900&q=82',
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

/** Placeholders — validar con dirección del club */
const PLACEHOLDER_METRICS: { label: string; value: string; placeholder?: boolean }[] = [
  { label: 'Años en Tlalpan', value: '[validar]', placeholder: true },
  { label: 'Clases por semana (referencia)', value: 'Programación viva', placeholder: false },
  { label: 'Socios activos', value: '[validar]', placeholder: true },
  { label: 'Staff coaching', value: 'Certificado / en formación continua', placeholder: false },
]

const TESTIMONIALS_PLACEHOLDER: { quote: string; author: string }[] = [
  {
    quote: 'Aquí va un testimonio real de socio cuando lo tengan.',
    author: '[Nombre — placeholder]',
  },
  {
    quote: 'Segundo testimonio corto sobre resultados o ambiente.',
    author: '[Nombre — placeholder]',
  },
]

export default function Landing() {
  return (
    <div className="oc-home min-h-screen bg-oc-carbon text-oc-light">
      <PublicNav />

      {/* 1 · Hero alto impacto: full-bleed imagen + overlay + contenido comercial */}
      <section className="relative min-h-[min(92vh,900px)] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={IMG_HERO}
            alt=""
            className="h-full w-full object-cover object-center scale-105 sm:scale-100"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/45 sm:to-black/35"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-oc-carbon to-transparent" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[80rem] px-4 pb-14 pt-28 sm:px-6 lg:px-10 lg:pb-20">
          <div className="max-w-3xl">
            <OcClubLogo variant="heroMark" priority className="opacity-95" />
            <p className="mt-5 text-sm font-medium text-white/75 tracking-wide">
              Elite Training Community · <span className="text-white">Tlalpan, CDMX</span>
            </p>
            <h1 className="mt-6 font-hero text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] text-white uppercase tracking-tight">
              Entrena con método.
              <span className="block text-oc-red mt-1">Compite contigo.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/85 font-medium leading-snug max-w-xl">
              Club de alto rendimiento: calistenia, powerlifting y spartan en un mismo estándar. Más
              disciplinas según tu plan. <span className="text-white">Te guiamos en el piso.</span>
            </p>
            <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/membresias"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-oc-red hover:bg-oc-red-deep text-white text-sm font-bold tracking-wide rounded-sm border border-white/10 transition-colors shadow-lg shadow-black/40"
              >
                Ver membresías
              </Link>
              <Link
                to="/clases"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/25 text-white hover:bg-white/10 text-sm font-semibold rounded-sm transition-colors"
              >
                Horarios y clases
              </Link>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl border-t border-white/15 pt-10">
            <div>
              <dt className="text-xs text-white/50 font-medium">Clases</dt>
              <dd className="mt-1 text-lg font-hero text-white tracking-wide">60 min</dd>
              <dd className="text-xs text-white/55 mt-0.5">Grupales estructuradas</dd>
            </div>
            <div>
              <dt className="text-xs text-white/50 font-medium">Zona</dt>
              <dd className="mt-1 text-lg font-hero text-white tracking-wide">Tlalpan</dd>
              <dd className="text-xs text-white/55 mt-0.5">San Andrés Totoltepec</dd>
            </div>
            <div>
              <dt className="text-xs text-white/50 font-medium">Formato</dt>
              <dd className="mt-1 text-lg font-hero text-white tracking-wide">Cupos</dd>
              <dd className="text-xs text-white/55 mt-0.5">Seguimiento real</dd>
            </div>
            <div>
              <dt className="text-xs text-white/50 font-medium">Enfoque</dt>
              <dd className="mt-1 text-lg font-hero text-oc-red tracking-wide">Técnica</dd>
              <dd className="text-xs text-white/55 mt-0.5">Progresión y orden</dd>
            </div>
          </dl>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/80 max-w-2xl">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DISCIPLINES.map((d) => (
              <article
                key={d.slug}
                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900"
              >
                <img
                  src={d.image}
                  alt=""
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

      {/* 4 · Credibilidad + testimonios (placeholders marcados) */}
      <section className="py-16 md:py-20 bg-[#111] border-y border-white/[0.05]">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/90 mb-8">
            Datos numéricos pendientes de validación con dirección
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 md:mb-20">
            {PLACEHOLDER_METRICS.map((m) => (
              <div key={m.label}>
                <p className="text-xs text-white/45">{m.label}</p>
                <p
                  className={`mt-2 font-display text-2xl font-bold tracking-tight ${m.placeholder ? 'text-white/50' : 'text-white'}`}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
          <h2 className="font-hero text-3xl sm:text-4xl text-white uppercase tracking-tight mb-8">Voces del club</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS_PLACEHOLDER.map((t, i) => (
              <figure
                key={i}
                className="rounded-lg border border-white/[0.08] bg-black/40 p-6 md:p-8"
              >
                <blockquote className="text-white/85 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm text-oc-muted not-italic">— {t.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Filosofía / club — corto */}
      <section id="club" className="scroll-mt-24 py-16 md:py-24 bg-oc-carbon">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-hero text-4xl sm:text-5xl text-white uppercase tracking-tight">El club</h2>
              <p className="mt-6 text-lg text-white/75 leading-relaxed">
                <strong className="text-white font-semibold">OC-CLUB</strong> existe para que entrenes con orden y
                resultados: peso corporal, fuerza y disciplinas que se complementan. Aquí se entiende el esfuerzo como
                hábito, no como moda pasajera.
              </p>
              <p className="mt-4 text-white/60 leading-relaxed">
                Somos humanos, profesionales y exigentes. Si buscas pasar desapercibido en un rincón, probablemente no
                encajes.
              </p>
            </div>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px] rounded-lg overflow-hidden border border-white/[0.07]">
              <img
                src={IMG_CLUB_INTERIOR}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" aria-hidden />
              <p className="absolute bottom-4 left-4 right-4 text-xs text-white/60">
                Imagen de referencia (gimnasio) — sustituir por foto del espacio OC-CLUB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 · Membresías / CTA cierre */}
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
                  <button
                    type="button"
                    onClick={() => document.getElementById('club')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-oc-red transition-colors text-left"
                  >
                    El club
                  </button>
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
              <p className="text-sm text-white/55 mt-2">Segunda Cda. de Cedral 2, San Andrés Totoltepec, Tlalpan</p>
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
