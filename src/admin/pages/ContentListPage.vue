<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'

const router = useRouter()
const contentStore = useContentStore()
const scheduleStore = useScheduleStore()
const auditStore = useAuditStore()
const userStore = useUserStore()
const toast = useToastStore()

const searchQuery = ref('')
const filterStatus = ref('all')
const filterTag = ref('all')
const canCreate = computed(() => userStore.can(PERMISSIONS.CONTENT_CREATE))
const canRead = computed(() => userStore.can(PERMISSIONS.CONTENT_READ))
const canEdit = computed(() => userStore.can(PERMISSIONS.CONTENT_EDIT))
const canDelete = computed(() => userStore.can(PERMISSIONS.CONTENT_DELETE))
const canSubmit = computed(() => userStore.can(PERMISSIONS.CONTENT_SUBMIT))

const allTags = computed(() => {
  const tags = new Set()
  contentStore.items.forEach(c => c.tags?.forEach(t => tags.add(t)))
  return [...tags].sort()
})

const filtered = computed(() => {
  return contentStore.items.filter(c => {
    const matchesSearch = !searchQuery.value ||
      c.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' || c.status === filterStatus.value
    const matchesTag = filterTag.value === 'all' || c.tags?.includes(filterTag.value)
    return matchesSearch && matchesStatus && matchesTag
  })
})

function deleteContent(id) {
  if (!canDelete.value) return
  let removedSchedules = 0
  try {
    contentStore.remove(id)
  } catch (error) {
    toast.error(error?.message || 'Inhalt konnte nicht gelöscht werden')
    return
  }
  try {
    removedSchedules = scheduleStore.removeForTarget('content', id)
  } catch (error) {
    console.warn('[ContentList] Zeitplan-Bereinigung fehlgeschlagen:', error)
    toast.warning('Inhalt gelöscht, aber abhängige Zeitpläne konnten nicht bereinigt werden')
  }
  safeAuditLog(auditStore, 'content.deleted', 'content', id, userStore.currentUser.id, { removedSchedules }, { toast })
  toast.success(removedSchedules ? `Inhalt und ${removedSchedules} Zeitplan-Regeln gelöscht` : 'Inhalt gelöscht')
}

function submitForReview(id) {
  if (!canSubmit.value) return
  try {
    contentStore.submitForReview(id, userStore.currentUser)
    safeAuditLog(auditStore, 'content.submitted_for_review', 'content', id, userStore.currentUser.id, {}, { toast })
    toast.success('Zur Prüfung eingereicht')
  } catch (error) {
    toast.error(error?.issues?.[0]?.message || error?.message || 'Inhalt konnte nicht eingereicht werden')
  }
}

function latestRejectedComment(content) {
  return [...(content.reviewEvents || [])]
    .reverse()
    .find(event => event.type === 'rejected' && event.comment)?.comment || ''
}

const statusLabels = {
  draft: 'Entwurf',
  in_review: 'In Prüfung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
  archived: 'Archiviert'
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>

<template>
  <div class="content-page">
    <!-- Toolbar -->
    <div class="page-toolbar">
      <div class="toolbar-left">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="7" cy="7" r="5"/>
            <path d="M11 11l3.5 3.5"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Inhalte suchen..."
            class="search-input"
          />
        </div>
        <div class="filter-wrap">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="in_review">In Prüfung</option>
            <option value="approved">Freigegeben</option>
            <option value="rejected">Abgelehnt</option>
            <option value="archived">Archiviert</option>
          </select>
        </div>
        <div class="filter-wrap">
          <select v-model="filterTag" class="filter-select">
            <option value="all">Alle Tags</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>
      </div>
      <button v-if="canCreate" class="btn-create" @click="router.push({ name: 'admin-publish' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M8 3v10M3 8h10"/>
        </svg>
        Assistent starten
      </button>
    </div>

    <!-- Content count -->
    <div class="content-count">
      <span class="count-number">{{ filtered.length }}</span>
      <span class="count-label">{{ filtered.length === 1 ? 'Inhalt' : 'Inhalte' }}</span>
      <span v-if="searchQuery || filterStatus !== 'all' || filterTag !== 'all'" class="count-filtered">(gefiltert)</span>
    </div>

    <!-- Content List -->
    <div class="content-list">
      <div
        v-for="(content, i) in filtered"
        :key="content.id"
        class="content-card"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        <div class="card-icon-wrap" :class="'type-' + content.type">
          <img v-if="content.thumbnailUrl" :src="content.thumbnailUrl" class="card-thumbnail" alt="" />
          <template v-else>
            <!-- Text -->
            <svg v-if="content.type === 'text'" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="2" width="14" height="16" rx="2"/>
              <path d="M7 6h6M7 10h6M7 14h3"/>
            </svg>
            <!-- Image -->
            <svg v-else-if="content.type === 'image'" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="16" height="14" rx="2"/>
              <circle cx="7" cy="8" r="1.5"/>
              <path d="M18 14l-4-4-3 3-2-2-4 4"/>
            </svg>
            <!-- Video -->
            <svg v-else-if="content.type === 'video'" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="12" height="12" rx="2"/>
              <path d="M14 8l4-2v8l-4-2"/>
            </svg>
            <!-- HTML -->
            <svg v-else-if="content.type === 'html'" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 7L2 10l4 3"/>
              <path d="M14 7l4 3-4 3"/>
              <path d="M11 4l-2 12"/>
            </svg>
            <!-- PDF -->
            <svg v-else-if="content.type === 'pdf'" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z"/>
              <path d="M12 2v5h5"/>
              <path d="M7 12h6M7 15h3"/>
            </svg>
            <!-- Default -->
            <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="2" width="14" height="16" rx="2"/>
              <path d="M7 6h6M7 10h6M7 14h3"/>
            </svg>
          </template>
        </div>

        <div class="card-body" :class="{ 'card-body--readonly': !canEdit }" @click="canRead && router.push('/admin/content/' + content.id)">
          <div class="card-top-row">
            <h4 class="card-title">{{ content.title }}</h4>
            <span :class="['status-pill', content.status]">{{ statusLabels[content.status] }}</span>
          </div>
	          <p class="card-desc">{{ content.description }}</p>
          <p v-if="content.status === 'rejected' && latestRejectedComment(content)" class="review-note">
            {{ latestRejectedComment(content) }}
          </p>
          <div class="card-meta">
            <span v-for="tag in content.tags" :key="tag" class="tag-chip">{{ tag }}</span>
            <span v-if="content.templateId" class="template-chip">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
              </svg>
              Template
            </span>
            <span v-if="content.fileName" class="file-chip">{{ content.fileName }}</span>
            <span v-if="content.fileSizeBytes" class="size-text">{{ formatSize(content.fileSizeBytes) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button
            v-if="content.status === 'draft' && canSubmit"
            class="btn-action btn-review"
            @click.stop="submitForReview(content.id)"
            title="Zur Prüfung einreichen"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M2 8l4 4 8-8"/>
            </svg>
          </button>
          <button
            v-if="canDelete && !contentStore.isLocked(content)"
            class="btn-action btn-delete"
            @click.stop="deleteContent(content.id)"
            title="Löschen"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5"/>
              <path d="M4 4l.8 9a1 1 0 001 .9h4.4a1 1 0 001-.9L12 4"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!filtered.length" class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round">
            <rect x="6" y="4" width="28" height="32" rx="4"/>
            <path d="M14 14h12M14 20h12M14 26h6"/>
          </svg>
        </div>
        <p class="empty-title">Keine Inhalte gefunden</p>
        <p class="empty-hint">Erstellen Sie Ihren ersten Inhalt mit dem Button oben.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.content-page {
  max-width: 1200px;
  animation: fadeInUp 0.4s var(--ease-out-expo) both;
}

/* ===== TOOLBAR ===== */
.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex: 1;
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  background: var(--blickle-white);
  transition: all 200ms ease;
}
.search-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08);
}

.filter-wrap {
  position: relative;
}

.filter-select {
  padding: 9px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  background: var(--blickle-white);
  color: var(--gray-600);
  cursor: pointer;
  transition: border-color 200ms ease;
  appearance: auto;
}
.filter-select:focus {
  outline: none;
  border-color: var(--blickle-navy);
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  background: var(--blickle-navy);
  color: var(--blickle-white);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  transition: all 200ms ease;
  white-space: nowrap;
}
.btn-create:hover {
  background: var(--blickle-navy-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 58, 108, 0.2);
}

/* ===== COUNT ===== */
.content-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 16px;
  padding-left: 2px;
}
.count-number {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--blickle-navy);
}
.count-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  font-weight: 500;
}
.count-filtered {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  font-style: italic;
}

/* ===== CONTENT CARDS ===== */
.content-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
  border: 1px solid transparent;
  transition: all 250ms var(--ease-in-out);
  animation: fadeInUp 0.35s var(--ease-out-expo) both;
}
.content-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-border);
  transform: translateY(-1px);
}

.card-icon-wrap {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.card-icon-wrap.type-text { background: var(--gray-100); color: var(--gray-500); }
.card-icon-wrap.type-image { background: var(--blickle-green-50); color: var(--blickle-green-dark); }
.card-icon-wrap.type-video { background: rgba(59, 130, 246, 0.08); color: var(--color-info); }
.card-icon-wrap.type-html { background: rgba(22, 58, 108, 0.06); color: var(--blickle-navy); }
.card-icon-wrap.type-pdf { background: rgba(239, 68, 68, 0.06); color: var(--color-danger); }

.card-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.card-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.card-title {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

	.card-desc {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
	}

  .review-note {
    margin: 6px 0 0;
    padding: 7px 9px;
    border-left: 3px solid var(--color-danger);
    border-radius: 6px;
    background: var(--color-danger-light);
    color: #991b1b;
    font-size: var(--font-size-xs);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

	.card-meta {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
  align-items: center;
}

/* ===== STATUS PILLS ===== */
.status-pill {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.status-pill.approved { background: var(--color-success-light); color: #166534; }
.status-pill.in_review { background: var(--color-warning-light); color: #92400E; }
.status-pill.draft { background: var(--gray-100); color: var(--gray-500); }
.status-pill.rejected { background: var(--color-danger-light); color: #991B1B; }
.status-pill.archived { background: rgba(100,116,139,0.16); color: #475569; }

.tag-chip {
  font-size: 0.625rem;
  padding: 2px 8px;
  background: var(--gray-100);
  color: var(--gray-500);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.template-chip {
  font-size: 0.625rem;
  padding: 2px 8px;
  background: rgba(181, 204, 24, 0.12);
  color: var(--blickle-green-dark);
  border-radius: var(--radius-full);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.file-chip {
  font-size: 0.6rem;
  padding: 2px 7px;
  background: rgba(22, 58, 108, 0.06);
  color: var(--blickle-navy);
  border-radius: 4px;
  font-family: var(--font-mono);
}
.size-text { font-size: 0.6rem; color: var(--gray-400); }

/* ===== CARD ACTIONS ===== */
.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 200ms ease;
}
.content-card:hover .card-actions {
  opacity: 1;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}
.btn-review {
  color: var(--blickle-navy);
  background: var(--gray-50);
}
.btn-review:hover {
  background: var(--blickle-navy);
  color: white;
}
.btn-delete {
  color: var(--gray-400);
  background: transparent;
}
.btn-delete:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.empty-title {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--gray-400);
}
</style>
