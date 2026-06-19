import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { runtime } from '../../config/runtime'
import { toUserMessage } from '../../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

type Notice = { type: 'success' | 'error'; text: string }

type PreviewSummary = {
  total_rows: number
  new_members: number
  existing_members: number
  ambiguous_members: number
  payments_to_create: number
  cycles_to_create: number
  error_rows: number
  warning_rows: number
  duplicate_rows: number
  estimated_real_income: number
  estimated_courtesies: number
  estimated_adjustments: number
  estimated_pending_balance: number
  blocking_errors: boolean
}

type PreviewRow = {
  row_number: number
  status: string
  socio_nombre?: string
  telefono?: string
  fecha_pago?: string
  monto_pagado?: number
  metodo_pago?: string
  socio_match?: string
  matched_user_id?: number
  candidate_user_ids?: number[]
  errors?: { code: string; message: string }[]
  warnings?: { code: string; message: string }[]
}

type PreviewResponse = {
  batch_id: number
  status: string
  diagnosis: {
    sheets?: string[]
    selected_sheet?: string
    columns_detected?: string[]
    column_mapping_suggested?: Record<string, string>
    can_preview?: boolean
    can_import?: boolean
    blocking_errors?: string[]
    duplicate_rows?: { row_numbers: number[] }[]
  }
  column_mapping: Record<string, string>
  preview_summary: PreviewSummary
  rows: PreviewRow[]
}

const TEMPLATE_COLUMNS = [
  'socio_nombre',
  'telefono',
  'plan',
  'fecha_pago',
  'monto_pagado',
  'metodo_pago',
  'periodo_inicio',
  'periodo_fin',
  'payment_action',
  'counts_as_income',
  'applies_to_balance',
  'saldo_pendiente',
  'nota',
  'fuente_archivo',
  'referencia_externa',
]

function fmtMoney(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)
}

export default function ImportarPagos() {
  const [file, setFile] = useState<File | null>(null)
  const [sheetName, setSheetName] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [confirmDuplicates, setConfirmDuplicates] = useState<number[]>([])
  const [ambiguousResolution, setAmbiguousResolution] = useState<Record<number, number>>({})
  const [commitResult, setCommitResult] = useState<Record<string, unknown> | null>(null)

  const showNotice = (type: Notice['type'], text: string) => {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 6000)
  }

  const availableSheets = preview?.diagnosis?.sheets || []

  const duplicateRowNumbers = useMemo(() => {
    if (!preview) return []
    return preview.rows
      .filter((row) => row.status === 'duplicate' || row.warnings?.some((w) => w.code.startsWith('duplicate')))
      .map((row) => row.row_number)
  }, [preview])

  const ambiguousRows = useMemo(() => {
    if (!preview) return []
    return preview.rows.filter((row) => row.socio_match === 'ambiguous')
  }, [preview])

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/membership/admin/imports/template`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_importacion_historica.csv'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo descargar la plantilla'))
    }
  }, [])

  const handleDownloadErrors = useCallback(async () => {
    if (!preview) return
    try {
      const res = await axios.get(`${API_URL}/membership/admin/imports/${preview.batch_id}/errors`)
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `errores_importacion_lote_${preview.batch_id}.json`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo descargar el reporte de errores'))
    }
  }, [preview])

  const handlePreview = useCallback(async () => {
    if (!file || busy) return
    setBusy(true)
    setCommitResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (sheetName.trim()) formData.append('sheet_name', sheetName.trim())
      if (Object.keys(columnMapping).length > 0) {
        formData.append('column_mapping_json', JSON.stringify(columnMapping))
      }
      const res = await axios.post<PreviewResponse>(`${API_URL}/membership/admin/imports/preview`, formData)
      setPreview(res.data)
      setColumnMapping(res.data.column_mapping || {})
      setConfirmDuplicates([])
      setAmbiguousResolution({})
      showNotice('success', 'Vista previa generada. Revisa antes de confirmar.')
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo generar la vista previa'))
    } finally {
      setBusy(false)
    }
  }, [file, sheetName, columnMapping, busy])

  const handleCommit = useCallback(async () => {
    if (!preview || busy) return
    if (preview.preview_summary.blocking_errors) {
      showNotice('error', 'Corrige los errores bloqueantes antes de importar')
      return
    }
    if (!window.confirm('¿Confirmas importar los registros válidos? Esta acción escribirá en la base de datos.')) {
      return
    }
    setBusy(true)
    try {
      const res = await axios.post(`${API_URL}/membership/admin/imports/commit`, {
        batch_id: preview.batch_id,
        confirm_duplicate_rows: confirmDuplicates,
        resolve_ambiguous: ambiguousResolution,
      })
      setCommitResult(res.data)
      showNotice('success', 'Importación completada')
    } catch (error) {
      showNotice('error', toUserMessage(error, 'No se pudo completar la importación'))
    } finally {
      setBusy(false)
    }
  }, [preview, busy, confirmDuplicates, ambiguousResolution])

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setCommitResult(null)
    setColumnMapping({})
    setConfirmDuplicates([])
    setAmbiguousResolution({})
  }

  const toggleDuplicate = (rowNumber: number) => {
    setConfirmDuplicates((prev) =>
      prev.includes(rowNumber) ? prev.filter((n) => n !== rowNumber) : [...prev, rowNumber],
    )
  }

  return (
    <div className="px-4 space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Importar pagos históricos</h1>
          <p className="text-oc-muted mt-1">
            Carga un archivo .xlsx o .csv, revisa la vista previa y confirma solo cuando esté validado.
            El método <code className="text-oc-muted">historico_sin_metodo</code> es solo para lotes históricos sin forma de pago registrada.
          </p>
          <p className="text-amber-200/90 text-sm mt-2">
            Los registros históricos importados se conservarán en expediente e historial, pero no generarán recordatorios operativos por defecto.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/app/admin/membresias" className="text-oc-red hover:underline">
            Volver a membresías
          </Link>
          <button type="button" onClick={handleDownloadTemplate} className="text-oc-red hover:underline">
            Descargar plantilla CSV
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'border-green-700 bg-green-900/30 text-green-200'
              : 'border-red-700 bg-red-900/30 text-red-200'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="bg-oc-metal border border-oc-border rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Subir archivo</h2>
        <p className="text-sm text-oc-muted">
          Usa .xlsx o .csv exportado desde Excel/Numbers. No se aceptan archivos .numbers directamente.
        </p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-oc-muted file:mr-4 file:rounded file:border-0 file:bg-oc-red file:px-4 file:py-2 file:text-white hover:file:bg-oc-red-deep"
        />
        {file && (
          <p className="text-sm text-white">
            Archivo seleccionado: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-oc-muted">
            Hoja Excel (opcional)
            <input
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder={availableSheets[0] || 'Hoja1'}
              className="mt-1 w-full rounded bg-oc-panel border border-oc-border px-3 py-2 text-white"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!file || busy}
            onClick={handlePreview}
            className="rounded bg-oc-red px-4 py-2 text-white hover:bg-oc-red-deep disabled:opacity-50"
          >
            {busy ? 'Procesando...' : 'Generar vista previa'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-oc-border px-4 py-2 text-white hover:bg-oc-panel"
          >
            Cancelar / limpiar
          </button>
        </div>
      </div>

      {preview && (
        <>
          <div className="bg-oc-metal border border-oc-border rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">2. Diagnóstico y mapeo</h2>
              <span className="text-sm text-oc-muted">Lote #{preview.batch_id}</span>
            </div>
            {preview.diagnosis.blocking_errors && preview.diagnosis.blocking_errors.length > 0 && (
              <div className="rounded border border-red-700 bg-red-900/20 p-3 text-sm text-red-200">
                <p className="font-medium mb-1">Errores bloqueantes</p>
                <ul className="list-disc pl-5">
                  {preview.diagnosis.blocking_errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Filas leídas</p>
                <p className="text-xl text-white">{preview.preview_summary.total_rows}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Errores</p>
                <p className="text-xl text-white">{preview.preview_summary.error_rows}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Advertencias</p>
                <p className="text-xl text-white">{preview.preview_summary.warning_rows}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Duplicados</p>
                <p className="text-xl text-white">{preview.preview_summary.duplicate_rows}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-oc-muted mb-2">Columnas detectadas: {preview.diagnosis.columns_detected?.join(', ')}</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-oc-muted border-b border-oc-border">
                      <th className="py-2 pr-4">Campo esperado</th>
                      <th className="py-2">Columna del archivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPLATE_COLUMNS.map((col) => (
                      <tr key={col} className="border-b border-oc-border/60">
                        <td className="py-2 pr-4 text-white">{col}</td>
                        <td className="py-2">
                          <select
                            value={columnMapping[col] || ''}
                            onChange={(e) =>
                              setColumnMapping((prev) => ({
                                ...prev,
                                [col]: e.target.value,
                              }))
                            }
                            className="w-full rounded bg-oc-panel border border-oc-border px-2 py-1 text-white"
                          >
                            <option value="">— sin mapear —</option>
                            {(preview.diagnosis.columns_detected || []).map((source) => (
                              <option key={source} value={source}>
                                {source}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                disabled={!file || busy}
                onClick={handlePreview}
                className="mt-3 rounded border border-oc-border px-3 py-1.5 text-sm text-white hover:bg-oc-panel"
              >
                Re-generar vista previa con este mapeo
              </button>
            </div>
          </div>

          <div className="bg-oc-metal border border-oc-border rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">3. Vista previa</h2>
              <button type="button" onClick={handleDownloadErrors} className="text-sm text-oc-red hover:underline">
                Descargar reporte de errores
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Socios nuevos</p>
                <p className="text-xl text-white">{preview.preview_summary.new_members}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Socios existentes</p>
                <p className="text-xl text-white">{preview.preview_summary.existing_members}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Pagos a crear</p>
                <p className="text-xl text-white">{preview.preview_summary.payments_to_create}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Ingresos reales est.</p>
                <p className="text-xl text-white">{fmtMoney(preview.preview_summary.estimated_real_income)}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Cortesías</p>
                <p className="text-xl text-white">{preview.preview_summary.estimated_courtesies}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Ajustes</p>
                <p className="text-xl text-white">{preview.preview_summary.estimated_adjustments}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Adeudos est.</p>
                <p className="text-xl text-white">{fmtMoney(preview.preview_summary.estimated_pending_balance)}</p>
              </div>
              <div className="rounded bg-oc-panel p-3">
                <p className="text-oc-muted">Ciclos a crear</p>
                <p className="text-xl text-white">{preview.preview_summary.cycles_to_create}</p>
              </div>
            </div>

            {ambiguousRows.length > 0 && (
              <div className="rounded border border-yellow-700 bg-yellow-900/20 p-3 space-y-2">
                <p className="text-sm font-medium text-yellow-200">Resolver socios ambiguos</p>
                {ambiguousRows.map((row) => (
                  <div key={row.row_number} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-white">
                      Fila {row.row_number}: {row.socio_nombre}
                    </span>
                    <select
                      value={ambiguousResolution[row.row_number] || ''}
                      onChange={(e) =>
                        setAmbiguousResolution((prev) => ({
                          ...prev,
                          [row.row_number]: Number(e.target.value),
                        }))
                      }
                      className="rounded bg-oc-panel border border-oc-border px-2 py-1 text-white"
                    >
                      <option value="">Seleccionar socio</option>
                      {(row.candidate_user_ids || []).map((id) => (
                        <option key={id} value={id}>
                          Usuario #{id}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {duplicateRowNumbers.length > 0 && (
              <div className="rounded border border-orange-700 bg-orange-900/20 p-3 space-y-2">
                <p className="text-sm font-medium text-orange-200">Confirmar duplicados a importar</p>
                {duplicateRowNumbers.map((rowNumber) => (
                  <label key={rowNumber} className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={confirmDuplicates.includes(rowNumber)}
                      onChange={() => toggleDuplicate(rowNumber)}
                    />
                    Importar fila {rowNumber} aunque parezca duplicada
                  </label>
                ))}
              </div>
            )}

            <div className="overflow-x-auto max-h-[28rem]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-oc-metal">
                  <tr className="text-left text-oc-muted border-b border-oc-border">
                    <th className="py-2 pr-3">Fila</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Socio</th>
                    <th className="py-2 pr-3">Match</th>
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Monto</th>
                    <th className="py-2 pr-3">Método</th>
                    <th className="py-2">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.row_number} className="border-b border-oc-border/50 align-top">
                      <td className="py-2 pr-3 text-white">{row.row_number}</td>
                      <td className="py-2 pr-3 text-white">{row.status}</td>
                      <td className="py-2 pr-3 text-white">{row.socio_nombre}</td>
                      <td className="py-2 pr-3 text-white">{row.socio_match}</td>
                      <td className="py-2 pr-3 text-white">{row.fecha_pago}</td>
                      <td className="py-2 pr-3 text-white">{row.monto_pagado}</td>
                      <td className="py-2 pr-3 text-white">{row.metodo_pago}</td>
                      <td className="py-2 text-oc-muted">
                        {[...(row.errors || []), ...(row.warnings || [])].map((item) => (
                          <div key={`${row.row_number}-${item.code}`}>{item.message}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-oc-metal border border-oc-border rounded-lg p-5 space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Confirmar importación</h2>
            <p className="text-sm text-oc-muted">
              Solo se importarán filas válidas. Los errores se omiten. Los duplicados requieren confirmación explícita.
            </p>
            <button
              type="button"
              disabled={busy || preview.preview_summary.blocking_errors}
              onClick={handleCommit}
              className="rounded bg-oc-red px-4 py-2 text-white hover:bg-oc-red-deep disabled:opacity-50"
            >
              {busy ? 'Importando...' : 'Confirmar importación'}
            </button>
            {commitResult && (
              <pre className="overflow-x-auto rounded bg-oc-panel p-3 text-xs text-green-200">
                {JSON.stringify(commitResult, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  )
}
