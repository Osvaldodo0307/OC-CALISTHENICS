import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'
import ClubServicePanels from '../components/landing/ClubServicePanels'
import WhatsAppLink from '../components/WhatsAppLink'

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

      <ClubServicePanels />

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
            <WhatsAppLink
              preset="visita"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-oc-red hover:bg-oc-red-deep text-white font-semibold transition-all hover:shadow-lg hover:shadow-oc-red/50"
            >
              Pedir informes por WhatsApp
            </WhatsAppLink>
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
              <div className="mb-4">
                <OcClubLogo variant="footer" />
              </div>
              <p className="text-oc-muted text-sm">
                OC-CLUB · Elite Training Community
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
                <WhatsAppLink
                  preset="visita"
                  className="block text-oc-muted hover:text-oc-red text-sm transition-colors"
                >
                  Agendar visita (WhatsApp)
                </WhatsAppLink>
                <Link to="/aviso-privacidad" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Aviso de privacidad
                </Link>
                <Link to="/terminos" className="block text-oc-muted hover:text-oc-red text-sm transition-colors">
                  Términos
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-oc-border pt-8 text-center">
            <p className="text-oc-muted text-sm">
              © {new Date().getFullYear()} OC Club. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
