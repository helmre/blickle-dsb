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

export function isCurrentlyValid(validFrom, validUntil, nowTs = Date.now()) {
  const fromTs = toTimestamp(validFrom)
  const untilTs = toTimestamp(validUntil)
  if (fromTs !== null && fromTs > nowTs) return false
  if (untilTs !== null && untilTs < nowTs) return false
  return true
}

export function getValidityState(validFrom, validUntil, nowTs = Date.now()) {
  const fromTs = toTimestamp(validFrom)
  const untilTs = toTimestamp(validUntil)
  if (fromTs !== null && fromTs > nowTs) return 'pending'
  if (untilTs !== null && untilTs < nowTs) return 'expired'
  return 'active'
}

export { DEFAULT_TZ }
