import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { generateId, now } from '../utils/storage.js'
import { displayProgramRepository } from '../repositories/appRepositories.js'
import { getDefaultDisplayPrograms } from '../displayEngine/displayProgramRules.js'
import { commitRef } from './storeCommit.js'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export const useDisplayProgramStore = defineStore('displayPrograms', () => {
  const items = ref(displayProgramRepository.load())
  const defaults = computed(() => getDefaultDisplayPrograms())

  function persist() { displayProgramRepository.save(items.value) }

  function getById(id) {
    return items.value.find(program => program.id === id) || defaults.value.find(program => program.id === id) || null
  }

  function add(program) {
    const item = {
      ...clone(program),
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      entries: program.entries || [],
    }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(program => program.id === id)
    if (idx === -1) return null
    const updated = { ...items.value[idx], ...clone(changes), updatedAt: now() }
    commitRef(items, items.value.map((program, programIdx) => programIdx === idx ? updated : program), persist)
    return updated
  }

  function remove(id) {
    commitRef(items, items.value.filter(program => program.id !== id), persist)
  }

  function resetDefaults() {
    commitRef(items, getDefaultDisplayPrograms(), persist)
  }

  return { items, defaults, getById, add, update, remove, resetDefaults, persist }
})
