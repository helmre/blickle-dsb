<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const route = useRoute()
const playlistStore = usePlaylistStore()
const contentStore = useContentStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const playlistId = computed(() => route.params.id)
const playlist = ref(null)
const editName = ref('')
const editDescription = ref('')
const editLoop = ref(true)
const editPriority = ref(0)
const contentSearch = ref('')
const saved = ref(false)
const dragIndex = ref(null)

onMounted(() => {
  loadPlaylist()
})

function loadPlaylist() {
  const p = playlistStore.getById(playlistId.value)
  if (p) {
    playlist.value = p
    editName.value = p.name
    editDescription.value = p.description || ''
    editLoop.value = p.loop
    editPriority.value = p.priority || 0
  }
}

const filteredContent = computed(() => {
  return contentStore.items.filter(c => {
    if (!contentSearch.value) return true
    return c.title.toLowerCase().includes(contentSearch.value.toLowerCase())
  })
})

const playlistItems = computed(() => {
  if (!playlist.value) return []
  return [...(playlist.value.items || [])].sort((a, b) => a.order - b.order)
})

function getContentTitle(contentId) {
  const c = contentStore.getById(contentId)
  return c ? c.title : 'Unbekannter Inhalt'
}

function addToPlaylist(contentId) {
  playlistStore.addItem(playlistId.value, contentId, 15)
  loadPlaylist()
}

function removeFromPlaylist(itemId) {
  playlistStore.removeItem(playlistId.value, itemId)
  loadPlaylist()
}

function updateItemDuration(item, duration) {
  item.duration = parseInt(duration)
  playlistStore.reorderItems(playlistId.value, playlist.value.items)
}

function updateItemTransition(item, transition) {
  item.transition = transition
  playlistStore.reorderItems(playlistId.value, playlist.value.items)
}

function moveUp(index) {
  if (index <= 0) return
  const items = [...playlistItems.value]
  const temp = items[index]
  items[index] = items[index - 1]
  items[index - 1] = temp
  playlistStore.reorderItems(playlistId.value, items)
  loadPlaylist()
}

function moveDown(index) {
  const items = [...playlistItems.value]
  if (index >= items.length - 1) return
  const temp = items[index]
  items[index] = items[index + 1]
  items[index + 1] = temp
  playlistStore.reorderItems(playlistId.value, items)
  loadPlaylist()
}

function savePlaylist() {
  playlistStore.update(playlistId.value, {
    name: editName.value,
    description: editDescription.value,
    loop: editLoop.value,
    priority: editPriority.value
  })
  auditStore.log('playlist.updated', 'playlist', playlistId.value, userStore.currentUser.id, { name: editName.value })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function openPreview() {
  window.open('/display', '_blank')
}
</script>

<template>
  <div class="editor-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <router-link to="/admin/playlists" class="back-link">&larr; Zurueck</router-link>
        <h2 class="page-title">Playlist bearbeiten</h2>
      </div>
      <div class="toolbar-right">
        <button class="btn-secondary" @click="openPreview">Vorschau</button>
        <button class="btn-primary" @click="savePlaylist">
          {{ saved ? 'Gespeichert!' : 'Speichern' }}
        </button>
      </div>
    </div>

    <div v-if="playlist" class="editor-layout">
      <!-- Settings -->
      <div class="settings-panel">
        <div class="panel-card">
          <h3 class="panel-title">Einstellungen</h3>
          <div class="form-group">
            <label>Name</label>
            <input v-model="editName" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Beschreibung</label>
            <textarea v-model="editDescription" class="form-input" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Prioritaet</label>
              <input v-model.number="editPriority" type="number" min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label>Schleife</label>
              <label class="toggle-label">
                <input type="checkbox" v-model="editLoop" />
                <span>{{ editLoop ? 'Aktiv' : 'Inaktiv' }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-panels">
        <!-- Left: Content Library -->
        <div class="panel-card content-panel">
          <h3 class="panel-title">Verfuegbare Inhalte</h3>
          <input
            v-model="contentSearch"
            type="text"
            placeholder="Inhalte suchen..."
            class="form-input search-input"
          />
          <div class="content-list">
            <div v-for="content in filteredContent" :key="content.id" class="content-item">
              <div class="content-info">
                <span class="content-title">{{ content.title }}</span>
                <span class="content-type">{{ content.type }}</span>
              </div>
              <button class="btn-sm btn-outline" @click="addToPlaylist(content.id)">+ Hinzufuegen</button>
            </div>
            <p v-if="!filteredContent.length" class="empty-text">Keine Inhalte gefunden.</p>
          </div>
        </div>

        <!-- Right: Playlist Items -->
        <div class="panel-card playlist-panel">
          <h3 class="panel-title">Playlist-Elemente ({{ playlistItems.length }})</h3>
          <div class="playlist-items">
            <div v-for="(item, index) in playlistItems" :key="item.id" class="playlist-item">
              <div class="item-order">{{ index + 1 }}</div>
              <div class="item-details">
                <span class="item-title">{{ getContentTitle(item.contentId) }}</span>
                <div class="item-controls">
                  <label class="control-label">
                    Dauer: {{ item.duration }}s
                    <input
                      type="range"
                      min="5"
                      max="120"
                      :value="item.duration"
                      @input="updateItemDuration(item, $event.target.value)"
                      class="duration-slider"
                    />
                  </label>
                  <label class="control-label">
                    Uebergang:
                    <select
                      :value="item.transition"
                      @change="updateItemTransition(item, $event.target.value)"
                      class="transition-select"
                    >
                      <option value="fade">Einblenden</option>
                      <option value="slide">Schieben</option>
                      <option value="none">Keiner</option>
                    </select>
                  </label>
                </div>
              </div>
              <div class="item-actions">
                <button class="btn-icon" @click="moveUp(index)" :disabled="index === 0" title="Nach oben">&uarr;</button>
                <button class="btn-icon" @click="moveDown(index)" :disabled="index === playlistItems.length - 1" title="Nach unten">&darr;</button>
                <button class="btn-icon btn-icon-danger" @click="removeFromPlaylist(item.id)" title="Entfernen">&times;</button>
              </div>
            </div>
            <p v-if="!playlistItems.length" class="empty-text">Keine Elemente. Fuegen Sie Inhalte aus der linken Liste hinzu.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-text">Playlist nicht gefunden.</div>
  </div>
</template>

<style scoped>
.editor-page { max-width: 1400px; }

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.toolbar-right {
  display: flex;
  gap: 8px;
}
.back-link {
  font-size: var(--font-size-sm);
  color: var(--blickle-navy);
  text-decoration: none;
  font-weight: 500;
}
.back-link:hover { text-decoration: underline; }

.page-title {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--blickle-navy);
}

.editor-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-panel { width: 100%; }

.editor-panels {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 16px;
}

.panel-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.panel-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 16px;
}

.search-input { margin-bottom: 12px; }

.content-list {
  max-height: 500px;
  overflow-y: auto;
}

.content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-100);
}
.content-item:last-child { border-bottom: none; }

.content-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.content-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}
.content-type {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.playlist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.item-order {
  width: 28px;
  height: 28px;
  background: var(--blickle-navy);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  flex-shrink: 0;
}

.item-details { flex: 1; min-width: 0; }

.item-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
  display: block;
  margin-bottom: 6px;
}

.item-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.duration-slider {
  width: 80px;
  accent-color: var(--blickle-navy);
}

.transition-select {
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.btn-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--gray-500);
  background: var(--blickle-white);
  border: 1px solid var(--color-border);
}
.btn-icon:hover { background: var(--gray-100); }
.btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-icon-danger:hover { background: var(--color-danger-light); color: var(--color-danger); }

.btn-primary {
  padding: 8px 20px;
  background: var(--blickle-navy);
  color: var(--blickle-white);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}
.btn-primary:hover { background: var(--blickle-navy-light); }

.btn-secondary {
  padding: 8px 20px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.btn-sm {
  padding: 4px 12px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.btn-outline {
  border: 1px solid var(--blickle-navy);
  color: var(--blickle-navy);
}
.btn-outline:hover { background: var(--blickle-navy); color: white; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.form-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
  cursor: pointer;
}

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: 20px;
}
</style>
