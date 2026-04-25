import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { displayPageRepository } from '../repositories/appRepositories.js'
import { getDefaultDisplayPages } from '../displayEngine/displayPageDefaults.js'
import { commitRef } from './storeCommit.js'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function pageKey(page) {
  return page.pageId || page.id
}

function isGlobalPage(page) {
  return !page.locationId && (!Array.isArray(page.locationIds) || page.locationIds.length === 0)
}

function matchesLocation(page, locationId) {
  if (!locationId) return isGlobalPage(page)
  if (page.locationId === locationId) return true
  return Array.isArray(page.locationIds) && page.locationIds.length === 1 && page.locationIds[0] === locationId
}

export const useDisplayPageStore = defineStore('displayPages', () => {
  const items = ref(displayPageRepository.load())

  const defaults = computed(() => getDefaultDisplayPages())

  function persist() { displayPageRepository.save(items.value) }

  function getById(id) {
    return items.value.find(page => page.id === id) || defaults.value.find(page => page.id === id) || null
  }

  function getPageConfig(pageId, locationId = '') {
    const pages = items.value.length ? items.value : defaults.value
    const locationMatch = locationId
      ? pages.find(page => pageKey(page) === pageId && matchesLocation(page, locationId))
      : null
    const globalMatch = pages.find(page => pageKey(page) === pageId && isGlobalPage(page))
    const defaultMatch = defaults.value.find(page => pageKey(page) === pageId)

    return clone(locationMatch || globalMatch || defaultMatch || null)
  }

  function savePageConfig(config) {
    const targetPageId = pageKey(config)
    const targetLocationId = config.locationId || ''
    const normalized = clone(config)
    const idx = items.value.findIndex(page =>
      pageKey(page) === targetPageId &&
      (page.locationId || '') === targetLocationId
    )

    const nextItems = idx === -1
      ? [...items.value, normalized]
      : items.value.map((page, pageIdx) => pageIdx === idx ? normalized : page)

    commitRef(items, nextItems, persist)
    return normalized
  }

  function resetPageConfig(pageId, locationId = '') {
    const nextItems = items.value.filter(page =>
      pageKey(page) !== pageId || (page.locationId || '') !== locationId
    )
    commitRef(items, nextItems, persist)
  }

  return {
    items,
    defaults,
    getById,
    getPageConfig,
    savePageConfig,
    resetPageConfig,
    persist,
  }
})

