<script setup>
import { ref } from 'vue'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const playlistStore = usePlaylistStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const showDeleteConfirm = ref(null)

function createPlaylist() {
  const item = playlistStore.add({
    name: 'Neue Playlist',
    description: '',
    loop: true,
    priority: 0,
    items: []
  })
  auditStore.log('playlist.created', 'playlist', item.id, userStore.currentUser.id, { name: item.name })
}

function deletePlaylist(id) {
  const playlist = playlistStore.getById(id)
  playlistStore.remove(id)
  auditStore.log('playlist.deleted', 'playlist', id, userStore.currentUser.id, { name: playlist?.name })
  showDeleteConfirm.value = null
}
</script>

<template>
  <div class="playlist-page">
    <div class="page-toolbar">
      <h2 class="page-title">Playlists</h2>
      <button class="btn-primary" @click="createPlaylist">+ Neue Playlist</button>
    </div>

    <div class="playlist-grid">
      <div v-for="playlist in playlistStore.items" :key="playlist.id" class="playlist-card">
        <div class="card-header-section">
          <h4 class="card-title">{{ playlist.name }}</h4>
          <span class="item-count">{{ playlist.items?.length || 0 }} Elemente</span>
        </div>
        <div class="card-meta">
          <span :class="['status-badge', playlist.loop ? 'active' : 'inactive']">
            {{ playlist.loop ? 'Schleife' : 'Einmalig' }}
          </span>
          <span class="priority-badge">Prioritaet: {{ playlist.priority || 0 }}</span>
        </div>
        <div class="card-actions">
          <router-link :to="`/admin/playlists/${playlist.id}`" class="btn-sm btn-outline">
            Bearbeiten
          </router-link>
          <button class="btn-sm btn-danger" @click="showDeleteConfirm = playlist.id">Loeschen</button>
        </div>
      </div>
      <p v-if="!playlistStore.items.length" class="empty-text">Keine Playlists vorhanden. Erstellen Sie eine neue Playlist.</p>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Playlist loeschen</h3>
          <button class="modal-close" @click="showDeleteConfirm = null">&times;</button>
        </div>
        <div class="modal-body">
          <p>Sind Sie sicher, dass Sie diese Playlist loeschen moechten? Diese Aktion kann nicht rueckgaengig gemacht werden.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirm = null">Abbrechen</button>
          <button class="btn-danger-solid" @click="deletePlaylist(showDeleteConfirm)">Loeschen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-page { max-width: 1200px; }

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--blickle-navy);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.playlist-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: var(--font-size-base, 1rem);
  font-weight: 600;
  color: var(--blickle-navy);
}

.item-count {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-secondary);
  background: var(--gray-100);
  padding: 2px 8px;
  border-radius: 10px;
}

.card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.status-badge.active { background: var(--color-success-light); color: var(--color-success); }
.status-badge.inactive { background: var(--gray-100); color: var(--gray-600); }

.priority-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--color-warning-light);
  color: #92400E;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

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
  text-decoration: none;
}
.btn-outline:hover { background: var(--blickle-navy); color: white; }
.btn-danger { color: var(--color-danger); }
.btn-danger:hover { background: var(--color-danger-light); }
.btn-danger-solid {
  padding: 8px 20px;
  background: var(--color-danger);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px;
  grid-column: 1 / -1;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  width: 440px;
  box-shadow: var(--shadow-lg);
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--blickle-navy);
}
.modal-close {
  font-size: 1.5rem;
  color: var(--gray-400);
  padding: 4px;
}
.modal-body { padding: 24px; }
.modal-body p { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
