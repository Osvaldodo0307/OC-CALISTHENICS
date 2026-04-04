const MX_TIME_ZONE = 'America/Mexico_City'

function getPart(
  date: Date,
  type: Intl.DateTimeFormatPartTypes,
  options: Intl.DateTimeFormatOptions,
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MX_TIME_ZONE,
    ...options,
  }).formatToParts(date)
  const value = parts.find((part) => part.type === type)?.value
  return value ?? ''
}

export function getMxDateString(date: Date = new Date()): string {
  const year = getPart(date, 'year', { year: 'numeric' })
  const month = getPart(date, 'month', { month: '2-digit' })
  const day = getPart(date, 'day', { day: '2-digit' })
  return `${year}-${month}-${day}`
}

export function getMxHour(date: Date = new Date()): number {
  return Number(getPart(date, 'hour', { hour: '2-digit', hour12: false }))
}

export function ymdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

export function addDaysToYmd(ymd: string, days: number): string {
  const dt = ymdToUtcDate(ymd)
  dt.setUTCDate(dt.getUTCDate() + days)
  const year = dt.getUTCFullYear()
  const month = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const day = String(dt.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ymdWeekday(ymd: string): number {
  return ymdToUtcDate(ymd).getUTCDay()
}

export function ymdDayOfMonth(ymd: string): number {
  return ymdToUtcDate(ymd).getUTCDate()
}

export function ymdMonthIndex(ymd: string): number {
  return ymdToUtcDate(ymd).getUTCMonth()
}

export function ymdYear(ymd: string): number {
  return ymdToUtcDate(ymd).getUTCFullYear()
}

export function startOfWeekMondayYmd(ymd: string): string {
  const weekday = ymdWeekday(ymd)
  const diff = weekday === 0 ? -6 : 1 - weekday
  return addDaysToYmd(ymd, diff)
}
