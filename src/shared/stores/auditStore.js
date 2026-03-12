import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadData, saveData, generateId, now } from '../utils/storage.js'
import { getSeedAuditLog } from '../utils/seedData.js'

export const useAuditStore = defineStore('audit', () => {
  const items = ref(loadData('auditLog', getSeedAuditLog()))

  function persist() { saveData('auditLog', items.value) }

  const sorted = computed(() => [...items.value].sort((a, b) => b.timestamp.localeCompare(a.timestamp)))

  function log(action, entityType, entityId, userId, details = {}) {
    const entry = { id: generateId(), action, entityType, entityId, userId, timestamp: now(), details }
    items.value.push(entry)
    persist()
    return entry
  }

  function getByEntity(entityType, entityId) {
    return items.value.filter(e => e.entityType === entityType && e.entityId === entityId)
  }

  return { items, sorted, log, getByEntity, persist }
})
