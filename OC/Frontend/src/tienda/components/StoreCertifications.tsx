import { CERTIFICACIONES_BANNER, getCertificacionLogos } from '../data/tiendaAssets'

/**
 * Sección de certificaciones en el home de la tienda.
 * - Panel editorial: `public/tienda/imagenes/certificaciones/banner.png` (copia de `Imágenes/Certificaciones.png`).
 * - Sellos adicionales: archivos en `src/tienda/Imágenes/certificaciones/`.
 */
export default function StoreCertifications() {
  const logos = getCertificacionLogos()

  return (
    <section className="border-y border-neutral-200 bg-white" aria-labelledby="tienda-certificaciones-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <header className="mb-6 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-oc-red">
            Confianza
          </p>
          <h2
            id="tienda-certificaciones-heading"
            className="mt-2 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Certificaciones
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-neutral-600 sm:mx-0 mx-auto">
            Compromiso con calidad y buenas prácticas. Aquí iremos sumando los reconocimientos y sellos
            oficiales disponibles.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <img
            src={CERTIFICACIONES_BANNER}
            alt="Certificaciones y estándares OC Store"
            className="h-auto w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>

        {logos.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500 sm:text-left">
              Sellos y distintivos
            </p>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {logos.map((item) => (
                <li
                  key={item.src}
                  className="flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="max-h-14 w-auto max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
