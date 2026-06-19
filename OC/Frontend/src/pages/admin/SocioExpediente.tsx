import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { runtime } from '../../config/runtime'
import { toUserMessage } from '../../services/api/errorMessages'
import {
  buildMemberWhatsAppHref,
  whatsappPresetForInboxItem,
  type MembershipWhatsAppPreset,
} from '../../utils/whatsapp'

const API_URL = runtime.apiBaseUrl

function HistoricalBadge({ source }: { source?: string | null }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-700/50">
        Histórico importado
      </span>
      {source ? (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-oc-panel text-oc-muted border border-oc-border">
          Fuente: {source}
        </span>
      ) : null}
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-oc-panel text-oc-muted border border-oc-border">
        No operativo actual
      </span>
    </span>
  )
}

type TabId = 'resumen' | 'pagos' | 'ciclos' | 'adeudos' | 'seguimientos' | 'notas'

type PaymentAction =
  | 'register_only'
  | 'renew_extend'
  | 'partial_debt'
  | 'courtesy_extend'
  | 'admin_adjustment'

interface SocioProfile {
  user_id: number
  membership_id: number
  name: string
  phone?: string | null
  general: {
    status: string
    membership_type?: string | null
    cost: number
    start_date?: string | null
    end_date?: string | null
    days_remaining?: number | null
    days_overdue?: number | null
    total_paid: number
    current_pending_balance: number
    historical_pending_balance: number
    total_pending_balance: number
    last_payment?: { amount: number; payment_date: string; payment_method: string } | null
    last_followup?: { status: string; note?: string | null; updated_at?: string } | null
    next_followup_at?: string | null
    tags: string[]
    is_recently_contacted: boolean
    has_pending_followup: boolean
    is_historical_only_member?: boolean
    is_historical_import?: boolean
    historical_source?: string | null
    import_batch_id?: number | null
  }
  active_cycle: {
    id: number
    membership_type: string
    cost: number
    start_date: string
    end_date: string
    status: string
    total_paid: number
    pending_balance: number
    courtesies_count: number
    adjustments_count: number
    reversed_payments_count: number
    is_historical_import?: boolean
    historical_source?: string | null
    import_batch_id?: number | null
    notes?: { id: number; note: string; created_at: string; created_by_name?: string }[]
  } | null
  cycles_history: Array<{
    id: number
    membership_type: string
    start_date: string
    end_date: string
    status: string
    cost: number
    total_paid: number
    pending_balance: number
    is_active_cycle: boolean
    is_historical_import?: boolean
    historical_source?: string | null
    import_batch_id?: number | null
    payments_count: number
    reversed_payments_count: number
    courtesies_count: number
    adjustments_count: number
  }>
  payments: Array<{
    id: number
    membership_cycle_id: number
    payment_date: string
    amount: number
    payment_method: string
    payment_action?: string | null
    period_start_date?: string | null
    period_end_date?: string | null
    counts_as_income?: boolean
    applies_to_balance?: boolean
    concept?: string | null
    observations?: string | null
    is_historical_import?: boolean
    historical_source?: string | null
    import_batch_id?: number | null
    created_by_name?: string | null
    reversed_at?: string | null
    reversal_reason?: string | null
    reversed_by_name?: string | null
    is_reversed: boolean
    status_label: string
    can_reverse: boolean
    reversal_block_reason?: string | null
  }>
  debts: Array<{
    cycle_id: number
    membership_type: string
    concept: string
    pending_balance: number
    is_active_cycle: boolean
    end_date: string
    days_overdue?: number | null
    status: string
  }>
  followups: Array<{
    id: number
    status: string
    channel: string
    followup_type: string
    note?: string | null
    contact_at?: string | null
    next_followup_at?: string | null
    created_at: string
    created_by_name?: string | null
  }>
  notes: Array<{
    id: number
    note: string
    created_at: string
    created_by_name?: string | null
    note_type: string
    membership_cycle_id?: number | null
  }>
  flags: {
    can_register_payment: boolean
    can_suspend: boolean
    can_unsuspend: boolean
    has_phone: boolean
    has_active_cycle: boolean
    has_payments: boolean
  }
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'ciclos', label: 'Ciclos' },
  { id: 'adeudos', label: 'Adeudos' },
  { id: 'seguimientos', label: 'Seguimientos' },
  { id: 'notas', label: 'Notas' },
]

const TAG_LABELS: Record<string, string> = {
  al_corriente: 'Al corriente',
  por_vencer: 'Por vencer',
  vence_hoy: 'Vence hoy',
  vencido: 'Vencido',
  con_adeudo: 'Con adeudo',
  suspendido: 'Suspendido',
  contactado_recientemente: 'Contactado recientemente',
}

const fmtMoney = (v: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v || 0)
const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('es-MX') : '-')

function statusLabel(status: string) {
  const map: Record<string, string> = {
    activa: 'Al corriente',
    proxima_a_vencer: 'Por vencer',
    vence_hoy: 'Vence hoy',
    vencida: 'Vencido',
    con_adeudo: 'Con adeudo',
    suspendida: 'Suspendido',
  }
  return map[status] || status
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    activa: 'bg-emerald-900/50 text-emerald-200',
    proxima_a_vencer: 'bg-amber-900/50 text-amber-200',
    vence_hoy: 'bg-orange-900/50 text-orange-200',
    vencida: 'bg-red-900/50 text-red-200',
    con_adeudo: 'bg-rose-900/50 text-rose-200',
    suspendida: 'bg-zinc-800 text-zinc-300',
  }
  return map[status] || 'bg-oc-panel text-oc-light/90'
}

function whatsappPreset(status: string): MembershipWhatsAppPreset {
  return whatsappPresetForInboxItem(status)
}

export default function SocioExpediente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = Number(id)
  const [profile, setProfile] = useState<SocioProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabId>('resumen')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [noteText, setNoteText] = useState('')
  const [followupNote, setFollowupNote] = useState('')
  const [nextFollowupDate, setNextFollowupDate] = useState('')
  const [reverseTarget, setReverseTarget] = useState<SocioProfile['payments'][0] | null>(null)
  const [reverseReason, setReverseReason] = useState('')
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'efectivo',
    payment_action: 'renew_extend' as PaymentAction,
    concept: '',
    observations: '',
  })

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 5000)
  }

  const fetchProfile = useCallback(async () => {
    if (!Number.isFinite(userId)) {
      setError('ID de socio invalido')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<SocioProfile>(`${API_URL}/membership/admin/client/${userId}/profile`)
      setProfile(res.data)
      const pending = res.data.active_cycle?.pending_balance ?? 0
      setPaymentForm((prev) => ({
        ...prev,
        amount: pending > 0 ? String(pending) : String(res.data.active_cycle?.cost || ''),
        payment_action: pending > 0 ? 'partial_debt' : 'renew_extend',
      }))
    } catch (err) {
      setProfile(null)
      setError(toUserMessage(err, 'No se pudo cargar el expediente del socio'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const waHref = useMemo(() => {
    if (!profile?.flags.has_phone) return null
    return buildMemberWhatsAppHref(profile.phone, whatsappPreset(profile.general.status))
  }, [profile])

  const handlePayment = async () => {
    if (!profile?.active_cycle || busy) return
    const amount = Number(paymentForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      showNotice('error', 'Monto invalido')
      return
    }
    setBusy(true)
    try {
      await axios.post(`${API_URL}/membership/admin/cycle/${profile.active_cycle.id}/payment`, {
        amount,
        payment_method: paymentForm.payment_method,
        payment_action: paymentForm.payment_action,
        concept: paymentForm.concept || null,
        observations: paymentForm.observations || null,
        idempotency_key: `exp-${profile.active_cycle.id}-${Date.now()}`,
      })
      showNotice('success', 'Pago registrado')
      await fetchProfile()
    } catch (err) {
      showNotice('error', toUserMessage(err, 'No se pudo registrar el pago'))
    } finally {
      setBusy(false)
    }
  }

  const handleReverse = async () => {
    if (!reverseTarget || busy) return
    if (!reverseReason.trim()) {
      showNotice('error', 'Indica el motivo de la reversa')
      return
    }
    if (!window.confirm('Esta accion modificara vigencia y saldo. El pago quedara como REVERTIDO. ¿Continuar?')) return
    setBusy(true)
    try {
      await axios.post(`${API_URL}/membership/admin/payment/${reverseTarget.id}/reverse`, { reason: reverseReason.trim() })
      setReverseTarget(null)
      setReverseReason('')
      showNotice('success', 'Pago revertido')
      await fetchProfile()
    } catch (err) {
      showNotice('error', toUserMessage(err, 'No se pudo revertir el pago'))
    } finally {
      setBusy(false)
    }
  }

  const handleNote = async () => {
    if (!profile || !noteText.trim() || busy) return
    setBusy(true)
    try {
      await axios.post(
        `${API_URL}/membership/admin/client/${profile.user_id}/note`,
        { note: noteText.trim() },
        { params: { cycle_id: profile.active_cycle?.id } },
      )
      setNoteText('')
      showNotice('success', 'Nota guardada')
      await fetchProfile()
    } catch (err) {
      showNotice('error', toUserMessage(err, 'No se pudo guardar la nota'))
    } finally {
      setBusy(false)
    }
  }

  const quickFollowup = async (action: string) => {
    if (!profile || busy) return
    setBusy(true)
    try {
      const params: Record<string, string> = { action, channel: 'whatsapp' }
      if (followupNote.trim()) params.note = followupNote.trim()
      if (nextFollowupDate) params.next_followup_at = new Date(`${nextFollowupDate}T10:00:00`).toISOString()
      await axios.post(`${API_URL}/membership/admin/client/${profile.user_id}/followups/quick`, null, { params })
      setFollowupNote('')
      showNotice('success', 'Seguimiento registrado')
      await fetchProfile()
    } catch (err) {
      showNotice('error', toUserMessage(err, 'No se pudo registrar el seguimiento'))
    } finally {
      setBusy(false)
    }
  }

  const handleSuspend = async () => {
    if (!profile || busy) return
    if (!window.confirm('¿Suspender la membresia de este socio?')) return
    setBusy(true)
    try {
      await axios.put(`${API_URL}/membership/${profile.user_id}/deactivate`)
      showNotice('success', 'Membresia suspendida')
      await fetchProfile()
    } catch (err) {
      showNotice('error', toUserMessage(err, 'No se pudo suspender'))
    } finally {
      setBusy(false)
    }
  }

  const handleUnsuspend = async () => {
    if (!profile?.active_cycle || busy) return
    setBusy(true)
    try {
      await axios.put(`${API_URL}/membership/cycle/${profile.active_cycle.id}/unsuspend`)
      showNotice('success', 'Suspension levantada')
      await fetchProfile()
    } catch (err) {
      showNotice('error', toUserMessage(err, 'No se pudo levantar la suspension'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="px-4 py-10 text-oc-muted">Cargando expediente...</div>
  }

  if (error || !profile) {
    return (
      <div className="px-4 py-10 space-y-4">
        <p className="text-red-200">{error || 'Socio no encontrado'}</p>
        <Link to="/app/admin/membresias" className="text-oc-red hover:underline text-sm">
          Volver a Membresias
        </Link>
      </div>
    )
  }

  const g = profile.general

  return (
    <div className="px-4 space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={() => navigate(-1)} className="text-oc-muted text-sm hover:text-white mb-1">
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
          <p className="text-oc-muted mt-1">
            {profile.phone || 'Sin telefono'} · Expediente administrativo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/admin/membresias" className="text-sm bg-oc-panel text-white px-3 py-2 rounded">
            Membresias
          </Link>
          <Link to="/app/admin/recordatorios" className="text-sm bg-oc-panel text-white px-3 py-2 rounded">
            Recordatorios
          </Link>
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-sm bg-emerald-800 text-white px-3 py-2 rounded">
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`rounded border px-4 py-3 text-sm ${
            notice.type === 'success' ? 'bg-emerald-900/30 border-emerald-700 text-emerald-100' : 'bg-red-900/30 border-red-700 text-red-100'
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="bg-oc-metal border border-oc-red/20 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm px-2 py-1 rounded ${statusBadgeClass(g.status)}`}>{statusLabel(g.status)}</span>
          {g.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded bg-oc-panel text-oc-light/90">
              {TAG_LABELS[tag] || tag}
            </span>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div><span className="text-oc-muted">Plan:</span> <span className="text-white">{g.membership_type || '-'}</span></div>
          <div><span className="text-oc-muted">Monto:</span> <span className="text-white">{fmtMoney(g.cost)}</span></div>
          <div><span className="text-oc-muted">Vigencia:</span> <span className="text-white">{fmtDate(g.start_date)} – {fmtDate(g.end_date)}</span></div>
          <div>
            <span className="text-oc-muted">Dias:</span>{' '}
            <span className="text-white">
              {g.days_overdue ? `${g.days_overdue} vencidos` : g.days_remaining != null ? `${g.days_remaining} restantes` : '-'}
            </span>
          </div>
          <div><span className="text-oc-muted">Saldo pendiente:</span> <span className="text-white">{fmtMoney(g.total_pending_balance)}</span></div>
          <div><span className="text-oc-muted">Ultimo pago:</span> <span className="text-white">{g.last_payment ? `${fmtMoney(g.last_payment.amount)} (${fmtDate(g.last_payment.payment_date)})` : '-'}</span></div>
          <div><span className="text-oc-muted">Ultimo seguimiento:</span> <span className="text-white">{g.last_followup?.status || '-'}</span></div>
          <div><span className="text-oc-muted">Proximo seguimiento:</span> <span className="text-white">{fmtDate(g.next_followup_at)}</span></div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-oc-border">
          {profile.flags.can_register_payment && (
            <button type="button" disabled={busy} onClick={() => setTab('resumen')} className="text-xs bg-oc-red text-white px-3 py-1.5 rounded">
              Registrar pago
            </button>
          )}
          {profile.flags.can_suspend && (
            <button type="button" disabled={busy} onClick={() => void handleSuspend()} className="text-xs bg-zinc-700 text-white px-3 py-1.5 rounded">
              Suspender
            </button>
          )}
          {profile.flags.can_unsuspend && (
            <button type="button" disabled={busy} onClick={() => void handleUnsuspend()} className="text-xs bg-emerald-800 text-white px-3 py-1.5 rounded">
              Levantar suspension
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => setTab('notas')} className="text-xs bg-oc-panel text-white px-3 py-1.5 rounded">
            Agregar nota
          </button>
          <button type="button" disabled={busy} onClick={() => setTab('seguimientos')} className="text-xs bg-oc-panel text-white px-3 py-1.5 rounded">
            Crear seguimiento
          </button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-oc-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded text-sm ${tab === t.id ? 'bg-oc-red text-white' : 'bg-oc-panel text-oc-light/90'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-oc-metal border border-oc-border rounded-lg p-4 space-y-3">
            <h2 className="text-lg text-oc-red font-semibold">Ciclo actual</h2>
            {profile.active_cycle ? (
              <>
                {profile.active_cycle.is_historical_import || profile.general.is_historical_import ? (
                  <div className="mb-2">
                    <HistoricalBadge source={profile.active_cycle.historical_source || profile.general.historical_source} />
                  </div>
                ) : null}
                <div className="text-sm text-white grid gap-1">
                  <div>{profile.active_cycle.membership_type} · {fmtMoney(profile.active_cycle.cost)}</div>
                  <div>{fmtDate(profile.active_cycle.start_date)} – {fmtDate(profile.active_cycle.end_date)}</div>
                  <div>Estado: {statusLabel(profile.active_cycle.status)}</div>
                  <div>Pagado: {fmtMoney(profile.active_cycle.total_paid)} · Saldo: {fmtMoney(profile.active_cycle.pending_balance)}</div>
                  <div className="text-oc-muted text-xs">
                    Cortesias: {profile.active_cycle.courtesies_count} · Ajustes: {profile.active_cycle.adjustments_count} · Reversas: {profile.active_cycle.reversed_payments_count}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-oc-muted text-sm">Sin ciclo activo.</p>
            )}
          </div>
          {profile.flags.can_register_payment && (
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4 space-y-3">
              <h2 className="text-lg text-oc-red font-semibold">Registrar pago</h2>
              <div className="grid gap-2">
                <input className="bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Monto" />
                <select className="bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" value={paymentForm.payment_method} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cortesia">Cortesia</option>
                  <option value="ajuste">Ajuste</option>
                </select>
                <select className="bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" value={paymentForm.payment_action} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_action: e.target.value as PaymentAction }))}>
                  <option value="renew_extend">Renovar / extender</option>
                  <option value="partial_debt">Adeudo parcial</option>
                  <option value="register_only">Solo registrar</option>
                  <option value="courtesy_extend">Cortesia con extension</option>
                  <option value="admin_adjustment">Ajuste administrativo</option>
                </select>
                <button type="button" disabled={busy} onClick={() => void handlePayment()} className="bg-oc-red text-white py-2 rounded text-sm">
                  Registrar pago
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'pagos' && (
        <div className="bg-oc-metal border border-oc-border rounded-lg p-4 overflow-x-auto">
          <h2 className="text-lg text-oc-red font-semibold mb-3">Historial de pagos</h2>
          {profile.payments.length === 0 ? (
            <p className="text-oc-muted text-sm">Sin pagos registrados.</p>
          ) : (
            <table className="w-full text-sm text-left min-w-[720px]">
              <thead className="text-oc-muted text-xs">
                <tr>
                  <th className="py-2">Fecha</th>
                  <th>Monto</th>
                  <th>Metodo</th>
                  <th>Accion</th>
                  <th>Periodo</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {profile.payments.map((p) => (
                  <tr key={p.id} className={`border-t border-oc-border ${p.is_reversed ? 'opacity-70' : ''}`}>
                    <td className="py-2 text-white">
                      <div>{fmtDate(p.payment_date)}</div>
                      {p.is_historical_import ? (
                        <div className="mt-1">
                          <HistoricalBadge source={p.historical_source} />
                        </div>
                      ) : null}
                    </td>
                    <td className={p.is_reversed ? 'line-through text-red-300' : 'text-white'}>{fmtMoney(p.amount)}</td>
                    <td className="text-oc-light/90">{p.payment_method}</td>
                    <td className="text-oc-light/90 text-xs">{p.payment_action || '-'}</td>
                    <td className="text-oc-muted text-xs">{p.period_start_date ? `${fmtDate(p.period_start_date)} – ${fmtDate(p.period_end_date)}` : '-'}</td>
                    <td className="text-xs">{p.counts_as_income ? 'Si' : 'No'}</td>
                    <td>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${p.is_reversed ? 'bg-red-900/60 text-red-100' : 'bg-emerald-900/40 text-emerald-100'}`}>
                        {p.is_reversed ? 'REVERTIDO' : 'ACTIVO'}
                      </span>
                    </td>
                    <td>
                      {!p.is_reversed && (
                        <button
                          type="button"
                          disabled={!p.can_reverse}
                          title={p.reversal_block_reason || ''}
                          onClick={() => setReverseTarget(p)}
                          className={`text-xs px-2 py-1 rounded ${p.can_reverse ? 'bg-oc-panel text-white' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                        >
                          Revertir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'ciclos' && (
        <div className="space-y-2">
          {profile.cycles_history.length === 0 ? (
            <p className="text-oc-muted text-sm">Sin ciclos registrados.</p>
          ) : (
            profile.cycles_history.map((c) => (
              <div key={c.id} className="bg-oc-metal border border-oc-border rounded-lg p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="text-white font-medium">
                    {c.membership_type} {c.is_active_cycle && <span className="text-oc-red text-xs">(actual)</span>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeClass(c.status)}`}>{statusLabel(c.status)}</span>
                </div>
                {c.is_historical_import ? (
                  <div className="mt-2">
                    <HistoricalBadge source={c.historical_source} />
                  </div>
                ) : null}
                <div className="text-oc-muted mt-1">{fmtDate(c.start_date)} – {fmtDate(c.end_date)}</div>
                <div className="text-white mt-2 grid sm:grid-cols-2 gap-1">
                  <span>Esperado: {fmtMoney(c.cost)}</span>
                  <span>Pagado: {fmtMoney(c.total_paid)}</span>
                  <span>Saldo final: {fmtMoney(c.pending_balance)}</span>
                  <span>Pagos: {c.payments_count} · Reversas: {c.reversed_payments_count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'adeudos' && (
        <div className="bg-oc-metal border border-oc-border rounded-lg p-4 space-y-3">
          {profile.debts.length === 0 ? (
            <p className="text-oc-muted text-sm">Sin adeudos registrados.</p>
          ) : (
            profile.debts.map((d) => (
              <div key={d.cycle_id} className="bg-oc-dark border border-oc-border rounded p-3 text-sm">
                <div className="text-white font-medium">{d.concept}</div>
                <div className="text-oc-muted">{fmtDate(d.end_date)} · {statusLabel(d.status)}</div>
                <div className="text-white mt-1">Saldo: {fmtMoney(d.pending_balance)}</div>
                {d.days_overdue ? <div className="text-amber-300 text-xs">{d.days_overdue} dias vencidos</div> : null}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setTab('resumen')} className="text-xs bg-oc-red text-white px-2 py-1 rounded">Registrar pago</button>
                  {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-xs bg-emerald-800 text-white px-2 py-1 rounded">WhatsApp</a>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'seguimientos' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-oc-metal border border-oc-border rounded-lg p-4 space-y-3">
            <h2 className="text-lg text-oc-red font-semibold">Nuevo seguimiento</h2>
            {g.is_recently_contacted && (
              <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-800 rounded px-2 py-1">
                Contactado recientemente (24h)
              </p>
            )}
            <textarea className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" rows={3} value={followupNote} onChange={(e) => setFollowupNote(e.target.value)} placeholder="Nota" />
            <input type="date" className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" value={nextFollowupDate} onChange={(e) => setNextFollowupDate(e.target.value)} />
            <div className="flex flex-wrap gap-1">
              {['contactado', 'respondio', 'sin_respuesta', 'renovado', 'descartado'].map((a) => (
                <button key={a} type="button" disabled={busy} onClick={() => void quickFollowup(a)} className="text-xs bg-oc-panel text-white px-2 py-1 rounded capitalize">
                  {a.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
            <h2 className="text-lg text-oc-red font-semibold mb-2">Historial</h2>
            {profile.followups.length === 0 ? (
              <p className="text-oc-muted text-sm">Sin seguimientos.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-auto text-sm">
                {profile.followups.map((f) => (
                  <li key={f.id} className="bg-oc-dark border border-oc-border rounded p-2">
                    <div className="text-white">{f.status} · {f.channel} · {f.followup_type}</div>
                    <div className="text-oc-muted text-xs">{fmtDate(f.created_at)} · {f.created_by_name}</div>
                    {f.note && <div className="text-oc-light/90 mt-1">{f.note}</div>}
                    {f.next_followup_at && <div className="text-xs text-sky-300">Proximo: {fmtDate(f.next_followup_at)}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'notas' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-oc-metal border border-oc-border rounded-lg p-4 space-y-3">
            <h2 className="text-lg text-oc-red font-semibold">Agregar nota</h2>
            <textarea className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" rows={4} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Nota administrativa interna" />
            <button type="button" disabled={busy} onClick={() => void handleNote()} className="bg-oc-red text-white py-2 rounded text-sm w-full">
              Guardar nota
            </button>
          </div>
          <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
            <h2 className="text-lg text-oc-red font-semibold mb-2">Notas registradas</h2>
            {profile.notes.length === 0 ? (
              <p className="text-oc-muted text-sm">Sin notas.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-auto text-sm">
                {profile.notes.map((n) => (
                  <li key={n.id} className="bg-oc-dark border border-oc-border rounded p-2">
                    <div className="text-oc-muted text-xs">{fmtDate(n.created_at)} · {n.created_by_name} · {n.note_type}</div>
                    <div className="text-white mt-1">{n.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {reverseTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-oc-metal border border-oc-border rounded-lg p-4 max-w-md w-full space-y-3">
            <h3 className="text-white font-semibold">Revertir pago</h3>
            <p className="text-oc-muted text-sm">
              Pago de {fmtMoney(reverseTarget.amount)} del {fmtDate(reverseTarget.payment_date)}. Quedara marcado como REVERTIDO.
            </p>
            <textarea className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm" rows={3} value={reverseReason} onChange={(e) => setReverseReason(e.target.value)} placeholder="Motivo obligatorio" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setReverseTarget(null); setReverseReason('') }} className="bg-oc-panel text-white px-3 py-2 rounded text-sm">Cancelar</button>
              <button type="button" disabled={busy} onClick={() => void handleReverse()} className="bg-red-800 text-white px-3 py-2 rounded text-sm">Confirmar reversa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
