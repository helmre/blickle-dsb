export function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  let failWrites = false

  return {
    get length() {
      return data.size
    },
    key(index) {
      return [...data.keys()][index] || null
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      if (failWrites) {
        const error = new Error('Quota exceeded')
        error.name = 'QuotaExceededError'
        throw error
      }
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    },
    clear() {
      data.clear()
    },
    snapshot() {
      return Object.fromEntries(data.entries())
    },
    failWrites(value = true) {
      failWrites = value
    },
  }
}

export function installMemoryStorage(initial = {}) {
  const storage = createMemoryStorage(initial)
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  })
  return storage
}
