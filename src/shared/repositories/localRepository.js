import { loadData, removeData, saveData } from '../utils/storage.js'

function resolveDefault(defaultValue) {
  return typeof defaultValue === 'function' ? defaultValue() : defaultValue
}

export function createLocalRepository(key, defaultValue = []) {
  return {
    key,
    load() {
      return loadData(key, resolveDefault(defaultValue))
    },
    save(data) {
      saveData(key, data)
      return data
    },
    remove() {
      removeData(key)
    },
  }
}
