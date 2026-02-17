export interface User {
  id: number
  username: string
  name: string
  role: 'admin' | 'socio' | 'coach'
  phone?: string
  created_at: string
}

export interface Membership {
  id: number
  user_id: number
  status: 'active' | 'expired'
  plan: 'grupal' | 'personalizado'
  expires_at?: string
  created_at: string
}

export interface ClassSession {
  id: number
  title: string
  discipline: string
  description?: string
  intensity: 'low' | 'med' | 'high'
  level: 'all' | 'inter' | 'adv'
  duration_minutes: number
  capacity: number
  start_datetime: string
  coach_id?: number
  created_at: string
}

export interface Booking {
  id: number
  user_id: number
  class_id: number
  status: 'booked' | 'canceled'
  created_at: string
  class_session?: ClassSession
}

export interface ProgressEntry {
  id: number
  student_id: number
  coach_id: number
  date: string
  discipline?: string
  metric_type: string
  value: number
  notes?: string
  created_at: string
}

export interface TrainingPlan {
  id: number
  student_id: number
  coach_id: number
  title: string
  start_date: string
  end_date: string
  goal?: string
  source?: string
  created_at: string
  items?: TrainingPlanItem[]
}

export interface TrainingPlanItem {
  id: number
  plan_id: number
  week_number: number
  day_label: string
  warmup?: string
  main: string
  accessories?: string
  cooldown?: string
  notes?: string
}

export interface VirtualAssessment {
  id: number
  student_id: number
  coach_id: number
  date: string
  goal?: string
  level?: string
  days_per_week?: number
  session_minutes?: number
  equipment_json?: Record<string, boolean>
  restrictions?: string
  preference?: string
}

export interface DashboardStats {
  active_members: number
  expired_members: number
  bookings_today: number
  avg_occupancy: number
  cancellation_rate: number
}

export interface BookingChartData {
  labels: string[]
  data: number[]
}

export interface ClassPopularityData {
  labels: string[]
  data: number[]
}
