import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadData, saveData, generateId } from '../utils/storage.js'
import { getSeedTemplates } from '../utils/seedData.js'

export const useTemplateStore = defineStore('templates', () => {
  const items = ref(loadData('templates', getSeedTemplates()))

  function persist() { saveData('templates', items.value) }

  function getById(id) { return items.value.find(t => t.id === id) }

  function add(template) {
    const item = { ...template, id: generateId() }
    items.value.push(item)
    persist()
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(t => t.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...changes }
    persist()
    return items.value[idx]
  }

  function remove(id) {
    items.value = items.value.filter(t => t.id !== id)
    persist()
  }

  return { items, getById, add, update, remove, persist }
})
