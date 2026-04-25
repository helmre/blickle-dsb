const DEFAULT_TZ = 'Europe/Berlin'

export function getLocationTimezone(locationId, locationStore) {
  if (!locationId || !locationStore) return DEFAULT_TZ
  const loc = locationStore.getById?.(locationId)
  return loc?.timezone || DEFAULT_TZ
}

export function formatDateTime(value, timezone = DEFAULT_TZ) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDate(value, timezone = DEFAULT_TZ) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

export function toTimestamp(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  const t = date.getTime()
  return isNaN(t) ? null : t
}

function isDateOnly(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function dateOnlyTimestamp(value, boundary) {
  const [year, month, day] = value.split('-').map(Number)
  const date = boundary === 'end'
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0)
  return date.getTime()
}

function validityTimestamp(value, boundary) {
  if (!value) return null
  if (isDateOnly(value)) return dateOnlyTimestamp(value, boundary)
  return toTimestamp(value)
}

export function isCurrentlyValid(validFrom, validUntil, nowTs = Date.now()) {
  const fromTs = validityTimestamp(validFrom, 'start')
  const untilTs = validityTimestamp(validUntil, 'end')
  if (fromTs !== null && fromTs > nowTs) return false
  if (untilTs !== null && untilTs < nowTs) return false
  return true
}

export function getValidityState(validFrom, validUntil, nowTs = Date.now()) {
  const fromTs = validityTimestamp(validFrom, 'start')
  const untilTs = validityTimestamp(validUntil, 'end')
  if (fromTs !== null && fromTs > nowTs) return 'pending'
  if (untilTs !== null && untilTs < nowTs) return 'expired'
  return 'active'
}

function datePart(value) {
  if (!value) return null
  const s = String(value)
  return s.length >= 10 ? s.slice(0, 10) : null
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function minutesFromHHMM(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  const h = Number(m[1])
  const mi = Number(m[2])
  if (h < 0 || h > 23 || mi < 0 || mi > 59) return null
  return h * 60 + mi
}

function scheduleCoversServiceDate(schedule, serviceDate) {
  const serviceDay = localDateKey(serviceDate)
  const startDay = datePart(schedule.startDate)
  const endDay = datePart(schedule.endDate)
  if (startDay && serviceDay < startDay) return false
  if (endDay && serviceDay > endDay) return false

  if (Array.isArray(schedule.weekdays) && schedule.weekdays.length > 0) {
    return schedule.weekdays.includes(weekdayOf(serviceDate))
  }

  return true
}

// Maps JS Date.getDay() (0 = Sun) to the app's convention (Mo=1..So=0 - same).
// Kept for clarity.
function weekdayOf(date) {
  return date.getDay()
}

export function isScheduleActiveNow(schedule, now = new Date()) {
  if (!schedule) return false
  if (schedule.isActive === false) return false

  const tStart = minutesFromHHMM(schedule.timeStart)
  const tEnd = minutesFromHHMM(schedule.timeEnd)
  if (tStart !== null && tEnd !== null) {
    const nowMin = now.getHours() * 60 + now.getMinutes()
    if (tStart <= tEnd) {
      if (nowMin < tStart || nowMin > tEnd) return false
      return scheduleCoversServiceDate(schedule, now)
    } else {
      // Window crosses midnight, e.g. 22:00 .. 06:00. The after-midnight
      // segment still belongs to the previous service day for date/weekday rules.
      if (nowMin >= tStart) return scheduleCoversServiceDate(schedule, now)
      if (nowMin <= tEnd) return scheduleCoversServiceDate(schedule, addDays(now, -1))
      return false
    }
  }

  return scheduleCoversServiceDate(schedule, now)
}

export { DEFAULT_TZ }
