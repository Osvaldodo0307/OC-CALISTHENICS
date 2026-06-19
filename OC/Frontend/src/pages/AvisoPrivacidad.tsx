import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

export default function AvisoPrivacidad() {
  return (
    <div className="min-h-screen bg-oc-carbon text-oc-light">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-10">
        <OcClubLogo variant="heroMark" className="opacity-90" />
        <h1 className="mt-8 font-hero text-4xl text-white uppercase tracking-tight">Aviso de privacidad</h1>
        <p className="mt-2 text-sm text-white/50">Última actualización: {new Date().getFullYear()}</p>

        <div className="mt-10 space-y-8 text-sm text-white/75 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-white">Responsable</h2>
            <p className="mt-2">
              OC Club («nosotros») opera el sitio web y los servicios presenciales del gimnasio ubicado en Lázaro
              Cárdenas 8, Ejidos de San Pedro Mártir, Tlalpan, CDMX. Este aviso describe el tratamiento de datos
              personales recabados a través del sitio, formularios de contacto, WhatsApp y servicios del club.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Datos que recabamos</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Nombre y teléfono o WhatsApp (formulario de contacto y comunicación comercial).</li>
              <li>Interés en planes, clases, Recovery Lab o tienda.</li>
              <li>Mensajes que nos envíes voluntariamente por formulario o WhatsApp.</li>
              <li>Datos de cuenta y operación si eres socio registrado en el portal (usuario, membresía, reservas).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Finalidades</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Responder solicitudes de información y agendar visitas al club.</li>
              <li>Gestionar membresías, clases, reservas y servicios contratados en el gimnasio.</li>
              <li>Atender pedidos o consultas de la tienda OC, sujetos a disponibilidad.</li>
              <li>Mejorar la experiencia del sitio y, si lo autorizas, analítica web básica.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">WhatsApp y medios electrónicos</h2>
            <p className="mt-2">
              Si nos contactas por WhatsApp, trataremos la información que compartas para dar seguimiento comercial u
              operativo. WhatsApp es un servicio de terceros con sus propias políticas de privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Transferencias y almacenamiento</h2>
            <p className="mt-2">
              Podemos alojar datos en proveedores de hosting y servicios en la nube (por ejemplo, Netlify para
              formularios del sitio y servicios de backend en la nube). No vendemos tus datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Derechos ARCO</h2>
            <p className="mt-2">
              Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos escribiendo al
              equipo OC por WhatsApp al 55 6786 9589 o al correo de contacto que tengamos publicado en el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Servicios de salud y resultados</h2>
            <p className="mt-2">
              La información en este sitio es de carácter informativo. El entrenamiento y los servicios de Recovery Lab
              no garantizan resultados físicos específicos. Se recomienda evaluación profesional cuando aplique,
              especialmente si tienes lesiones o condiciones médicas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Cambios</h2>
            <p className="mt-2">
              Podemos actualizar este aviso. La versión vigente estará publicada en esta página.
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm">
          <Link to="/" className="text-oc-red hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  )
}
