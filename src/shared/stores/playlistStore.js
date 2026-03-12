import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadData, saveData, generateId, now } from '../utils/storage.js'
import { getSeedPlaylists } from '../utils/seedData.js'

export const usePlaylistStore = defineStore('playlists', () => {
  const items = ref(loadData('playlists', getSeedPlaylists()))

  function persist() { saveData('playlists', items.value) }

  function getById(id) { return items.value.find(p => p.id === id) }

  function add(playlist) {
    const item = { ...playlist, id: generateId(), createdAt: now(), updatedAt: now(), items: playlist.items || [] }
    items.value.push(item)
    persist()
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(p => p.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...changes, updatedAt: now() }
    persist()
    return items.value[idx]
  }

  function remove(id) {
    items.value = items.value.filter(p => p.id !== id)
    persist()
  }

  function addItem(playlistId, contentId, duration = 15) {
    const playlist = getById(playlistId)
    if (!playlist) return
    const order = playlist.items.length + 1
    playlist.items.push({ id: generateId(), contentId, duration, order, transition: 'fade' })
    persist()
  }

  function removeItem(playlistId, itemId) {
    const playlist = getById(playlistId)
    if (!playlist) return
    playlist.items = playlist.items.filter(i => i.id !== itemId)
    playlist.items.forEach((item, idx) => { item.order = idx + 1 })
    persist()
  }

  function reorderItems(playlistId, newItems) {
    const playlist = getById(playlistId)
    if (!playlist) return
    playlist.items = newItems.map((item, idx) => ({ ...item, order: idx + 1 }))
    persist()
  }

  return { items, getById, add, update, remove, addItem, removeItem, reorderItems, persist }
})
