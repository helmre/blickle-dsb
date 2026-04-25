<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useDisplayProgramStore } from '../../shared/stores/displayProgramStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import {
  canAddContentToPlaylist,
  filterContentForPlaylist,
  getPlaylistItemIssue,
  isPlaylistLooping,
  movePlaylistItem,
  playlistIssueCount,
  playlistDurationSummary,
  sortPlaylistItems,
  updatePlaylistItem,
} from '../../shared/playlists/playlistRules.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'
import { schedulesForTarget } from '../../shared/displayEngine/playlistResolver.js'

const route = useRoute()
const playlistStore = usePlaylistStore()
const programStore = useDisplayProgramStore()
const scheduleStore = useScheduleStore()
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
const playlistNotice = ref('')
let noticeTimer = null
let savedTimer = null
const canManage = computed(() => userStore.can(PERMISSIONS.PLAYLISTS_MANAGE))

const CONTENT_STATUS_LABELS = {
  approved: 'Freigegeben',
  draft: 'Entwurf',
  in_review: 'In Prüfung',
  rejected: 'Abgelehnt',
}

onMounted(() => {
  loadPlaylist()
})

onUnmounted(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
  if (savedTimer) clearTimeout(savedTimer)
})

function loadPlaylist() {
  const p = playlistStore.getById(playlistId.value)
  if (p) {
    playlist.value = p
    editName.value = p.name
    editDescription.value = p.description || ''
    editLoop.value = isPlaylistLooping(p)
    editPriority.value = p.priority || 0
  }
}

const filteredContent = computed(() => {
  return filterContentForPlaylist(contentStore.items, contentSearch.value)
})

const playlistItems = computed(() => {
  if (!playlist.value) return []
  return sortPlaylistItems(playlist.value)
})

const playlistSummary = computed(() => playlistDurationSummary(playlistItems.value))
const approvedContentCount = computed(() => contentStore.items.filter(content => content.status === 'approved').length)
const playlistProblemsCount = computed(() => {
  return playlistIssueCount(playlistItems.value, contentId => contentStore.getById(contentId))
})
const playlistScheduleCount = computed(() => schedulesForTarget(scheduleStore.items, 'playlist', playlistId.value).length)
const programsUsingPlaylistSlot = computed(() => {
  return programStore.items.filter(program =>
    program.entries?.some(entry => entry.enabled !== false && entry.type === 'playlist')
  )
})

function getContentTitle(contentId) {
  const c = contentStore.getById(contentId)
  return c ? c.title : 'Unbekannter Inhalt'
}

function getAddState(content) {
  return canAddContentToPlaylist(content, playlist.value)
}

function formatContentStatus(status) {
  return CONTENT_STATUS_LABELS[status] || status
}

function getItemIssue(item) {
  return getPlaylistItemIssue(item, contentStore.getById(item.contentId))
}

function showNotice(message) {
  playlistNotice.value = message
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    playlistNotice.value = ''
    noticeTimer = null
  }, 2500)
}

function addToPlaylist(contentId) {
  if (!canManage.value) return
  const content = contentStore.getById(contentId)
  const addState = getAddState(content)
  if (!addState.allowed) {
    showNotice(addState.reason)
    return
  }
  playlistStore.addItem(playlistId.value, contentId, 15)
  loadPlaylist()
}

function removeFromPlaylist(itemId) {
  if (!canManage.value) return
  playlistStore.removeItem(playlistId.value, itemId)
  loadPlaylist()
}

function updateItemDuration(item, duration) {
  if (!canManage.value) return
  const nextItems = updatePlaylistItem(playlistItems.value, item.id, {
    duration: Number.parseInt(duration, 10) || 15,
  })
  playlistStore.reorderItems(playlistId.value, nextItems)
  loadPlaylist()
}

function updateItemTransition(item, transition) {
  if (!canManage.value) return
  const nextItems = updatePlaylistItem(playlistItems.value, item.id, { transition })
  playlistStore.reorderItems(playlistId.value, nextItems)
  loadPlaylist()
}

function moveUp(index) {
  if (!canManage.value) return
  if (index <= 0) return
  playlistStore.reorderItems(playlistId.value, movePlaylistItem(playlistItems.value, index, -1))
  loadPlaylist()
}

function moveDown(index) {
  if (!canManage.value) return
  if (index >= playlistItems.value.length - 1) return
  playlistStore.reorderItems(playlistId.value, movePlaylistItem(playlistItems.value, index, 1))
  loadPlaylist()
}

function savePlaylist() {
  if (!canManage.value) return
  playlistStore.update(playlistId.value, {
    name: editName.value,
    description: editDescription.value,
    loop: editLoop.value,
    isLoop: editLoop.value,
    priority: editPriority.value
  })
  safeAuditLog(auditStore, 'playlist.updated', 'playlist', playlistId.value, userStore.currentUser.id, { name: editName.value })
  saved.value = true
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => {
    saved.value = false
    savedTimer = null
  }, 2000)
}

function openPreview() {
  const previewWindow = window.open('/#/display', '_blank', 'noopener,noreferrer')
  if (previewWindow) {
    try {
      previewWindow.opener = null
    } catch {
      // Ignore browser-specific opener restrictions.
    }
  }
}
</script>

<template>
  <div class="editor-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <router-link to="/admin/playlists" class="back-link">&larr; Zurück</router-link>
        <div>
          <h2 class="page-title">{{ canManage ? 'Playlist bearbeiten' : 'Playlist ansehen' }}</h2>
          <p class="page-subtitle">{{ playlistSummary.label }}</p>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="btn-secondary" @click="openPreview">Vorschau</button>
        <button v-if="canManage" class="btn-primary" @click="savePlaylist">
          {{ saved ? 'Gespeichert!' : 'Speichern' }}
        </button>
      </div>
    </div>

    <div v-if="playlist" class="editor-layout">
      <!-- Settings -->
      <div class="settings-panel">
        <div class="panel-card">
          <h3 class="panel-title">Einstellungen</h3>
          <div class="playlist-stats">
            <div class="stat-tile">
              <span class="stat-value">{{ playlistSummary.itemCount }}</span>
              <span class="stat-label">Elemente</span>
            </div>
            <div class="stat-tile">
              <span class="stat-value">{{ playlistSummary.totalSeconds }}s</span>
              <span class="stat-label">Zyklus</span>
            </div>
            <div class="stat-tile">
              <span class="stat-value">{{ playlistProblemsCount }}</span>
              <span class="stat-label">Zu prüfen</span>
            </div>
          </div>
          <p class="settings-hint">
            Bibliothek: {{ approvedContentCount }} freigegebene Inhalte können hinzugefügt werden.
          </p>
          <div class="playout-context">
            <strong>Ausspielung</strong>
            <span>{{ playlistScheduleCount }} Zeitplan-Regel(n) · {{ programsUsingPlaylistSlot.length }} Programm(e) mit Playlist-Baustein</span>
            <router-link to="/admin/display-programs">Programme öffnen</router-link>
          </div>
          <div class="form-group">
            <label>Name</label>
            <input v-model="editName" type="text" class="form-input" :disabled="!canManage" />
          </div>
          <div class="form-group">
            <label>Beschreibung</label>
            <textarea v-model="editDescription" class="form-input" rows="2" :disabled="!canManage"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Priorität</label>
              <input v-model.number="editPriority" type="number" min="0" class="form-input" :disabled="!canManage" />
            </div>
            <div class="form-group">
              <label>Schleife</label>
              <label class="toggle-label">
                <input type="checkbox" v-model="editLoop" :disabled="!canManage" />
                <span>{{ editLoop ? 'Aktiv' : 'Inaktiv' }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-panels">
        <!-- Left: Content Library -->
        <div class="panel-card content-panel">
          <h3 class="panel-title">Verfügbare Inhalte</h3>
          <p v-if="playlistNotice" class="playlist-notice">{{ playlistNotice }}</p>
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
                <span class="content-meta">
                  <span class="content-type">{{ content.type }}</span>
                  <span :class="['content-status', `status-${content.status}`]">{{ formatContentStatus(content.status) }}</span>
                </span>
              </div>
              <button
                class="btn-sm btn-outline"
                :disabled="!canManage || !getAddState(content).allowed"
                :title="getAddState(content).reason"
                @click="addToPlaylist(content.id)"
              >
                {{ getAddState(content).allowed ? '+ Hinzufügen' : 'Gesperrt' }}
              </button>
            </div>
            <p v-if="!filteredContent.length" class="empty-text">Keine Inhalte gefunden.</p>
          </div>
        </div>

        <!-- Right: Playlist Items -->
        <div class="panel-card playlist-panel">
          <div class="panel-heading">
            <h3 class="panel-title">Playlist-Elemente</h3>
            <span class="panel-kpi">{{ playlistSummary.totalSeconds }}s Zyklus</span>
          </div>
          <div class="playlist-items">
            <div v-for="(item, index) in playlistItems" :key="item.id" class="playlist-item">
              <div class="item-order">{{ index + 1 }}</div>
              <div class="item-details">
                <span class="item-title">
                  {{ getContentTitle(item.contentId) }}
                  <span v-if="getItemIssue(item)" :class="['item-issue', `issue-${getItemIssue(item).level}`]">
                    {{ getItemIssue(item).message }}
                  </span>
                </span>
                <div class="item-controls">
                  <label class="control-label">
                    Dauer: {{ item.duration }}s
                    <input
                      type="range"
                      min="5"
                      max="120"
                      :value="item.duration"
                      :disabled="!canManage"
                      @input="updateItemDuration(item, $event.target.value)"
                      class="duration-slider"
                    />
                  </label>
                  <label class="control-label">
                    Übergang:
                    <select
                      :value="item.transition"
                      :disabled="!canManage"
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
                <button class="btn-icon" @click="moveUp(index)" :disabled="!canManage || index === 0" title="Nach oben">&uarr;</button>
                <button class="btn-icon" @click="moveDown(index)" :disabled="!canManage || index === playlistItems.length - 1" title="Nach unten">&darr;</button>
                <button v-if="canManage" class="btn-icon btn-icon-danger" @click="removeFromPlaylist(item.id)" title="Entfernen">&times;</button>
              </div>
            </div>
            <p v-if="!playlistItems.length" class="empty-text">Keine Elemente. Fügen Sie Inhalte aus der linken Liste hinzu.</p>
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
  margin: 0;
}

.page-subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
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

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-heading .panel-title {
  margin-bottom: 0;
}

.panel-kpi {
  color: var(--blickle-navy);
  background: rgba(181, 204, 24, 0.16);
  border: 1px solid rgba(181, 204, 24, 0.35);
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  padding: 4px 10px;
  white-space: nowrap;
}

.playlist-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.stat-tile {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  background: var(--gray-50);
}

.stat-value,
.stat-label {
  display: block;
}

.stat-value {
  color: var(--blickle-navy);
  font-size: var(--font-size-base);
  font-weight: 800;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-top: 2px;
}

.settings-hint {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: -4px 0 16px;
}

.playout-context {
  display: grid;
  gap: 4px;
  margin: -4px 0 16px;
  padding: 10px 12px;
  border: 1px solid rgba(22, 58, 108, 0.12);
  border-radius: 8px;
  background: rgba(22, 58, 108, 0.04);
}

.playout-context strong {
  color: var(--blickle-navy);
  font-size: var(--font-size-sm);
}

.playout-context span,
.playout-context a {
  color: var(--gray-600);
  font-size: var(--font-size-xs);
}

.playout-context a {
  color: var(--blickle-navy);
  font-weight: 800;
  text-decoration: none;
}

.playlist-notice {
  color: var(--color-warning);
  background: var(--color-warning-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: 0 0 12px;
  padding: 8px 10px;
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

.content-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.content-status {
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  padding: 4px 7px;
  text-transform: uppercase;
}

.status-approved {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-draft,
.status-in_review {
  background: var(--gray-100);
  color: var(--gray-600);
}

.status-rejected {
  background: var(--color-danger-light);
  color: var(--color-danger);
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
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.item-issue {
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 800;
  line-height: 1;
  padding: 4px 7px;
  text-transform: uppercase;
}

.issue-warning {
  background: var(--color-warning-light);
  color: #92400E;
}

.issue-error {
  background: var(--color-danger-light);
  color: var(--color-danger);
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
.btn-outline:disabled {
  border-color: var(--gray-200);
  color: var(--gray-400);
  background: var(--gray-100);
  cursor: not-allowed;
}

.btn-outline:disabled:hover {
  color: var(--gray-400);
  background: var(--gray-100);
}

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

@media (max-width: 900px) {
  .page-toolbar,
  .toolbar-left,
  .toolbar-right {
    align-items: stretch;
    flex-direction: column;
  }

  .editor-panels,
  .playlist-stats,
  .form-row {
    grid-template-columns: 1fr;
  }

  .playlist-item,
  .content-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .item-actions {
    flex-direction: row;
  }
}
</style>
