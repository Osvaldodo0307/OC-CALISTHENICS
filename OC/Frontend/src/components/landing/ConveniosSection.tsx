import { conveniosData } from '../../data/clubServices'

export default function ConveniosSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-oc-metal">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light text-center">Convenios y certificaciones</h2>
          <p className="mt-3 text-center text-oc-muted">Alianzas estratégicas que fortalecen la experiencia OC-CLUB.</p>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {conveniosData.certificaciones.map((cert) => (
              <article key={cert.name} className="rounded-xl border border-oc-border bg-oc-dark/55 p-5">
                <div className="h-36 rounded-lg bg-black/70 border border-oc-border overflow-hidden flex items-center justify-center">
                  <img src={cert.logo} alt={cert.name} className="h-full w-full object-contain p-3" loading="lazy" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-oc-light">{cert.name}</h3>
                <p className="mt-2 text-sm text-oc-muted">{cert.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light text-center">Patrocinadores</h2>
          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            {conveniosData.patrocinadores.map((sponsor) => (
              <article key={sponsor.name} className="rounded-xl border border-oc-border bg-oc-dark/55 p-5">
                <div className="h-36 rounded-lg bg-black/70 border border-oc-border overflow-hidden flex items-center justify-center">
                  <img src={sponsor.logo} alt={sponsor.name} className="h-full w-full object-contain p-3" loading="lazy" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-oc-light">{sponsor.name}</h3>
                {sponsor.subtitle && <p className="text-oc-red font-semibold text-sm mt-1">{sponsor.subtitle}</p>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
