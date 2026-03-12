<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useEmergencyStore } from '../../shared/stores/emergencyStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'

const router = useRouter()
const contentStore = useContentStore()
const playlistStore = usePlaylistStore()
const locationStore = useLocationStore()
const emergencyStore = useEmergencyStore()
const auditStore = useAuditStore()

const stats = computed(() => [
  {
    label: 'Inhalte gesamt',
    value: contentStore.items.length,
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M13 2v5h5"/><path d="M8 12h6M8 15h4"/></svg>`,
    gradient: 'linear-gradient(135deg, #163A6C 0%, #1E4D8A 100%)',
    iconBg: 'rgba(22, 58, 108, 0.08)',
    iconColor: '#163A6C',
  },
  {
    label: 'Freigabe ausstehend',
    value: contentStore.inReview.length,
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="9"/><path d="M11 7v4l3 3"/></svg>`,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    iconBg: 'rgba(245, 158, 11, 0.08)',
    iconColor: '#D97706',
  },
  {
    label: 'Playlists',
    value: playlistStore.items.length,
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h11M4 10h8M4 14h5"/><circle cx="16" cy="14" r="3"/><path d="M19 14V7"/></svg>`,
    gradient: 'linear-gradient(135deg, #96AA10 0%, #B5CC18 100%)',
    iconBg: 'rgba(181, 204, 24, 0.1)',
    iconColor: '#7A8E00',
  },
  {
    label: 'Standorte',
    value: locationStore.items.length,
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h14M6 20V9l5-5 5 5v11"/><path d="M10 20v-4h2v4"/></svg>`,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    iconBg: 'rgba(59, 130, 246, 0.08)',
    iconColor: '#2563EB',
  },
])

const recentAudit = computed(() => auditStore.sorted.slice(0, 5))

const statusMap = {
  approved: { label: 'Freigegeben', cls: 'status-approved' },
  in_review: { label: 'In Pruefung', cls: 'status-review' },
  draft: { label: 'Entwurf', cls: 'status-draft' },
  rejected: { label: 'Abgelehnt', cls: 'status-rejected' },
}

const typeIcons = {
  text: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 1H4.5A1.5 1.5 0 003 2.5v11A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5V4Z"/><path d="M10 1v3h3"/></svg>`,
  image: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="1.5"/><circle cx="5.5" cy="5.5" r="1.2"/><path d="M14 11l-3-3-7 7"/></svg>`,
  video: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="3" width="10" height="10" rx="1.5"/><path d="M11 6l4-2v8l-4-2"/></svg>`,
  html: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 4L1 8l4 4M11 4l4 4-4 4"/></svg>`,
  pdf: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 1H4.5A1.5 1.5 0 003 2.5v11A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5V4Z"/><path d="M10 1v3h3"/><path d="M6 9h4M6 11h2"/></svg>`,
}

function formatAuditAction(action) {
  const map = {
    'content.created': 'Inhalt erstellt',
    'content.updated': 'Inhalt aktualisiert',
    'content.deleted': 'Inhalt geloescht',
    'content.submitted_for_review': 'Zur Pruefung eingereicht',
    'content.approved': 'Inhalt freigegeben',
    'content.rejected': 'Inhalt abgelehnt',
    'content.created_from_template': 'Aus Template erstellt',
    'system.initialized': 'System initialisiert',
  }
  return map[action] || action
}

function formatTime(ts) {
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="dashboard">
    <!-- Greeting -->
    <div class="dash-greeting">
      <div>
        <h2 class="dash-hello">Willkommen zurueck</h2>
        <p class="dash-sub">Uebersicht ueber Ihr Digitales Schwarzes Brett</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="stat-card"
        :style="{ animationDelay: `${i * 80 + 100}ms` }"
      >
        <div class="stat-icon-wrap" :style="{ background: stat.iconBg }">
          <span class="stat-icon" :style="{ color: stat.iconColor }" v-html="stat.icon"></span>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-accent" :style="{ background: stat.gradient }"></div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dash-grid">
      <!-- Recent Content -->
      <div class="card">
        <div class="card-head">
          <div class="card-head-left">
            <svg class="card-head-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--blickle-navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 1H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5Z"/><path d="M11 1v4h4"/></svg>
            <h3 class="card-title">Aktuelle Inhalte</h3>
          </div>
          <router-link to="/admin/content" class="card-action">Alle anzeigen
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l4 4-4 4"/></svg>
          </router-link>
        </div>
        <div class="card-body">
          <div
            v-for="(content, ci) in contentStore.items.slice(0, 5)"
            :key="content.id"
            class="content-row"
            @click="router.push('/admin/content/' + content.id)"
          >
            <div class="content-type-icon" v-html="typeIcons[content.type] || typeIcons.text"></div>
            <div class="content-info">
              <span class="content-title">{{ content.title }}</span>
              <span class="content-desc">{{ content.description }}</span>
            </div>
            <span :class="['status-pill', statusMap[content.status]?.cls || 'status-draft']">
              {{ statusMap[content.status]?.label || content.status }}
            </span>
          </div>
          <div v-if="!contentStore.items.length" class="empty-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--gray-300)" stroke-width="1.2"><rect x="6" y="4" width="20" height="24" rx="2"/><path d="M12 12h8M12 16h5"/></svg>
            <span>Noch keine Inhalte vorhanden.</span>
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="card">
        <div class="card-head">
          <div class="card-head-left">
            <svg class="card-head-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--blickle-navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="8"/><path d="M9 5v4l3 3"/></svg>
            <h3 class="card-title">Letzte Aktivitaeten</h3>
          </div>
          <router-link to="/admin/audit-log" class="card-action">Alle anzeigen
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l4 4-4 4"/></svg>
          </router-link>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div v-for="entry in recentAudit" :key="entry.id" class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-action">{{ formatAuditAction(entry.action) }}</span>
                <span class="timeline-time">{{ formatTime(entry.timestamp) }}</span>
              </div>
            </div>
          </div>
          <div v-if="!recentAudit.length" class="empty-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--gray-300)" stroke-width="1.2"><circle cx="16" cy="16" r="12"/><path d="M16 10v6l4 4"/></svg>
            <span>Noch keine Aktivitaeten.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-section">
      <h3 class="section-title">Schnellaktionen</h3>
      <div class="actions-grid">
        <router-link to="/admin/content" class="action-card">
          <div class="action-icon-wrap action-icon-navy">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8M8 6l4-4 4 4"/><path d="M4 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"/></svg>
          </div>
          <span class="action-label">Inhalt hochladen</span>
          <span class="action-desc">Neue Inhalte erstellen</span>
        </router-link>
        <router-link to="/admin/playlists" class="action-card">
          <div class="action-icon-wrap action-icon-green">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h11M4 10h8M4 14h5"/><circle cx="16" cy="14" r="3"/><path d="M19 14V7"/></svg>
          </div>
          <span class="action-label">Playlist erstellen</span>
          <span class="action-desc">Inhalte zusammenstellen</span>
        </router-link>
        <router-link to="/admin/emergency" class="action-card action-card-danger">
          <div class="action-icon-wrap action-icon-red">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2L2 18h18L11 2Z"/><path d="M11 9v4"/><circle cx="11" cy="15.5" r="0.8" fill="currentColor" stroke="none"/></svg>
          </div>
          <span class="action-label">Notfall senden</span>
          <span class="action-desc">Sofort-Meldung an alle</span>
        </router-link>
        <router-link to="/display" class="action-card" target="_blank">
          <div class="action-icon-wrap action-icon-blue">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="18" height="13" rx="2"/><path d="M7 19h8M11 16v3"/></svg>
          </div>
          <span class="action-label">Display-Vorschau</span>
          <span class="action-desc">Live-Ansicht oeffnen</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1160px;
  animation: fadeInUp 0.4s var(--ease-out-expo) both;
}

/* ── Greeting ── */
.dash-greeting {
  margin-bottom: 28px;
}

.dash-hello {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  margin-bottom: 2px;
}

.dash-sub {
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: 400;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--blickle-white);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s var(--ease-out-expo) both;
  cursor: default;
}

.stat-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.stat-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 300ms ease;
}

.stat-card:hover .stat-accent {
  opacity: 1;
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  display: flex;
}

.stat-body {
  min-width: 0;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--gray-900);
  line-height: 1;
  letter-spacing: -0.03em;
  animation: countUp 0.6s var(--ease-out-expo) both;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
  margin-top: 3px;
  letter-spacing: 0.01em;
}

/* ── Main Grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: var(--blickle-white);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.card-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-head-icon {
  flex-shrink: 0;
}

.card-title {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.01em;
}

.card-action {
  font-size: 0.75rem;
  color: var(--blickle-navy);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  opacity: 0.7;
  transition: opacity 200ms ease;
}

.card-action:hover {
  opacity: 1;
}

.card-body {
  padding: 6px 0;
}

/* Content Rows */
.content-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 150ms ease;
}

.content-row:hover {
  background: var(--gray-50);
}

.content-type-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--gray-500);
}

.content-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.content-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-desc {
  font-size: 0.6875rem;
  color: var(--gray-400);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-pill {
  font-family: var(--font-body);
  font-size: 0.625rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.status-approved { background: #ECFDF5; color: #059669; }
.status-review { background: #FFFBEB; color: #B45309; }
.status-draft { background: var(--gray-100); color: var(--gray-500); }
.status-rejected { background: #FEF2F2; color: #DC2626; }

/* Timeline */
.timeline {
  padding: 8px 20px;
}

.timeline-item {
  display: flex;
  gap: 14px;
  padding: 10px 0;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 26px;
  bottom: -4px;
  width: 1px;
  background: var(--gray-200);
}

.timeline-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--blickle-white);
  border: 2px solid var(--blickle-navy);
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  z-index: 1;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.timeline-action {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
}

.timeline-time {
  font-size: 0.6875rem;
  color: var(--gray-400);
  margin-top: 1px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 20px;
  color: var(--gray-400);
  font-size: 0.8125rem;
}

/* ── Quick Actions ── */
.quick-section {
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  background: var(--blickle-white);
  border-radius: 14px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid transparent;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--gray-200);
}

.action-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-card:hover .action-icon-wrap {
  transform: scale(1.08);
}

.action-icon-navy {
  background: rgba(22, 58, 108, 0.08);
  color: var(--blickle-navy);
}
.action-icon-green {
  background: rgba(181, 204, 24, 0.12);
  color: #6B7F00;
}
.action-icon-red {
  background: rgba(239, 68, 68, 0.08);
  color: var(--color-danger);
}
.action-icon-blue {
  background: rgba(59, 130, 246, 0.08);
  color: #2563EB;
}

.action-label {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: -0.01em;
}

.action-desc {
  font-size: 0.6875rem;
  color: var(--gray-400);
  font-weight: 400;
  line-height: 1.3;
}

.action-card-danger:hover {
  border-color: rgba(239, 68, 68, 0.2);
}
</style>
