import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { runtime } from '../../config/runtime'
import { toUserMessage } from '../../services/api/errorMessages'

const MOBILE_MAX_PX = 1023

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches
}

const API_URL = runtime.apiBaseUrl
const FILTERS = ['todos', 'activa', 'proxima_a_vencer', 'vencida', 'con_adeudo', 'suspendida'] as const
type StatusFilter = (typeof FILTERS)[number]

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
  payment_date: string
  amount: number
  payment_method: string
  concept?: string | null
  observations?: string | null
  created_by_name?: string | null
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

function statusLabel(status: string) {
  const map: Record<string, string> = {
    activa: 'Activa',
    proxima_a_vencer: 'Proxima a vencer',
    vencida: 'Vencida',
    con_adeudo: 'Con adeudo',
    suspendida: 'Suspendida',
  }
  return map[status] || status
}

export default function MembresiasControl() {
  const [rows, setRows] = useState<MembershipClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [detail, setDetail] = useState<MembershipClientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [cycleForm, setCycleForm] = useState({ membership_type: 'Mensual', cost: '750', start_date: '', end_date: '', manual_status: 'activa' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_method: 'efectivo', concept: '', observations: '' })
  const [noteText, setNoteText] = useState('')

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get<MembershipClientSummary[]>(`${API_URL}/membership/admin/clients`, {
        params: { status: statusFilter, search: search.trim() || undefined },
      })
      setRows(response.data)
    } catch (error) {
      alert(toUserMessage(error, 'No se pudo cargar el control de membresias'))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

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
      alert(toUserMessage(error, 'No se pudo cargar el detalle del cliente'))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

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
  const filteredPayments = useMemo(() => {
    if (!activeCycle) return detail?.payments ?? []
    return (detail?.payments ?? []).filter((payment) => payment && activeCycle && payment.id > 0)
  }, [detail?.payments, activeCycle])

  const handleOpenDetail = (userId: number) => {
    setSelectedUserId(userId)
    if (isMobileViewport()) {
      setMobileDetailOpen(true)
    }
  }

  const closeMobileDetail = () => {
    setMobileDetailOpen(false)
    setSelectedUserId(null)
  }

  const handleMobilePickUser = (userId: string) => {
    const id = Number(userId)
    if (!Number.isFinite(id)) return
    setSelectedUserId(id)
  }

  const handleSaveCycle = async (renew: boolean) => {
    if (!selectedUserId || busy) return
    const cost = Number(cycleForm.cost)
    if (!cycleForm.membership_type.trim() || !cycleForm.start_date || !cycleForm.end_date || !Number.isFinite(cost) || cost <= 0) {
      alert('Completa tipo, costo y vigencia con valores validos')
      return
    }
    if (cycleForm.end_date <= cycleForm.start_date) {
      alert('La fecha de vencimiento debe ser mayor a la fecha de inicio')
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
      } else {
        await axios.put(`${API_URL}/membership/admin/cycle/${activeCycle.id}`, {
          membership_type: cycleForm.membership_type.trim(),
          cost,
          start_date: cycleForm.start_date,
          end_date: cycleForm.end_date,
          manual_status: cycleForm.manual_status,
        })
      }
      await fetchRows()
      await fetchDetail(selectedUserId)
    } catch (error) {
      alert(toUserMessage(error, 'No se pudo guardar la membresia'))
    } finally {
      setBusy(false)
    }
  }

  const handleAddPayment = async () => {
    if (!activeCycle || busy) return
    const amount = Number(paymentForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    setBusy(true)
    try {
      const idempotencyKey = `pay-${activeCycle.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      await axios.post(`${API_URL}/membership/admin/cycle/${activeCycle.id}/payment`, {
        amount,
        payment_method: paymentForm.payment_method,
        concept: paymentForm.concept || null,
        observations: paymentForm.observations || null,
        idempotency_key: idempotencyKey,
      })
      setPaymentForm({ amount: '', payment_method: 'efectivo', concept: '', observations: '' })
      await fetchRows()
      if (selectedUserId) await fetchDetail(selectedUserId)
    } catch (error) {
      alert(toUserMessage(error, 'No se pudo registrar el pago'))
    } finally {
      setBusy(false)
    }
  }

  const handleAddNote = async () => {
    if (!selectedUserId || busy) return
    if (!noteText.trim()) {
      alert('La nota no puede estar vacia')
      return
    }
    setBusy(true)
    try {
      await axios.post(`${API_URL}/membership/admin/client/${selectedUserId}/note`, { note: noteText.trim() }, {
        params: { cycle_id: activeCycle?.id || undefined },
      })
      setNoteText('')
      if (selectedUserId) await fetchDetail(selectedUserId)
    } catch (error) {
      alert(toUserMessage(error, 'No se pudo guardar la nota'))
    } finally {
      setBusy(false)
    }
  }

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
            <div className="text-oc-muted">Costo total</div>
            <div className="text-white">{fmtMoney(activeCycle?.cost || 0)}</div>
            <div className="text-oc-muted">Total abonado</div>
            <div className="text-white">{fmtMoney(activeCycle?.total_paid || 0)}</div>
            <div className="text-oc-muted">Saldo pendiente</div>
            <div className="text-white">{fmtMoney(activeCycle?.pending_balance || 0)}</div>
            <div className="text-oc-muted">Adeudo historico</div>
            <div className="text-white">{fmtMoney(detail.historical_pending_balance || 0)}</div>
            <div className="text-oc-muted">Adeudo total</div>
            <div className="text-white">{fmtMoney(detail.total_pending_balance || 0)}</div>
            <div className="text-oc-muted">Estatus</div>
            <div className="text-white">{statusLabel(activeCycle?.status || 'vencida')}</div>
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
              <option value="activa">Activa</option>
              <option value="proxima_a_vencer">Proxima a vencer</option>
              <option value="vencida">Vencida</option>
              <option value="con_adeudo">Con adeudo</option>
              <option value="suspendida">Suspendida</option>
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
            <h3 className="text-white font-semibold">Registrar pago / abono</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="Monto"
                type="number"
                min={1}
              />
              <select
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white"
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="otro">Otro</option>
              </select>
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.concept}
                onChange={(e) => setPaymentForm((p) => ({ ...p, concept: e.target.value }))}
                placeholder="Concepto o periodo cubierto"
              />
              <input
                className="bg-oc-metal border border-oc-border rounded px-2 py-2 text-white col-span-2"
                value={paymentForm.observations}
                onChange={(e) => setPaymentForm((p) => ({ ...p, observations: e.target.value }))}
                placeholder="Observaciones (opcional)"
              />
            </div>
            <button disabled={busy || !activeCycle} onClick={() => void handleAddPayment()} className="bg-oc-red text-white px-3 py-2 rounded">
              Registrar pago
            </button>
            <div className="max-h-36 overflow-auto text-sm space-y-1">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="bg-oc-metal p-2 rounded border border-oc-border">
                  <div className="text-white">
                    {fmtMoney(payment.amount)} - {payment.payment_method}
                  </div>
                  <div className="text-oc-muted text-xs">
                    {fmtDate(payment.payment_date)} - {payment.created_by_name || 'sistema'}
                  </div>
                  {payment.observations && <div className="text-oc-light/90 text-xs">{payment.observations}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-oc-dark rounded border border-oc-border p-3 space-y-2">
            <h3 className="text-white font-semibold">Notas internas</h3>
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
              {detail.notes.map((note) => (
                <div key={note.id} className="bg-oc-metal p-2 rounded border border-oc-border">
                  <div className="text-oc-light/90">{note.note}</div>
                  <div className="text-oc-muted text-xs">
                    {fmtDate(note.created_at)} - {note.created_by_name || 'sistema'}
                  </div>
                </div>
              ))}
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
    <div className="px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Control de membresias</h1>
        <p className="text-oc-muted mt-1">Clientes, vigencias, pagos parciales, adeudos y notas internas</p>
      </div>

      <div className="bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded text-sm ${statusFilter === filter ? 'bg-oc-red text-white' : 'bg-oc-panel text-oc-light/90'}`}
            >
              {statusLabel(filter)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o telefono"
            className="flex-1 bg-oc-dark border border-oc-border rounded px-3 py-2 text-white"
          />
          <button onClick={() => void fetchRows()} className="bg-oc-red text-white px-4 py-2 rounded">
            Buscar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-oc-metal p-4 rounded-lg border border-oc-red/20">
          <h2 className="text-xl text-oc-red font-semibold mb-3">Listado de clientes</h2>
          {loading ? (
            <p className="text-oc-muted">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-oc-light/90 border-b border-oc-border">
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Plan</th>
                    <th className="text-left py-2">Vence</th>
                    <th className="text-left py-2">Saldo</th>
                    <th className="text-left py-2">Estatus</th>
                    <th className="text-left py-2">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.user_id} className="border-b border-oc-border/50">
                      <td className="py-2 text-white">{row.name}</td>
                      <td className="py-2 text-oc-light/90">{row.membership_type || '-'}</td>
                      <td className="py-2 text-oc-light/90">{fmtDate(row.end_date)}</td>
                      <td className="py-2 text-oc-light/90">{fmtMoney(row.pending_balance)}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded bg-oc-panel text-oc-light/90">{statusLabel(row.status)}</span>
                      </td>
                      <td className="py-2">
                        <button type="button" onClick={() => handleOpenDetail(row.user_id)} className="bg-oc-red text-white px-2 py-1 rounded">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="hidden lg:block bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-4">
          <h2 className="text-xl text-oc-red font-semibold">Detalle del cliente</h2>
          {!selectedUserId && <p className="text-oc-muted">Selecciona un cliente para ver su ficha.</p>}
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
              <h2 className="text-xl text-oc-red font-semibold">Detalle del cliente</h2>
              {renderDetailInner()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
