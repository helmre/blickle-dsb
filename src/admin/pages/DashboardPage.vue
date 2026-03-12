<script setup>
import { computed } from 'vue'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useEmergencyStore } from '../../shared/stores/emergencyStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'

const contentStore = useContentStore()
const playlistStore = usePlaylistStore()
const locationStore = useLocationStore()
const emergencyStore = useEmergencyStore()
const auditStore = useAuditStore()

const stats = computed(() => [
  { label: 'Inhalte gesamt', value: contentStore.items.length, icon: '&#128196;', color: 'var(--blickle-navy)' },
  { label: 'Freigabe ausstehend', value: contentStore.inReview.length, icon: '&#128269;', color: 'var(--color-warning)' },
  { label: 'Playlists', value: playlistStore.items.length, icon: '&#9654;', color: 'var(--blickle-green-dark)' },
  { label: 'Standorte', value: locationStore.items.length, icon: '&#127970;', color: 'var(--color-info)' },
])

const recentAudit = computed(() => auditStore.sorted.slice(0, 5))
</script>

<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" v-html="stat.icon" :style="{ color: stat.color }"></div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h3>Aktuelle Inhalte</h3>
          <router-link to="/admin/content" class="card-link">Alle anzeigen &rarr;</router-link>
        </div>
        <div class="card-body">
          <div v-for="content in contentStore.items.slice(0, 5)" :key="content.id" class="list-item">
            <div class="list-item-info">
              <span class="list-item-title">{{ content.title }}</span>
              <span class="list-item-desc">{{ content.description }}</span>
            </div>
            <span :class="['status-badge', content.status]">
              {{ content.status === 'approved' ? 'Freigegeben' : content.status === 'in_review' ? 'In Pruefung' : 'Entwurf' }}
            </span>
          </div>
          <p v-if="!contentStore.items.length" class="empty-text">Noch keine Inhalte vorhanden.</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Letzte Aktivitaeten</h3>
          <router-link to="/admin/audit-log" class="card-link">Alle anzeigen &rarr;</router-link>
        </div>
        <div class="card-body">
          <div v-for="entry in recentAudit" :key="entry.id" class="list-item">
            <div class="list-item-info">
              <span class="list-item-title">{{ entry.action }}</span>
              <span class="list-item-desc">{{ new Date(entry.timestamp).toLocaleString('de-DE') }}</span>
            </div>
          </div>
          <p v-if="!recentAudit.length" class="empty-text">Noch keine Aktivitaeten.</p>
        </div>
      </div>
    </div>

    <div class="card quick-actions">
      <div class="card-header"><h3>Schnellaktionen</h3></div>
      <div class="card-body actions-grid">
        <router-link to="/admin/content" class="action-btn">
          <span class="action-icon">&#128196;</span>
          <span>Inhalt hochladen</span>
        </router-link>
        <router-link to="/admin/playlists" class="action-btn">
          <span class="action-icon">&#9654;</span>
          <span>Playlist erstellen</span>
        </router-link>
        <router-link to="/admin/emergency" class="action-btn action-btn-danger">
          <span class="action-icon">&#9888;</span>
          <span>Notfall senden</span>
        </router-link>
        <router-link to="/display" class="action-btn" target="_blank">
          <span class="action-icon">&#128250;</span>
          <span>Display-Vorschau</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--blickle-navy);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--blickle-navy);
}

.card-link {
  font-size: var(--font-size-sm);
  color: var(--blickle-navy);
  font-weight: 500;
}

.card-link:hover { text-decoration: underline; }

.card-body {
  padding: 12px 20px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--gray-100);
}

.list-item:last-child { border-bottom: none; }

.list-item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.list-item-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.list-item-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.approved { background: var(--color-success-light); color: var(--color-success); }
.status-badge.in_review { background: var(--color-warning-light); color: #92400E; }
.status-badge.draft { background: var(--gray-100); color: var(--gray-600); }

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--gray-50);
  color: var(--blickle-navy);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--blickle-green);
}

.action-btn-danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.action-icon {
  font-size: 1.5rem;
}
</style>
