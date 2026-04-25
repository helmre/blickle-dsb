import { DEFAULT_TZ, formatDate } from '../utils/datetime.js'

export { DEFAULT_TZ }

export const WEEKDAYS = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'So' },
]

export function createDefaultScheduleDraft(overrides = {}) {
  return {
    targetType: 'content',
    targetId: '',
    startDate: '',
    endDate: '',
    locationIds: [],
    recurrence: 'none',
    allDay: true,
    timeStart: '',
    timeEnd: '',
    weekdays: [],
    ...overrides,
  }
}

export function normalizeScheduleDraft(draft) {
  return {
    targetType: draft.targetType,
    targetId: draft.targetId,
    startDate: draft.startDate,
    endDate: draft.endDate,
    locationIds: [...(draft.locationIds || [])],
    recurrence: draft.recurrence,
    timeStart: draft.allDay ? null : (draft.timeStart || null),
    timeEnd: draft.allDay ? null : (draft.timeEnd || null),
    weekdays: draft.weekdays?.length ? [...draft.weekdays] : null,
  }
}

export function validateScheduleDraft(draft) {
  const issues = []

  if (!draft.targetId) {
    issues.push({ key: 'targetId', message: 'Bitte Inhalt, Playlist oder Programm auswählen.' })
  }
  if (!draft.startDate) {
    issues.push({ key: 'startDate', message: 'Startdatum ist erforderlich.' })
  }
  if (!draft.endDate) {
    issues.push({ key: 'endDate', message: 'Enddatum ist erforderlich.' })
  }
  if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
    issues.push({ key: 'dateRange', message: 'Enddatum darf nicht vor dem Startdatum liegen.' })
  }
  if (!draft.allDay && (!draft.timeStart || !draft.timeEnd)) {
    issues.push({ key: 'timeWindow', message: 'Bei Zeitfenstern bitte Von und Bis ausfüllen.' })
  }

  return issues
}

export function weekdayPreset(preset) {
  if (preset === 'all') return [1, 2, 3, 4, 5, 6, 0]
  if (preset === 'workdays') return [1, 2, 3, 4, 5]
  if (preset === 'weekend') return [6, 0]
  return []
}

export function formatWeekdays(weekdays) {
  if (!Array.isArray(weekdays) || weekdays.length === 0) return 'Alle Tage'
  if (weekdays.length === 7) return 'Alle Tage'
  const sorted = [...weekdays].sort((a, b) => {
    const norm = value => (value === 0 ? 7 : value)
    return norm(a) - norm(b)
  })
  return sorted.map(value => WEEKDAYS.find(weekday => weekday.value === value)?.label || '').join(' ')
}

export function formatTimeWindow(schedule) {
  if (!schedule.timeStart || !schedule.timeEnd) return 'ganztägig'
  return `${schedule.timeStart}-${schedule.timeEnd}`
}

export function scheduleCoversDate(schedule, dateStr) {
  if (schedule.isActive === false) return false

  const start = (schedule.startDate || '').slice(0, 10)
  const end = (schedule.endDate || '').slice(0, 10)
  if (!(start <= dateStr && end >= dateStr)) return false

  const weekday = new Date(`${dateStr}T00:00:00`).getDay()
  if (Array.isArray(schedule.weekdays) && schedule.weekdays.length > 0) {
    return schedule.weekdays.includes(weekday)
  }

  return true
}

export function buildCalendarDays({ year, month, schedules = [] }) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const days = []

  for (let i = 0; i < startPad; i++) {
    days.push({ day: null, date: null, scheduleCount: 0, hasSchedule: false })
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const scheduleCount = schedules.filter(schedule => scheduleCoversDate(schedule, date)).length
    days.push({ day, date, scheduleCount, hasSchedule: scheduleCount > 0 })
  }

  return days
}

export function getTargetName(schedule, { contentById = new Map(), playlistById = new Map(), programById = new Map() } = {}) {
  if (schedule.targetType === 'content') {
    return contentById.get(schedule.targetId)?.title || 'Unbekannter Inhalt'
  }
  if (schedule.targetType === 'playlist') {
    return playlistById.get(schedule.targetId)?.name || 'Unbekannte Playlist'
  }
  if (schedule.targetType === 'program') {
    return programById.get(schedule.targetId)?.name || 'Unbekanntes Programm'
  }
  return 'Unbekanntes Ziel'
}

export function getLocationNames(locationIds = [], locationById = new Map()) {
  return locationIds.map(id => locationById.get(id)?.name || id).join(', ')
}

export function describeSchedule(schedule, lookups = {}) {
  return {
    targetName: getTargetName(schedule, lookups),
    locationNames: getLocationNames(schedule.locationIds || [], lookups.locationById),
    dateRange: `${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}`,
    timeWindow: formatTimeWindow(schedule),
    weekdays: formatWeekdays(schedule.weekdays),
    timezone: DEFAULT_TZ,
  }
}
