<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'

const route = useRoute()
const router = useRouter()
const contentStore = useContentStore()
const auditStore = useAuditStore()
const userStore = useUserStore()
const locationStore = useLocationStore()
const toastStore = useToastStore()

const content = computed(() => contentStore.getById(route.params.id))
const editForm = ref(null)
const uploadedFile = ref(null)
const filePreview = ref(null)
const isDragging = ref(false)
const showPreview = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const uploadSuccess = ref(false)

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = ['image/', 'video/', 'application/pdf', 'text/html']

function initForm() {
  if (content.value) {
    editForm.value = {
      ...content.value,
      tags: content.value.tags?.join(', ') || '',
      embedCode: content.value.metadata?.embedCode || '',
      locationIds: content.value.locationIds || [],
    }
    // Restore file preview from existing content
    if (content.value.thumbnailUrl) {
      filePreview.value = content.value.thumbnailUrl
    }
    if (content.value.fileUrl) {
      uploadedFile.value = {
        name: content.value.fileName || 'Datei',
        size: content.value.fileSizeBytes || 0,
        mimeType: content.value.mimeType || '',
        dataUrl: content.value.fileUrl
      }
    }
  }
}
initForm()

// Re-init when route changes
watch(() => route.params.id, () => initForm())

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function detectType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('html')) return 'html'
  return 'text'
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFileSelect(e) {
  const file = e.target?.files?.[0]
  if (file) processFile(file)
}

function processFile(file) {
  uploadError.value = ''
  uploadSuccess.value = false
  uploadProgress.value = 0

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    uploadError.value = `Datei zu gross: ${(file.size / 1024 / 1024).toFixed(1)} MB (max. ${MAX_FILE_SIZE / 1024 / 1024} MB)`
    return
  }

  // Validate file type
  const isAllowed = ALLOWED_TYPES.some(t => file.type.startsWith(t))
  if (!isAllowed) {
    uploadError.value = `Dateityp nicht unterstuetzt: ${file.type || 'unbekannt'}. Erlaubt: Bilder, Videos, PDF, HTML`
    return
  }

  const reader = new FileReader()
  reader.onprogress = (e) => {
    if (e.lengthComputable) {
      uploadProgress.value = Math.round((e.loaded / e.total) * 100)
    }
  }
  reader.onload = () => {
    uploadedFile.value = {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      dataUrl: reader.result
    }
    editForm.value.type = detectType(file.type)
    if (file.type.startsWith('image/')) {
      filePreview.value = reader.result
    } else {
      filePreview.value = null
    }
    uploadProgress.value = 100
    uploadSuccess.value = true
    setTimeout(() => { uploadSuccess.value = false; uploadProgress.value = 0 }, 2500)
  }
  reader.onerror = () => {
    uploadError.value = 'Fehler beim Lesen der Datei'
    uploadProgress.value = 0
  }
  reader.readAsDataURL(file)
}

function removeFile() {
  uploadedFile.value = null
  filePreview.value = null
  editForm.value.fileUrl = null
  editForm.value.fileName = null
  editForm.value.mimeType = null
  editForm.value.fileSizeBytes = 0
  editForm.value.thumbnailUrl = null
}

function save() {
  if (!editForm.value) return
  const changes = {
    title: editForm.value.title,
    description: editForm.value.description,
    type: editForm.value.type,
    tags: editForm.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    validFrom: editForm.value.validFrom || null,
    validUntil: editForm.value.validUntil || null,
    fileUrl: uploadedFile.value?.dataUrl || editForm.value.fileUrl || null,
    mimeType: uploadedFile.value?.mimeType || editForm.value.mimeType || null,
    fileSizeBytes: uploadedFile.value?.size || editForm.value.fileSizeBytes || 0,
    fileName: uploadedFile.value?.name || editForm.value.fileName || null,
    thumbnailUrl: filePreview.value || editForm.value.thumbnailUrl || null,
    locationIds: editForm.value.locationIds || [],
    metadata: {
      ...(editForm.value.metadata || {}),
      embedCode: editForm.value.embedCode || null,
    },
  }
  contentStore.update(content.value.id, changes)
  auditStore.log('content.updated', 'content', content.value.id, userStore.currentUser.id, { title: changes.title })
  toastStore.success('Inhalt erfolgreich gespeichert')
  router.push('/admin/content')
}

function submitForReview() {
  contentStore.setStatus(content.value.id, 'in_review')
  auditStore.log('content.submitted_for_review', 'content', content.value.id, userStore.currentUser.id)
  toastStore.info('Inhalt zur Pruefung eingereicht')
  initForm()
}

function approve() {
  contentStore.setStatus(content.value.id, 'approved')
  auditStore.log('content.approved', 'content', content.value.id, userStore.currentUser.id)
  toastStore.success('Inhalt freigegeben')
  initForm()
}

function reject() {
  contentStore.setStatus(content.value.id, 'rejected')
  auditStore.log('content.rejected', 'content', content.value.id, userStore.currentUser.id)
  toastStore.warning('Inhalt abgelehnt')
  initForm()
}

const statusLabels = {
  draft: 'Entwurf',
  in_review: 'In Pruefung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt'
}

const statusIcons = {
  draft: '&#9998;',
  in_review: '&#128269;',
  approved: '&#9989;',
  rejected: '&#10060;'
}

const typeLabels = {
  text: 'Text',
  image: 'Bild',
  video: 'Video',
  pdf: 'PDF-Dokument',
  html: 'HTML-Inhalt'
}

const typeIcons = {
  text: '&#128196;',
  image: '&#128248;',
  video: '&#127909;',
  pdf: '&#128462;',
  html: '&#128187;',
}

const categoryColors = {
  'Messen': '#3B82F6',
  'Mitarbeiter': '#B5CC18',
  'Organisation': '#F59E0B',
  'Nachhaltigkeit': '#10B981',
  'Produktion': '#8B5CF6',
  'Sicherheit': '#EF4444',
  'Stellenanzeige': '#EC4899',
  'Neuheiten': '#06B6D4',
  'Events': '#F97316',
  'Allgemein': '#6B7280',
}

function mapTagToCategory(tags) {
  if (!tags || tags.length === 0) return 'Allgemein'
  const tagArr = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
  const tag = tagArr[0]?.toLowerCase() || ''
  if (tag.includes('sicherheit')) return 'Sicherheit'
  if (tag.includes('produktion')) return 'Produktion'
  if (tag.includes('event')) return 'Events'
  if (tag.includes('sozial')) return 'Mitarbeiter'
  if (tag.includes('neuheit')) return 'Neuheiten'
  if (tag.includes('messe')) return 'Messen'
  if (tag.includes('nachhaltig')) return 'Nachhaltigkeit'
  if (tag.includes('organisation')) return 'Organisation'
  if (tag.includes('stelle')) return 'Stellenanzeige'
  return 'Allgemein'
}

const previewCategory = computed(() => {
  if (!editForm.value) return 'Allgemein'
  const tags = editForm.value.tags.split(',').map(t => t.trim()).filter(Boolean)
  return mapTagToCategory(tags)
})

const previewDate = computed(() => {
  if (!content.value) return ''
  return new Date(content.value.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const canEdit = computed(() => {
  const role = userStore.currentUser?.role
  return role === 'admin' || role === 'editor'
})

const canApprove = computed(() => {
  const role = userStore.currentUser?.role
  return role === 'admin' || role === 'reviewer'
})
</script>

<template>
  <div class="detail-page" v-if="editForm">
    <!-- Header -->
    <div class="detail-header">
      <button class="btn-back" @click="router.push('/admin/content')">
        <span class="back-arrow">&larr;</span> Zurueck zur Uebersicht
      </button>
      <div class="header-right">
        <button
          v-if="content.status === 'draft' && canEdit"
          class="btn-action btn-submit"
          @click="submitForReview"
        >&#128269; Zur Pruefung einreichen</button>
        <button
          v-if="content.status === 'in_review' && canApprove"
          class="btn-action btn-approve"
          @click="approve"
        >&#9989; Freigeben</button>
        <button
          v-if="content.status === 'in_review' && canApprove"
          class="btn-action btn-reject"
          @click="reject"
        >&#10060; Ablehnen</button>
        <button class="btn-preview-toggle" @click="showPreview = !showPreview">
          {{ showPreview ? '&#128196; Editor' : '&#128250; Vorschau' }}
        </button>
      </div>
    </div>

    <div class="detail-layout">
      <!-- Main Column -->
      <div class="detail-main">
        <!-- Status Banner -->
        <div :class="['status-banner', content.status]">
          <span class="status-icon" v-html="statusIcons[content.status]"></span>
          <span class="status-text">{{ statusLabels[content.status] }}</span>
          <span class="status-meta" v-if="content.updatedAt">
            Zuletzt bearbeitet: {{ new Date(content.updatedAt).toLocaleDateString('de-DE') }}
          </span>
        </div>

        <!-- Editor View -->
        <div v-if="!showPreview" class="editor-section">
          <!-- File Upload Area -->
          <div class="editor-card">
            <h4 class="card-section-title">Mediendatei</h4>
            <div v-if="!uploadedFile"
              :class="['drop-zone', { 'drop-zone-active': isDragging }]"
              @dragenter.prevent="isDragging = true"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <div class="drop-icon">&#128449;</div>
              <p class="drop-text">Datei hierher ziehen oder klicken</p>
              <p class="drop-hint">PDF, Bilder, Videos, HTML</p>
              <input ref="fileInput" type="file" accept="image/*,video/*,.pdf,.html" hidden @change="handleFileSelect" />
            </div>

            <!-- Upload progress bar -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress-container">
              <div class="upload-progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              <span class="upload-progress-text">{{ uploadProgress }}%</span>
            </div>

            <!-- Upload success toast -->
            <div v-if="uploadSuccess" class="upload-toast upload-toast-success">
              &#9989; Datei erfolgreich hochgeladen
            </div>

            <!-- Upload error -->
            <div v-if="uploadError" class="upload-toast upload-toast-error">
              &#9888; {{ uploadError }}
              <button class="upload-error-dismiss" @click="uploadError = ''">&times;</button>
            </div>

            <div v-if="uploadedFile" class="file-preview-card">
              <div class="file-preview-visual">
                <img v-if="filePreview" :src="filePreview" class="file-preview-img" alt="" />
                <div v-else class="file-preview-icon" v-html="typeIcons[editForm.type] || '&#128196;'"></div>
              </div>
              <div class="file-preview-info">
                <div class="file-preview-name">{{ uploadedFile.name }}</div>
                <div class="file-preview-meta">
                  {{ formatSize(uploadedFile.size) }}
                  <span v-if="uploadedFile.mimeType"> &bull; {{ uploadedFile.mimeType }}</span>
                </div>
                <div class="file-preview-type">
                  <span class="type-badge" v-html="typeIcons[editForm.type]"></span>
                  {{ typeLabels[editForm.type] || editForm.type }}
                </div>
              </div>
              <button class="file-remove-btn" @click="removeFile" title="Datei entfernen">&times;</button>
            </div>
          </div>

          <!-- Title & Description -->
          <div class="editor-card">
            <h4 class="card-section-title">Inhalt</h4>
            <div class="form-group">
              <label>Titel</label>
              <input v-model="editForm.title" class="form-input form-input-lg" placeholder="Titel eingeben..." />
            </div>
            <div class="form-group">
              <label>Beschreibung</label>
              <textarea v-model="editForm.description" class="form-input" rows="5" placeholder="Beschreibung des Inhalts..."></textarea>
            </div>
          </div>

          <!-- Scheduling -->
          <div class="editor-card">
            <h4 class="card-section-title">Zeitsteuerung</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Gueltig ab</label>
                <input v-model="editForm.validFrom" type="datetime-local" class="form-input" />
              </div>
              <div class="form-group">
                <label>Gueltig bis</label>
                <input v-model="editForm.validUntil" type="datetime-local" class="form-input" />
              </div>
            </div>
            <p class="scheduling-hint" v-if="!editForm.validFrom && !editForm.validUntil">
              Ohne Zeitsteuerung wird der Inhalt nach Freigabe dauerhaft angezeigt.
            </p>
          </div>

          <!-- Tags & Type -->
          <div class="editor-card">
            <h4 class="card-section-title">Kategorisierung</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Typ</label>
                <select v-model="editForm.type" class="form-input">
                  <option value="text">Text</option>
                  <option value="image">Bild</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="html">HTML / Embed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tags (kommagetrennt)</label>
                <input v-model="editForm.tags" class="form-input" placeholder="z.B. produktion, sicherheit" />
              </div>
            </div>
          </div>

          <!-- Standort-Zuweisung -->
          <div class="editor-card">
            <h4 class="card-section-title">STANDORTE</h4>
            <p class="scheduling-hint" style="margin-bottom: 10px">
              Waehlen Sie die Standorte, an denen dieser Inhalt angezeigt werden soll. Ohne Auswahl wird der Inhalt ueberall angezeigt.
            </p>
            <div class="location-checkboxes">
              <label
                v-for="loc in locationStore.items"
                :key="loc.id"
                class="location-checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="loc.id"
                  v-model="editForm.locationIds"
                  class="location-checkbox"
                />
                <span class="location-name">{{ loc.name }}</span>
                <span v-if="loc.parentId" class="location-child-badge">Unterstandort</span>
              </label>
            </div>
            <p v-if="!editForm.locationIds?.length" class="scheduling-hint" style="margin-top: 6px; color: var(--accent-primary)">
              &#9432; Ueberall sichtbar (global)
            </p>
          </div>

          <!-- HTML / Embed Code -->
          <div class="editor-card" v-if="editForm.type === 'html'">
            <h4 class="card-section-title">HTML / Embed Code</h4>
            <p class="embed-hint">YouTube-Video, iFrame oder eigenen HTML-Code einfuegen. Der Code wird direkt auf dem Display gerendert.</p>
            <div class="form-group">
              <label>Embed Code</label>
              <textarea
                v-model="editForm.embedCode"
                class="form-input embed-textarea"
                rows="6"
                placeholder='<iframe src="https://www.youtube.com/embed/..." width="100%" height="100%" frameborder="0" allowfullscreen></iframe>'
                spellcheck="false"
              ></textarea>
            </div>
            <div v-if="editForm.embedCode" class="embed-preview">
              <div class="embed-preview-label">Vorschau</div>
              <div class="embed-preview-frame" v-html="editForm.embedCode"></div>
            </div>
          </div>
        </div>

        <!-- Preview View -->
        <div v-if="showPreview" class="preview-section">
          <div class="preview-frame">
            <div class="preview-label">Display-Vorschau (Announcement Card)</div>
            <div class="preview-card-mock">
              <div class="mock-header">
                <div class="mock-accent"></div>
                <h3 class="mock-zone-title">INFOS</h3>
              </div>
              <div class="mock-body">
                <div class="mock-card">
                  <div class="mock-card-img" v-if="filePreview">
                    <img :src="filePreview" alt="" />
                  </div>
                  <div class="mock-card-content">
                    <div class="mock-meta">
                      <span
                        class="mock-category"
                        :style="{ background: (categoryColors[previewCategory] || '#6B7280') + '22', color: categoryColors[previewCategory] || '#6B7280' }"
                      >{{ previewCategory }}</span>
                      <span class="mock-date">{{ previewDate }}</span>
                    </div>
                    <div class="mock-title">{{ editForm.title || 'Kein Titel' }}</div>
                    <div class="mock-text">{{ editForm.description || 'Keine Beschreibung' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-frame" v-if="filePreview || (uploadedFile && editForm.type === 'pdf')">
            <div class="preview-label">Datei-Vorschau</div>
            <div class="preview-file-area">
              <img v-if="filePreview" :src="filePreview" class="preview-full-img" alt="" />
              <div v-else-if="editForm.type === 'pdf'" class="preview-pdf-placeholder">
                <span class="pdf-icon">&#128462;</span>
                <p>{{ uploadedFile?.name }}</p>
                <p class="preview-pdf-hint">PDF-Vorschau im Browser verfuegbar</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="btn-secondary" @click="router.push('/admin/content')">Abbrechen</button>
          <button class="btn-primary" @click="save" :disabled="!canEdit">
            &#128190; Speichern
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="detail-sidebar">
        <div class="sidebar-card">
          <h4 class="sidebar-title">Details</h4>
          <div class="sidebar-row">
            <span class="sidebar-label">ID</span>
            <span class="sidebar-value mono">{{ content.id }}</span>
          </div>
          <div class="sidebar-row">
            <span class="sidebar-label">Typ</span>
            <span class="sidebar-value">
              <span v-html="typeIcons[content.type]"></span>
              {{ typeLabels[content.type] || content.type }}
            </span>
          </div>
          <div class="sidebar-row">
            <span class="sidebar-label">Erstellt</span>
            <span class="sidebar-value">{{ new Date(content.createdAt).toLocaleDateString('de-DE') }}</span>
          </div>
          <div class="sidebar-row" v-if="content.updatedAt">
            <span class="sidebar-label">Aktualisiert</span>
            <span class="sidebar-value">{{ new Date(content.updatedAt).toLocaleDateString('de-DE') }}</span>
          </div>
          <div class="sidebar-row" v-if="content.createdBy">
            <span class="sidebar-label">Erstellt von</span>
            <span class="sidebar-value">{{ content.createdBy }}</span>
          </div>
        </div>

        <div class="sidebar-card" v-if="content.tags?.length">
          <h4 class="sidebar-title">Tags</h4>
          <div class="sidebar-tags">
            <span v-for="tag in content.tags" :key="tag" class="sidebar-tag">{{ tag }}</span>
          </div>
        </div>

        <div class="sidebar-card">
          <h4 class="sidebar-title">Zeitfenster</h4>
          <div v-if="content.validFrom || content.validUntil">
            <div class="sidebar-row" v-if="content.validFrom">
              <span class="sidebar-label">Von</span>
              <span class="sidebar-value">{{ new Date(content.validFrom).toLocaleString('de-DE') }}</span>
            </div>
            <div class="sidebar-row" v-if="content.validUntil">
              <span class="sidebar-label">Bis</span>
              <span class="sidebar-value">{{ new Date(content.validUntil).toLocaleString('de-DE') }}</span>
            </div>
          </div>
          <div v-else class="sidebar-hint">Dauerhaft sichtbar nach Freigabe</div>
        </div>

        <div class="sidebar-card" v-if="content.fileName">
          <h4 class="sidebar-title">Datei</h4>
          <div class="sidebar-file">
            <span class="sidebar-file-icon" v-html="typeIcons[content.type] || '&#128196;'"></span>
            <div>
              <div class="sidebar-file-name">{{ content.fileName }}</div>
              <div class="sidebar-file-meta">{{ formatSize(content.fileSizeBytes) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty-state">
    <div class="empty-icon">&#128269;</div>
    <h3>Inhalt nicht gefunden</h3>
    <p>Der angeforderte Inhalt existiert nicht oder wurde geloescht.</p>
    <button class="btn-primary" @click="router.push('/admin/content')">Zurueck zur Uebersicht</button>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1200px;
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--blickle-navy);
  font-weight: 500;
  font-size: var(--font-size-sm);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}
.btn-back:hover {
  background: var(--gray-100);
}
.back-arrow {
  font-size: 1.1rem;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-action {
  padding: 6px 14px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
}

.btn-submit {
  background: rgba(245, 158, 11, 0.1);
  color: #92400E;
}
.btn-submit:hover {
  background: rgba(245, 158, 11, 0.2);
}

.btn-approve {
  background: rgba(16, 185, 129, 0.1);
  color: #065F46;
}
.btn-approve:hover {
  background: rgba(16, 185, 129, 0.2);
}

.btn-reject {
  background: rgba(239, 68, 68, 0.1);
  color: #991B1B;
}
.btn-reject:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-preview-toggle {
  padding: 6px 14px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--gray-600);
  background: white;
  transition: all 0.15s ease;
}
.btn-preview-toggle:hover {
  border-color: var(--blickle-navy);
  color: var(--blickle-navy);
}

/* Layout */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}

/* Status Banner */
.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  font-size: var(--font-size-sm);
}

.status-banner.draft {
  background: var(--gray-100);
  color: var(--gray-700);
}
.status-banner.in_review {
  background: var(--color-warning-light);
  color: #92400E;
}
.status-banner.approved {
  background: var(--color-success-light);
  color: #065F46;
}
.status-banner.rejected {
  background: var(--color-danger-light);
  color: #991B1B;
}

.status-icon {
  font-size: 1.1rem;
}
.status-text {
  font-weight: 700;
}
.status-meta {
  margin-left: auto;
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

/* Editor Cards */
.editor-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.card-section-title {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--blickle-navy);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Form */
.form-group {
  margin-bottom: 14px;
}
.form-group:last-child {
  margin-bottom: 0;
}
.form-group label {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.form-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1);
}

.form-input-lg {
  font-size: var(--font-size-lg);
  font-weight: 600;
  padding: 10px 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.scheduling-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  margin-top: 6px;
  font-style: italic;
}

/* Embed */
.embed-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-bottom: 12px;
  line-height: 1.5;
}

.embed-textarea {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  background: var(--gray-50);
  line-height: 1.6;
}

.embed-preview {
  margin-top: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.embed-preview-label {
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-500);
  background: var(--gray-50);
  border-bottom: 1px solid var(--color-border);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.embed-preview-frame {
  height: 200px;
  background: #1a1f2e;
}

.embed-preview-frame :deep(iframe) {
  width: 100%;
  height: 100%;
  border: none;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-md);
  padding: 28px;
  text-align: center;
  color: var(--gray-500);
  cursor: pointer;
  transition: all 0.2s ease;
}
.drop-zone:hover {
  border-color: var(--blickle-green);
  background: rgba(181, 204, 24, 0.04);
}
.drop-zone-active {
  border-color: var(--blickle-green);
  background: rgba(181, 204, 24, 0.08);
  border-style: solid;
}
.drop-icon {
  font-size: 1.8rem;
  margin-bottom: 6px;
}
.drop-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}
.drop-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  margin-top: 2px;
}

/* File Preview */
.file-preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--gray-50);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.file-preview-visual {
  flex-shrink: 0;
}

.file-preview-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.file-preview-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.file-preview-info {
  flex: 1;
  min-width: 0;
}

.file-preview-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-preview-meta {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-top: 2px;
}

.file-preview-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  margin-top: 4px;
}

.type-badge {
  font-size: 0.85rem;
}

.file-remove-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray-200);
  color: var(--gray-600);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.file-remove-btn:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

/* Preview Section */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-frame {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.preview-label {
  padding: 10px 18px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--gray-500);
  background: var(--gray-50);
  border-bottom: 1px solid var(--color-border);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Mock Display Card */
.preview-card-mock {
  background: #0d1420;
  padding: 0;
}

.mock-header {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.mock-accent {
  width: 3px;
  height: 14px;
  background: #B5CC18;
  border-radius: 2px;
}

.mock-zone-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(232, 236, 244, 0.9);
  letter-spacing: 0.04em;
  margin: 0;
}

.mock-body {
  padding: 12px 14px;
}

.mock-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  overflow: hidden;
}

.mock-card-img {
  width: 100%;
  height: 120px;
  overflow: hidden;
}
.mock-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mock-card-content {
  padding: 12px 14px;
}

.mock-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mock-category {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mock-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  color: rgba(232, 236, 244, 0.35);
}

.mock-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #E8ECF4;
  margin-bottom: 3px;
}

.mock-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: rgba(232, 236, 244, 0.5);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* File Preview Area */
.preview-file-area {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.preview-full-img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.preview-pdf-placeholder {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
}

.pdf-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
}

.preview-pdf-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  margin-top: 4px;
}

/* Actions */
.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.btn-primary {
  padding: 10px 24px;
  background: var(--blickle-navy);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: var(--blickle-navy-light);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 24px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
}
.btn-secondary:hover {
  background: var(--gray-200);
}

/* Sidebar */
.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
}

.sidebar-title {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--blickle-navy);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sidebar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: var(--font-size-xs);
}

.sidebar-label {
  color: var(--gray-500);
  font-weight: 500;
}

.sidebar-value {
  color: var(--gray-700);
  font-weight: 500;
  text-align: right;
}

.sidebar-value.mono {
  font-family: monospace;
  font-size: 0.65rem;
  color: var(--gray-400);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.sidebar-tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  background: var(--gray-100);
  color: var(--gray-600);
  border-radius: 4px;
  font-weight: 500;
}

.sidebar-hint {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  font-style: italic;
}

.sidebar-file {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-file-icon {
  font-size: 1.5rem;
}

.sidebar-file-name {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-700);
  word-break: break-all;
}

.sidebar-file-meta {
  font-size: var(--font-size-xs);
  color: var(--gray-400);
  margin-top: 1px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--blickle-navy);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 24px;
}

/* Upload feedback */
.upload-progress-container {
  position: relative;
  height: 28px;
  background: var(--gray-100);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 10px;
}

.upload-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), #a3c41a);
  border-radius: 8px;
  transition: width 0.2s ease;
}

.upload-progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gray-700);
}

.upload-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-top: 10px;
  animation: toast-in 0.3s ease;
}

.upload-toast-success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.upload-toast-error {
  background: #fce4ec;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.upload-error-dismiss {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: inherit;
  padding: 0 4px;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Location checkboxes */
.location-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.location-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: var(--font-size-sm);
}

.location-checkbox-label:hover {
  background: var(--gray-50);
}

.location-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
}

.location-name {
  font-weight: 500;
  color: var(--gray-700);
}

.location-child-badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-400);
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
</style>
