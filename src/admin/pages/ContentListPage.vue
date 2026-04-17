<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useTemplateStore } from '../../shared/stores/templateStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const router = useRouter()
const contentStore = useContentStore()
const templateStore = useTemplateStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const searchQuery = ref('')
const filterStatus = ref('all')
const filterTag = ref('all')

// --- Content Designer Flow ---
const showDesigner = ref(false)
const designerStep = ref('choose') // 'choose' | 'template' | 'upload' | 'embed' | 'text'

const newContent = ref({ title: '', description: '', type: 'text', tags: '', embedCode: '' })
const uploadedFile = ref(null)
const filePreview = ref(null)
const isDragging = ref(false)

// Template selection
const selectedCategory = ref('all')
const templateCategories = computed(() => {
  const cats = new Set()
  templateStore.items.forEach(t => { if (t.category) cats.add(t.category) })
  return [...cats].sort()
})
const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') return templateStore.items
  return templateStore.items.filter(t => t.category === selectedCategory.value)
})

function openDesigner() {
  showDesigner.value = true
  designerStep.value = 'choose'
  resetForm()
}

function closeDesigner() {
  showDesigner.value = false
  designerStep.value = 'choose'
  resetForm()
}

function resetForm() {
  newContent.value = { title: '', description: '', type: 'text', tags: '', embedCode: '' }
  uploadedFile.value = null
  filePreview.value = null
}

// --- Template Flow ---
function selectTemplate(tmpl) {
  const params = {}
  if (tmpl.parameters) {
    for (const param of tmpl.parameters) {
      const k = param.key || param.name
      params[k] = param.defaultValue || param.default || ''
    }
  }
  const item = contentStore.add({
    title: `${tmpl.name} - ${new Date().toLocaleDateString('de-DE')}`,
    description: tmpl.description || '',
    type: 'html',
    tags: [tmpl.category || 'template'],
    createdBy: userStore.currentUser.id,
    fileUrl: null,
    mimeType: null,
    fileSizeBytes: 0,
    thumbnailUrl: null,
    templateId: tmpl.id,
    templateParams: params,
    metadata: {}
  })
  auditStore.log('content.created_from_template', 'content', item.id, userStore.currentUser.id, {
    templateId: tmpl.id,
    templateName: tmpl.name
  })
  closeDesigner()
  router.push('/admin/content/' + item.id)
}

// --- Filters ---
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

// --- File handling ---
function detectType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('html')) return 'html'
  return 'text'
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
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
  const reader = new FileReader()
  reader.onload = () => {
    uploadedFile.value = {
      name: file.name, size: file.size, mimeType: file.type, dataUrl: reader.result
    }
    newContent.value.type = detectType(file.type)
    if (!newContent.value.title) {
      newContent.value.title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    }
    if (file.type.startsWith('image/')) {
      filePreview.value = reader.result
    } else {
      filePreview.value = null
    }
  }
  reader.readAsDataURL(file)
}

function removeFile() {
  uploadedFile.value = null
  filePreview.value = null
}

// --- Create content (for upload, embed, text flows) ---
function addContent() {
  if (!newContent.value.title) return
  const contentType = (designerStep.value === 'embed') ? 'html' : newContent.value.type
  const item = contentStore.add({
    ...newContent.value,
    type: contentType,
    tags: (typeof newContent.value.tags === 'string')
      ? newContent.value.tags.split(',').map(t => t.trim()).filter(Boolean)
      : newContent.value.tags || [],
    createdBy: userStore.currentUser.id,
    fileUrl: uploadedFile.value?.dataUrl || null,
    mimeType: uploadedFile.value?.mimeType || null,
    fileSizeBytes: uploadedFile.value?.size || 0,
    fileName: uploadedFile.value?.name || null,
    thumbnailUrl: filePreview.value || null,
    templateId: null, templateParams: null,
    metadata: {
      embedCode: newContent.value.embedCode || null,
    }
  })
  auditStore.log('content.created', 'content', item.id, userStore.currentUser.id, { title: item.title })
  closeDesigner()
  router.push('/admin/content/' + item.id)
}

function deleteContent(id) {
  contentStore.remove(id)
  auditStore.log('content.deleted', 'content', id, userStore.currentUser.id)
}

function submitForReview(id) {
  contentStore.setStatus(id, 'in_review')
  auditStore.log('content.submitted_for_review', 'content', id, userStore.currentUser.id)
}

const statusLabels = {
  draft: 'Entwurf',
  in_review: 'In Pruefung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt'
}

const categoryLabels = {
  kommunikation: 'Kommunikation',
  sicherheit: 'Sicherheit',
  produktion: 'Produktion',
  personal: 'Personal',
  events: 'Events',
  information: 'Information',
  medien: 'Medien',
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
            <option value="in_review">In Pruefung</option>
            <option value="approved">Freigegeben</option>
          </select>
        </div>
        <div class="filter-wrap">
          <select v-model="filterTag" class="filter-select">
            <option value="all">Alle Tags</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>
      </div>
      <button class="btn-create" @click="router.push({ name: 'admin-templates' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M8 3v10M3 8h10"/>
        </svg>
        Neuer Inhalt
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

        <div class="card-body" @click="router.push('/admin/content/' + content.id)">
          <div class="card-top-row">
            <h4 class="card-title">{{ content.title }}</h4>
            <span :class="['status-pill', content.status]">{{ statusLabels[content.status] }}</span>
          </div>
          <p class="card-desc">{{ content.description }}</p>
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
            v-if="content.status === 'draft'"
            class="btn-action btn-review"
            @click.stop="submitForReview(content.id)"
            title="Zur Pruefung einreichen"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M2 8l4 4 8-8"/>
            </svg>
          </button>
          <button
            class="btn-action btn-delete"
            @click.stop="deleteContent(content.id)"
            title="Loeschen"
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

    <!-- ========== CONTENT DESIGNER MODAL ========== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDesigner" class="modal-overlay" @click.self="closeDesigner">
          <div :class="['modal', { 'modal-wide': designerStep === 'template' }]">
            <div class="modal-header">
              <div class="modal-header-left">
                <button v-if="designerStep !== 'choose'" class="back-btn" @click="designerStep = 'choose'">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 2l-6 6 6 6"/>
                  </svg>
                </button>
                <h3>{{ designerStep === 'choose' ? 'Was moechten Sie erstellen?' :
                       designerStep === 'template' ? 'Template auswaehlen' :
                       designerStep === 'upload' ? 'Datei hochladen' :
                       designerStep === 'embed' ? 'HTML / Embed einfuegen' :
                       'Text erstellen' }}</h3>
              </div>
              <button class="modal-close" @click="closeDesigner">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M4 4l10 10M14 4L4 14"/>
                </svg>
              </button>
            </div>

            <!-- Step 1: Choose Type -->
            <div v-if="designerStep === 'choose'" class="modal-body">
              <div class="designer-grid">
                <div class="designer-option" @click="designerStep = 'template'">
                  <div class="do-icon-wrap do-icon-navy">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                  </div>
                  <div class="do-text">
                    <div class="do-label">Aus Template</div>
                    <div class="do-desc">Vorgefertigte Layouts im Blickle CI</div>
                  </div>
                  <svg class="do-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
                </div>
                <div class="designer-option" @click="designerStep = 'upload'">
                  <div class="do-icon-wrap do-icon-green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 16V4M12 4l-4 4M12 4l4 4"/>
                      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2"/>
                    </svg>
                  </div>
                  <div class="do-text">
                    <div class="do-label">Datei hochladen</div>
                    <div class="do-desc">Bilder, Videos, PDFs hochladen</div>
                  </div>
                  <svg class="do-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
                </div>
                <div class="designer-option" @click="designerStep = 'embed'">
                  <div class="do-icon-wrap do-icon-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M8 7L3 12l5 5"/>
                      <path d="M16 7l5 5-5 5"/>
                      <path d="M14 4l-4 16"/>
                    </svg>
                  </div>
                  <div class="do-text">
                    <div class="do-label">HTML / Embed</div>
                    <div class="do-desc">iFrame, YouTube, HTML-Code</div>
                  </div>
                  <svg class="do-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
                </div>
                <div class="designer-option" @click="designerStep = 'text'">
                  <div class="do-icon-wrap do-icon-warm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <path d="M14 2v6h6"/>
                      <path d="M9 15h6M9 11h6"/>
                    </svg>
                  </div>
                  <div class="do-text">
                    <div class="do-label">Text / Notiz</div>
                    <div class="do-desc">Einfache Textmeldung erstellen</div>
                  </div>
                  <svg class="do-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
                </div>
              </div>
            </div>

            <!-- Step 2a: Template Selection -->
            <div v-else-if="designerStep === 'template'" class="modal-body">
              <div class="template-filter-bar">
                <button
                  :class="['cat-chip', { active: selectedCategory === 'all' }]"
                  @click="selectedCategory = 'all'"
                >Alle</button>
                <button
                  v-for="cat in templateCategories" :key="cat"
                  :class="['cat-chip', { active: selectedCategory === cat }]"
                  @click="selectedCategory = cat"
                >{{ categoryLabels[cat] || cat }}</button>
              </div>
              <div class="template-pick-grid">
                <div
                  v-for="tmpl in filteredTemplates" :key="tmpl.id"
                  class="template-pick-card"
                  @click="selectTemplate(tmpl)"
                >
                  <div class="tpc-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="6" height="6" rx="1"/><rect x="12" y="2" width="6" height="6" rx="1"/><rect x="2" y="12" width="6" height="6" rx="1"/><rect x="12" y="12" width="6" height="6" rx="1"/>
                    </svg>
                  </div>
                  <div class="tpc-info">
                    <div class="tpc-name">{{ tmpl.name }}</div>
                    <div class="tpc-desc">{{ tmpl.description }}</div>
                  </div>
                  <div class="tpc-category" v-if="tmpl.category">{{ categoryLabels[tmpl.category] || tmpl.category }}</div>
                  <svg class="tpc-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
                </div>
              </div>
              <p v-if="!filteredTemplates.length" class="empty-text-small">Keine Templates in dieser Kategorie.</p>
            </div>

            <!-- Step 2b: File Upload -->
            <div v-else-if="designerStep === 'upload'" class="modal-body">
              <div
                v-if="!uploadedFile"
                :class="['drop-zone', { 'drop-zone-active': isDragging }]"
                @dragenter.prevent="isDragging = true"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
                @click="$refs.fileInput.click()"
              >
                <div class="drop-icon-wrap">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <path d="M16 22V8M16 8l-5 5M16 8l5 5"/>
                    <path d="M26 22v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3"/>
                  </svg>
                </div>
                <p class="drop-title">Datei hierher ziehen</p>
                <p class="drop-hint">oder klicken zum Auswaehlen</p>
                <div class="drop-formats">PDF, Bilder, Videos, HTML</div>
                <input ref="fileInput" type="file" accept="image/*,video/*,.pdf,.html" hidden @change="handleFileSelect" />
              </div>
              <div v-if="uploadedFile" class="file-preview-card">
                <img v-if="filePreview" :src="filePreview" class="file-preview-img" alt="" />
                <div v-else class="file-preview-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                </div>
                <div class="file-preview-info">
                  <div class="file-preview-name">{{ uploadedFile.name }}</div>
                  <div class="file-preview-meta">{{ formatSize(uploadedFile.size) }} &bull; {{ uploadedFile.mimeType }}</div>
                </div>
                <button class="file-preview-remove" @click="removeFile">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M4 4l8 8M12 4l-8 8"/>
                  </svg>
                </button>
              </div>
              <div class="form-group">
                <label>Titel</label>
                <input v-model="newContent.title" type="text" placeholder="Titel eingeben..." class="form-input" />
              </div>
              <div class="form-group">
                <label>Beschreibung</label>
                <textarea v-model="newContent.description" placeholder="Beschreibung..." class="form-input" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Tags (kommagetrennt)</label>
                <input v-model="newContent.tags" type="text" placeholder="z.B. produktion, sicherheit" class="form-input" />
              </div>
            </div>

            <!-- Step 2c: Embed -->
            <div v-else-if="designerStep === 'embed'" class="modal-body">
              <div class="form-group">
                <label>Titel</label>
                <input v-model="newContent.title" type="text" placeholder="z.B. YouTube Video, Dashboard..." class="form-input" />
              </div>
              <div class="form-group">
                <label>HTML / Embed Code</label>
                <textarea
                  v-model="newContent.embedCode"
                  placeholder='<iframe src="https://..." width="100%" height="100%" frameborder="0"></iframe>'
                  class="form-input embed-code"
                  rows="6"
                ></textarea>
              </div>
              <div v-if="newContent.embedCode" class="embed-preview-wrap">
                <div class="embed-preview-label">Vorschau</div>
                <div class="embed-preview" v-html="newContent.embedCode"></div>
              </div>
              <div class="form-group">
                <label>Tags (kommagetrennt)</label>
                <input v-model="newContent.tags" type="text" placeholder="z.B. medien, youtube" class="form-input" />
              </div>
            </div>

            <!-- Step 2d: Text -->
            <div v-else-if="designerStep === 'text'" class="modal-body">
              <div class="form-group">
                <label>Titel</label>
                <input v-model="newContent.title" type="text" placeholder="Titel eingeben..." class="form-input" />
              </div>
              <div class="form-group">
                <label>Nachricht</label>
                <textarea v-model="newContent.description" placeholder="Ihre Nachricht..." class="form-input" rows="5"></textarea>
              </div>
              <div class="form-group">
                <label>Tags (kommagetrennt)</label>
                <input v-model="newContent.tags" type="text" placeholder="z.B. allgemein, organisation" class="form-input" />
              </div>
            </div>

            <!-- Footer (not on choose or template steps) -->
            <div v-if="designerStep !== 'choose' && designerStep !== 'template'" class="modal-footer">
              <button class="btn-secondary" @click="closeDesigner">Abbrechen</button>
              <button class="btn-primary" @click="addContent" :disabled="!newContent.title">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M8 3v10M3 8h10"/>
                </svg>
                Erstellen
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

.btn-secondary:hover { background: var(--gray-200); }
</style>

<!-- Unscoped styles for Teleported modal -->
<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay .modal {
  background: #FFFFFF;
  border-radius: 16px;
  width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.modal-overlay .modal-wide { width: 720px; }

.modal-overlay .modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-overlay .modal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-overlay .modal-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.0625rem;
  font-weight: 700;
  color: #0F172A;
}
.modal-overlay .modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
  background: none;
}
.modal-overlay .modal-close:hover {
  background: #F1F5F9;
  color: #475569;
}

.modal-overlay .modal-body { padding: 24px; }

.modal-overlay .modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-overlay .back-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F1F5F9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
}
.modal-overlay .back-btn:hover {
  background: #E2E8F0;
  color: #1E293B;
}

/* Designer Options */
.modal-overlay .designer-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-overlay .designer-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-overlay .designer-option:hover {
  border-color: #163A6C;
  background: rgba(22, 58, 108, 0.02);
  transform: translateX(4px);
}
.modal-overlay .designer-option:hover .do-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.modal-overlay .do-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.modal-overlay .do-icon-navy { background: rgba(22, 58, 108, 0.08); color: #163A6C; }
.modal-overlay .do-icon-green { background: rgba(181, 204, 24, 0.12); color: #96AA10; }
.modal-overlay .do-icon-blue { background: rgba(59, 130, 246, 0.08); color: #3B82F6; }
.modal-overlay .do-icon-warm { background: rgba(245, 158, 11, 0.08); color: #F59E0B; }

.modal-overlay .do-text { flex: 1; min-width: 0; }
.modal-overlay .do-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.9375rem;
  color: #0F172A;
  margin-bottom: 2px;
}
.modal-overlay .do-desc {
  font-size: 0.8125rem;
  color: #64748B;
  line-height: 1.3;
}

.modal-overlay .do-arrow {
  color: #CBD5E1;
  opacity: 0;
  flex-shrink: 0;
  transition: all 200ms ease;
}

/* Template Picker */
.modal-overlay .template-filter-bar { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.modal-overlay .cat-chip {
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #F1F5F9;
  color: #475569;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 150ms ease;
}
.modal-overlay .cat-chip:hover { background: #E2E8F0; }
.modal-overlay .cat-chip.active { background: #163A6C; color: white; }

.modal-overlay .template-pick-grid { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
.modal-overlay .template-pick-card {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  border: 1px solid #E2E8F0; border-radius: 8px; cursor: pointer; transition: all 200ms ease;
}
.modal-overlay .template-pick-card:hover { border-color: #163A6C; background: rgba(22, 58, 108, 0.02); transform: translateX(3px); }
.modal-overlay .template-pick-card:hover .tpc-arrow { opacity: 1; color: #163A6C; }
.modal-overlay .tpc-icon-wrap { width: 38px; height: 38px; border-radius: 8px; background: rgba(22, 58, 108, 0.06); color: #163A6C; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-overlay .tpc-info { flex: 1; min-width: 0; }
.modal-overlay .tpc-name { font-size: 0.8125rem; font-weight: 600; color: #0F172A; }
.modal-overlay .tpc-desc { font-size: 0.75rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.modal-overlay .tpc-category { font-size: 0.6rem; padding: 2px 8px; background: #F1F5F9; color: #64748B; border-radius: 9999px; font-weight: 500; flex-shrink: 0; }
.modal-overlay .tpc-arrow { color: #CBD5E1; flex-shrink: 0; opacity: 0; transition: all 200ms ease; }

/* Upload / Embed / Text form styles */
.modal-overlay .drop-zone { border: 2px dashed #CBD5E1; border-radius: 16px; padding: 40px 32px; text-align: center; color: #64748B; margin-bottom: 20px; cursor: pointer; transition: all 250ms ease; }
.modal-overlay .drop-zone:hover { border-color: #B5CC18; background: rgba(181, 204, 24, 0.03); }
.modal-overlay .drop-zone-active { border-color: #B5CC18; background: rgba(181, 204, 24, 0.06); border-style: solid; }
.modal-overlay .drop-icon-wrap { width: 56px; height: 56px; border-radius: 16px; background: #F1F5F9; color: #94A3B8; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.modal-overlay .drop-zone:hover .drop-icon-wrap { background: rgba(181, 204, 24, 0.1); color: #96AA10; }
.modal-overlay .drop-title { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.9375rem; color: #334155; margin-bottom: 4px; }
.modal-overlay .drop-hint { font-size: 0.8125rem; color: #94A3B8; }
.modal-overlay .drop-formats { margin-top: 12px; font-size: 0.75rem; color: #94A3B8; padding: 4px 12px; background: #F8FAFC; border-radius: 9999px; display: inline-block; }

.modal-overlay .file-preview-card { display: flex; align-items: center; gap: 14px; padding: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 20px; }
.modal-overlay .file-preview-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.modal-overlay .file-preview-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 8px; flex-shrink: 0; color: #94A3B8; }
.modal-overlay .file-preview-info { flex: 1; min-width: 0; }
.modal-overlay .file-preview-name { font-size: 0.8125rem; font-weight: 600; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.modal-overlay .file-preview-meta { font-size: 0.75rem; color: #64748B; margin-top: 2px; }
.modal-overlay .file-preview-remove { width: 30px; height: 30px; border-radius: 9999px; background: #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 150ms ease; cursor: pointer; border: none; }
.modal-overlay .file-preview-remove:hover { background: #FEF2F2; color: #EF4444; }

.modal-overlay .embed-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8rem; background: #0F172A; color: #E8ECF4; border: 1px solid #1E293B; border-radius: 8px !important; }
.modal-overlay .embed-preview-wrap { margin-bottom: 16px; }
.modal-overlay .embed-preview-label { font-size: 0.75rem; font-weight: 600; color: #64748B; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em; }
.modal-overlay .embed-preview { background: #0F172A; border: 1px solid #1E293B; border-radius: 8px; min-height: 200px; overflow: hidden; }
.modal-overlay .embed-preview iframe { width: 100%; min-height: 200px; border: none; }

.modal-overlay .form-group { margin-bottom: 16px; }
.modal-overlay .form-group label { display: block; font-size: 0.8125rem; font-weight: 600; color: #334155; margin-bottom: 6px; }
.modal-overlay .form-input { width: 100%; padding: 10px 14px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 0.8125rem; font-family: 'DM Sans', sans-serif; background: white; transition: all 200ms ease; box-sizing: border-box; }
.modal-overlay .form-input:focus { outline: none; border-color: #163A6C; box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08); }

.modal-overlay .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; background: #163A6C; color: white; border-radius: 8px; font-weight: 600; font-size: 0.8125rem; font-family: 'DM Sans', sans-serif; transition: all 200ms ease; cursor: pointer; border: none; }
.modal-overlay .btn-primary:hover { background: #1E4D8A; }
.modal-overlay .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.modal-overlay .btn-secondary { padding: 9px 20px; background: #F1F5F9; color: #475569; border-radius: 8px; font-weight: 500; font-size: 0.8125rem; font-family: 'DM Sans', sans-serif; transition: all 150ms ease; cursor: pointer; border: none; }
.modal-overlay .btn-secondary:hover { background: #E2E8F0; }

.modal-overlay .empty-text-small { font-size: 0.75rem; color: #94A3B8; text-align: center; padding: 24px; }

/* Transitions */
.modal-enter-active { transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active { transition: all 200ms ease-in; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal { transform: scale(0.96) translateY(8px); opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal { transform: scale(0.98) translateY(4px); opacity: 0; }
.modal-enter-active .modal { transition: all 350ms cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active .modal { transition: all 200ms ease-in; }
</style>
