const PREFIX = 'dsb_'

export function loadData(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveData(key, data) {
  localStorage.setItem(PREFIX + key, JSON.stringify(data))
}

export function removeData(key) {
  localStorage.removeItem(PREFIX + key)
}

export function clearAllData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function now() {
  return new Date().toISOString()
}
