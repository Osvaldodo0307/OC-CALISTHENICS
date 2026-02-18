import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'

const DISCIPLINES = [
  'Calistenia Dinámicos', "Spartan's", 'Stretching', 'OC-BOOTY', 'Hyrox',
  'Calistenia Force', 'Defensa Personal', 'Expresa', 'Jump', 'Funcional',
  'Powerlifting', 'Pole Dance', 'Twerk', 'Basquetbol', 'Box', 'Karate',
  'Kickboxing', 'Competencias', 'Programas Deportivos',
]

const MONTHLY_CLASSES = [
  'Calistenia funcional', 'Expressa Jump', 'Baile', 'Basquetbol',
  'Cuerda de batalla', 'Box', 'Defensa personal', 'Explosive',
  'Rusas', 'Stretching', 'GAP', 'Pilates y más…',
]

const MONTHLY_BENEFITS = [
  'Clases ilimitadas',
  'Regaderas',
  'Servicio de toalla',
  'Servicio de agua',
  'Servicio de café',
  'Una sesión de salud (INBODY)',
  'Sauna',
  'Visitas (máx. 3 por invitado)',
]

const OC_GYM_PRICES = [
  { label: 'Semanal', price: 250 },
  { label: 'Quincenal', price: 400 },
  { label: 'Mensualidad', price: 750 },
]

const OC_GYM_SERVICES = [
  'Una toalla facial o corporal',
  'Agua (trae tu botella y la llenamos)',
]

const OC_GYM_BENEFITS = [
  'Uso de las instalaciones (excepción de clases y sauna)',
  'Coach de piso (rutina general)',
  'Regaderas',
  'Cancelación inmediata',
]

const CALISTHENICS_PRICES = [
  { clases: 4, price: 560 },
  { clases: 6, price: 780 },
  { clases: 8, price: 960 },
  { clases: 12, price: 1080 },
]

const CALISTHENICS_BENEFITS = [
  '5 disciplinas',
  'Uso de las instalaciones (excepción de sauna)',
]

const PREMIUM_PRICES = [
  { sesiones: 5, price: 3150 },
  { sesiones: 10, price: 6300 },
  { sesiones: 20, price: 12600 },
  { sesiones: 30, price: 18900 },
  { sesiones: 45, price: 28350 },
]

const PREMIUM_BENEFITS = [
  'Programa deportivo',
  'Uso de las instalaciones',
  'Sauna ilimitado',
  'Una sesión de presoterapia',
]

const HEALTH_PACKAGES = [
  { sesiones: 1, price: 1500, vigencia: '1 mes' },
  { sesiones: 4, price: 6000, vigencia: '1 mes' },
  { sesiones: 8, price: 12000, vigencia: '1 mes' },
  { sesiones: 12, price: 18500, vigencia: '1 mes' },
  { sesiones: 16, price: 24000, vigencia: '2 meses' },
  { sesiones: 20, price: 30000, vigencia: '2 meses', badge: 'Más popular' },
  { sesiones: 25, price: 37500, vigencia: '2 meses' },
  { sesiones: 30, price: 45000, vigencia: '2 meses' },
]

const HEALTH_BENEFITS = [
  'INBODY', 'Nutrición', 'Fisioterapia', 'Crioterapia',
  'Presoterapia', 'Sauna', 'Pistola de masaje',
  'Masajes deportivos', 'Contrastes (sauna y hielo)',
]

const GENERAL_SERVICES = [
  'Toalla facial',
  'Toalla corporal',
  'Agua (trae tu botella y te la llenamos)',
  'Una taza de café por visita (válido con tu termo o vaso)',
]

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-2">{children}</h2>
      {sub && <p className="text-oc-muted text-lg">{sub}</p>}
    </div>
  )
}

function BenefitList({ items, columns = 3 }: { items: string[]; columns?: number }) {
  const gridCols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 md:grid-cols-4'
        : 'sm:grid-cols-2 md:grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-oc-light">
          <span className="text-oc-red mt-0.5 shrink-0">■</span>
          <span className="text-sm sm:text-base">{item}</span>
        </div>
      ))}
    </div>
  )
}

function WhatsAppButton({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://wa.me/525567869589"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50 ${className}`}
    >
      Pedir informes por WhatsApp
    </a>
  )
}

export default function Membresias() {
  return (
    <div className="min-h-screen bg-oc-dark text-oc-light">
      <PublicNav />

      {/* ─── Hero ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-oc-dark to-oc-metal">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-oc-red">¡No es un entrenamiento,</span>
            <br />
            <span className="text-oc-light">es una experiencia única!</span>
          </h1>
          <p className="text-lg text-oc-muted mb-6">
            Elige el plan que mejor se adapte a tus objetivos
          </p>

          {/* Horarios */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-oc-metal/80 border border-oc-border px-4 py-2 rounded-full">
              <span className="text-oc-red font-semibold">L–V</span>{' '}
              <span className="text-oc-light">6:00 am – 11:00 pm</span>
            </span>
            <span className="bg-oc-metal/80 border border-oc-border px-4 py-2 rounded-full">
              <span className="text-oc-red font-semibold">Sábado</span>{' '}
              <span className="text-oc-light">8:00 am – 4:00 pm</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Disciplinas ─── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {DISCIPLINES.map((d) => (
              <span
                key={d}
                className="bg-oc-dark/60 border border-oc-red/20 text-oc-light text-xs sm:text-sm px-3 py-1.5 rounded-full"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1 · MEMBRESÍA
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto">
          <div className="bg-oc-metal/50 p-8 sm:p-10 rounded-2xl border border-oc-red/40 text-center hover:shadow-lg hover:shadow-oc-red/20 transition-all">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-2">Membresía</h2>
            <div className="mt-6">
              <span className="text-5xl sm:text-6xl font-bold text-oc-red">$1,799</span>
              <span className="text-oc-muted text-xl ml-2">MXN</span>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2 · PAQUETES MENSUALES
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <SectionTitle sub="Selecciona tu clase favorita · Entrena hasta 6 clases por semana">
            Paquetes Mensuales
          </SectionTitle>

          {/* Precio principal */}
          <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border mb-10 text-center">
            <p className="text-oc-muted text-lg mb-1">Mensualidad</p>
            <span className="text-5xl font-bold text-oc-red">$2,100</span>
            <span className="text-oc-muted text-xl ml-2">MXN</span>
          </div>

          {/* Clases disponibles */}
          <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border mb-10">
            <h3 className="text-lg font-semibold text-oc-light mb-4 text-center">
              Clases disponibles
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {MONTHLY_CLASSES.map((c) => (
                <span
                  key={c}
                  className="bg-oc-metal/80 border border-oc-red/20 text-oc-light text-sm px-4 py-2 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Promociones */}
          <h3 className="text-2xl font-bold text-oc-red text-center mb-6">¡Promociones!</h3>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-oc-dark/50 p-6 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all text-center">
              <h4 className="text-xl font-bold text-oc-light mb-2">6 Meses</h4>
              <span className="text-4xl font-bold text-oc-red">$12,600</span>
              <span className="text-oc-muted ml-2">MXN</span>
            </div>
            <div className="bg-oc-dark/50 p-6 rounded-2xl border-2 border-oc-red hover:shadow-lg hover:shadow-oc-red/30 transition-all text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-oc-red text-white text-xs font-bold px-4 py-1 rounded-full">
                Más popular
              </div>
              <h4 className="text-xl font-bold text-oc-light mb-2">18 Meses</h4>
              <span className="text-4xl font-bold text-oc-red">$25,200</span>
              <span className="text-oc-muted ml-2">MXN</span>
            </div>
          </div>

          {/* Beneficios */}
          <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border">
            <h3 className="text-xl font-bold text-oc-light mb-4 text-center">Beneficios</h3>
            <BenefitList items={MONTHLY_BENEFITS} columns={2} />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3 · PLANES (OC Gym / Calisthenics / Premium)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-7xl mx-auto">
          <SectionTitle sub="Encuentra el plan ideal para ti">Nuestros Planes</SectionTitle>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Plan OC Gym ── */}
            <div className="bg-oc-metal/50 rounded-2xl border border-oc-border overflow-hidden flex flex-col">
              <div className="bg-oc-metal p-6 text-center border-b border-oc-red/20">
                <h3 className="text-2xl font-bold text-oc-light">Plan OC Gym</h3>
                <p className="text-oc-muted text-sm mt-1">Acceso general al gimnasio</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {OC_GYM_PRICES.map((p) => (
                    <div
                      key={p.label}
                      className="flex justify-between items-center bg-oc-dark/50 px-4 py-3 rounded-lg border border-oc-border"
                    >
                      <span className="text-oc-light font-medium">{p.label}</span>
                      <span className="text-oc-red font-bold text-lg">
                        ${p.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-oc-red mb-2 uppercase tracking-wide">
                    Servicios
                  </h4>
                  {OC_GYM_SERVICES.map((s) => (
                    <div key={s} className="flex items-start gap-2 text-sm text-oc-light mb-1">
                      <span className="text-oc-red mt-0.5 shrink-0">●</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <h4 className="text-sm font-semibold text-oc-red mb-2 uppercase tracking-wide">
                    Beneficios
                  </h4>
                  {OC_GYM_BENEFITS.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-oc-light mb-1">
                      <span className="text-oc-red mt-0.5 shrink-0">■</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Plan Calisthenics ── */}
            <div className="bg-oc-metal/50 rounded-2xl border border-oc-border overflow-hidden flex flex-col">
              <div className="bg-oc-metal p-6 text-center border-b border-oc-red/20">
                <h3 className="text-2xl font-bold text-oc-light">Plan Calisthenics</h3>
                <p className="text-oc-muted text-sm mt-1">Clases por mes</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {CALISTHENICS_PRICES.map((p) => (
                    <div
                      key={p.clases}
                      className="flex justify-between items-center bg-oc-dark/50 px-4 py-3 rounded-lg border border-oc-border"
                    >
                      <span className="text-oc-light font-medium">{p.clases} clases/mes</span>
                      <span className="text-oc-red font-bold text-lg">
                        ${p.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <h4 className="text-sm font-semibold text-oc-red mb-2 uppercase tracking-wide">
                    Beneficios
                  </h4>
                  {CALISTHENICS_BENEFITS.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-oc-light mb-1">
                      <span className="text-oc-red mt-0.5 shrink-0">■</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Plan Premium ── */}
            <div className="bg-oc-metal/50 rounded-2xl border-2 border-oc-red overflow-hidden flex flex-col relative">
              <div className="absolute top-4 right-4 bg-oc-red text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                Recomendado
              </div>
              <div className="bg-gradient-to-r from-oc-red-deep/40 to-oc-metal p-6 text-center border-b border-oc-red/40">
                <h3 className="text-2xl font-bold text-oc-light">Plan Premium</h3>
                <p className="text-oc-muted text-sm mt-1">Sesiones personalizadas</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {PREMIUM_PRICES.map((p) => (
                    <div
                      key={p.sesiones}
                      className="flex justify-between items-center bg-oc-dark/50 px-4 py-3 rounded-lg border border-oc-red/20"
                    >
                      <span className="text-oc-light font-medium">
                        {p.sesiones} sesiones
                      </span>
                      <span className="text-oc-red font-bold text-lg">
                        ${p.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <h4 className="text-sm font-semibold text-oc-red mb-2 uppercase tracking-wide">
                    Beneficios
                  </h4>
                  {PREMIUM_BENEFITS.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-oc-light mb-1">
                      <span className="text-oc-red mt-0.5 shrink-0">■</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <WhatsAppButton />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4 · PROGRAMAS DE SALUD PERSONALIZADO
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <SectionTitle sub="Selecciona tu paquete favorito y obtén tu programa personalizado">
            Programas de Salud Personalizado
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {HEALTH_PACKAGES.map((pkg) => (
              <div
                key={pkg.sesiones}
                className={`bg-oc-dark/50 p-5 rounded-xl border transition-all hover:shadow-lg hover:shadow-oc-red/10 relative text-center ${
                  pkg.badge
                    ? 'border-2 border-oc-red hover:shadow-oc-red/30'
                    : 'border-oc-border hover:border-oc-red/50'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-oc-red text-white text-xs font-bold px-3 py-1 rounded-full">
                    {pkg.badge}
                  </div>
                )}
                <div className="bg-oc-red/10 text-oc-red font-bold text-lg w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  {pkg.sesiones}
                </div>
                <p className="text-oc-muted text-sm mb-2">
                  {pkg.sesiones === 1 ? 'Sesión' : 'Sesiones'}
                </p>
                <span className="text-2xl font-bold text-oc-light">
                  ${pkg.price.toLocaleString()}
                </span>
                <p className="text-oc-muted text-xs mt-2">Expira en {pkg.vigencia}</p>
              </div>
            ))}
          </div>

          {/* Beneficios salud */}
          <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border">
            <h3 className="text-xl font-bold text-oc-light mb-4 text-center">Beneficios</h3>
            <BenefitList items={HEALTH_BENEFITS} />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5 · CLASE MUESTRA GRATIS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-oc-red">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¡Clase Muestra Gratis!
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Ven a conocernos sin compromiso. Tu primera clase es completamente gratis.
          </p>
          <a
            href="https://wa.me/525567869589?text=Hola%2C%20quiero%20agendar%20mi%20clase%20muestra%20gratis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-oc-red font-bold transition-all hover:bg-oc-light hover:shadow-lg"
          >
            ¡Reserva ahora!
          </a>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6 · SERVICIOS GENERALES
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-metal/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl font-bold text-oc-light mb-6 text-center">
              Servicios incluidos
            </h2>
            <BenefitList items={GENERAL_SERVICES} columns={2} />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7 · NOTAS GENERALES
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl font-bold text-oc-light mb-6 text-center">
              Notas generales
            </h2>
            <ul className="space-y-3 text-oc-light">
              {[
                'Los paquetes y planes tienen vigencia limitada y no son transferibles.',
                'La disponibilidad de servicios depende del horario y del cupo.',
                'Todos los programas están sujetos a agenda previa.',
                'Las promociones pueden cambiar sin previo aviso.',
                'Comienza ahora y obtén una sesión INBODY de salud gratis.',
              ].map((nota) => (
                <li key={nota} className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>{nota}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA Final
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-oc-muted text-lg mb-4">
            Contáctanos para más información o agenda tu clase muestra gratis
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-oc-muted text-sm mb-8">
            <span>📞 55 6786 9589</span>
            <span>📸 @OC_CALISTHENICS</span>
            <span>🕐 L–V 7:00 – 22:00</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WhatsAppButton />
            <Link
              to="/"
              className="px-8 py-4 rounded-full border-2 border-oc-red text-oc-red hover:bg-oc-red/10 font-semibold transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
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
                ¡No es un entrenamiento, es una experiencia única!
              </p>
            </div>
            <div>
              <h4 className="text-oc-light font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-oc-muted">
                <p>Tel: 55 6786 9589</p>
                <p>WhatsApp disponible</p>
                <p>Instagram: @OC_CALISTHENICS</p>
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
              © {new Date().getFullYear()} OC-CALISTHENICS. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
