import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadData, saveData, generateId } from '../utils/storage.js'
import { getSeedUsers } from '../utils/seedData.js'

export const useUserStore = defineStore('users', () => {
  const items = ref(loadData('users', getSeedUsers()))
  const currentUserId = ref(loadData('currentUser', 'user-admin'))

  function persist() {
    saveData('users', items.value)
    saveData('currentUser', currentUserId.value)
  }

  const currentUser = computed(() => items.value.find(u => u.id === currentUserId.value) || items.value[0])
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isReviewer = computed(() => ['admin', 'reviewer'].includes(currentUser.value?.role))
  const isEditor = computed(() => ['admin', 'reviewer', 'editor'].includes(currentUser.value?.role))

  function switchUser(userId) {
    currentUserId.value = userId
    persist()
  }

  function getById(id) { return items.value.find(u => u.id === id) }

  function add(user) {
    const item = { ...user, id: generateId() }
    items.value.push(item)
    persist()
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(u => u.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...changes }
    persist()
    return items.value[idx]
  }

  function remove(id) {
    items.value = items.value.filter(u => u.id !== id)
    persist()
  }

  return { items, currentUser, currentUserId, isAdmin, isReviewer, isEditor, switchUser, getById, add, update, remove, persist }
})
