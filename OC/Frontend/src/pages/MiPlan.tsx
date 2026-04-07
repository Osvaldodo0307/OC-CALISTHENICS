import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { TrainingPlan, TrainingPlanItem } from '../types'
import { format } from 'date-fns'
import { runtime } from '../config/runtime'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { toUserMessage } from '../services/api/errorMessages'

const API_URL = runtime.apiBaseUrl

export default function MiPlan() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlan = useCallback(async () => {
    setError(null)
    try {
      const response = await axios.get<TrainingPlan>(`${API_URL}/plans/my-plan`)
      setPlan(response.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status !== 404) {
          setError(toUserMessage(error, 'No se pudo cargar tu plan.'))
        }
      } else {
        setError('No se pudo cargar tu plan.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  if (loading) {
    return <LoadingState message="Cargando plan..." />
  }

  if (error) {
    return (
      <div className="px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Mi Plan de Entrenamiento</h1>
        <ErrorState message={error} onRetry={() => {
          setLoading(true)
          void fetchPlan()
        }} />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Mi Plan de Entrenamiento</h1>
        <EmptyState
          title="Aun no tienes plan asignado"
          message="Contacta a tu coach para obtener un plan de entrenamiento."
        />
      </div>
    )
  }

  const itemsByWeek = plan.items?.reduce<Record<number, TrainingPlanItem[]>>((acc, item) => {
    if (!acc[item.week_number]) {
      acc[item.week_number] = []
    }
    acc[item.week_number].push(item)
    return acc
  }, {})

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Mi Plan de Entrenamiento</h1>

      <div className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
        <h2 className="text-2xl font-semibold text-oc-red mb-2">{plan.title}</h2>
        {plan.goal && <p className="text-oc-light/90 mb-4">{plan.goal}</p>}
        <div className="flex gap-4 text-sm text-oc-muted">
          <span>
            Inicio: {format(new Date(plan.start_date), "dd/MM/yyyy")}
          </span>
          <span>
            Fin: {format(new Date(plan.end_date), "dd/MM/yyyy")}
          </span>
        </div>
      </div>

      {!itemsByWeek || Object.keys(itemsByWeek).length === 0 ? (
        <EmptyState
          title="Plan sin detalle"
          message="Tu plan no tiene bloques semanales cargados todavia."
        />
      ) : Object.entries(itemsByWeek).map(([week, items]) => (
        <div key={week} className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
          <h3 className="text-xl font-bold text-oc-red mb-4">Semana {week}</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-oc-dark p-4 rounded border border-oc-border">
                <h4 className="text-lg font-semibold text-white mb-2">{item.day_label}</h4>
                {item.warmup && (
                  <div className="mb-2">
                    <span className="text-oc-red font-semibold">Calentamiento:</span>
                    <p className="text-oc-light/90 text-sm ml-2">{item.warmup}</p>
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-oc-red font-semibold">Principal:</span>
                  <p className="text-oc-light/90 text-sm ml-2">{item.main}</p>
                </div>
                {item.accessories && (
                  <div className="mb-2">
                    <span className="text-oc-red font-semibold">Accesorios:</span>
                    <p className="text-oc-light/90 text-sm ml-2">{item.accessories}</p>
                  </div>
                )}
                {item.cooldown && (
                  <div className="mb-2">
                    <span className="text-oc-red font-semibold">Enfriamiento:</span>
                    <p className="text-oc-light/90 text-sm ml-2">{item.cooldown}</p>
                  </div>
                )}
                {item.notes && (
                  <p className="text-oc-muted text-xs italic mt-2">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
