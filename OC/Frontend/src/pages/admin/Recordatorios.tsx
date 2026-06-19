import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { runtime } from '../../config/runtime'
import { toUserMessage } from '../../services/api/errorMessages'
import { buildMemberWhatsAppHref, whatsappPresetForInboxItem } from '../../utils/whatsapp'

const API_URL = runtime.apiBaseUrl

const FILTERS = [
  'todos',
  'por_vencer',
  'vence_hoy',
  'vencidos',
  'adeudo',
  'seguimiento_pendiente',
  'contactados',
  'sin_respuesta',
  'renovados',
  'descartados',
  'seguimientos_atrasados',
] as const
type InboxFilter = (typeof FILTERS)[number]

interface FollowUpSummary {
  pendientes_hoy: number
  vence_hoy: number
  vencidos: number
  con_adeudo: number
  contactados_hoy: number
  renovados_despues_seguimiento: number
  seguimientos_atrasados: number
  total_bandeja: number
}

interface InboxItem {
  user_id: number
  cycle_id: number | null
  name: string
  phone?: string | null
  membership_type?: string | null
  status: string
  end_date?: string | null
  days_remaining?: number | null
  days_overdue?: number | null
  pending_balance: number
  pending_balance_total?: number
  last_payment?: { amount: number; payment_date: string } | null
  priority_category: string
  priority_rank: number
  recommended_action: string
  contacted_recently: boolean
  followup_status?: string | null
  next_followup_at?: string | null
  last_followup?: { note?: string | null; status: string; updated_at?: string } | null
}

interface FollowUpHistory {
  id: number
  status: string
  channel: string
  followup_type: string
  note?: string | null
  contact_at?: string | null
  next_followup_at?: string | null
  created_at: string
  created_by_name?: string | null
}

const fmtMoney = (v: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v || 0)
const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('es-MX') : '-')

const FILTER_LABELS: Record<InboxFilter, string> = {
  todos: 'Todos',
  por_vencer: 'Por vencer',
  vence_hoy: 'Vence hoy',
  vencidos: 'Vencidos',
  adeudo: 'Con adeudo',
  seguimiento_pendiente: 'Seguimiento pendiente',
  contactados: 'Contactados',
  sin_respuesta: 'Sin respuesta',
  renovados: 'Renovados',
  descartados: 'Descartados',
  seguimientos_atrasados: 'Seguimientos atrasados',
}

const PRIORITY_LABELS: Record<string, string> = {
  vencidos_con_adeudo: 'Vencido + adeudo',
  vence_hoy: 'Vence hoy',
  vencidos_sin_contacto: 'Vencido sin contacto',
  por_vencer: 'Por vencer',
  seguimientos_atrasados: 'Seguimiento atrasado',
  seguimientos_hoy: 'Seguimiento hoy',
  suspendidos_con_adeudo: 'Suspendido + adeudo',
}

function priorityBadge(category: string) {
  const map: Record<string, string> = {
    vencidos_con_adeudo: 'bg-red-900/60 text-red-100',
    vence_hoy: 'bg-orange-900/60 text-orange-100',
    vencidos_sin_contacto: 'bg-rose-900/50 text-rose-100',
    por_vencer: 'bg-amber-900/50 text-amber-100',
    seguimientos_atrasados: 'bg-purple-900/50 text-purple-100',
    seguimientos_hoy: 'bg-sky-900/50 text-sky-100',
    suspendidos_con_adeudo: 'bg-zinc-700 text-zinc-200',
  }
  return map[category] || 'bg-oc-panel text-oc-light/90'
}

export default function Recordatorios() {
  const [summary, setSummary] = useState<FollowUpSummary | null>(null)
  const [rows, setRows] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<InboxFilter>('todos')
  const [includeHistorical, setIncludeHistorical] = useState(false)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selected, setSelected] = useState<InboxItem | null>(null)
  const [history, setHistory] = useState<FollowUpHistory[]>([])
  const [panelNote, setPanelNote] = useState('')
  const [nextFollowupDate, setNextFollowupDate] = useState('')

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 5000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, inboxRes] = await Promise.all([
        axios.get<FollowUpSummary>(`${API_URL}/membership/admin/followups/summary`, {
          params: { include_historical: includeHistorical },
        }),
        axios.get<InboxItem[]>(`${API_URL}/membership/admin/followups`, {
          params: {
            status: filter,
            search: search.trim() || undefined,
            include_historical: includeHistorical,
          },
        }),
      ])
      setSummary(summaryRes.data)
      setRows(inboxRes.data)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo cargar la bandeja de recordatorios'))
    } finally {
      setLoading(false)
    }
  }, [filter, search, includeHistorical])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const loadHistory = async (userId: number) => {
    try {
      const res = await axios.get<FollowUpHistory[]>(`${API_URL}/membership/admin/client/${userId}/followups`)
      setHistory(res.data)
    } catch {
      setHistory([])
    }
  }

  const openPanel = (item: InboxItem) => {
    setSelected(item)
    setPanelNote('')
    setNextFollowupDate('')
    void loadHistory(item.user_id)
  }

  const quickAction = async (action: string, channel = 'whatsapp') => {
    if (!selected || busy) return
    setBusy(true)
    try {
      const params: Record<string, string> = { action, channel }
      if (panelNote.trim()) params.note = panelNote.trim()
      if (nextFollowupDate) params.next_followup_at = new Date(`${nextFollowupDate}T10:00:00`).toISOString()
      await axios.post(`${API_URL}/membership/admin/client/${selected.user_id}/followups/quick`, null, { params })
      showNotice('success', `Seguimiento registrado: ${action}`)
      await fetchData()
      await loadHistory(selected.user_id)
      setPanelNote('')
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo registrar el seguimiento'))
    } finally {
      setBusy(false)
    }
  }

  const saveFollowupNote = async () => {
    if (!selected || busy) return
    setBusy(true)
    try {
      await axios.post(`${API_URL}/membership/admin/followups`, {
        user_id: selected.user_id,
        membership_cycle_id: selected.cycle_id,
        followup_type: 'otro',
        channel: 'nota_interna',
        status: 'pendiente',
        note: panelNote.trim(),
        next_followup_at: nextFollowupDate ? new Date(`${nextFollowupDate}T10:00:00`).toISOString() : null,
      })
      showNotice('success', 'Nota y seguimiento guardados')
      await fetchData()
      await loadHistory(selected.user_id)
      setPanelNote('')
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo guardar la nota'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-4 space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Centro de recordatorios</h1>
          <p className="text-oc-muted mt-1">Bandeja de seguimiento diario — WhatsApp manual, sin envios automaticos</p>
        </div>
        <Link to="/app/admin/membresias" className="text-sm text-oc-red hover:underline">
          Ir a control de pagos
        </Link>
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

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {summary ? (
          <>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Pendientes hoy</div>
              <div className="text-white text-2xl font-semibold">{summary.pendientes_hoy}</div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Vencen hoy</div>
              <div className="text-orange-200 text-2xl font-semibold">{summary.vence_hoy}</div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Vencidos / adeudo</div>
              <div className="text-white text-sm mt-1">Vencidos: {summary.vencidos}</div>
              <div className="text-white text-sm">Con adeudo: {summary.con_adeudo}</div>
            </div>
            <div className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <div className="text-oc-muted text-xs">Actividad hoy</div>
              <div className="text-white text-sm mt-1">Contactados: {summary.contactados_hoy}</div>
              <div className="text-white text-sm">Renovados: {summary.renovados_despues_seguimiento}</div>
              <div className="text-purple-200 text-sm">Atrasados: {summary.seguimientos_atrasados}</div>
            </div>
          </>
        ) : (
          <p className="text-oc-muted col-span-full">Cargando resumen...</p>
        )}
      </section>

      <div className="bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm ${filter === f ? 'bg-oc-red text-white' : 'bg-oc-panel text-oc-light/90'}`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
          <label className="flex items-center gap-2 text-xs sm:text-sm text-oc-light/90 ml-1">
            <input
              type="checkbox"
              checked={includeHistorical}
              onChange={(e) => setIncludeHistorical(e.target.checked)}
              className="accent-oc-red"
            />
            Incluir históricos
          </label>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void fetchData()}
            placeholder="Buscar nombre o telefono"
            className="flex-1 bg-oc-dark border border-oc-border rounded px-3 py-2 text-white"
          />
          <button type="button" onClick={() => void fetchData()} className="bg-oc-red text-white px-4 py-2 rounded">
            Buscar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-oc-metal p-4 rounded-lg border border-oc-red/20">
          <h2 className="text-xl text-oc-red font-semibold mb-3">Bandeja ({rows.length})</h2>
          {loading ? (
            <p className="text-oc-muted">Cargando...</p>
          ) : rows.length === 0 ? (
            <p className="text-oc-muted">No hay recordatorios con este filtro. Buen trabajo.</p>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-auto">
              {rows.map((row) => {
                const wa = buildMemberWhatsAppHref(
                  row.phone,
                  whatsappPresetForInboxItem(row.status, row.priority_category),
                )
                return (
                  <div
                    key={row.user_id}
                    className={`p-3 rounded border border-oc-border bg-oc-dark ${selected?.user_id === row.user_id ? 'ring-1 ring-oc-red' : ''}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-white font-medium">{row.name}</div>
                        <div className="text-oc-muted text-xs">{row.phone || 'Sin telefono'} · {row.membership_type || 'Sin plan'}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${priorityBadge(row.priority_category)}`}>
                        {PRIORITY_LABELS[row.priority_category] || row.priority_category}
                      </span>
                    </div>
                    <div className="text-xs text-oc-light/90 mt-2 grid sm:grid-cols-2 gap-1">
                      <span>Vence: {fmtDate(row.end_date)}</span>
                      <span>Saldo: {fmtMoney(row.pending_balance_total ?? row.pending_balance)}</span>
                      <span>Accion: {row.recommended_action}</span>
                      {row.contacted_recently && (
                        <span className="text-amber-300">Contactado recientemente (24h)</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Link to={`/app/admin/socios/${row.user_id}`} className="text-xs bg-oc-red text-white px-2 py-1 rounded">
                        Ver socio
                      </Link>
                      <button type="button" onClick={() => openPanel(row)} className="text-xs bg-oc-panel text-white px-2 py-1 rounded">
                        Gestionar
                      </button>
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="text-xs bg-emerald-800 text-white px-2 py-1 rounded">
                          WhatsApp
                        </a>
                      )}
                      <Link to={`/app/admin/socios/${row.user_id}`} className="text-xs bg-oc-panel text-white px-2 py-1 rounded">
                        Expediente
                      </Link>
                      <Link to="/app/admin/membresias" className="text-xs bg-oc-red text-white px-2 py-1 rounded">
                        Registrar pago
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-oc-metal p-4 rounded-lg border border-oc-red/20 space-y-3">
          <h2 className="text-xl text-oc-red font-semibold">Seguimiento</h2>
          {!selected ? (
            <p className="text-oc-muted text-sm">Selecciona un socio de la bandeja para registrar contacto, notas o programar seguimiento.</p>
          ) : (
            <>
              <div className="text-sm text-white font-medium">{selected.name}</div>
              <p className="text-xs text-oc-muted">{selected.recommended_action}</p>
              {selected.contacted_recently && (
                <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-800 rounded px-2 py-1">
                  Este socio fue contactado en las ultimas 24 horas. Puedes continuar si es necesario.
                </p>
              )}
              <textarea
                className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm"
                rows={3}
                value={panelNote}
                onChange={(e) => setPanelNote(e.target.value)}
                placeholder="Nota de seguimiento"
              />
              <input
                type="date"
                className="w-full bg-oc-dark border border-oc-border rounded px-2 py-2 text-white text-sm"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
              />
              <div className="flex flex-wrap gap-1">
                <button disabled={busy} type="button" onClick={() => void quickAction('contactado')} className="text-xs bg-oc-panel text-white px-2 py-1.5 rounded">
                  Marcar contactado
                </button>
                <button disabled={busy} type="button" onClick={() => void quickAction('respondio')} className="text-xs bg-sky-900 text-white px-2 py-1.5 rounded">
                  Respondio
                </button>
                <button disabled={busy} type="button" onClick={() => void quickAction('sin_respuesta')} className="text-xs bg-zinc-700 text-white px-2 py-1.5 rounded">
                  Sin respuesta
                </button>
                <button disabled={busy} type="button" onClick={() => void quickAction('renovado')} className="text-xs bg-emerald-800 text-white px-2 py-1.5 rounded">
                  Renovado
                </button>
                <button disabled={busy} type="button" onClick={() => void quickAction('descartado', 'nota_interna')} className="text-xs bg-oc-panel/60 text-white px-2 py-1.5 rounded">
                  Descartar
                </button>
              </div>
              <button disabled={busy} type="button" onClick={() => void saveFollowupNote()} className="w-full bg-oc-red text-white py-2 rounded text-sm">
                Guardar nota / programar
              </button>
              <div className="border-t border-oc-border pt-3">
                <h3 className="text-white text-sm font-medium mb-2">Historial</h3>
                {history.length === 0 ? (
                  <p className="text-oc-muted text-xs">Sin seguimientos previos.</p>
                ) : (
                  <ul className="space-y-2 max-h-48 overflow-auto text-xs">
                    {history.map((h) => (
                      <li key={h.id} className="bg-oc-dark border border-oc-border rounded p-2">
                        <div className="text-white">{h.status} · {h.channel}</div>
                        <div className="text-oc-muted">{fmtDate(h.created_at)} · {h.created_by_name}</div>
                        {h.note && <div className="text-oc-light/90 mt-1">{h.note}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
