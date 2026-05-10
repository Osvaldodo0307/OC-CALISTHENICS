import { Link } from 'react-router-dom'
import { CERTIFICACIONES } from '../data/certificaciones'

/**
 * Vista pública de certificaciones del equipo OC.
 * Endpoint: /tienda/certificaciones
 *
 * Diseño: alineado con el resto de la tienda (fondo claro, acento rojo OC,
 * tarjetas con sombra suave). No promete relación médica ni resultados;
 * solo presenta los reconocimientos del equipo.
 */
export default function Certifications() {
  return (
    <div className="bg-neutral-50 pb-16">
      <nav
        className="mx-auto max-w-7xl flex flex-wrap items-center gap-2 px-4 pt-6 text-[12px] text-neutral-500 sm:px-6 lg:px-10 lg:pt-10"
        aria-label="Migas de pan"
      >
        <Link to="/tienda" className="hover:text-oc-red">
          Tienda
        </Link>
        <span aria-hidden>/</span>
        <span className="text-neutral-700">Certificaciones</span>
      </nav>

      <header className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">Confianza</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Certificaciones del equipo OC
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
          Reconocimientos y formaciones que respaldan el acompañamiento y la curaduría
          de producto del equipo OC. Iremos sumando más a medida que se emitan.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICACIONES.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div
                className={`grid gap-1 bg-neutral-100 ${
                  cert.fotos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {cert.fotos.map((foto) => (
                  <a
                    key={foto.src}
                    href={foto.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-[3/4] overflow-hidden bg-neutral-100"
                    aria-label={`Abrir imagen completa: ${foto.alt}`}
                  >
                    <img
                      src={foto.src}
                      alt={foto.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </a>
                ))}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-oc-red">
                  Certificación
                </span>
                <h2 className="text-base font-bold text-neutral-900 sm:text-lg">{cert.nombre}</h2>
                {cert.emisor && (
                  <p className="text-[12px] text-neutral-500">{cert.emisor}</p>
                )}
                {cert.resumen && (
                  <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">{cert.resumen}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
