import { useMemo, useState } from 'react'
import { clubServicePanels, membershipFees, type ServicePanel } from '../../data/clubServices'
import ServiceCard from './ServiceCard'

export default function ClubServicePanels() {
  const [activePanelId, setActivePanelId] = useState<ServicePanel['id']>(clubServicePanels[0].id)

  const activePanel = useMemo(
    () => clubServicePanels.find((panel) => panel.id === activePanelId) ?? clubServicePanels[0],
    [activePanelId],
  )

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {clubServicePanels.map((panel) => {
            const isActive = panel.id === activePanelId
            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActivePanelId(panel.id)}
                className={`rounded-xl border text-left overflow-hidden transition-all ${
                  isActive
                    ? 'border-oc-red bg-oc-red/10 shadow-lg shadow-oc-red/20'
                    : 'border-oc-border bg-oc-metal/40 hover:border-oc-red/45'
                }`}
              >
                {panel.panelImage && (
                  <div className="h-28 relative">
                    <img src={panel.panelImage} alt={panel.title} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" aria-hidden />
                  </div>
                )}
                <div className="p-4">
                  <p className={`text-lg font-bold ${isActive ? 'text-oc-light' : 'text-oc-light/90'}`}>{panel.title}</p>
                  <p className="mt-1 text-sm text-oc-muted">{panel.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-oc-red">
                    {isActive ? 'Panel activo' : 'Ver detalles'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-oc-metal/45 border border-oc-border rounded-2xl p-4 sm:p-6 lg:p-8">
          {activePanel.panelImage && (
            <div className="mb-6 rounded-xl overflow-hidden border border-oc-border h-48 sm:h-56">
              <img
                src={activePanel.panelImage}
                alt={`Panel ${activePanel.title}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-oc-light uppercase">{activePanel.title}</h3>
            <p className="mt-2 text-oc-muted">{activePanel.description}</p>
            {activePanel.id === 'acceso-total' && (
              <p className="mt-3 text-sm text-oc-light/85">
                La experiencia completa de OC-CLUB: entrenamiento, clases, recuperación y beneficios premium en un solo acceso.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activePanel.items.map((item) => (
              <ServiceCard key={item.id} item={item} showImage={activePanel.showItemImages} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
