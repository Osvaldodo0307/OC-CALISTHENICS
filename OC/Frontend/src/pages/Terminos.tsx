import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import OcClubLogo from '../components/brand/OcClubLogo'

export default function Terminos() {
  return (
    <div className="min-h-screen bg-oc-carbon text-oc-light">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-10">
        <OcClubLogo variant="heroMark" className="opacity-90" />
        <h1 className="mt-8 font-hero text-4xl text-white uppercase tracking-tight">Términos y condiciones</h1>
        <p className="mt-2 text-sm text-white/50">Última actualización: {new Date().getFullYear()}</p>

        <div className="mt-10 space-y-8 text-sm text-white/75 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-white">Alcance</h2>
            <p className="mt-2">
              Estos términos regulan el uso del sitio web de OC Club y la información comercial publicada sobre
              membresías, clases, Recovery Lab y tienda. El uso del sitio implica que los has leído.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Servicios presenciales</h2>
            <p className="mt-2">
              Las membresías, clases y servicios de Recovery Lab se prestan en las instalaciones del club en Tlalpan.
              Precios, promociones y disponibilidad mostrados en el sitio son referenciales y se confirman con el equipo
              OC al contratar o renovar.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Tienda y catálogo</h2>
            <p className="mt-2">
              El catálogo en línea puede estar en actualización. Los productos, precios, tallas e imágenes son
              referenciales. Toda compra o pedido queda sujeto a disponibilidad real y confirmación por WhatsApp o con
              el equipo en recepción. No hay pago en línea activo en el sitio en esta etapa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Portal de socios</h2>
            <p className="mt-2">
              El acceso al portal (`/app`) es para usuarios autorizados (socios, coaches, administración). Eres
              responsable de mantener la confidencialidad de tu contraseña.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Sin garantía de resultados</h2>
            <p className="mt-2">
              El entrenamiento físico conlleva riesgos inherentes. OC Club no garantiza resultados corporales,
              deportivos o de salud específicos. Consulta a un profesional de la salud antes de iniciar o intensificar
              tu actividad si tienes condiciones médicas relevantes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Propiedad intelectual</h2>
            <p className="mt-2">
              Marcas, textos, imágenes y diseño del sitio pertenecen a OC Club o se usan con autorización. No está
              permitida su reproducción comercial sin permiso.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Limitación de responsabilidad</h2>
            <p className="mt-2">
              El sitio se ofrece «tal cual». No respondemos por interrupciones temporales del servicio web, enlaces a
              terceros (redes sociales, WhatsApp) ni por información desactualizada si no ha sido reportada al equipo.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">Contacto</h2>
            <p className="mt-2">
              Para dudas sobre estos términos: WhatsApp 55 6786 9589 o la sección de contacto del sitio.
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
