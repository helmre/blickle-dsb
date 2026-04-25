import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateId } from '../utils/storage.js'
import { layoutRepository } from '../repositories/appRepositories.js'
import { commitRef } from './storeCommit.js'

export const useLayoutStore = defineStore('layouts', () => {
  const items = ref(layoutRepository.load())

  function persist() { layoutRepository.save(items.value) }

  function getById(id) { return items.value.find(l => l.id === id) }

  function add(layout) {
    const item = { ...layout, id: generateId() }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(l => l.id === id)
    if (idx === -1) return null
    const updated = { ...items.value[idx], ...changes }
    commitRef(items, items.value.map((layout, layoutIdx) => layoutIdx === idx ? updated : layout), persist)
    return updated
  }

  function remove(id) {
    commitRef(items, items.value.filter(l => l.id !== id), persist)
  }

  return { items, getById, add, update, remove, persist }
})
