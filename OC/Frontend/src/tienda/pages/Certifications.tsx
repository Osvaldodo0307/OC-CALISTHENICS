import { Link } from 'react-router-dom'
import { buildWhatsAppHref } from '../../utils/whatsapp'

/**
 * Oferta comercial de certificaciones por consulta.
 * Las fotografías de diplomas anteriores siguen archivadas en el repositorio,
 * pero no representan cursos actuales ni títulos en venta.
 */
export default function Certifications() {
  const contactHref = buildWhatsAppHref(
    'Hola OC-STORE, quiero información sobre las certificaciones disponibles, requisitos, modalidad, fechas y costos.',
  )

  return (
    <div className="min-h-screen bg-[#060606] pb-20 text-white">
      <div className="relative overflow-hidden border-b border-white/10 bg-[#111]">
        <div className="absolute inset-0 opacity-25" aria-hidden
          style={{ backgroundImage: "url('/tienda/imagenes/certificaciones/banner.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/90 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <nav className="mb-8 flex items-center gap-2 text-xs text-white/60" aria-label="Migas de pan">
            <Link to="/tienda" className="hover:text-oc-red">OC-STORE</Link>
            <span aria-hidden>/</span>
            <span className="text-white">Certificaciones</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-oc-red">Formación y desarrollo</p>
          <h1 className="mt-3 max-w-3xl font-hero text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl">
            CERTIFICACIONES <span className="text-oc-red">OC-STORE</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Consulta la oferta de formación y certificaciones relacionadas con el entrenamiento y
            la preparación deportiva. Los programas, organismos emisores, modalidad, requisitos,
            fechas y precios se confirman directamente con el equipo OC.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={contactHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-oc-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-oc-red-deep">
              Solicitar información por WhatsApp →
            </a>
            <Link to="/tienda" className="inline-flex items-center justify-center border border-white/25 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10">
              Volver a OC-STORE
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-10">
        {[
          { title: 'Programas', body: 'Conoce qué opciones de formación se encuentran disponibles actualmente.' },
          { title: 'Requisitos y modalidad', body: 'Solicita información sobre perfil de ingreso, duración, formato y evaluación.' },
          { title: 'Inscripción', body: 'Recibe directamente los costos, próximas fechas y procedimiento de contratación.' },
        ].map((item, index) => (
          <article key={item.title} className="border border-white/10 bg-[#111] p-6">
            <span className="font-hero text-3xl text-oc-red">0{index + 1}</span>
            <h2 className="mt-4 font-hero text-2xl uppercase">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{item.body}</p>
          </article>
        ))}
      </section>
      <p className="mx-auto max-w-7xl px-4 text-xs text-white/50 sm:px-6 lg:px-10">
        Información comercial sujeta a confirmación. Esta página no promete emisión de certificados,
        acreditaciones o reconocimientos oficiales sin documentación del programa correspondiente.
      </p>
    </div>
  )
}
