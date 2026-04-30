import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateId, now } from '../utils/storage.js'
import { playlistRepository } from '../repositories/appRepositories.js'
import { isPlaylistLooping } from '../playlists/playlistRules.js'
import { commitRef } from './storeCommit.js'

function normalizeSeedPlaylist(items) {
  let changed = false
  const normalized = items.map((playlist) => {
    if (playlist.id !== 'playlist-home' || !playlist.items?.length) return playlist
    const psaItem = playlist.items.find(item => item.contentId === 'content-2')
    if (!psaItem) return playlist

    const existingStrobel = playlist.items.find(item => item.contentId === 'content-strobel')
    const strobelItem = existingStrobel || {
      id: 'pi-strobel',
      contentId: 'content-strobel',
      duration: 60,
      order: (psaItem.order || 1) + 1,
      transition: 'fade',
    }

    const remaining = playlist.items
      .filter(item => item.contentId !== 'content-2' && item.contentId !== 'content-strobel')
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const nextItems = [psaItem, strobelItem, ...remaining]
      .map((item, index) => ({
        ...item,
        order: index + 1,
        duration: item.contentId === 'content-strobel' ? (item.duration || 60) : item.duration,
      }))

    const wasAlreadyNormalized = playlist.items.length === nextItems.length &&
      playlist.items.every((item, index) => item.contentId === nextItems[index]?.contentId && item.order === nextItems[index]?.order)

    if (wasAlreadyNormalized) return playlist
    changed = true
    return { ...playlist, items: nextItems }
  })
  return { items: normalized, changed }
}

export const usePlaylistStore = defineStore('playlists', () => {
  const loadedItems = playlistRepository.load()
  const normalizedPlaylists = normalizeSeedPlaylist(loadedItems)
  const items = ref(normalizedPlaylists.items)
  if (normalizedPlaylists.changed) playlistRepository.save(normalizedPlaylists.items)

  function persist() { playlistRepository.save(items.value) }

  function getById(id) { return items.value.find(p => p.id === id) }

  function add(playlist) {
    const loop = isPlaylistLooping(playlist)
    const item = { ...playlist, loop, isLoop: loop, id: generateId(), createdAt: now(), updatedAt: now(), items: playlist.items || [] }
    commitRef(items, [...items.value, item], persist)
    return item
  }

  function update(id, changes) {
    const idx = items.value.findIndex(p => p.id === id)
    if (idx === -1) return null
    const merged = { ...items.value[idx], ...changes }
    const loop = isPlaylistLooping(merged)
    const updated = { ...merged, loop, isLoop: loop, updatedAt: now() }
    commitRef(items, items.value.map((playlist, playlistIdx) => playlistIdx === idx ? updated : playlist), persist)
    return updated
  }

  function remove(id) {
    commitRef(items, items.value.filter(p => p.id !== id), persist)
  }

  function addItem(playlistId, contentId, duration = 15) {
    const playlist = getById(playlistId)
    if (!playlist) return
    const order = playlist.items.length + 1
    const updated = {
      ...playlist,
      updatedAt: now(),
      items: [...playlist.items, { id: generateId(), contentId, duration, order, transition: 'fade' }],
    }
    commitRef(items, items.value.map(item => item.id === playlistId ? updated : item), persist)
  }

  function removeItem(playlistId, itemId) {
    const playlist = getById(playlistId)
    if (!playlist) return
    const nextItems = playlist.items
      .filter(i => i.id !== itemId)
      .map((item, idx) => ({ ...item, order: idx + 1 }))
    const updated = { ...playlist, updatedAt: now(), items: nextItems }
    commitRef(items, items.value.map(item => item.id === playlistId ? updated : item), persist)
  }

  function reorderItems(playlistId, newItems) {
    const playlist = getById(playlistId)
    if (!playlist) return
    const updated = { ...playlist, updatedAt: now(), items: newItems.map((item, idx) => ({ ...item, order: idx + 1 })) }
    commitRef(items, items.value.map(item => item.id === playlistId ? updated : item), persist)
  }

  return { items, getById, add, update, remove, addItem, removeItem, reorderItems, persist }
})
