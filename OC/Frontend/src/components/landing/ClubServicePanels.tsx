import { useEffect, useMemo, useRef, useState } from 'react'
import { clubServicePanels, membershipFees, type ServicePanel } from '../../data/clubServices'
import ServiceCard from './ServiceCard'

export default function ClubServicePanels() {
  const [activePanelId, setActivePanelId] = useState<ServicePanel['id']>(clubServicePanels[0].id)
  const detailPanelRef = useRef<HTMLDivElement | null>(null)
  const panelOrder: Record<ServicePanel['id'], string> = {
    'oc-gym': '01',
    'acceso-total': '02',
    clases: '03',
    'recovery-lab': '04',
  }
  const panelAccent: Record<ServicePanel['id'], { line: string; badge: string }> = {
    'oc-gym': { line: 'from-oc-red to-red-500/20', badge: 'border-oc-red/50 text-oc-red bg-oc-red/12' },
    'acceso-total': { line: 'from-red-400/85 to-red-500/10', badge: 'border-red-300/45 text-red-200 bg-red-400/10' },
    'clases': { line: 'from-orange-300/85 to-orange-500/10', badge: 'border-orange-300/40 text-orange-200 bg-orange-400/10' },
    'recovery-lab': { line: 'from-cyan-300/80 to-cyan-500/10', badge: 'border-cyan-300/40 text-cyan-200 bg-cyan-400/10' },
  }

  const activePanel = useMemo(
    () => clubServicePanels.find((panel) => panel.id === activePanelId) ?? clubServicePanels[0],
    [activePanelId],
  )

  useEffect(() => {
    // En móvil, mover foco visual al contenido al cambiar de panel.
    if (!window.matchMedia('(max-width: 1023px)').matches) return
    detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activePanelId])

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-oc-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-oc-light">Membresías y Servicios</h2>
          <p className="mt-3 text-oc-muted max-w-2xl mx-auto">
            Elige un panel para explorar planes, clases y beneficios de recuperación en OC-CLUB.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-oc-red/40 bg-oc-metal/50 px-4 py-3 text-center text-sm sm:text-base text-oc-light">
          <span className="font-semibold text-oc-red">Costos generales:</span> {membershipFees}
        </div>

        <div className="mb-8 sm:mb-10">
          <h3 className="text-2xl sm:text-3xl font-semibold text-oc-light">Elige tu experiencia OC</h3>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-oc-muted">
            Selecciona una categoría para conocer planes, clases y servicios disponibles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {clubServicePanels.map((panel) => {
            const isActive = panel.id === activePanelId
            const accent = panelAccent[panel.id]
            const order = panelOrder[panel.id]
            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActivePanelId(panel.id)}
                className={`group relative min-h-[230px] sm:min-h-[245px] lg:min-h-[270px] overflow-hidden rounded-[24px] border text-left transition-all duration-300 ${
                  isActive
                    ? 'border-oc-red/75 shadow-[0_0_35px_rgba(239,0,24,0.22)]'
                    : 'border-white/10 bg-[#111] hover:border-red-600/70 hover:shadow-[0_0_35px_rgba(239,0,24,0.22)]'
                }`}
              >
                {panel.panelImage && (
                  <img
                    src={panel.panelImage}
                    alt={panel.panelImageAlt ?? panel.title}
                    className="absolute inset-0 h-full w-full object-cover saturate-75 transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: panel.imagePosition ?? 'center center' }}
                    aria-hidden
                    loading="lazy"
                  />
                )}
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: panel.imageOpacity != null ? 1 - (panel.imageOpacity + 0.08) : 0.62 }}
                  aria-hidden
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/18" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" aria-hidden />
                <div
                  className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_10%,rgba(210,31,45,0.22),transparent_48%)]"
                  aria-hidden
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isActive ? 'bg-oc-red/[0.08] opacity-100' : 'bg-black/10 opacity-0 group-hover:opacity-100'
                  }`}
                  aria-hidden
                />
                <div className={`absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r ${accent.line}`} aria-hidden />

                <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-7">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-fit rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white/65">
                      {order}
                    </span>
                    {isActive && (
                      <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${accent.badge}`}>
                        Panel activo
                      </span>
                    )}
                  </div>

                  <p className="font-hero text-[1.8rem] sm:text-[2.05rem] tracking-tight text-white">{panel.title}</p>
                  <p className="mt-2 max-w-md text-sm sm:text-base text-white/78">{panel.description}</p>

                  {!!panel.categoryChips?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {panel.categoryChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-white/30 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/85"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-oc-red">
                    {`${isActive ? panel.statusLabel ?? 'Panel activo' : panel.panelCtaLabel ?? 'Ver detalles'} →`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <div ref={detailPanelRef} className="scroll-mt-28 bg-oc-metal/45 border border-oc-border rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-oc-light uppercase">{activePanel.title}</h3>
            <p className="mt-2 text-oc-muted">{activePanel.description}</p>
            {activePanel.id === 'acceso-total' && (
              <p className="mt-3 text-sm text-oc-light/85">
                La experiencia completa de OC-CLUB: entrenamiento, clases, recuperación y beneficios premium en un solo acceso.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 md:auto-rows-fr gap-5">
            {activePanel.items.map((item) => (
              <ServiceCard key={item.id} item={item} showImage={activePanel.showItemImages} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
