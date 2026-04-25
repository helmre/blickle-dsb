import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId } from '../utils/storage.js'
import { currentUserRepository, userRepository } from '../repositories/appRepositories.js'
import { PERMISSIONS, can as policyCan } from '../auth/policies.js'
import { commitRef, commitRefs } from './storeCommit.js'

export const useUserStore = defineStore('users', () => {
  const items = ref(userRepository.load())
  const currentUserId = ref(currentUserRepository.load())

  function persist() {
    userRepository.save(items.value)
    currentUserRepository.save(currentUserId.value)
  }

  const currentUser = computed(() => items.value.find(u => u.id === currentUserId.value) || null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isReviewer = computed(() => policyCan(currentUser.value, PERMISSIONS.CONTENT_APPROVE))
  const isEditor = computed(() => policyCan(currentUser.value, PERMISSIONS.CONTENT_EDIT))
  function can(permission) { return policyCan(currentUser.value, permission) }

  function switchUser(userId) {
    if (!items.value.some(user => user.id === userId)) return false
    commitRefs([{ target: currentUserId, value: userId }], persist)
    return true
  }

  function getById(id) { return items.value.find(u => u.id === id) }

  function add(user) {
    const item = { ...user, id: generateId() }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(u => u.id === id)
    if (idx === -1) return null
    const updated = { ...items.value[idx], ...changes }
    commitRef(items, items.value.map((user, userIdx) => userIdx === idx ? updated : user), persist)
    return updated
  }

  function remove(id) {
    const nextUsers = items.value.filter(u => u.id !== id)
    const nextCurrentUserId = currentUserId.value === id ? nextUsers[0]?.id || '' : currentUserId.value
    commitRefs([
      { target: items, value: nextUsers },
      { target: currentUserId, value: nextCurrentUserId },
    ], persist)
  }

  return { items, currentUser, currentUserId, isAdmin, isReviewer, isEditor, can, switchUser, getById, add, update, remove, persist }
})
