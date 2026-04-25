import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateId } from '../utils/storage.js'
import { templateRepository } from '../repositories/appRepositories.js'
import { commitRef } from './storeCommit.js'

export const useTemplateStore = defineStore('templates', () => {
  const items = ref(templateRepository.load())

  function persist() { templateRepository.save(items.value) }

  function getById(id) { return items.value.find(t => t.id === id) }

  function add(template) {
    const item = { ...template, id: generateId() }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(t => t.id === id)
    if (idx === -1) return null
    const updated = { ...items.value[idx], ...changes }
    commitRef(items, items.value.map((template, templateIdx) => templateIdx === idx ? updated : template), persist)
    return updated
  }

  function remove(id) {
    commitRef(items, items.value.filter(t => t.id !== id), persist)
  }

  return { items, getById, add, update, remove, persist }
})
