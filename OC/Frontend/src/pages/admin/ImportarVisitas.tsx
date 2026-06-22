import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { runtime } from '../../config/runtime'
import { toUserMessage } from '../../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

type Notice = { type: 'success' | 'error'; text: string }

type VisitPreviewSummary = {
  distinct_members: number
  total_summaries: number
  matched_members: number
  new_candidates: number
  ambiguous_members: number
  unmatched_members: number
  visits_by_period: Record<string, number>
  total_visits: number
  blocking_errors: string[]
  can_commit: boolean
}

type VisitPreviewRow = {
  raw_member_name: string
  normalized_member_name: string
  period_month: string
  month_label: string
  visits_count: number
  match_status: string
  matched_user_id?: number
  matched_user_name?: string
  candidate_user_ids?: number[]
  warnings?: string[]
}

type VisitPreviewResponse = {
  batch_id: number
  status: string
  sheet_name: string
  sheet_type: string
  diagnosis: Record<string, unknown>
  preview_summary: VisitPreviewSummary
  rows: VisitPreviewRow[]
}

type VisitSummaryItem = {
  id: number
  user_id?: number
  user_name?: string
  raw_member_name: string
  period_month: string
  visits_count: number
  source_sheet?: string
}

function matchStatusLabel(status: string) {
  switch (status) {
    case 'matched':
      return 'Encontrado'
    case 'new_candidate':
      return 'Sin socio en BD'
    case 'ambiguous':
      return 'Ambiguo'
    default:
      return 'Sin match'
  }
}

export default function ImportarVisitas() {
  if (!runtime.enableHistoricalVisitsImport) {
    return (
      <div className="px-4 py-10">
        <h1 className="text-2xl font-bold text-white">Importar visitas históricas</h1>
        <p className="text-oc-muted mt-2">
          Esta función no está disponible en este entorno. Contacta al administrador del sistema.
        </p>
        <Link to="/app/admin/membresias" className="text-sm text-oc-red hover:underline mt-4 inline-block">
          Volver a membresías
        </Link>
      </div>
    )
  }
  return <ImportarVisitasContent />
}

function ImportarVisitasContent() {
  const [file, setFile] = useState<File | null>(null)
  const [sheetName, setSheetName] = useState('ENERO 2026')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [preview, setPreview] = useState<VisitPreviewResponse | null>(null)
  const [commitResult, setCommitResult] = useState<Record<string, unknown> | null>(null)
  const [summaries, setSummaries] = useState<VisitSummaryItem[]>([])
  const [totalsByMonth, setTotalsByMonth] = useState<Record<string, number>>({})

  const showNotice = (type: Notice['type'], text: string) => {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 6000)
  }

  const canCommit = useMemo(() => {
    if (!preview) return false
    return preview.preview_summary.can_commit && preview.status === 'preview'
  }, [preview])

  const loadSummaries = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/historical-visits/admin/summaries`)
      setSummaries(res.data.items || [])
      setTotalsByMonth(res.data.totals_by_month || {})
    } catch {
      // Vista opcional si aún no hay importaciones
    }
  }, [])

  const handlePreview = useCallback(async () => {
    if (!file || busy) return
    setBusy(true)
    setCommitResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (sheetName.trim()) formData.append('sheet_name', sheetName.trim())
      const res = await axios.post<VisitPreviewResponse>(
        `${API_URL}/historical-visits/admin/imports/preview`,
        formData,
      )
      setPreview(res.data)
      showNotice('success', 'Vista previa generada. Revisa matches antes de confirmar.')
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo generar la vista previa'))
    } finally {
      setBusy(false)
    }
  }, [file, sheetName, busy])

  const handleCommit = useCallback(async () => {
    if (!preview || !canCommit || busy) return
    if (!window.confirm('¿Confirmar importación de visitas históricas agregadas?')) return
    setBusy(true)
    try {
      const res = await axios.post(`${API_URL}/historical-visits/admin/imports/commit`, {
        batch_id: preview.batch_id,
      })
      setCommitResult(res.data)
      setPreview((prev) => (prev ? { ...prev, status: 'committed' } : prev))
      await loadSummaries()
      showNotice('success', 'Importación de visitas completada')
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo completar la importación'))
    } finally {
      setBusy(false)
    }
  }, [preview, canCommit, busy, loadSummaries])

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setCommitResult(null)
  }

  return (
    <div className="px-4 space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Importar visitas históricas</h1>
          <p className="text-oc-muted mt-1">
            Carga un archivo .xlsx con el bloque superior de visitas agregadas por mes. No uses el importador de pagos.
          </p>
          <p className="text-amber-200/90 text-sm mt-2">
            Estas visitas históricas no generan pagos, ciclos, adeudos ni recordatorios.
          </p>
        </div>
        <Link to="/app/admin/membresias" className="text-sm text-oc-red hover:underline">
          Volver a membresías
        </Link>
      </div>

      {notice && (
        <div
          className={`rounded px-4 py-3 text-sm ${
            notice.type === 'success' ? 'bg-green-900/40 text-green-100' : 'bg-red-900/40 text-red-100'
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="bg-oc-metal border border-oc-border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Archivo</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-oc-light">
            Archivo (.xlsx o .csv)
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="mt-1 block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <label className="block text-sm text-oc-light">
            Hoja (Excel)
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="mt-1 w-full rounded bg-oc-dark border border-oc-border px-3 py-2"
              placeholder="ENERO 2026"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!file || busy}
            onClick={() => void handlePreview()}
            className="bg-oc-red hover:bg-oc-red-deep disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            Generar preview
          </button>
          <button type="button" onClick={handleReset} className="border border-oc-border text-oc-light px-4 py-2 rounded">
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => void loadSummaries()}
            className="border border-oc-border text-oc-light px-4 py-2 rounded"
          >
            Ver importadas
          </button>
        </div>
      </section>

      {preview && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Socios distintos', preview.preview_summary.distinct_members],
              ['Celdas socio×mes', preview.preview_summary.total_summaries],
              ['Matched', preview.preview_summary.matched_members],
              ['Total visitas', preview.preview_summary.total_visits],
              ['New candidate', preview.preview_summary.new_candidates],
              ['Ambiguous', preview.preview_summary.ambiguous_members],
              ['Unmatched', preview.preview_summary.unmatched_members],
            ].map(([label, value]) => (
              <div key={label} className="bg-oc-metal border border-oc-border rounded-lg p-3">
                <div className="text-xs text-oc-muted">{label}</div>
                <div className="text-2xl font-bold text-white">{value}</div>
              </div>
            ))}
          </section>

          {Object.keys(preview.preview_summary.visits_by_period).length > 0 && (
            <section className="bg-oc-metal border border-oc-border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-2">Visitas por mes (preview)</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(preview.preview_summary.visits_by_period).map(([month, total]) => (
                  <span key={month} className="text-sm bg-oc-dark border border-oc-border rounded px-2 py-1 text-oc-light">
                    {month}: {total}
                  </span>
                ))}
              </div>
            </section>
          )}

          {preview.preview_summary.blocking_errors.length > 0 && (
            <div className="bg-amber-900/30 border border-amber-700 rounded p-3 text-amber-100 text-sm">
              Bloqueos: {preview.preview_summary.blocking_errors.join(', ')}
            </div>
          )}

          <section className="bg-oc-metal border border-oc-border rounded-lg p-4 overflow-x-auto">
            <h2 className="text-lg font-semibold text-white mb-3">Registros de preview</h2>
            <table className="min-w-full text-sm text-left">
              <thead className="text-oc-muted">
                <tr>
                  <th className="py-2 pr-3">Socio</th>
                  <th className="py-2 pr-3">Mes</th>
                  <th className="py-2 pr-3">Visitas</th>
                  <th className="py-2 pr-3">Match</th>
                  <th className="py-2 pr-3">Socio encontrado</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, index) => (
                  <tr key={`${row.normalized_member_name}-${row.period_month}-${index}`} className="border-t border-oc-border/60">
                    <td className="py-2 pr-3 text-white">{row.raw_member_name}</td>
                    <td className="py-2 pr-3 text-oc-light">{row.month_label}</td>
                    <td className="py-2 pr-3 text-oc-light">{row.visits_count}</td>
                    <td className="py-2 pr-3 text-oc-light">{matchStatusLabel(row.match_status)}</td>
                    <td className="py-2 pr-3 text-oc-light">{row.matched_user_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canCommit || busy}
              onClick={() => void handleCommit()}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              Confirmar importación
            </button>
            {!canCommit && (
              <span className="text-sm text-amber-200">
                Confirmación deshabilitada: resuelve ambiguos, unmatched o new_candidate antes de importar.
              </span>
            )}
          </div>
        </>
      )}

      {commitResult && (
        <section className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-green-100 text-sm">
          Importación completada. Resumen: {JSON.stringify(commitResult.committed_summary)}
        </section>
      )}

      {summaries.length > 0 && (
        <section className="bg-oc-metal border border-oc-border rounded-lg p-4 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-3">Visitas históricas importadas</h2>
          {Object.keys(totalsByMonth).length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {Object.entries(totalsByMonth).map(([month, total]) => (
                <span key={month} className="text-xs bg-oc-dark border border-oc-border rounded px-2 py-1 text-oc-light">
                  {month}: {total}
                </span>
              ))}
            </div>
          )}
          <table className="min-w-full text-sm text-left">
            <thead className="text-oc-muted">
              <tr>
                <th className="py-2 pr-3">Socio</th>
                <th className="py-2 pr-3">Mes</th>
                <th className="py-2 pr-3">Visitas</th>
                <th className="py-2 pr-3">Hoja</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((item) => (
                <tr key={item.id} className="border-t border-oc-border/60">
                  <td className="py-2 pr-3 text-white">{item.user_name || item.raw_member_name}</td>
                  <td className="py-2 pr-3 text-oc-light">{item.period_month}</td>
                  <td className="py-2 pr-3 text-oc-light">{item.visits_count}</td>
                  <td className="py-2 pr-3 text-oc-light">{item.source_sheet || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
