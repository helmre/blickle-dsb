import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId } from '../utils/storage.js'
import { isScheduleActiveNow } from '../utils/datetime.js'
import { scheduleRepository } from '../repositories/appRepositories.js'
import { commitRef } from './storeCommit.js'

export const useScheduleStore = defineStore('schedules', () => {
  const items = ref(scheduleRepository.load())

  function persist() { scheduleRepository.save(items.value) }

  function getById(id) { return items.value.find(s => s.id === id) }

  const activeSchedules = computed(() => {
    const now = new Date()
    return items.value.filter(schedule => isScheduleActiveNow(schedule, now))
  })

  function getForLocation(locationId) {
    return items.value.filter(s => Array.isArray(s.locationIds) && s.locationIds.includes(locationId))
  }

  function add(schedule) {
    const item = { ...schedule, id: generateId(), isActive: true }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx === -1) return null
    const updated = { ...items.value[idx], ...changes }
    commitRef(items, items.value.map((schedule, scheduleIdx) => scheduleIdx === idx ? updated : schedule), persist)
    return updated
  }

  function remove(id) {
    commitRef(items, items.value.filter(s => s.id !== id), persist)
  }

  function removeForTarget(targetType, targetId) {
    const nextItems = items.value.filter(schedule =>
      schedule.targetType !== targetType || schedule.targetId !== targetId
    )
    const removedCount = items.value.length - nextItems.length
    if (removedCount > 0) commitRef(items, nextItems, persist)
    return removedCount
  }

  return { items, activeSchedules, getById, getForLocation, add, update, remove, removeForTarget, persist }
})
