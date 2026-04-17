import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadData, saveData, generateId, now } from '../utils/storage.js'
import { getSeedContent } from '../utils/seedData.js'
import { getTemplateById } from '../templates/registry.js'

export const useContentStore = defineStore('content', () => {
  const items = ref(loadData('content', getSeedContent()))

  function persist() { saveData('content', items.value) }

  const approved = computed(() => items.value.filter(c => c.status === 'approved'))
  const drafts = computed(() => items.value.filter(c => c.status === 'draft'))
  const inReview = computed(() => items.value.filter(c => c.status === 'in_review'))

  function getById(id) { return items.value.find(c => c.id === id) }

  function add(content) {
    const item = { ...content, id: generateId(), createdAt: now(), updatedAt: now(), status: 'draft' }
    items.value.push(item)
    persist()
    return item
  }

  // Creates a new draft content entry from a template (designer or legacy).
  // Seeds the entry with the template's defaultParams. Caller navigates to the editor.
  function createFromTemplate(templateId, overrides = {}) {
    const tpl = getTemplateById(templateId)
    if (!tpl) return null
    const defaults = tpl.defaultParams ? JSON.parse(JSON.stringify(tpl.defaultParams)) : {}
    const content = {
      id: generateId(),
      title: overrides.title || tpl.name,
      description: overrides.description || '',
      type: 'template',
      templateId: tpl.id,
      templateParams: { ...defaults, ...(overrides.templateParams || {}) },
      tags: [],
      status: 'draft',
      createdBy: overrides.createdBy || '',
      createdAt: now(),
      updatedAt: now(),
      validFrom: overrides.validFrom || null,
      validUntil: overrides.validUntil || null,
      locationIds: overrides.locationIds || [],
    }
    items.value.push(content)
    persist()
    return content
  }

  function update(id, changes) {
    const idx = items.value.findIndex(c => c.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...changes, updatedAt: now() }
    persist()
    return items.value[idx]
  }

  function remove(id) {
    items.value = items.value.filter(c => c.id !== id)
    persist()
  }

  function setStatus(id, status) {
    return update(id, { status })
  }

  return { items, approved, drafts, inReview, getById, add, createFromTemplate, update, remove, setStatus, persist }
})
