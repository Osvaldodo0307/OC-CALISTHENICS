import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { User, ProgressEntry, TrainingPlan } from '../../types'
import { runtime } from '../../config/runtime'
import { Line } from 'react-chartjs-2'
import {
  type ChartData,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_URL = runtime.apiBaseUrl
const MAX_POINTS = 30
const CHART_AXIS_COLOR = '#a3a3a3'

const trimSeries = (labels: string[], data: number[], maxPoints: number) => {
  if (labels.length <= maxPoints) {
    return { labels, data }
  }
  return {
    labels: labels.slice(-maxPoints),
    data: data.slice(-maxPoints)
  }
}

export default function CoachAlumno() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<User | null>(null)
  const [progress, setProgress] = useState<ProgressEntry[]>([])
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [selectedMetric, setSelectedMetric] = useState<string>('')
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [studentRes, progressRes, plansRes] = await Promise.all([
        axios.get(`${API_URL}/students/${id}`),
        axios.get(`${API_URL}/progress/student/${id}`),
        axios.get(`${API_URL}/plans/student/${id}`)
      ])
      setStudent(studentRes.data)
      setProgress(progressRes.data)
      setPlans(plansRes.data)
      
      // Seleccionar primera métrica disponible
      if (progressRes.data.length > 0 && !selectedMetric) {
        setSelectedMetric(progressRes.data[0].metric_type)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [id, selectedMetric])

  const fetchChartData = useCallback(async (metric: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/coach/student/${id}/progress-chart?metric_type=${metric}`
      )
      const trimmed = trimSeries(response.data.labels, response.data.data, MAX_POINTS)
      setChartData({
        labels: trimmed.labels,
        datasets: [
          {
            label: metric,
            data: trimmed.data,
            borderColor: '#D21F2D',
            backgroundColor: 'rgba(210, 31, 45, 0.12)',
            tension: 0.4,
            pointRadius: 2
          }
        ]
      })
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id, fetchData])

  useEffect(() => {
    if (selectedMetric && progress.length > 0) {
      fetchChartData(selectedMetric)
    }
  }, [selectedMetric, progress.length, fetchChartData])

  const handleAddProgress = async () => {
    const date = prompt('Fecha (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    const metric = prompt('Tipo de métrica (ej: peso_corporal, dominadas_max):')
    const value = prompt('Valor:')
    const notes = prompt('Notas (opcional):')

    if (!date || !metric || !value) return

    try {
      await axios.post(`${API_URL}/progress`, {
        student_id: Number(id),
        date,
        metric_type: metric,
        value: Number(value),
        notes: notes || undefined
      })
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail
        : undefined
      alert(message || 'Error al agregar progreso')
    }
  }

  const uniqueMetrics = Array.from(new Set(progress.map((p) => p.metric_type)))
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      legend: {
        labels: {
          color: CHART_AXIS_COLOR
        }
      },
      decimation: {
        enabled: true,
        algorithm: 'lttb' as const,
        samples: 50
      }
    },
    scales: {
      x: {
        ticks: {
          color: CHART_AXIS_COLOR,
          maxTicksLimit: 8
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: CHART_AXIS_COLOR,
          maxTicksLimit: 6
        },
        grid: {
          color: 'rgba(163, 163, 163, 0.12)'
        }
      }
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Cargando...</div>
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{student?.name}</h1>
        <div className="flex gap-2">
          <Link
            to={`/app/coach/asistencia-virtual/${id}`}
            className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm"
          >
            Asistencia Virtual
          </Link>
          <button
            onClick={handleAddProgress}
            className="bg-oc-red hover:bg-oc-red-deep text-white px-4 py-2 rounded text-sm"
          >
            Agregar Progreso
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
          <h2 className="text-xl font-semibold text-oc-red mb-4">Progresos</h2>
          {progress.length === 0 ? (
            <p className="text-oc-muted">No hay progresos registrados</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {progress.map((entry) => (
                <div key={entry.id} className="bg-oc-dark p-3 rounded border border-oc-border">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">{entry.metric_type}</span>
                    <span className="text-oc-red font-bold">{entry.value}</span>
                  </div>
                  <p className="text-sm text-oc-muted">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                  {entry.notes && <p className="text-sm text-oc-light/90 mt-1">{entry.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
          <h2 className="text-xl font-semibold text-oc-red mb-4">Gráfico de Progreso</h2>
          {uniqueMetrics.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-oc-light/90 mb-2">Métrica</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full bg-oc-dark border border-oc-border rounded px-4 py-2 text-white"
              >
                {uniqueMetrics.map((metric) => (
                  <option key={metric} value={metric}>
                    {metric}
                  </option>
                ))}
              </select>
            </div>
          )}
          {chartData && (
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20">
        <h2 className="text-xl font-semibold text-oc-red mb-4">Planes de Entrenamiento</h2>
        {plans.length === 0 ? (
          <p className="text-oc-muted">No hay planes asignados</p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-oc-dark p-4 rounded border border-oc-border">
                <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                {plan.goal && <p className="text-oc-light/90 text-sm">{plan.goal}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
