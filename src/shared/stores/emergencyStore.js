import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadData, saveData, generateId, now } from '../utils/storage.js'

export const useEmergencyStore = defineStore('emergencies', () => {
  const items = ref(loadData('emergencies', []))
  const activeEmergency = ref(null)

  function persist() { saveData('emergencies', items.value) }

  const history = computed(() => [...items.value].sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt)))

  function trigger({ message, severity = 'critical', targetLocationIds = [], displayDuration = 60, triggeredBy = 'user-admin' }) {
    const emergency = {
      id: generateId(),
      message,
      severity,
      targetLocationIds,
      displayDuration,
      triggeredBy,
      triggeredAt: now(),
      acknowledgedAt: null
    }
    items.value.push(emergency)
    activeEmergency.value = emergency
    persist()

    setTimeout(() => {
      if (activeEmergency.value && activeEmergency.value.id === emergency.id) {
        dismiss(emergency.id)
      }
    }, displayDuration * 1000)

    return emergency
  }

  function dismiss(id) {
    const emergency = items.value.find(e => e.id === id)
    if (emergency) {
      emergency.acknowledgedAt = now()
      persist()
    }
    if (activeEmergency.value && activeEmergency.value.id === id) {
      activeEmergency.value = null
    }
  }

  return { items, activeEmergency, history, trigger, dismiss, persist }
})
