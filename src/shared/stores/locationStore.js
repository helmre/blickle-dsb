import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadData, saveData, generateId, now } from '../utils/storage.js'
import { getSeedLocations } from '../utils/seedData.js'

export const useLocationStore = defineStore('locations', () => {
  const items = ref(loadData('locations', getSeedLocations()))

  function persist() { saveData('locations', items.value) }

  function getById(id) { return items.value.find(l => l.id === id) }

  const rootLocations = computed(() => items.value.filter(l => l.parentId === null))

  function getChildren(parentId) { return items.value.filter(l => l.parentId === parentId) }

  function add(location) {
    const item = { ...location, id: generateId(), isActive: true, zoneAssignments: [] }
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

  return { items, rootLocations, getById, getChildren, add, update, remove, persist }
})
