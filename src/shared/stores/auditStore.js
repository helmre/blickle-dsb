import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId, now } from '../utils/storage.js'
import { auditRepository } from '../repositories/appRepositories.js'
import { commitRef } from './storeCommit.js'

export const useAuditStore = defineStore('audit', () => {
  const items = ref(auditRepository.load())

  function persist() { auditRepository.save(items.value) }

  const sorted = computed(() => [...items.value].sort((a, b) => b.timestamp.localeCompare(a.timestamp)))

  function log(action, entityType, entityId, userId, details = {}) {
    const entry = { id: generateId(), action, entityType, entityId, userId, timestamp: now(), details }
    commitRef(items, [...items.value, entry], persist)
    return entry
  }

  function getByEntity(entityType, entityId) {
    return items.value.filter(e => e.entityType === entityType && e.entityId === entityId)
  }

  return { items, sorted, log, getByEntity, persist }
})
