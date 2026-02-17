import { Link } from 'react-router-dom'

export default function Membresias() {
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
            <span className="text-oc-light">Costos /</span>{' '}
            <span className="text-oc-red">Membresías</span>
          </h1>
          <p className="text-xl text-oc-muted mb-8">
            Elige el plan que mejor se adapte a tus objetivos y nivel de entrenamiento
          </p>
        </div>
      </section>

      {/* BLOQUE 1 – INSCRIPCIÓN */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto">
          <div className="bg-oc-metal/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-2">
                Inscripción
              </h2>
              <div className="mt-6 mb-4">
                <span className="text-5xl font-bold text-oc-red">$1,000</span>
                <span className="text-oc-muted text-xl ml-2">MXN</span>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <ul className="space-y-3 text-oc-light">
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>Pago único obligatorio para el alta como socio del club.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>Incluye registro administrativo, control interno y activación de perfil como socio.</span>
                </li>
              </ul>
            </div>

            <div className="bg-oc-dark/50 p-6 rounded-xl border border-oc-red/30 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <h4 className="text-oc-red font-semibold mb-2">Promoción estudiantes</h4>
                  <p className="text-oc-light">
                    Descuento de <span className="font-bold text-oc-red">$500 MXN</span> en la inscripción presentando tira de materias vigente.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="https://wa.me/525567869589"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
              >
                Pedir informes por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 2 – MEMBRESÍA GENERAL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-4xl mx-auto">
          <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-2">
                Membresía General
              </h2>
              <p className="text-oc-muted text-lg mb-4">Mensual</p>
              <div className="mt-6 mb-4">
                <span className="text-5xl font-bold text-oc-red">$1,799</span>
                <span className="text-oc-muted text-xl ml-2">MXN</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <ul className="space-y-3 text-oc-light">
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>La membresía expira de forma mensual.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>La membresía permite acceso general al club conforme al plan contratado.</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href="https://wa.me/525567869589"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
              >
                Pedir informes por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 3 – PAQUETES DE CLASES (WORKOUTS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Paquetes de clases</h2>
          </div>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { workouts: 3, price: 870, vigencia: '1 mes' },
              { workouts: 5, price: 1400, vigencia: '2 meses' },
              { workouts: 10, price: 2700, vigencia: '3 meses' },
              { workouts: 20, price: 5200, vigencia: '4 meses' },
              { workouts: 30, price: 7500, vigencia: '5 meses', badge: 'Más popular' },
              { workouts: 50, price: 12000, vigencia: '6 meses' },
              { workouts: 100, price: 23000, vigencia: '1 año' },
            ].map((paquete) => (
              <div
                key={paquete.workouts}
                className="bg-oc-metal/50 p-6 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10 relative"
              >
                {paquete.badge && (
                  <div className="absolute top-4 right-4 bg-oc-red text-white text-xs font-bold px-3 py-1 rounded-full">
                    {paquete.badge}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-oc-red mb-2">{paquete.workouts} workouts</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-oc-light">${paquete.price.toLocaleString()}</span>
                    <span className="text-oc-muted text-sm ml-1">MXN</span>
                  </div>
                  <p className="text-oc-muted text-sm">Vigencia: {paquete.vigencia}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE 4 – BENEFICIOS PAQUETES DE CLASES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6 text-center">
              Beneficios incluidos (Paquetes de clases)
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Paquete compartido',
                'Uso de sauna',
                'Uso de regaderas',
                'Toalla y agua',
                'Café',
                'Coach de piso',
                'Clases semi personalizadas',
              ].map((beneficio) => (
                <div key={beneficio} className="flex items-center gap-3 text-oc-light">
                  <span className="text-oc-red text-xl">✓</span>
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 5 – OC PLAN (DESCRIPCIÓN) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-metal/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6 text-center">
              OC Plan
            </h2>
            <div className="space-y-6 mb-8">
              <p className="text-oc-light text-lg leading-relaxed">
                El usuario selecciona su clase favorita y puede entrenar hasta 6 veces por semana.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold text-oc-red mb-4">Actividades incluidas:</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    'Sauna',
                    'Regaderas',
                    'Calistenia',
                    'Funcional',
                    'Express Jump',
                    'Baile',
                    'Basquetbol',
                    'Cuerda de batalla',
                    'Box',
                    'Defensa personal',
                    'Explosiva',
                    'Rusas',
                    'Stretching',
                    'GAP',
                    'Pilates',
                    'Y otras disciplinas adicionales',
                  ].map((actividad) => (
                    <div key={actividad} className="flex items-center gap-2 text-oc-light">
                      <span className="text-oc-red">•</span>
                      <span>{actividad}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 6 – COSTOS OC PLAN (3 CARDS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: OC Plan Mensual */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-oc-light mb-4">OC Plan Mensual</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-oc-red">$2,100</span>
                  <span className="text-oc-muted text-sm ml-1">MXN</span>
                </div>
                <p className="text-oc-muted text-sm mb-6">Vigencia 1 mes</p>
              </div>
            </div>

            {/* Card 2: OC Plan 6 meses */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-oc-light mb-4">OC Plan 6 meses</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-oc-red">$12,600</span>
                  <span className="text-oc-muted text-sm ml-1">MXN</span>
                </div>
                <p className="text-oc-muted text-sm mb-6">Vigencia 6 meses</p>
              </div>
            </div>

            {/* Card 3: OC Plan 18 meses */}
            <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/20 relative">
              <div className="absolute top-4 right-4 bg-oc-red text-white text-xs font-bold px-3 py-1 rounded-full">
                Más popular
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-oc-light mb-4">OC Plan 18 meses</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-oc-red">$25,200</span>
                  <span className="text-oc-muted text-sm ml-1">MXN</span>
                </div>
                <p className="text-oc-muted text-sm mb-2">Equivalente a $1,400 MXN mensuales</p>
                <p className="text-oc-muted text-sm mb-6">Vigencia 18 meses</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="https://wa.me/525567869589"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
            >
              Pedir informes por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* BLOQUE 7 – BENEFICIOS OC PLAN */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-metal/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6 text-center">
              Beneficios OC Plan
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Clases ilimitadas',
                'Visitas personales ilimitadas',
                'Tres visitas por invitado',
                'Servicio de toalla',
                'Servicio de agua',
                'Servicio de café',
                'Una sesión de salud (INBODY)',
              ].map((beneficio) => (
                <div key={beneficio} className="flex items-center gap-3 text-oc-light">
                  <span className="text-oc-red text-xl">✓</span>
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 8 – PROGRAMAS DE SALUD PERSONALIZADOS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-4">Programas de salud personalizados</h2>
          </div>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { sesiones: 1, price: 1500, vigencia: '1 mes' },
              { sesiones: 4, price: 6000, vigencia: '1 mes' },
              { sesiones: 8, price: 12000, vigencia: '1 mes' },
              { sesiones: 12, price: 18000, vigencia: '1 mes' },
              { sesiones: 16, price: 24000, vigencia: '2 meses' },
              { sesiones: 20, price: 30000, vigencia: '2 meses', badge: 'Más popular' },
              { sesiones: 25, price: 37500, vigencia: '2 meses' },
              { sesiones: 30, price: 45000, vigencia: 'según plan contratado' },
            ].map((programa) => (
              <div
                key={programa.sesiones}
                className="bg-oc-dark/50 p-6 rounded-xl border border-oc-border hover:border-oc-red/50 transition-all hover:shadow-lg hover:shadow-oc-red/10 relative"
              >
                {programa.badge && (
                  <div className="absolute top-4 right-4 bg-oc-red text-white text-xs font-bold px-3 py-1 rounded-full">
                    {programa.badge}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-oc-red mb-2">{programa.sesiones} sesión{programa.sesiones > 1 ? 'es' : ''}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-oc-light">${programa.price.toLocaleString()}</span>
                    <span className="text-oc-muted text-sm ml-1">MXN</span>
                  </div>
                  <p className="text-oc-muted text-sm">Vigencia: {programa.vigencia}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE 9 – SERVICIOS INCLUIDOS (PROGRAMAS DE SALUD) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-metal/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6 text-center">
              Servicios incluidos en programas de salud
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'INBODY',
                'Nutrición',
                'Fisioterapia',
                'Crioterapia',
                'Presoterapia',
                'Sauna',
                'Contrastes (sauna y hielo)',
                'Pistola de masaje',
                'Masajes deportivos',
              ].map((servicio) => (
                <div key={servicio} className="flex items-center gap-3 text-oc-light">
                  <span className="text-oc-red text-xl">✓</span>
                  <span>{servicio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 10 – NOTAS GENERALES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-metal">
        <div className="max-w-6xl mx-auto">
          <div className="bg-oc-dark/50 p-8 rounded-2xl border border-oc-border">
            <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6 text-center">
              Notas generales
            </h2>
            <div className="space-y-4">
              <ul className="space-y-3 text-oc-light">
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>Los paquetes y planes tienen vigencia limitada y no son transferibles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>La disponibilidad de servicios depende del horario y del cupo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>Todos los programas están sujetos a agenda previa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-oc-red mt-1 text-xl">•</span>
                  <span>Las promociones pueden cambiar sin previo aviso.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-oc-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-oc-muted text-lg mb-8">
            Contáctanos para más información o agenda una evaluación gratuita
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
