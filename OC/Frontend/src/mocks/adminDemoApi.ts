import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  addDemoFollowup,
  addDemoNote,
  addDemoPayment,
  getDemoAlerts,
  getDemoClientDetail,
  getDemoFollowupInbox,
  getDemoFollowupSummary,
  getDemoProfile,
  getDemoStore,
  getDemoSummary,
  getDemoWeeklySchedule,
  listDemoClients,
  reverseDemoPayment,
  suspendDemoUser,
  unsuspendDemoCycle,
} from './adminDemoData'

function parseUrl(config: AxiosRequestConfig): { path: string; searchParams: URLSearchParams } {
  const raw = config.url || ''
  const base = config.baseURL || 'http://local'
  try {
    const u = new URL(raw, base)
    return { path: u.pathname, searchParams: u.searchParams }
  } catch {
    const [path, qs] = raw.split('?')
    return { path, searchParams: new URLSearchParams(qs || '') }
  }
}

function ok<T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: { 'x-oc-demo': 'true' },
    config: config as InternalAxiosRequestConfig,
  }
}

function err(config: AxiosRequestConfig, status: number, detail: string): AxiosResponse {
  return {
    data: { detail },
    status,
    statusText: 'Error',
    headers: { 'x-oc-demo': 'true' },
    config: config as InternalAxiosRequestConfig,
  }
}

/** Maneja rutas admin conocidas; devuelve null si no aplica. */
export function resolveAdminDemoResponse(config: AxiosRequestConfig): AxiosResponse | null {
  const method = (config.method || 'get').toLowerCase()
  const { path, searchParams } = parseUrl(config)
  const body = config.data
  let parsedBody: Record<string, unknown> = {}
  if (body) {
    try {
      parsedBody = typeof body === 'string' ? JSON.parse(body) : (body as Record<string, unknown>)
    } catch {
      parsedBody = {}
    }
  }

  if (method === 'get' && path === '/membership/admin/clients') {
    return ok(config, listDemoClients(searchParams.get('status') || 'todos', searchParams.get('search') || ''))
  }
  if (method === 'get' && path === '/membership/admin/summary') {
    return ok(config, getDemoSummary())
  }
  if (method === 'get' && path === '/membership/admin/alerts') {
    return ok(config, getDemoAlerts())
  }
  if (method === 'get' && path === '/membership/admin/followups/summary') {
    return ok(config, getDemoFollowupSummary())
  }
  if (method === 'get' && path === '/membership/admin/followups') {
    return ok(config, getDemoFollowupInbox(searchParams.get('status') || 'todos', searchParams.get('search') || ''))
  }
  if (method === 'get' && path.startsWith('/dashboard/admin/weekly-schedule')) {
    return ok(config, getDemoWeeklySchedule())
  }

  const clientProfile = path.match(/^\/membership\/admin\/client\/(\d+)\/profile$/)
  if (method === 'get' && clientProfile) {
    const profile = getDemoProfile(Number(clientProfile[1]))
    return profile ? ok(config, profile) : err(config, 404, 'Cliente no encontrado')
  }

  const clientDetail = path.match(/^\/membership\/admin\/client\/(\d+)$/)
  if (method === 'get' && clientDetail) {
    const detail = getDemoClientDetail(Number(clientDetail[1]))
    return detail ? ok(config, detail) : err(config, 404, 'Cliente no encontrado')
  }

  const clientFollowups = path.match(/^\/membership\/admin\/client\/(\d+)\/followups$/)
  if (method === 'get' && clientFollowups) {
    const uid = Number(clientFollowups[1])
    const rows = getDemoStore().followups.filter((f) => f.user_id === uid)
    return ok(config, rows)
  }

  const quickFollowup = path.match(/^\/membership\/admin\/client\/(\d+)\/followups\/quick$/)
  if (method === 'post' && quickFollowup) {
    const uid = Number(quickFollowup[1])
    const params = config.params || {}
    return ok(config, addDemoFollowup(uid, { status: params.action, channel: params.channel, note: params.note, next_followup_at: params.next_followup_at }))
  }

  const clientNote = path.match(/^\/membership\/admin\/client\/(\d+)\/note$/)
  if (method === 'post' && clientNote) {
    const uid = Number(clientNote[1])
    const cycleId = config.params?.cycle_id
    return ok(config, addDemoNote(uid, String(parsedBody.note || ''), cycleId ? Number(cycleId) : undefined))
  }

  if (method === 'post' && path === '/membership/admin/followups') {
    return ok(config, addDemoFollowup(Number(parsedBody.user_id), parsedBody))
  }

  const cyclePayment = path.match(/^\/membership\/admin\/cycle\/(\d+)\/payment$/)
  if (method === 'post' && cyclePayment) {
    const result = addDemoPayment(Number(cyclePayment[1]), parsedBody)
    return result ? ok(config, result) : err(config, 404, 'Ciclo no encontrado')
  }

  const reversePayment = path.match(/^\/membership\/admin\/payment\/(\d+)\/reverse$/)
  if (method === 'post' && reversePayment) {
    const result = reverseDemoPayment(Number(reversePayment[1]), String(parsedBody.reason || ''))
    if ('error' in result) return err(config, 409, result.error as string)
    return ok(config, result)
  }

  const deactivate = path.match(/^\/membership\/(\d+)\/deactivate$/)
  if (method === 'put' && deactivate) {
    return ok(config, suspendDemoUser(Number(deactivate[1])))
  }

  const unsuspend = path.match(/^\/membership\/cycle\/(\d+)\/unsuspend$/)
  if (method === 'put' && unsuspend) {
    return ok(config, unsuspendDemoCycle(Number(unsuspend[1])))
  }

  return null
}

export function isAdminDemoApiPath(config: AxiosRequestConfig): boolean {
  const { path } = parseUrl(config)
  return (
    path.startsWith('/membership/admin') ||
    path.startsWith('/membership/') ||
    path.startsWith('/dashboard/admin/')
  )
}
