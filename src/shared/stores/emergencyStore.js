import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId, now } from '../utils/storage.js'
import { emergencyRepository } from '../repositories/appRepositories.js'
import { commitRef } from './storeCommit.js'

export const useEmergencyStore = defineStore('emergencies', () => {
  const items = ref(emergencyRepository.load())
  const nowTs = ref(Date.now())
  let clockTimer = null

  function persist() { emergencyRepository.save(items.value) }

  const history = computed(() => [...items.value].sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt)))
  const activeEmergency = computed(() => {
    return history.value.find((emergency) => {
      if (emergency.acknowledgedAt) return false
      return getEmergencyExpiresAt(emergency) > nowTs.value
    }) || null
  })

  function startClock() {
    if (clockTimer || typeof window === 'undefined') return
    clockTimer = window.setInterval(() => {
      nowTs.value = Date.now()
    }, 1000)
  }

  function stopClock() {
    if (!clockTimer || typeof window === 'undefined') return
    window.clearInterval(clockTimer)
    clockTimer = null
  }

  startClock()
  if (import.meta.hot) {
    import.meta.hot.dispose(stopClock)
  }

  function getEmergencyExpiresAt(emergency) {
    if (!emergency) return 0
    const explicitExpiry = Date.parse(emergency.expiresAt || '')
    if (!Number.isNaN(explicitExpiry)) return explicitExpiry
    const triggeredAt = Date.parse(emergency.triggeredAt || '')
    if (Number.isNaN(triggeredAt)) return 0
    return triggeredAt + Number(emergency.displayDuration || 0) * 1000
  }

  function trigger({ message, severity = 'critical', targetLocationIds = [], displayDuration = 60, triggeredBy = 'user-admin' }) {
    const triggeredAt = now()
    const duration = Math.max(1, Number(displayDuration) || 60)
    const emergency = {
      id: generateId(),
      message,
      severity,
      targetLocationIds: [...targetLocationIds],
      displayDuration: duration,
      triggeredBy,
      triggeredAt,
      expiresAt: new Date(Date.parse(triggeredAt) + duration * 1000).toISOString(),
      acknowledgedAt: null
    }
    commitRef(items, [...items.value, emergency], persist)
    nowTs.value = Date.now()
    return emergency
  }

  function dismiss(id, acknowledgedBy = '') {
    const idx = items.value.findIndex(e => e.id === id)
    if (idx !== -1) {
      commitRef(items, items.value.map((emergency, itemIdx) =>
        itemIdx === idx ? { ...emergency, acknowledgedAt: now(), acknowledgedBy } : emergency
      ), persist)
    }
    nowTs.value = Date.now()
  }

  return { items, activeEmergency, history, trigger, dismiss, persist, getEmergencyExpiresAt, startClock, stopClock }
})
