import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { runtime } from '../../config/runtime'
import { toUserMessage } from '../../services/api/errorMessages'
import { buildMemberWhatsAppHref, type MembershipWhatsAppPreset } from '../../utils/whatsapp'

const MOBILE_MAX_PX = 1023
const API_URL = runtime.apiBaseUrl

const FILTERS = [
  'todos',
  'activa',
  'proxima_a_vencer',
  'vence_hoy',
  'vencida',
  'con_adeudo',
  'suspendida',
] as const
type StatusFilter = (typeof FILTERS)[number]

interface LastPaymentSummary {
  payment_id: number
  payment_date: string
  amount: number
  payment_method: string
}

interface MembershipClientSummary {
  user_id: number
  membership_id: number
  cycle_id: number | null
  name: string
  phone?: string | null
  created_at: string
  membership_type?: string | null
  cost: number
  start_date?: string | null
  end_date?: string | null
  status: string
  total_paid: number
  pending_balance: number
  pending_balance_total?: number
  days_remaining?: number | null
  days_overdue?: number | null
  last_payment?: LastPaymentSummary | null
  is_historical_import?: boolean
  is_historical_only_member?: boolean
  historical_source?: string | null
  import_batch_id?: number | null
}

type PaymentAction =
  | 'register_only'
  | 'renew_extend'
  | 'partial_debt'
  | 'courtesy_extend'
  | 'admin_adjustment'

const PAYMENT_ACTION_LABELS: Record<PaymentAction, string> = {
  register_only: 'Registrar pago sin modificar vigencia',
  renew_extend: 'Renovar / extender membresia',
  partial_debt: 'Cubrir adeudo parcial',
  courtesy_extend: 'Cortesia con extension de vigencia',
  admin_adjustment: 'Ajuste administrativo',
}

interface MembershipSummary {
  month_income: number
  today_income: number
  month_courtesies?: number
  month_adjustments?: number
  month_adjustments_income?: number
  pending_estimate: number
  counts: {
    al_corriente: number
    por_vencer: number
    vence_hoy: number
    vencidos: number
    con_adeudo: number
    suspendidos: number
    total_socios: number
  }
  expiring_soon_days: number
  is_estimate: boolean
}

interface MembershipAlerts {
  vence_hoy: MembershipClientSummary[]
  proximos_3_dias: MembershipClientSummary[]
  vencidos: MembershipClientSummary[]
  con_adeudo: MembershipClientSummary[]
  suspendidos: MembershipClientSummary[]
}

interface MembershipCycleDetail {
  id: number
  membership_type: string
  cost: number
  start_date: string
  end_date: string
  status: string
  total_paid: number
  pending_balance: number
  is_active_cycle: boolean
}

interface MembershipPaymentDetail {
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
  extended_end_date?: string | null
  concept?: string | null
  observations?: string | null
  created_by_name?: string | null
  reversed_at?: string | null
  reversal_reason?: string | null
}

interface MembershipNoteDetail {
  id: number
  note: string
  created_at: string
  created_by_name?: string | null
}

interface MembershipClientDetail {
  user_id: number
  membership_id: number
  name: string
  phone?: string | null
  created_at: string
  active_cycle: MembershipCycleDetail | null
  historical_pending_balance?: number
  current_pending_balance?: number
  total_pending_balance?: number
  expiring_soon_days?: number
  cycles_history: MembershipCycleDetail[]
  payments: MembershipPaymentDetail[]
  notes: MembershipNoteDetail[]
}

const fmtMoney = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(value || 0)

const fmtDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-MX')
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    todos: 'Todos',
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

function daysLabel(row: MembershipClientSummary) {
  if (row.days_overdue != null && row.days_overdue > 0) {
    return `${row.days_overdue} d vencido`
  }
  if (row.days_remaining != null) {
    if (row.days_remaining === 0) return 'Hoy'
    return `${row.days_remaining} d restantes`
  }
  return '-'
}

function whatsappPresetForStatus(status: string): MembershipWhatsAppPreset {
  if (status === 'vence_hoy') return 'membresiaVenceHoy'
  if (status === 'proxima_a_vencer') return 'membresiaPorVencer'
  if (status === 'con_adeudo') return 'membresiaAdeudo'
  return 'membresiaVencida'
}

function paymentActionLabel(action?: string | null) {
  if (!action) return ''
  return PAYMENT_ACTION_LABELS[action as PaymentAction] || action
}

function inferDefaultPaymentAction(pending: number, amount: number, method: string): PaymentAction {
  if (method === 'cortesia') return 'courtesy_extend'
  if (method === 'ajuste') return 'admin_adjustment'
  if (pending > 0 && amount >= pending) return 'renew_extend'
  if (pending > 0) return 'partial_debt'
  return 'renew_extend'
}

export default function MembresiasControl() {
  const [rows, setRows] = useState<MembershipClientSummary[]>([])
  const [summary, setSummary] = useState<MembershipSummary | null>(null)
  const [alerts, setAlerts] = useState<MembershipAlerts | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [includeHistorical, setIncludeHistorical] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [detail, setDetail] = useState<MembershipClientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [cycleForm, setCycleForm] = useState({
    membership_type: 'Mensual',
    cost: '750',
    start_date: '',
    end_date: '',
    manual_status: 'activa',
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'efectivo',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_action: 'renew_extend' as PaymentAction,
    period_duration_months: '1',
    period_mode: 'duration' as 'duration' | 'custom',
    period_start: '',
    period_end: '',
    renewal_start_date: '',
    counts_as_income: false,
    concept: '',
    observations: '',
  })
  const [reverseTarget, setReverseTarget] = useState<MembershipPaymentDetail | null>(null)
  const [reverseReason, setReverseReason] = useState('')
  const [noteText, setNoteText] = useState('')

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 5000)
  }

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const response = await axios.get<MembershipSummary>(`${API_URL}/membership/admin/summary`)
      setSummary(response.data)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo cargar el resumen financiero'))
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true)
    try {
      const response = await axios.get<MembershipAlerts>(`${API_URL}/membership/admin/alerts`)
      setAlerts(response.data)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudieron cargar las alertas'))
    } finally {
      setAlertsLoading(false)
    }
  }, [])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const response = await axios.get<MembershipClientSummary[]>(`${API_URL}/membership/admin/clients`, {
        params: {
          status: statusFilter,
          search: search.trim() || undefined,
          include_historical: includeHistorical,
        },
      })
      setRows(response.data)
    } catch (error) {
      const message = toUserMessage(error, 'No se pudo cargar el control de membresias')
      setListError(message)
      showNotice('error', message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, includeHistorical])

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchRows(), fetchSummary(), fetchAlerts()])
  }, [fetchRows, fetchSummary, fetchAlerts])

  const fetchDetail = useCallback(async (userId: number) => {
    setDetailLoading(true)
    try {
      const response = await axios.get<MembershipClientDetail>(`${API_URL}/membership/admin/client/${userId}`)
      setDetail(response.data)
      const active = response.data.active_cycle
      if (active) {
        setCycleForm({
          membership_type: active.membership_type,
          cost: String(active.cost),
          start_date: active.start_date,
          end_date: active.end_date,
          manual_status: active.status,
        })
        setPaymentForm((prev) => ({
          ...prev,
          amount: active.pending_balance > 0 ? String(active.pending_balance) : String(active.cost || ''),
          payment_action: inferDefaultPaymentAction(active.pending_balance, active.pending_balance || active.cost, prev.payment_method),
          renewal_start_date: active.end_date < new Date().toISOString().slice(0, 10) ? new Date().toISOString().slice(0, 10) : '',
        }))
      } else {
        const today = new Date().toISOString().slice(0, 10)
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        setCycleForm({
          membership_type: 'Mensual',
          cost: '750',
          start_date: today,
          end_date: nextMonth.toISOString().slice(0, 10),
          manual_status: 'activa',
        })
      }
    } catch (error) {
      setDetail(null)
      showNotice('error', toUserMessage(error, 'No se pudo cargar el detalle del cliente'))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    if (selectedUserId) {
      void fetchDetail(selectedUserId)
    }
  }, [selectedUserId, fetchDetail])

  useEffect(() => {
    if (!mobileDetailOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileDetailOpen])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_MAX_PX + 1}px)`)
    const onChange = () => {
      if (mq.matches) setMobileDetailOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const activeCycle = detail?.active_cycle ?? null

  const activeCyclePayments = useMemo(() => {
    if (!detail?.payments) return []
    if (!activeCycle) return detail.payments.filter((p) => !p.reversed_at)
    return detail.payments.filter((p) => p.membership_cycle_id === activeCycle.id && !p.reversed_at)
  }, [detail?.payments, activeCycle])

  const allPaymentsHistory = useMemo(() => {
    return (detail?.payments ?? []).slice().sort((a, b) => b.payment_date.localeCompare(a.payment_date))
  }, [detail?.payments])

  const handleOpenDetail = (userId: number) => {
    setSelectedUserId(userId)
    setHistoryOpen(false)
    if (isMobileViewport()) {
      setMobileDetailOpen(true)
    }
  }

  const closeMobileDetail = () => {
    setMobileDetailOpen(false)
    setSelectedUserId(null)
    setHistoryOpen(false)
  }

  const handleMobilePickUser = (userId: string) => {
    const id = Number(userId)
    if (!Number.isFinite(id)) return
    setSelectedUserId(id)
    setHistoryOpen(false)
  }

  const handleSaveCycle = async (renew: boolean) => {
    if (!selectedUserId || busy) return
    const cost = Number(cycleForm.cost)
    if (!cycleForm.membership_type.trim() || !cycleForm.start_date || !cycleForm.end_date || !Number.isFinite(cost) || cost <= 0) {
      showNotice('error', 'Completa tipo, costo y vigencia con valores validos')
      return
    }
    if (cycleForm.end_date <= cycleForm.start_date) {
      showNotice('error', 'La fecha de vencimiento debe ser mayor a la fecha de inicio')
      return
    }

    setBusy(true)
    try {
      if (renew || !activeCycle) {
        await axios.post(`${API_URL}/membership/admin/cycle`, {
          user_id: selectedUserId,
          membership_type: cycleForm.membership_type.trim(),
          cost,
          start_date: cycleForm.start_date,
          end_date: cycleForm.end_date,
          manual_status: cycleForm.manual_status,
        })
        showNotice('success', renew ? 'Ciclo renovado correctamente' : 'Ciclo creado correctamente')
      } else {
        await axios.put(`${API_URL}/membership/admin/cycle/${activeCycle.id}`, {
          membership_type: cycleForm.membership_type.trim(),
          cost,
          start_date: cycleForm.start_date,
          end_date: cycleForm.end_date,
          manual_status: cycleForm.manual_status,
        })
        showNotice('success', 'Membresia actualizada')
      }
      await refreshAll()
      await fetchDetail(selectedUserId)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo guardar la membresia'))
    } finally {
      setBusy(false)
    }
  }

  const handleAddPayment = async () => {
    if (!activeCycle || busy) return
    const amount = Number(paymentForm.amount)
    const isCourtesy = paymentForm.payment_method === 'cortesia'
    if (!Number.isFinite(amount) || (amount <= 0 && !isCourtesy)) {
      showNotice('error', isCourtesy ? 'El monto de cortesia no puede ser negativo' : 'El monto debe ser mayor a 0')
      return
    }
    setBusy(true)
    try {
      const idempotencyKey = `pay-${activeCycle.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const paymentDate = paymentForm.payment_date
        ? new Date(`${paymentForm.payment_date}T12:00:00`).toISOString()
        : undefined
      const payload: Record<string, unknown> = {
        amount,
        payment_method: paymentForm.payment_method,
        payment_action: paymentForm.payment_action,
        payment_date: paymentDate,
        concept: paymentForm.concept || null,
        observations: paymentForm.observations || null,
        idempotency_key: idempotencyKey,
      }
      if (paymentForm.period_mode === 'custom') {
        if (paymentForm.period_start) payload.period_start = paymentForm.period_start
        if (paymentForm.period_end) payload.period_end = paymentForm.period_end
      } else if (paymentForm.period_duration_months) {
        payload.period_duration_months = Number(paymentForm.period_duration_months)
      }
      if (paymentForm.renewal_start_date) payload.renewal_start_date = paymentForm.renewal_start_date
      if (paymentForm.payment_action === 'admin_adjustment') {
        payload.counts_as_income = paymentForm.counts_as_income
        payload.applies_to_balance = paymentForm.counts_as_income
      }

      const response = await axios.post(`${API_URL}/membership/admin/cycle/${activeCycle.id}/payment`, payload)
      setPaymentForm({
        amount: '',
        payment_method: 'efectivo',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_action: 'renew_extend',
        period_duration_months: '1',
        period_mode: 'duration',
        period_start: '',
        period_end: '',
        renewal_start_date: '',
        counts_as_income: false,
        concept: '',
        observations: '',
      })
      const result = response.data as {
        new_end_date?: string
        vigencia_extended?: boolean
        status?: string
        pending_balance?: number
      }
      const vigenciaMsg = result.vigencia_extended
        ? ` Nueva vigencia: ${fmtDate(result.new_end_date)}.`
        : ''
      showNotice(
        'success',
        `Pago registrado.${vigenciaMsg} Estado: ${statusLabel(result.status || activeCycle.status)}. Saldo: ${fmtMoney(result.pending_balance ?? 0)}.`,
      )
      await refreshAll()
      if (selectedUserId) await fetchDetail(selectedUserId)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo registrar el pago'))
    } finally {
      setBusy(false)
    }
  }

  const handleReversePayment = async () => {
    if (!reverseTarget || busy) return
    if (!reverseReason.trim()) {
      showNotice('error', 'El motivo de reversa es obligatorio')
      return
    }
    if (
      !window.confirm(
        'Esta accion modificara vigencia, saldo e historial financiero del socio. El pago quedara marcado como revertido (no se elimina). ¿Deseas continuar?',
      )
    ) {
      return
    }
    setBusy(true)
    try {
      const response = await axios.post(`${API_URL}/membership/admin/payment/${reverseTarget.id}/reverse`, {
        reason: reverseReason.trim(),
      })
      const result = response.data as { new_end_date?: string; pending_balance?: number; vigencia_reverted?: boolean }
      setReverseTarget(null)
      setReverseReason('')
      showNotice(
        'success',
        `Pago revertido.${result.vigencia_reverted ? ` Vigencia restaurada a ${fmtDate(result.new_end_date)}.` : ''} Saldo: ${fmtMoney(result.pending_balance ?? 0)}.`,
      )
      await refreshAll()
      if (selectedUserId) await fetchDetail(selectedUserId)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo revertir el pago'))
    } finally {
      setBusy(false)
    }
  }

  const handleAddNote = async () => {
    if (!selectedUserId || busy) return
    if (!noteText.trim()) {
      showNotice('error', 'La nota no puede estar vacia')
      return
    }
    setBusy(true)
    try {
      await axios.post(
        `${API_URL}/membership/admin/client/${selectedUserId}/note`,
        { note: noteText.trim() },
        { params: { cycle_id: activeCycle?.id || undefined } },
      )
      setNoteText('')
      showNotice('success', 'Nota guardada')
      if (selectedUserId) await fetchDetail(selectedUserId)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo guardar la nota'))
    } finally {
      setBusy(false)
    }
  }

  const handleSuspend = async () => {
    if (!selectedUserId || busy) return
    setBusy(true)
    try {
      await axios.put(`${API_URL}/membership/${selectedUserId}/deactivate`)
      showNotice('success', 'Membresia suspendida')
      await refreshAll()
      await fetchDetail(selectedUserId)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo suspender la membresia'))
    } finally {
      setBusy(false)
    }
  }

  const handleUnsuspend = async () => {
    if (!activeCycle || busy) return
    setBusy(true)
    try {
      await axios.put(`${API_URL}/membership/cycle/${activeCycle.id}/unsuspend`)
      showNotice('success', 'Suspension levantada')
      await refreshAll()
      if (selectedUserId) await fetchDetail(selectedUserId)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo reactivar el ciclo'))
    } finally {
      setBusy(false)
    }
  }

  const renderAlertGroup = (title: string, items: MembershipClientSummary[], emptyText: string) => (
    <div className="bg-oc-dark rounded border border-oc-border p-3 space-y-2">
      <h3 className="text-white font-semibold text-sm">
        {title} <span className="text-oc-muted font-normal">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-oc-muted text-xs">{emptyText}</p>
      ) : (
        <ul className="space-y-2 max-h-40 overflow-auto">
          {items.map((item) => {
            const waHref = buildMemberWhatsAppHref(item.phone, whatsappPresetForStatus(item.status))
            return (
              <li key={item.user_id} className="bg-oc-metal rounded border border-oc-border p-2 text-xs">
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-oc-muted">
                  {item.membership_type || 'Sin plan'} · vence {fmtDate(item.end_date)} · {statusLabel(item.status)}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item.user_id)}
                    className="bg-oc-panel text-white px-2 py-1 rounded"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item.user_id)}
                    className="bg-oc-red text-white px-2 py-1 rounded"
                  >
                    Pago
                  </button>
                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-800 text-white px-2 py-1 rounded"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <span className="text-oc-muted px-1 py-1">Sin telefono</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  const renderPaymentHistory = () => (
    <div className="bg-oc-dark rounded border border-oc-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-white font-semibold">Historial de pagos</h3>
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="text-xs bg-oc-panel text-white px-2 py-1 rounded"
        >
          {historyOpen ? 'Ocultar' : 'Ver todo'}
        </button>
      </div>
      <div className="max-h-48 overflow-auto text-sm space-y-1">
        {(historyOpen ? allPaymentsHistory : activeCyclePayments).length === 0 ? (
          <p className="text-oc-muted text-xs">Sin pagos registrados.</p>
        ) : (
          (historyOpen ? allPaymentsHistory : activeCyclePayments).map((payment) => (
            <div
              key={payment.id}
              className={`p-2 rounded border ${
                payment.reversed_at
                  ? 'bg-oc-panel/50 border-red-900/40 opacity-80 line-through decoration-red-400/50'
                  : 'bg-oc-metal border-oc-border'
              }`}
            >
              <div className={`text-white flex flex-wrap items-center gap-2 ${payment.reversed_at ? 'line-through' : ''}`}>
                <span>
                  {fmtMoney(payment.amount)} · {payment.payment_method}
                  {payment.reversed_at ? ' (revertido)' : ''}
                </span>
                {payment.payment_method === 'cortesia' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200">Cortesia</span>
                )}
                {payment.payment_method === 'ajuste' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/50 text-sky-200">Ajuste</span>
                )}
                {payment.counts_as_income === false && payment.payment_method !== 'cortesia' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-200">Sin ingreso</span>
                )}
              </div>
              <div className="text-oc-muted text-xs">
                {fmtDate(payment.payment_date)} · {payment.created_by_name || 'sistema'}
              </div>
              {payment.payment_action && (
                <div className="text-oc-light/90 text-xs">{paymentActionLabel(payment.payment_action)}</div>
              )}
              {(payment.period_start_date || payment.period_end_date) && (
                <div className="text-oc-light/90 text-xs">
                  Periodo: {fmtDate(payment.period_start_date)} - {fmtDate(payment.period_end_date)}
                </div>
              )}
              {payment.extended_end_date && !payment.reversed_at && (
                <div className="text-emerald-300/90 text-xs">Vigencia extendida a {fmtDate(payment.extended_end_date)}</div>
              )}
              {payment.concept && <div className="text-oc-light/90 text-xs">Nota periodo: {payment.concept}</div>}
              {payment.observations && <div className="text-oc-light/90 text-xs">{payment.observations}</div>}
              {payment.reversed_at && (
                <div className="text-red-300 text-xs font-medium no-underline" style={{ textDecoration: 'none' }}>
                  ANULADO / REVERTIDO — sigue visible en historial para auditoria
                </div>
              )}
              {payment.reversal_reason && (
                <div className="text-red-300/90 text-xs no-underline" style={{ textDecoration: 'none' }}>
                  Motivo reversa: {payment.reversal_reason}
                </div>
              )}
              {!payment.reversed_at && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReverseTarget(payment)
                    setReverseReason('')
                  }}
                  className="mt-2 text-xs bg-red-900/60 text-red-100 px-2 py-1 rounded"
                >
                  Revertir pago
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderDetailInner = () => (
    <>
      {detailLoading && <p className="text-oc-muted">Cargando detalle...</p>}
      {!detailLoading && detail && (
        <>
          <div className="bg-oc-dark rounded border border-oc-border p-3 text-sm grid grid-cols-2 gap-2">
            <div className="text-oc-muted">Nombre</div>
            <div className="text-white">{detail.name}</div>
            <div className="text-oc-muted">Telefono</div>
            <div className="text-white">{detail.phone || '-'}</div>
            <div className="text-oc-muted">Plan</div>
            <div className="text-white">{activeCycle?.membership_type || '-'}</div>
            <div className="text-oc-muted">Monto del plan</div>
            <div className="text-white">{fmtMoney(activeCycle?.cost || 0)}</div>
            <div className="text-oc-muted">Total abonado</div>
            <div className="text-white">{fmtMoney(activeCycle?.total_paid || 0)}</div>
            <div className="text-oc-muted">Saldo pendiente</div>
            <div className="text-white">{fmtMoney(activeCycle?.pending_balance || 0)}</div>
            <div className="text-oc-muted">Adeudo total</div>
            <div className="text-white">{fmtMoney(detail.total_pending_balance || 0)}</div>
            <div className="text-oc-muted">Vencimiento</div>
            <div className="text-white">{fmtDate(activeCycle?.end_date)}</div>
            <div className="text-oc-muted">Estatus</div>
            <div>
              <span className={`px-2 py-0.5 rounded text-xs ${statusBadgeClass(activeCycle?.status || 'vencida')}`}>
                {statusLabel(activeCycle?.status || 'vencida')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeCycle?.status === 'suspendida' ? (
              <button disabled={busy} onClick={() => void handleUnsuspend()} className="bg-emerald-800 text-white px-3 py-2 rounded text-sm">
                Levantar suspension
              </button>
            ) : (
              <button disabled={busy || !activeCycle} onClick={() => void handleSuspend()} className="bg-zinc-700 text-white px-3 py-2 rounded text-sm">
                Suspender
              </button>
            )}
          </div>

          <div className="bg-oc-dark rounded border border-oc-border p-3 space-y-2">
            <h3 className="text-white font-semibold">Editar / renovar membresia</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={cycleForm.membership_type}
                onChange={(e) => setCycleForm((p) => ({ ...p, membership_type: e.target.value }))}
                placeholder="Tipo de membresia"
              />
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={cycleForm.cost}
                onChange={(e) => setCycleForm((p) => ({ ...p, cost: e.target.value }))}
                placeholder="Costo"
                type="number"
                min={1}
              />
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={cycleForm.start_date}
                onChange={(e) => setCycleForm((p) => ({ ...p, start_date: e.target.value }))}
                type="date"
              />
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={cycleForm.end_date}
                onChange={(e) => setCycleForm((p) => ({ ...p, end_date: e.target.value }))}
                type="date"
              />
            </div>
            <select
              className="w-full bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
              value={cycleForm.manual_status}
              onChange={(e) => setCycleForm((p) => ({ ...p, manual_status: e.target.value }))}
            >
              <option value="activa">Al corriente</option>
              <option value="proxima_a_vencer">Por vencer</option>
              <option value="vence_hoy">Vence hoy</option>
              <option value="vencida">Vencido</option>
              <option value="con_adeudo">Con adeudo</option>
              <option value="suspendida">Suspendido</option>
            </select>
            <div className="flex gap-2 flex-wrap">
              <button disabled={busy} onClick={() => void handleSaveCycle(false)} className="bg-oc-panel text-white px-3 py-2 rounded">
                Guardar cambios
              </button>
              <button disabled={busy} onClick={() => void handleSaveCycle(true)} className="bg-oc-red text-white px-3 py-2 rounded">
                Renovar ciclo
              </button>
            </div>
          </div>

          <div className="bg-oc-dark rounded border border-oc-border p-3 space-y-2">
            <h3 className="text-white font-semibold">Registrar pago manual</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={paymentForm.amount}
                onChange={(e) => {
                  const amount = e.target.value
                  setPaymentForm((p) => ({
                    ...p,
                    amount,
                    payment_action:
                      p.payment_action === 'register_only' || p.payment_action === 'admin_adjustment' || p.payment_action === 'courtesy_extend'
                        ? p.payment_action
                        : inferDefaultPaymentAction(activeCycle?.pending_balance ?? 0, Number(amount) || 0, p.payment_method),
                  }))
                }}
                placeholder="Monto pagado"
                type="number"
                min={0}
              />
              <select
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={paymentForm.payment_method}
                onChange={(e) => {
                  const payment_method = e.target.value
                  setPaymentForm((p) => ({
                    ...p,
                    payment_method,
                    payment_action: inferDefaultPaymentAction(
                      activeCycle?.pending_balance ?? 0,
                      Number(p.amount) || 0,
                      payment_method,
                    ),
                  }))
                }}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta_terminal">Tarjeta terminal</option>
                <option value="cortesia">Cortesia</option>
                <option value="ajuste">Ajuste administrativo</option>
                <option value="otro">Otro</option>
              </select>
              <select
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.payment_action}
                onChange={(e) => setPaymentForm((p) => ({ ...p, payment_action: e.target.value as PaymentAction }))}
              >
                {(Object.keys(PAYMENT_ACTION_LABELS) as PaymentAction[]).map((action) => (
                  <option key={action} value={action}>
                    {PAYMENT_ACTION_LABELS[action]}
                  </option>
                ))}
              </select>
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm((p) => ({ ...p, payment_date: e.target.value }))}
                type="date"
              />
              <select
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.period_mode}
                onChange={(e) => setPaymentForm((p) => ({ ...p, period_mode: e.target.value as 'duration' | 'custom' }))}
              >
                <option value="duration">Duracion del periodo</option>
                <option value="custom">Periodo personalizado (inicio / fin)</option>
              </select>
              {paymentForm.period_mode === 'duration' ? (
                <select
                  className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                  value={paymentForm.period_duration_months}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, period_duration_months: e.target.value }))}
                >
                  <option value="1">1 mes</option>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                </select>
              ) : (
                <>
                  <input
                    className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                    value={paymentForm.period_start}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, period_start: e.target.value }))}
                    type="date"
                    placeholder="Inicio periodo"
                  />
                  <input
                    className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                    value={paymentForm.period_end}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, period_end: e.target.value }))}
                    type="date"
                    placeholder="Fin periodo"
                  />
                </>
              )}
              {activeCycle && activeCycle.end_date < new Date().toISOString().slice(0, 10) && (
                <input
                  className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                  value={paymentForm.renewal_start_date}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, renewal_start_date: e.target.value }))}
                  type="date"
                  placeholder="Inicio de renovacion (socio vencido)"
                />
              )}
              {paymentForm.payment_action === 'admin_adjustment' && (
                <label className="col-span-2 flex items-center gap-2 text-sm text-oc-light/90">
                  <input
                    type="checkbox"
                    checked={paymentForm.counts_as_income}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, counts_as_income: e.target.checked }))}
                  />
                  Contar como ingreso real
                </label>
              )}
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.concept}
                onChange={(e) => setPaymentForm((p) => ({ ...p, concept: e.target.value }))}
                placeholder="Referencia o nota del periodo (opcional)"
              />
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.observations}
                onChange={(e) => setPaymentForm((p) => ({ ...p, observations: e.target.value }))}
                placeholder="Observaciones internas (opcional)"
              />
            </div>
            {activeCycle && (
              <p className="text-xs text-oc-muted">
                Vencimiento actual: {fmtDate(activeCycle.end_date)} · Saldo pendiente: {fmtMoney(activeCycle.pending_balance)}
              </p>
            )}
            <button disabled={busy || !activeCycle} onClick={() => void handleAddPayment()} className="bg-oc-red text-white px-3 py-2 rounded">
              Registrar pago
            </button>
          </div>

          {reverseTarget && (
            <div className="bg-red-950/30 border border-red-800 rounded p-3 space-y-2">
              <h3 className="text-white font-semibold text-sm">Revertir pago</h3>
              <p className="text-oc-light/90 text-xs">
                Pago de {fmtMoney(reverseTarget.amount)} del {fmtDate(reverseTarget.payment_date)}. Esta accion modificara vigencia,
                saldo e historial financiero. El registro permanecera visible como revertido.
              </p>
              <p className="text-amber-200/90 text-xs">
                Solo puedes revertir en orden inverso: primero el pago mas reciente del ciclo.
              </p>
              <textarea
                className="w-full bg-oc-metal border border-oc-border rounded px-2 py-2 text-white text-sm"
                rows={2}
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder="Motivo obligatorio de la reversa"
              />
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => void handleReversePayment()} className="bg-red-700 text-white px-3 py-2 rounded text-sm">
                  Confirmar reversa
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReverseTarget(null)
                    setReverseReason('')
                  }}
                  className="bg-oc-panel text-white px-3 py-2 rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {renderPaymentHistory()}

          <div className="bg-oc-dark rounded border border-oc-border p-3 space-y-2">
            <h3 className="text-white font-semibold">Notas administrativas</h3>
            <textarea
              className="w-full bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escribe una nota interna del cliente"
            />
            <button disabled={busy} onClick={() => void handleAddNote()} className="bg-oc-red text-white px-3 py-2 rounded">
              Agregar nota
            </button>
            <div className="max-h-36 overflow-auto text-sm space-y-1">
              {detail.notes.length === 0 ? (
                <p className="text-oc-muted text-xs">Sin notas.</p>
              ) : (
                detail.notes.map((note) => (
                  <div key={note.id} className="bg-oc-metal p-2 rounded border border-oc-border">
                    <div className="text-oc-light/90">{note.note}</div>
                    <div className="text-oc-muted text-xs">
                      {fmtDate(note.created_at)} - {note.created_by_name || 'sistema'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-oc-dark rounded border border-oc-border p-3">
            <h3 className="text-white font-semibold mb-2">Historial de ciclos</h3>
            <div className="text-sm space-y-1 max-h-40 overflow-auto">
              {detail.cycles_history.map((cycle) => (
                <div key={cycle.id} className="bg-oc-metal p-2 rounded border border-oc-border text-oc-light/90">
                  {cycle.membership_type} | {fmtDate(cycle.start_date)} - {fmtDate(cycle.end_date)} | {fmtMoney(cycle.cost)} |{' '}
                  {statusLabel(cycle.status)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <div className="px-4 space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Control de pagos y membresias</h1>
          <p className="text-oc-muted mt-1">Operacion interna: vigencias, adeudos, pagos manuales y alertas de vencimiento</p>
        </div>
        <Link to="/app/admin/recordatorios" className="text-sm text-oc-red hover:underline">
          Centro de recordatorios
        </Link>
        <Link to="/app/admin/importar-pagos" className="text-sm text-oc-red hover:underline">
          Importar pagos históricos
        </Link>
      </div>

      {notice && (
        <div
          className={`rounded border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'bg-emerald-900/30 border-emerald-700 text-emerald-100'
              : 'bg-red-900/30 border-red-700 text-red-100'
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {summaryLoading ? (
          <p className="text-oc-muted col-span-full">Cargando resumen...</p>
        ) : summary ? (
          <>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Ingresos reales del mes</div>
              <div className="text-white text-xl font-semibold">{fmtMoney(summary.month_income)}</div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Pagos recibidos hoy</div>
              <div className="text-white text-xl font-semibold">{fmtMoney(summary.today_income)}</div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Cortesias del mes</div>
              <div className="text-purple-200 text-xl font-semibold">{fmtMoney(summary.month_courtesies ?? 0)}</div>
              <div className="text-oc-muted text-[10px] mt-1">No suman a ingreso real</div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Ajustes del mes</div>
              <div className="text-sky-200 text-xl font-semibold">{fmtMoney(summary.month_adjustments ?? 0)}</div>
              <div className="text-oc-muted text-[10px] mt-1">
                Ingreso por ajustes: {fmtMoney(summary.month_adjustments_income ?? 0)}
              </div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Pendiente estimado</div>
              <div className="text-white text-xl font-semibold">{fmtMoney(summary.pending_estimate)}</div>
              {summary.is_estimate && <div className="text-oc-muted text-[10px] mt-1">Estimado segun saldos registrados</div>}
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4 text-sm space-y-1 sm:col-span-2 xl:col-span-5">
              <div className="text-oc-muted text-xs mb-1">Socios por estatus</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white">
                <span>Al corriente: {summary.counts.al_corriente}</span>
                <span>Por vencer: {summary.counts.por_vencer}</span>
                <span>Vence hoy: {summary.counts.vence_hoy}</span>
                <span>Vencidos: {summary.counts.vencidos}</span>
                <span>Con adeudo: {summary.counts.con_adeudo}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-oc-muted col-span-full">Resumen no disponible.</p>
        )}
      </section>

      <section className="bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-3">
        <h2 className="text-xl text-oc-red font-semibold">Alertas internas</h2>
        <p className="text-oc-muted text-sm">Recordatorios para el administrador. WhatsApp es manual, no automatico.</p>
        {alertsLoading ? (
          <p className="text-oc-muted">Cargando alertas...</p>
        ) : alerts ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {renderAlertGroup('Vencen hoy', alerts.vence_hoy, 'Nadie vence hoy.')}
            {renderAlertGroup(
              `Proximos ${summary?.expiring_soon_days ?? 3} dias`,
              alerts.proximos_3_dias,
              'Sin vencimientos proximos.',
            )}
            {renderAlertGroup('Vencidos', alerts.vencidos, 'Sin socios vencidos.')}
            {renderAlertGroup('Con adeudo', alerts.con_adeudo, 'Sin adeudos pendientes.')}
            {renderAlertGroup('Suspendidos', alerts.suspendidos, 'Sin suspensiones activas.')}
          </div>
        ) : (
          <p className="text-oc-muted">Alertas no disponibles.</p>
        )}
      </section>

      <div className="bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded text-sm ${statusFilter === filter ? 'bg-oc-red text-white' : 'bg-oc-panel text-oc-light/90'}`}
            >
              {statusLabel(filter)}
            </button>
          ))}
          <label className="flex items-center gap-2 text-sm text-oc-light/90 ml-2">
            <input
              type="checkbox"
              checked={includeHistorical}
              onChange={(e) => setIncludeHistorical(e.target.checked)}
              className="accent-oc-red"
            />
            Incluir históricos importados
          </label>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void fetchRows()
            }}
            placeholder="Buscar por nombre o telefono"
            className="flex-1 bg-oc-dark border border-oc-border rounded px-3 py-2 text-white"
          />
          <button type="button" onClick={() => void fetchRows()} className="bg-oc-red text-white px-4 py-2 rounded">
            Buscar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-oc-metal p-4 rounded-lg border border-oc-red/20">
          <h2 className="text-xl text-oc-red font-semibold mb-3">Socios y membresias</h2>
          {loading ? (
            <p className="text-oc-muted">Cargando...</p>
          ) : listError ? (
            <p className="text-red-300">{listError}</p>
          ) : rows.length === 0 ? (
            <p className="text-oc-muted">No hay socios con este filtro.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-oc-light/90 border-b border-oc-border">
                    <th className="text-left py-2">Socio</th>
                    <th className="text-left py-2">Plan</th>
                    <th className="text-left py-2">Monto</th>
                    <th className="text-left py-2">Vence</th>
                    <th className="text-left py-2">Dias</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Ultimo pago</th>
                    <th className="text-left py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.user_id} className="border-b border-oc-border/50">
                      <td className="py-2 text-white">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{row.name}</span>
                          {row.is_historical_import && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-700/50">
                              Histórico importado
                            </span>
                          )}
                        </div>
                        {row.phone && <div className="text-oc-muted text-xs">{row.phone}</div>}
                      </td>
                      <td className="py-2 text-oc-light/90">{row.membership_type || '-'}</td>
                      <td className="py-2 text-oc-light/90">{fmtMoney(row.cost)}</td>
                      <td className="py-2 text-oc-light/90">{fmtDate(row.end_date)}</td>
                      <td className="py-2 text-oc-light/90">{daysLabel(row)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${statusBadgeClass(row.status)}`}>{statusLabel(row.status)}</span>
                      </td>
                      <td className="py-2 text-oc-light/90 text-xs">
                        {row.last_payment ? (
                          <>
                            <div>{fmtMoney(row.last_payment.amount)}</div>
                            <div className="text-oc-muted">{fmtDate(row.last_payment.payment_date)}</div>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          <Link to={`/app/admin/socios/${row.user_id}`} className="bg-oc-red text-white px-2 py-1 rounded text-xs">
                            Ver socio
                          </Link>
                          <button type="button" onClick={() => handleOpenDetail(row.user_id)} className="bg-oc-panel text-white px-2 py-1 rounded text-xs">
                            Panel rapido
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenDetail(row.user_id)
                              setHistoryOpen(true)
                            }}
                            className="bg-oc-panel text-white px-2 py-1 rounded text-xs"
                          >
                            Historial
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="hidden lg:block bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-4">
          <h2 className="text-xl text-oc-red font-semibold">Detalle del socio</h2>
          {!selectedUserId && <p className="text-oc-muted">Selecciona un socio para ver su ficha, registrar pago o agregar nota.</p>}
          {selectedUserId ? renderDetailInner() : null}
        </div>
      </div>

      {mobileDetailOpen && selectedUserId ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-oc-dark lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de membresia"
        >
          <div className="shrink-0 border-b border-oc-border bg-oc-metal px-3 py-3 space-y-2">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={closeMobileDetail}
                className="shrink-0 rounded border border-oc-border px-3 py-2 text-sm text-white hover:bg-oc-panel"
              >
                Cerrar
              </button>
              <label className="min-w-0 flex-1 text-xs text-oc-muted">
                <span className="mb-1 block text-oc-light/90">Cambiar alumno</span>
                <select
                  className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-sm text-white"
                  value={String(selectedUserId)}
                  onChange={(e) => handleMobilePickUser(e.target.value)}
                >
                  {!rows.some((r) => r.user_id === selectedUserId) && detail?.user_id === selectedUserId ? (
                    <option value={detail.user_id}>
                      {detail.name} — {statusLabel(detail.active_cycle?.status || 'activa')} (listado filtrado)
                    </option>
                  ) : null}
                  {rows.map((row) => (
                    <option key={row.user_id} value={row.user_id}>
                      {row.name} — {statusLabel(row.status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 pb-8">
            <div className="bg-oc-metal rounded-lg border border-oc-red/20 p-4 space-y-4">
              <h2 className="text-xl text-oc-red font-semibold">Detalle del socio</h2>
              {renderDetailInner()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
