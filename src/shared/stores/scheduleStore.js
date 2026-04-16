import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadData, saveData, generateId, now } from '../utils/storage.js'
import { isCurrentlyValid } from '../utils/datetime.js'

export const useScheduleStore = defineStore('schedules', () => {
  const items = ref(loadData('schedules', []))

  function persist() { saveData('schedules', items.value) }

  function getById(id) { return items.value.find(s => s.id === id) }

  const activeSchedules = computed(() => {
    const nowTs = Date.now()
    return items.value.filter(s => s.isActive && isCurrentlyValid(s.startDate, s.endDate, nowTs))
  })

  function getForLocation(locationId) {
    return items.value.filter(s => s.locationIds.includes(locationId))
  }

  function add(schedule) {
    const item = { ...schedule, id: generateId(), isActive: true }
    items.value.push(item)
    persist()
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...changes }
    persist()
    return items.value[idx]
  }

  function remove(id) {
    items.value = items.value.filter(s => s.id !== id)
    persist()
  }

  return { items, activeSchedules, getById, getForLocation, add, update, remove, persist }
})
