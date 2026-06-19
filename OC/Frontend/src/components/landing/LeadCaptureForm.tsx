import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import WhatsAppLink from '../WhatsAppLink'
import { ANALYTICS_EVENTS, trackEvent } from '../../utils/analytics'
import { syncUtmAttribution, type UtmFields } from '../../utils/utm'

export const LEAD_FORM_NAME = 'oc-lead-capture'

const INTEREST_OPTIONS = [
  { value: 'membresia-basica', label: 'Membresía básica' },
  { value: 'membresia-premium', label: 'Membresía premium' },
  { value: 'acceso-total', label: 'Acceso total' },
  { value: 'clases', label: 'Clases' },
  { value: 'recovery-lab', label: 'Recovery Lab' },
  { value: 'tienda-merch', label: 'Tienda / merch' },
] as const

type InterestValue = (typeof INTEREST_OPTIONS)[number]['value']

function isInterestValue(value: string): value is InterestValue {
  return INTEREST_OPTIONS.some((opt) => opt.value === value)
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export default function LeadCaptureForm() {
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [interes, setInteres] = useState<InterestValue>(INTEREST_OPTIONS[0].value)
  const [mensaje, setMensaje] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [utm, setUtm] = useState<UtmFields>(() => syncUtmAttribution())

  useEffect(() => {
    setUtm(syncUtmAttribution())
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!privacyConsent) {
      return
    }

    setStatus('submitting')

    const attribution = syncUtmAttribution()
    setUtm(attribution)

    const body = new URLSearchParams({
      'form-name': LEAD_FORM_NAME,
      nombre,
      telefono,
      interes,
      mensaje: mensaje.trim(),
      privacy_consent: 'si',
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      page_path: attribution.page_path,
      'bot-field': '',
    })

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!response.ok) {
        throw new Error('submit failed')
      }

      trackEvent(ANALYTICS_EVENTS.lead_form_success, {
        interes,
        page_path: attribution.page_path,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
      })

      setStatus('success')
      setNombre('')
      setTelefono('')
      setInteres(INTEREST_OPTIONS[0].value)
      setMensaje('')
      setPrivacyConsent(false)
    } catch {
      trackEvent(ANALYTICS_EVENTS.lead_form_error, {
        interes,
        page_path: attribution.page_path,
      })
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-6 md:p-8"
        role="status"
      >
        <h3 className="text-lg font-bold text-white">¡Recibimos tu solicitud!</h3>
        <p className="mt-2 text-sm text-white/75 leading-relaxed">
          El equipo OC te contactará pronto. Si prefieres respuesta inmediata, escríbenos por WhatsApp.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <WhatsAppLink
            preset="visita"
            className="inline-flex items-center justify-center rounded-sm bg-oc-red px-5 py-2.5 text-sm font-bold text-white hover:bg-oc-red-deep transition-colors"
          >
            Agendar visita por WhatsApp
          </WhatsAppLink>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="inline-flex items-center justify-center rounded-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5 transition-colors"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-6 md:p-8">
      <h3 className="text-xl font-bold text-white">Cuéntanos qué buscas</h3>
      <p className="mt-2 text-sm text-white/65 leading-relaxed">
        Déjanos tus datos y te contactamos. Si necesitas respuesta al momento, WhatsApp sigue siendo la vía más
        rápida.
      </p>

      {status === 'error' && (
        <div
          className="mt-4 rounded-sm border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100"
          role="alert"
        >
          No pudimos enviar el formulario en este momento. Puedes intentar de nuevo o escribirnos directo por{' '}
          <WhatsAppLink preset="general" className="font-semibold text-white underline hover:text-oc-red">
            WhatsApp
          </WhatsAppLink>
          .
        </div>
      )}

      <form
        name={LEAD_FORM_NAME}
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="form-name" value={LEAD_FORM_NAME} />
        <input type="hidden" name="utm_source" value={utm.utm_source} />
        <input type="hidden" name="utm_medium" value={utm.utm_medium} />
        <input type="hidden" name="utm_campaign" value={utm.utm_campaign} />
        <input type="hidden" name="utm_content" value={utm.utm_content} />
        <input type="hidden" name="page_path" value={utm.page_path} />
        <p className="hidden" aria-hidden>
          <label>
            No llenar: <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <div>
          <label htmlFor="lead-nombre" className="block text-sm font-medium text-white/85 mb-1.5">
            Nombre <span className="text-oc-red">*</span>
          </label>
          <input
            id="lead-nombre"
            name="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-black/50 px-4 py-2.5 text-white placeholder:text-white/35 focus:border-oc-red/60 focus:outline-none focus:ring-1 focus:ring-oc-red/40"
            placeholder="Tu nombre"
            disabled={status === 'submitting'}
          />
        </div>

        <div>
          <label htmlFor="lead-telefono" className="block text-sm font-medium text-white/85 mb-1.5">
            Teléfono o WhatsApp <span className="text-oc-red">*</span>
          </label>
          <input
            id="lead-telefono"
            name="telefono"
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-black/50 px-4 py-2.5 text-white placeholder:text-white/35 focus:border-oc-red/60 focus:outline-none focus:ring-1 focus:ring-oc-red/40"
            placeholder="55 1234 5678"
            disabled={status === 'submitting'}
          />
        </div>

        <div>
          <label htmlFor="lead-interes" className="block text-sm font-medium text-white/85 mb-1.5">
            ¿Qué te interesa? <span className="text-oc-red">*</span>
          </label>
          <select
            id="lead-interes"
            name="interes"
            required
            value={interes}
            onChange={(e) => {
              const value = e.target.value
              if (isInterestValue(value)) setInteres(value)
            }}
            className="w-full rounded-sm border border-white/15 bg-black/50 px-4 py-2.5 text-white focus:border-oc-red/60 focus:outline-none focus:ring-1 focus:ring-oc-red/40"
            disabled={status === 'submitting'}
          >
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lead-mensaje" className="block text-sm font-medium text-white/85 mb-1.5">
            Mensaje (opcional)
          </label>
          <textarea
            id="lead-mensaje"
            name="mensaje"
            rows={3}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-black/50 px-4 py-2.5 text-white placeholder:text-white/35 focus:border-oc-red/60 focus:outline-none focus:ring-1 focus:ring-oc-red/40 resize-y"
            placeholder="Horario que te conviene, dudas sobre planes, etc."
            disabled={status === 'submitting'}
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-white/75 leading-relaxed cursor-pointer">
          <input
            id="lead-privacy-consent"
            name="privacy_consent"
            type="checkbox"
            value="si"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-black/50 text-oc-red focus:ring-oc-red/40"
            disabled={status === 'submitting'}
          />
          <span>
            Acepto el tratamiento de mis datos conforme al{' '}
            <Link to="/aviso-privacidad" className="text-white underline hover:text-oc-red">
              Aviso de Privacidad
            </Link>
            . <span className="text-oc-red">*</span>
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex flex-1 items-center justify-center rounded-sm bg-oc-red px-5 py-3 text-sm font-bold text-white hover:bg-oc-red-deep transition-colors disabled:opacity-60"
          >
            {status === 'submitting' ? 'Enviando…' : 'Enviar solicitud'}
          </button>
          <WhatsAppLink
            preset="visita"
            className="inline-flex flex-1 items-center justify-center rounded-sm border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Prefiero WhatsApp
          </WhatsAppLink>
        </div>
      </form>
    </div>
  )
}
