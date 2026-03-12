import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadData, saveData, generateId } from '../utils/storage.js'
import { getSeedLayouts } from '../utils/seedData.js'

export const useLayoutStore = defineStore('layouts', () => {
  const items = ref(loadData('layouts', getSeedLayouts()))

  function persist() { saveData('layouts', items.value) }

  function getById(id) { return items.value.find(l => l.id === id) }

  function add(layout) {
    const item = { ...layout, id: generateId() }
    items.value.push(item)
    persist()
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(l => l.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...changes }
    persist()
    return items.value[idx]
  }

  function remove(id) {
    items.value = items.value.filter(l => l.id !== id)
    persist()
  }

  return { items, getById, add, update, remove, persist }
})
