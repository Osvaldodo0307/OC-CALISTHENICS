import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { TrainingPlan, TrainingPlanItem } from '../types'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function MiPlan() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    try {
      const response = await axios.get<TrainingPlan>(`${API_URL}/plans/my-plan`)
      setPlan(response.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status !== 404) {
          console.error('Error fetching plan:', error.response?.data || error.message)
        }
      } else {
        console.error('Error fetching plan:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  if (loading) {
    return <div className="text-white text-center py-8">Cargando plan...</div>
  }

  if (!plan) {
    return (
      <div className="px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Mi Plan de Entrenamiento</h1>
        <div className="bg-oc-metal p-8 rounded-lg border border-oc-red/20 text-center">
          <p className="text-gray-400 text-lg">
            No tienes un plan asignado. Contacta a tu coach para obtener uno.
          </p>
        </div>
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
        {plan.goal && <p className="text-gray-300 mb-4">{plan.goal}</p>}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>
            Inicio: {format(new Date(plan.start_date), "dd/MM/yyyy")}
          </span>
          <span>
            Fin: {format(new Date(plan.end_date), "dd/MM/yyyy")}
          </span>
        </div>
      </div>

      {itemsByWeek && Object.entries(itemsByWeek).map(([week, items]) => (
        <div key={week} className="bg-oc-metal p-6 rounded-lg border border-oc-red/20 mb-6">
          <h3 className="text-xl font-bold text-oc-red mb-4">Semana {week}</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-oc-dark p-4 rounded border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">{item.day_label}</h4>
                {item.warmup && (
                  <div className="mb-2">
                    <span className="text-oc-red font-semibold">Calentamiento:</span>
                    <p className="text-gray-300 text-sm ml-2">{item.warmup}</p>
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-oc-red font-semibold">Principal:</span>
                  <p className="text-gray-300 text-sm ml-2">{item.main}</p>
                </div>
                {item.accessories && (
                  <div className="mb-2">
                    <span className="text-oc-red font-semibold">Accesorios:</span>
                    <p className="text-gray-300 text-sm ml-2">{item.accessories}</p>
                  </div>
                )}
                {item.cooldown && (
                  <div className="mb-2">
                    <span className="text-oc-red font-semibold">Enfriamiento:</span>
                    <p className="text-gray-300 text-sm ml-2">{item.cooldown}</p>
                  </div>
                )}
                {item.notes && (
                  <p className="text-gray-400 text-xs italic mt-2">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
