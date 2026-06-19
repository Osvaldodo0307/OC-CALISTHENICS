/**
 * Datos de prueba para modo admin demo (sin backend).
 * Estado mutable en memoria durante la sesión del navegador.
 */
export interface DemoPayment {
  id: number
  membership_cycle_id: number
  user_id: number
  payment_date: string
  amount: number
  payment_method: string
  payment_action: string
  period_start_date?: string | null
  period_end_date?: string | null
  counts_as_income: boolean
  applies_to_balance: boolean
  extended_end_date?: string | null
  concept?: string | null
  observations?: string | null
  created_by_name: string
  reversed_at?: string | null
  reversed_by_name?: string | null
  reversal_reason?: string | null
}

export interface DemoCycle {
  id: number
  membership_id: number
  user_id: number
  membership_type: string
  cost: number
  start_date: string
  end_date: string
  status: string
  is_active_cycle: boolean
  manual_suspend: boolean
}

export interface DemoClient {
  user_id: number
  membership_id: number
  name: string
  phone: string | null
  membership_type: string
  cost: number
  start_date: string
  end_date: string
  status: string
  days_remaining: number | null
  days_overdue: number | null
}

export interface DemoFollowUp {
  id: number
  user_id: number
  status: string
  channel: string
  followup_type: string
  note?: string | null
  contact_at?: string | null
  next_followup_at?: string | null
  created_at: string
  created_by_name: string
}

export interface DemoNote {
  id: number
  user_id: number
  membership_cycle_id?: number | null
  note: string
  created_at: string
  created_by_name: string
  note_type: string
}

interface DemoStore {
  clients: DemoClient[]
  cycles: DemoCycle[]
  payments: DemoPayment[]
  followups: DemoFollowUp[]
  notes: DemoNote[]
  nextPaymentId: number
  nextFollowupId: number
  nextNoteId: number
  nextCycleId: number
}

const d = (offset: number) => {
  const x = new Date()
  x.setDate(x.getDate() + offset)
  return x.toISOString().slice(0, 10)
}

const nowIso = () => new Date().toISOString()

function createInitialStore(): DemoStore {
  const cycles: DemoCycle[] = [
    { id: 201, membership_id: 1, user_id: 101, membership_type: 'Mensual Premium', cost: 950, start_date: d(-15), end_date: d(20), status: 'activa', is_active_cycle: true, manual_suspend: false },
    { id: 202, membership_id: 1, user_id: 102, membership_type: 'Mensual', cost: 750, start_date: d(-25), end_date: d(2), status: 'proxima_a_vencer', is_active_cycle: true, manual_suspend: false },
    { id: 203, membership_id: 1, user_id: 103, membership_type: 'Mensual', cost: 750, start_date: d(-28), end_date: d(0), status: 'vence_hoy', is_active_cycle: true, manual_suspend: false },
    { id: 204, membership_id: 1, user_id: 104, membership_type: 'Mensual', cost: 750, start_date: d(-60), end_date: d(-8), status: 'vencida', is_active_cycle: true, manual_suspend: false },
    { id: 205, membership_id: 1, user_id: 105, membership_type: 'Mensual', cost: 1000, start_date: d(-35), end_date: d(-3), status: 'con_adeudo', is_active_cycle: true, manual_suspend: false },
    { id: 206, membership_id: 1, user_id: 106, membership_type: 'Mensual', cost: 750, start_date: d(-20), end_date: d(10), status: 'suspendida', is_active_cycle: true, manual_suspend: true },
    { id: 207, membership_id: 1, user_id: 107, membership_type: 'Mensual', cost: 750, start_date: d(-10), end_date: d(20), status: 'activa', is_active_cycle: true, manual_suspend: false },
    { id: 208, membership_id: 1, user_id: 108, membership_type: 'Mensual', cost: 800, start_date: d(-12), end_date: d(18), status: 'activa', is_active_cycle: true, manual_suspend: false },
    { id: 209, membership_id: 1, user_id: 109, membership_type: 'Mensual', cost: 750, start_date: d(-40), end_date: d(5), status: 'activa', is_active_cycle: true, manual_suspend: false },
    { id: 210, membership_id: 1, user_id: 110, membership_type: 'Mensual', cost: 600, start_date: d(-5), end_date: d(25), status: 'activa', is_active_cycle: true, manual_suspend: false },
    { id: 211, membership_id: 1, user_id: 111, membership_type: 'Mensual', cost: 750, start_date: d(0), end_date: d(30), status: 'con_adeudo', is_active_cycle: true, manual_suspend: false },
    { id: 212, membership_id: 1, user_id: 112, membership_type: 'Mensual', cost: 750, start_date: d(-30), end_date: d(-2), status: 'vencida', is_active_cycle: true, manual_suspend: false },
    { id: 213, membership_id: 1, user_id: 105, membership_type: 'Mensual', cost: 750, start_date: d(-90), end_date: d(-45), status: 'vencida', is_active_cycle: false, manual_suspend: false },
  ]

  const clients: DemoClient[] = [
    { user_id: 101, membership_id: 1, name: 'Ana Corriente', phone: '5511111001', membership_type: 'Mensual Premium', cost: 950, start_date: d(-15), end_date: d(20), status: 'activa', days_remaining: 20, days_overdue: null },
    { user_id: 102, membership_id: 1, name: 'Bruno Por Vencer', phone: '5511111002', membership_type: 'Mensual', cost: 750, start_date: d(-25), end_date: d(2), status: 'proxima_a_vencer', days_remaining: 2, days_overdue: null },
    { user_id: 103, membership_id: 1, name: 'Carla Vence Hoy', phone: '5511111003', membership_type: 'Mensual', cost: 750, start_date: d(-28), end_date: d(0), status: 'vence_hoy', days_remaining: 0, days_overdue: null },
    { user_id: 104, membership_id: 1, name: 'Diego Vencido', phone: '5511111004', membership_type: 'Mensual', cost: 750, start_date: d(-60), end_date: d(-8), status: 'vencida', days_remaining: null, days_overdue: 8 },
    { user_id: 105, membership_id: 1, name: 'Elena Adeudo', phone: '5511111005', membership_type: 'Mensual', cost: 1000, start_date: d(-35), end_date: d(-3), status: 'con_adeudo', days_remaining: null, days_overdue: 3 },
    { user_id: 106, membership_id: 1, name: 'Felipe Suspendido', phone: '5511111006', membership_type: 'Mensual', cost: 750, start_date: d(-20), end_date: d(10), status: 'suspendida', days_remaining: 10, days_overdue: null },
    { user_id: 107, membership_id: 1, name: 'Gabriela Cortesia', phone: '5511111007', membership_type: 'Mensual', cost: 750, start_date: d(-10), end_date: d(20), status: 'activa', days_remaining: 20, days_overdue: null },
    { user_id: 108, membership_id: 1, name: 'Hector Ajuste', phone: '5511111008', membership_type: 'Mensual', cost: 800, start_date: d(-12), end_date: d(18), status: 'activa', days_remaining: 18, days_overdue: null },
    { user_id: 109, membership_id: 1, name: 'Irene Reversa', phone: '5511111009', membership_type: 'Mensual', cost: 750, start_date: d(-40), end_date: d(5), status: 'activa', days_remaining: 5, days_overdue: null },
    { user_id: 110, membership_id: 1, name: 'Jorge Sin Telefono', phone: null, membership_type: 'Mensual', cost: 600, start_date: d(-5), end_date: d(25), status: 'activa', days_remaining: 25, days_overdue: null },
    { user_id: 111, membership_id: 1, name: 'Karla Sin Pagos', phone: '5511111011', membership_type: 'Mensual', cost: 750, start_date: d(0), end_date: d(30), status: 'con_adeudo', days_remaining: 30, days_overdue: null },
    { user_id: 112, membership_id: 1, name: 'Luis Seguimiento', phone: '5511111012', membership_type: 'Mensual', cost: 750, start_date: d(-30), end_date: d(-2), status: 'vencida', days_remaining: null, days_overdue: 2 },
  ]

  const payments: DemoPayment[] = [
    { id: 301, membership_cycle_id: 201, user_id: 101, payment_date: d(-10), amount: 950, payment_method: 'transferencia', payment_action: 'renew_extend', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 302, membership_cycle_id: 202, user_id: 102, payment_date: d(-20), amount: 750, payment_method: 'efectivo', payment_action: 'renew_extend', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 303, membership_cycle_id: 203, user_id: 103, payment_date: d(-25), amount: 750, payment_method: 'tarjeta', payment_action: 'renew_extend', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 304, membership_cycle_id: 205, user_id: 105, payment_date: d(-30), amount: 400, payment_method: 'efectivo', payment_action: 'partial_debt', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 305, membership_cycle_id: 206, user_id: 106, payment_date: d(-15), amount: 750, payment_method: 'transferencia', payment_action: 'renew_extend', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 306, membership_cycle_id: 207, user_id: 107, payment_date: d(-8), amount: 0, payment_method: 'cortesia', payment_action: 'courtesy_extend', counts_as_income: false, applies_to_balance: true, concept: 'Cortesia bienvenida', created_by_name: 'Admin Demo' },
    { id: 307, membership_cycle_id: 208, user_id: 108, payment_date: d(-5), amount: 50, payment_method: 'ajuste', payment_action: 'admin_adjustment', counts_as_income: false, applies_to_balance: true, concept: 'Ajuste promocion', created_by_name: 'Admin Demo' },
    { id: 308, membership_cycle_id: 208, user_id: 108, payment_date: d(-5), amount: 750, payment_method: 'efectivo', payment_action: 'renew_extend', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 309, membership_cycle_id: 209, user_id: 109, payment_date: d(-35), amount: 750, payment_method: 'efectivo', payment_action: 'renew_extend', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
    { id: 310, membership_cycle_id: 209, user_id: 109, payment_date: d(-5), amount: 200, payment_method: 'transferencia', payment_action: 'partial_debt', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo', reversed_at: nowIso(), reversed_by_name: 'Admin Demo', reversal_reason: 'Captura duplicada (demo)' },
    { id: 311, membership_cycle_id: 213, user_id: 105, payment_date: d(-80), amount: 300, payment_method: 'efectivo', payment_action: 'partial_debt', counts_as_income: true, applies_to_balance: true, created_by_name: 'Admin Demo' },
  ]

  const followups: DemoFollowUp[] = [
    { id: 401, user_id: 112, status: 'contactado', channel: 'whatsapp', followup_type: 'vencido', note: 'Recordatorio enviado', contact_at: nowIso(), next_followup_at: d(1) + 'T10:00:00.000Z', created_at: nowIso(), created_by_name: 'Admin Demo' },
    { id: 402, user_id: 104, status: 'pendiente', channel: 'nota_interna', followup_type: 'vencido', note: 'Pendiente llamar', next_followup_at: d(-1) + 'T10:00:00.000Z', created_at: d(-3) + 'T12:00:00.000Z', created_by_name: 'Admin Demo' },
    { id: 403, user_id: 105, status: 'sin_respuesta', channel: 'whatsapp', followup_type: 'adeudo', note: 'Sin respuesta por WhatsApp', created_at: d(-5) + 'T12:00:00.000Z', created_by_name: 'Admin Demo' },
  ]

  const notes: DemoNote[] = [
    { id: 501, user_id: 105, membership_cycle_id: 205, note: 'Acordo pagar en dos partes', created_at: d(-10) + 'T10:00:00.000Z', created_by_name: 'Admin Demo', note_type: 'general' },
    { id: 502, user_id: 106, membership_cycle_id: 206, note: 'Suspendido por viaje', created_at: d(-2) + 'T10:00:00.000Z', created_by_name: 'Admin Demo', note_type: 'suspension' },
  ]

  return {
    clients,
    cycles,
    payments,
    followups,
    notes,
    nextPaymentId: 400,
    nextFollowupId: 500,
    nextNoteId: 600,
    nextCycleId: 300,
  }
}

let store: DemoStore = createInitialStore()

export function resetDemoStore(): void {
  store = createInitialStore()
}

export function getDemoStore(): DemoStore {
  return store
}

function cyclePaid(cycleId: number): number {
  return store.payments
    .filter((p) => p.membership_cycle_id === cycleId && !p.reversed_at && p.applies_to_balance)
    .reduce((s, p) => s + p.amount, 0)
}

function lastPayment(userId: number) {
  const p = store.payments
    .filter((x) => x.user_id === userId && !x.reversed_at)
    .sort((a, b) => b.payment_date.localeCompare(a.payment_date))[0]
  if (!p) return null
  return { payment_id: p.id, payment_date: p.payment_date, amount: p.amount, payment_method: p.payment_method }
}

export function listDemoClients(statusFilter = 'todos', search = '') {
  const q = search.trim().toLowerCase()
  return store.clients
    .map((c) => {
      const cycle = store.cycles.find((x) => x.user_id === c.user_id && x.is_active_cycle)
      const paid = cycle ? cyclePaid(cycle.id) : 0
      const pending = cycle ? Math.max(cycle.cost - paid, 0) : 0
      return {
        user_id: c.user_id,
        membership_id: c.membership_id,
        cycle_id: cycle?.id ?? null,
        name: c.name,
        phone: c.phone,
        created_at: '2024-06-01T00:00:00.000Z',
        membership_type: c.membership_type,
        cost: c.cost,
        start_date: c.start_date,
        end_date: c.end_date,
        status: cycle?.manual_suspend ? 'suspendida' : c.status,
        total_paid: paid,
        pending_balance: pending,
        pending_balance_total: pending + store.cycles.filter((cy) => cy.user_id === c.user_id && !cy.is_active_cycle).reduce((s, cy) => s + Math.max(cy.cost - cyclePaid(cy.id), 0), 0),
        days_remaining: c.days_remaining,
        days_overdue: c.days_overdue,
        last_payment: lastPayment(c.user_id),
      }
    })
    .filter((row) => {
      if (q && !row.name.toLowerCase().includes(q) && !(row.phone || '').includes(q)) return false
      if (statusFilter === 'todos') return true
      return row.status === statusFilter
    })
}

export function getDemoSummary() {
  const rows = listDemoClients('todos')
  const count = (s: string) => rows.filter((r) => r.status === s).length
  return {
    month_income: 12450,
    today_income: 950,
    month_courtesies: 1,
    month_adjustments: 1,
    pending_estimate: rows.reduce((s, r) => s + (r.pending_balance_total || r.pending_balance), 0),
    counts: {
      al_corriente: count('activa'),
      por_vencer: count('proxima_a_vencer'),
      vence_hoy: count('vence_hoy'),
      vencidos: count('vencida'),
      con_adeudo: count('con_adeudo'),
      suspendidos: count('suspendida'),
      total_socios: rows.length,
    },
    expiring_soon_days: 3,
    is_estimate: true,
  }
}

export function getDemoAlerts() {
  const rows = listDemoClients('todos')
  return {
    vence_hoy: rows.filter((r) => r.status === 'vence_hoy'),
    proximos_3_dias: rows.filter((r) => r.status === 'proxima_a_vencer'),
    vencidos: rows.filter((r) => r.status === 'vencida'),
    con_adeudo: rows.filter((r) => r.status === 'con_adeudo' || r.pending_balance > 0),
    suspendidos: rows.filter((r) => r.status === 'suspendida'),
  }
}

function cyclePayload(cycle: DemoCycle) {
  const paid = cyclePaid(cycle.id)
  return {
    id: cycle.id,
    membership_id: cycle.membership_id,
    user_id: cycle.user_id,
    membership_type: cycle.membership_type,
    cost: cycle.cost,
    start_date: cycle.start_date,
    end_date: cycle.end_date,
    status: cycle.manual_suspend ? 'suspendida' : store.clients.find((c) => c.user_id === cycle.user_id)?.status || cycle.status,
    is_active_cycle: cycle.is_active_cycle,
    created_at: '2024-06-01T00:00:00.000Z',
    updated_at: nowIso(),
    total_paid: paid,
    pending_balance: Math.max(cycle.cost - paid, 0),
    payments_count: store.payments.filter((p) => p.membership_cycle_id === cycle.id && !p.reversed_at).length,
    reversed_payments_count: store.payments.filter((p) => p.membership_cycle_id === cycle.id && p.reversed_at).length,
    courtesies_count: store.payments.filter((p) => p.membership_cycle_id === cycle.id && !p.reversed_at && p.payment_method === 'cortesia').length,
    adjustments_count: store.payments.filter((p) => p.membership_cycle_id === cycle.id && !p.reversed_at && (p.payment_method === 'ajuste' || p.payment_action === 'admin_adjustment')).length,
  }
}

export function getDemoClientDetail(userId: number) {
  const client = store.clients.find((c) => c.user_id === userId)
  if (!client) return null
  const cycles = store.cycles.filter((c) => c.user_id === userId).sort((a, b) => b.id - a.id)
  const active = cycles.find((c) => c.is_active_cycle)
  const payments = store.payments.filter((p) => p.user_id === userId).map((p) => ({
    ...p,
    created_by: 1,
    created_at: p.payment_date + 'T12:00:00.000Z',
    reversal_reason: p.reversal_reason ?? null,
  }))
  const notes = store.notes.filter((n) => n.user_id === userId).map((n) => ({
    id: n.id,
    user_id: n.user_id,
    membership_id: client.membership_id,
    membership_cycle_id: n.membership_cycle_id,
    note: n.note,
    created_by: 1,
    created_at: n.created_at,
    created_by_name: n.created_by_name,
  }))
  let historical = 0
  let current = 0
  for (const c of cycles) {
    const bal = Math.max(c.cost - cyclePaid(c.id), 0)
    if (active && c.id === active.id) current = bal
    else historical += bal
  }
  return {
    user_id: userId,
    membership_id: client.membership_id,
    name: client.name,
    phone: client.phone,
    created_at: '2024-06-01T00:00:00.000Z',
    active_cycle: active ? cyclePayload(active) : null,
    cycles_history: cycles.map((c) => cyclePayload(c)),
    historical_pending_balance: historical,
    current_pending_balance: current,
    total_pending_balance: historical + current,
    expiring_soon_days: 3,
    payments,
    notes,
  }
}

export function getDemoProfile(userId: number) {
  const base = getDemoClientDetail(userId)
  if (!base) return null
  const client = store.clients.find((c) => c.user_id === userId)!
  const followups = store.followups.filter((f) => f.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const latest = followups[0]
  const contactedRecently = latest?.status === 'contactado' && latest.contact_at && (Date.now() - new Date(latest.contact_at).getTime()) < 86400000
  const tags: string[] = []
  const tagMap: Record<string, string> = { activa: 'al_corriente', proxima_a_vencer: 'por_vencer', vence_hoy: 'vence_hoy', vencida: 'vencido', con_adeudo: 'con_adeudo', suspendida: 'suspendido' }
  if (tagMap[base.active_cycle?.status || client.status]) tags.push(tagMap[base.active_cycle?.status || client.status])
  if (contactedRecently) tags.push('contactado_recientemente')
  if (base.total_pending_balance > 0 && !tags.includes('con_adeudo')) tags.push('con_adeudo')

  const activePayments = store.payments.filter((p) => p.user_id === userId && !p.reversed_at)
  const latestActive = [...activePayments].sort((a, b) => b.id - a.id)[0]

  const payments = base.payments.map((p) => {
    const canReverse = !p.reversed_at && latestActive?.id === p.id
    return {
      ...p,
      is_reversed: Boolean(p.reversed_at),
      status_label: p.reversed_at ? 'REVERTIDO' : 'ACTIVO',
      can_reverse: canReverse,
      reversal_block_reason: canReverse ? null : 'En demo solo se puede revertir el pago activo mas reciente (LIFO).',
    }
  })

  const debts = base.cycles_history
    .filter((c) => c.pending_balance > 0)
    .map((c) => ({
      cycle_id: c.id,
      membership_type: c.membership_type,
      concept: `Ciclo ${c.membership_type}`,
      pending_balance: c.pending_balance,
      is_active_cycle: c.is_active_cycle,
      end_date: c.end_date,
      days_overdue: client.days_overdue,
      status: c.status,
    }))

  return {
    ...base,
    general: {
      status: base.active_cycle?.status || client.status,
      membership_type: client.membership_type,
      cost: client.cost,
      start_date: client.start_date,
      end_date: client.end_date,
      days_remaining: client.days_remaining,
      days_overdue: client.days_overdue,
      total_paid: base.active_cycle?.total_paid || 0,
      current_pending_balance: base.current_pending_balance,
      historical_pending_balance: base.historical_pending_balance,
      total_pending_balance: base.total_pending_balance,
      last_payment: lastPayment(userId),
      last_followup: latest ? { status: latest.status, note: latest.note, updated_at: latest.created_at } : null,
      next_followup_at: latest?.next_followup_at ?? null,
      tags,
      is_recently_contacted: contactedRecently,
      has_pending_followup: followups.some((f) => f.status === 'pendiente' && f.next_followup_at),
      expiring_soon_days: 3,
    },
    active_cycle: base.active_cycle
      ? {
          ...base.active_cycle,
          notes: store.notes.filter((n) => n.membership_cycle_id === base.active_cycle!.id).map((n) => ({
            id: n.id,
            note: n.note,
            created_at: n.created_at,
            created_by_name: n.created_by_name,
            note_type: n.note_type,
          })),
        }
      : null,
    payments,
    debts,
    followups: followups.map((f) => ({ ...f, created_by: 1, updated_by: 1 })),
    notes: store.notes.filter((n) => n.user_id === userId).map((n) => ({ ...n, membership_id: client.membership_id })),
    flags: {
      can_register_payment: Boolean(base.active_cycle),
      can_suspend: Boolean(base.active_cycle && base.active_cycle.status !== 'suspendida'),
      can_unsuspend: Boolean(base.active_cycle?.status === 'suspendida'),
      has_phone: Boolean(client.phone),
      has_active_cycle: Boolean(base.active_cycle),
      has_payments: payments.some((p) => !p.is_reversed),
    },
  }
}

export function getDemoFollowupInbox(status = 'todos', search = '') {
  const rows = listDemoClients('todos', search)
  const inbox = rows
    .filter((r) => ['proxima_a_vencer', 'vence_hoy', 'vencida', 'con_adeudo', 'suspendida'].includes(r.status) || store.followups.some((f) => f.user_id === r.user_id))
    .map((r) => {
      const fu = store.followups.filter((f) => f.user_id === r.user_id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
      const priority =
        r.status === 'vencida' && r.pending_balance > 0
          ? 'vencidos_con_adeudo'
          : r.status === 'vence_hoy'
            ? 'vence_hoy'
            : r.status === 'vencida'
              ? 'vencidos_sin_contacto'
              : r.status === 'proxima_a_vencer'
                ? 'por_vencer'
                : r.status === 'suspendida' && r.pending_balance > 0
                  ? 'suspendidos_con_adeudo'
                  : 'otro'
      const rank: Record<string, number> = { vencidos_con_adeudo: 1, vence_hoy: 2, vencidos_sin_contacto: 3, por_vencer: 4, seguimientos_atrasados: 5, seguimientos_hoy: 6, suspendidos_con_adeudo: 7, otro: 99 }
      const contactedRecently = fu?.status === 'contactado' && fu.contact_at && Date.now() - new Date(fu.contact_at).getTime() < 86400000
      return {
        ...r,
        priority_category: priority,
        priority_rank: rank[priority] || 99,
        recommended_action: 'Dar seguimiento (demo)',
        contacted_recently: contactedRecently,
        followup_status: fu?.status ?? null,
        next_followup_at: fu?.next_followup_at ?? null,
        last_followup: fu ? { note: fu.note, status: fu.status, updated_at: fu.created_at } : null,
      }
    })
    .sort((a, b) => a.priority_rank - b.priority_rank)

  if (status === 'todos') return inbox
  return inbox.filter((i) => {
    if (status === 'vencidos') return i.status === 'vencida'
    if (status === 'adeudo') return i.pending_balance > 0
    if (status === 'por_vencer') return i.status === 'proxima_a_vencer'
    if (status === 'contactados') return i.followup_status === 'contactado'
    if (status === 'sin_respuesta') return i.followup_status === 'sin_respuesta'
    return true
  })
}

export function getDemoFollowupSummary() {
  const inbox = getDemoFollowupInbox('todos')
  return {
    pendientes_hoy: inbox.filter((i) => i.followup_status === 'pendiente').length,
    vence_hoy: inbox.filter((i) => i.status === 'vence_hoy').length,
    vencidos: inbox.filter((i) => i.status === 'vencida').length,
    con_adeudo: inbox.filter((i) => i.pending_balance > 0).length,
    contactados_hoy: store.followups.filter((f) => f.status === 'contactado').length,
    renovados_despues_seguimiento: 0,
    seguimientos_atrasados: inbox.filter((i) => i.priority_category === 'seguimientos_atrasados').length,
    total_bandeja: inbox.length,
  }
}

export function addDemoPayment(cycleId: number, payload: Record<string, unknown>) {
  const cycle = store.cycles.find((c) => c.id === cycleId)
  if (!cycle) return null
  const payment: DemoPayment = {
    id: store.nextPaymentId++,
    membership_cycle_id: cycleId,
    user_id: cycle.user_id,
    payment_date: d(0),
    amount: Number(payload.amount) || 0,
    payment_method: String(payload.payment_method || 'efectivo'),
    payment_action: String(payload.payment_action || 'renew_extend'),
    counts_as_income: payload.payment_method !== 'cortesia',
    applies_to_balance: true,
    concept: (payload.concept as string) || null,
    observations: (payload.observations as string) || null,
    created_by_name: 'Admin Demo',
  }
  store.payments.unshift(payment)
  const paid = cyclePaid(cycleId)
  return { ok: true, payment_id: payment.id, status: cycle.status, pending_balance: Math.max(cycle.cost - paid, 0), vigencia_extended: false }
}

export function reverseDemoPayment(paymentId: number, reason: string) {
  const payment = store.payments.find((p) => p.id === paymentId)
  if (!payment || payment.reversed_at) return { error: 'No se puede revertir' }
  const active = store.payments.filter((p) => p.membership_cycle_id === payment.membership_cycle_id && !p.reversed_at).sort((a, b) => b.id - a.id)[0]
  if (active?.id !== paymentId) return { error: 'Orden LIFO: revierte primero el pago mas reciente' }
  payment.reversed_at = nowIso()
  payment.reversed_by_name = 'Admin Demo'
  payment.reversal_reason = reason
  const cycle = store.cycles.find((c) => c.id === payment.membership_cycle_id)!
  return { ok: true, vigencia_reverted: false, pending_balance: Math.max(cycle.cost - cyclePaid(cycle.id), 0) }
}

export function addDemoNote(userId: number, note: string, cycleId?: number) {
  const n: DemoNote = { id: store.nextNoteId++, user_id: userId, membership_cycle_id: cycleId, note, created_at: nowIso(), created_by_name: 'Admin Demo', note_type: 'general' }
  store.notes.unshift(n)
  return { ok: true }
}

export function addDemoFollowup(userId: number, payload: Record<string, unknown>) {
  const f: DemoFollowUp = {
    id: store.nextFollowupId++,
    user_id: userId,
    status: String(payload.status || 'pendiente'),
    channel: String(payload.channel || 'nota_interna'),
    followup_type: String(payload.followup_type || 'otro'),
    note: (payload.note as string) || null,
    contact_at: ['contactado', 'respondio', 'renovado'].includes(String(payload.status)) ? nowIso() : null,
    next_followup_at: (payload.next_followup_at as string) || null,
    created_at: nowIso(),
    created_by_name: 'Admin Demo',
  }
  store.followups.unshift(f)
  return { ok: true, followup: f }
}

export function suspendDemoUser(userId: number) {
  const cycle = store.cycles.find((c) => c.user_id === userId && c.is_active_cycle)
  if (cycle) {
    cycle.manual_suspend = true
    const client = store.clients.find((c) => c.user_id === userId)
    if (client) client.status = 'suspendida'
  }
  return { ok: true }
}

export function unsuspendDemoCycle(cycleId: number) {
  const cycle = store.cycles.find((c) => c.id === cycleId)
  if (cycle) {
    cycle.manual_suspend = false
    const client = store.clients.find((c) => c.user_id === cycle.user_id)
    if (client) client.status = 'activa'
  }
  return { ok: true }
}

export function getDemoWeeklySchedule() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = d(i - 1)
    return {
      date,
      day_name: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][new Date(date + 'T12:00:00').getDay()],
      is_today: date === d(0),
      bookings_count: i === 1 ? 3 : 1,
      classes: i === 1 ? [{ id: 1, title: 'Calistenia', discipline: 'Fuerza', start_datetime: date + 'T09:00:00', bookings_count: 3, students: [] }] : [],
    }
  })
  return { week_start: d(-1), week_end: d(5), total_bookings: 5, total_unique_students: 4, days }
}
