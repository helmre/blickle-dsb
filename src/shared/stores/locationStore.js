import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId } from '../utils/storage.js'
import { locationRepository } from '../repositories/appRepositories.js'
import { getSeedLocations } from '../utils/seedData.js'
import { commitRef } from './storeCommit.js'

const LEGACY_SEED_LOCATION_NAMES = {
  'loc-global': new Set(['Blickle Global']),
  'loc-halle1': new Set(['Produktionshalle 1', 'Halle 1']),
  'loc-halle2': new Set(['Produktionshalle 2', 'Halle 2']),
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

function normalizeSeedName(seed, existing) {
  const savedName = String(existing?.name || '').trim()
  if (!savedName) return seed.name
  if (LEGACY_SEED_LOCATION_NAMES[seed.id]?.has(savedName)) return seed.name
  return savedName
}

function normalizeLocations(loadedLocations) {
  const loaded = Array.isArray(loadedLocations) ? loadedLocations : []
  const canonical = getSeedLocations()
  const byId = new Map(loaded.map(location => [location.id, location]))
  const normalized = canonical.map(seed => {
    const existing = byId.get(seed.id)
    if (!existing) return seed
    return {
      ...seed,
      ...existing,
      name: normalizeSeedName(seed, existing),
      parentId: hasOwn(existing, 'parentId') ? existing.parentId : seed.parentId,
      timezone: existing.timezone || seed.timezone,
      layoutId: existing.layoutId || seed.layoutId,
      isActive: existing.isActive ?? seed.isActive,
      zoneAssignments: existing.zoneAssignments || seed.zoneAssignments,
    }
  })
  const custom = loaded.filter(location => location.id && !canonical.some(seed => seed.id === location.id))
  return [...normalized, ...custom]
}

function locationError(message, details = {}) {
  const error = new Error(message)
  error.name = 'LocationError'
  Object.assign(error, details)
  return error
}

export const useLocationStore = defineStore('locations', () => {
  const items = ref(normalizeLocations(locationRepository.load()))
  try {
    locationRepository.save(items.value)
  } catch (error) {
    console.warn('[LocationStore] Standort-Migration konnte nicht persistiert werden:', error)
  }

  function persist() { locationRepository.save(items.value) }

  function getById(id) { return items.value.find(l => l.id === id) }

  const rootLocations = computed(() => items.value.filter(l => l.parentId === null))
  const displayLocations = computed(() => items.value.filter(l => l.id !== 'loc-global'))

  function getChildren(parentId) { return items.value.filter(l => l.parentId === parentId) }

  function getDescendantIds(parentId) {
    const descendants = []
    const queue = [parentId]
    const seen = new Set([parentId])

    while (queue.length) {
      const currentId = queue.shift()
      items.value
        .filter(location => location.parentId === currentId)
        .forEach((child) => {
          if (seen.has(child.id)) return
          seen.add(child.id)
          descendants.push(child.id)
          queue.push(child.id)
        })
    }

    return descendants
  }

  function add(location) {
    const item = { ...location, id: generateId(), isActive: true, zoneAssignments: [] }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(l => l.id === id)
    if (idx === -1) return null
    const updated = { ...items.value[idx], ...changes }
    commitRef(items, items.value.map((location, locationIdx) => locationIdx === idx ? updated : location), persist)
    return updated
  }

  function remove(id) {
    const descendantIds = getDescendantIds(id)
    if (descendantIds.length) {
      throw locationError('Standort hat untergeordnete Standorte und kann nicht direkt gelöscht werden.', {
        locationId: id,
        descendantIds,
      })
    }
    commitRef(items, items.value.filter(l => l.id !== id), persist)
  }

  return { items, rootLocations, displayLocations, getById, getChildren, getDescendantIds, add, update, remove, persist }
})
