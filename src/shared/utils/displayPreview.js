const STORAGE_PREFIX = 'dsb_display_preview_'
const PREVIEW_TTL_MS = 60 * 60 * 1000

function makeToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function storageKey(token) {
  return `${STORAGE_PREFIX}${token}`
}

function getStorage() {
  if (!globalThis.localStorage) {
    throw new Error('Display-Vorschau kann nicht gespeichert werden: localStorage ist nicht verfügbar.')
  }
  return globalThis.localStorage
}

function previewStorageKeys(storage) {
  const keys = []
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key)
  }
  return keys
}

export function cleanupExpiredDisplayPreviews(nowTs = Date.now()) {
  let storage
  try {
    storage = getStorage()
  } catch {
    return 0
  }

  let removed = 0
  previewStorageKeys(storage).forEach((key) => {
    try {
      const payload = JSON.parse(storage.getItem(key) || 'null')
      if (!payload?.content || Number(payload.expiresAt || 0) < nowTs) {
        storage.removeItem(key)
        removed++
      }
    } catch {
      storage.removeItem(key)
      removed++
    }
  })
  return removed
}

export function saveDisplayPreview(content) {
  cleanupExpiredDisplayPreviews()
  const token = makeToken()
  const payload = {
    content,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + PREVIEW_TTL_MS,
  }
  getStorage().setItem(storageKey(token), JSON.stringify(payload))
  return token
}

export function loadDisplayPreview(token) {
  if (!token) return null
  try {
    const storage = getStorage()
    const raw = storage.getItem(storageKey(token))
    if (!raw) return null
    const payload = JSON.parse(raw)
    if (!payload?.content || Number(payload.expiresAt || 0) < Date.now()) {
      storage.removeItem(storageKey(token))
      return null
    }
    return payload
  } catch (error) {
    console.warn('[DisplayPreview] Vorschau konnte nicht geladen werden:', error)
    return null
  }
}
