const PREFIX = 'dsb_'

export class StorageError extends Error {
  constructor(key, cause) {
    const quotaHint = isQuotaExceeded(cause) ? ' Speicherplatz/Quota ist voll.' : ''
    super(`Daten konnten nicht gespeichert werden (${PREFIX}${key}).${quotaHint}`)
    this.name = 'StorageError'
    this.key = key
    this.cause = cause
  }
}

function isQuotaExceeded(error) {
  return error?.name === 'QuotaExceededError' ||
    error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error?.code === 22 ||
    error?.code === 1014
}

export function loadData(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch (error) {
    throw new StorageError(key, error)
  }
}

export function removeData(key) {
  localStorage.removeItem(PREFIX + key)
}

export function clearAllData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}

export function generateId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function now() {
  return new Date().toISOString()
}
