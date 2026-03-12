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
  // Create content from template and navigate to detail page
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
  // Auto-set type for embed content
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

const typeIcons = {
  text: '&#128196;',
  image: '&#128248;',
  video: '&#127909;',
  pdf: '&#128462;',
  html: '&#128187;',
}

const categoryIcons = {
  kommunikation: '&#128227;',
  sicherheit: '&#9888;',
  produktion: '&#9881;',
  personal: '&#128101;',
  events: '&#127881;',
  information: '&#128218;',
  medien: '&#127916;',
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
    <div class="page-toolbar">
      <div class="toolbar-left">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Inhalte suchen..."
          class="search-input"
        />
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Alle Status</option>
          <option value="draft">Entwurf</option>
          <option value="in_review">In Pruefung</option>
          <option value="approved">Freigegeben</option>
        </select>
        <select v-model="filterTag" class="filter-select">
          <option value="all">Alle Tags</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
      <button class="btn-primary" @click="openDesigner">+ Neuer Inhalt</button>
    </div>

    <div class="content-grid">
      <div v-for="content in filtered" :key="content.id" class="content-card">
        <div class="card-icon-wrap">
          <img v-if="content.thumbnailUrl" :src="content.thumbnailUrl" class="card-thumbnail" alt="" />
          <div v-else class="card-icon" v-html="typeIcons[content.type] || '&#128196;'"></div>
        </div>
        <div class="card-info" @click="router.push('/admin/content/' + content.id)" style="cursor: pointer;">
          <h4 class="card-title">{{ content.title }}</h4>
          <p class="card-desc">{{ content.description }}</p>
          <div class="card-meta">
            <span :class="['status-badge', content.status]">{{ statusLabels[content.status] }}</span>
            <span v-for="tag in content.tags" :key="tag" class="tag-badge">{{ tag }}</span>
            <span v-if="content.templateId" class="template-badge">Template</span>
            <span v-if="content.fileName" class="file-badge">{{ content.fileName }}</span>
            <span v-if="content.fileSizeBytes" class="size-badge">{{ formatSize(content.fileSizeBytes) }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button
            v-if="content.status === 'draft'"
            class="btn-sm btn-outline"
            @click="submitForReview(content.id)"
          >Zur Pruefung</button>
          <button class="btn-sm btn-danger" @click="deleteContent(content.id)">&#128465;</button>
        </div>
      </div>
      <p v-if="!filtered.length" class="empty-text">Keine Inhalte gefunden.</p>
    </div>

    <!-- ========== CONTENT DESIGNER MODAL ========== -->
    <div v-if="showDesigner" class="modal-overlay" @click.self="closeDesigner">
      <div :class="['modal', { 'modal-wide': designerStep === 'template' }]">
        <div class="modal-header">
          <div class="modal-header-left">
            <button v-if="designerStep !== 'choose'" class="back-btn" @click="designerStep = 'choose'">&#8592;</button>
            <h3>{{ designerStep === 'choose' ? 'Was moechten Sie erstellen?' :
                   designerStep === 'template' ? 'Template auswaehlen' :
                   designerStep === 'upload' ? 'Datei hochladen' :
                   designerStep === 'embed' ? 'HTML / Embed einfuegen' :
                   'Text erstellen' }}</h3>
          </div>
          <button class="modal-close" @click="closeDesigner">&times;</button>
        </div>

        <!-- Step 1: Choose Type -->
        <div v-if="designerStep === 'choose'" class="modal-body">
          <div class="designer-grid">
            <div class="designer-option" @click="designerStep = 'template'">
              <div class="designer-icon">&#127912;</div>
              <div class="designer-label">Aus Template</div>
              <div class="designer-desc">Vorgefertigte Layouts im Blickle CI</div>
            </div>
            <div class="designer-option" @click="designerStep = 'upload'">
              <div class="designer-icon">&#128449;</div>
              <div class="designer-label">Datei hochladen</div>
              <div class="designer-desc">Bilder, Videos, PDFs hochladen</div>
            </div>
            <div class="designer-option" @click="designerStep = 'embed'">
              <div class="designer-icon">&#128187;</div>
              <div class="designer-label">HTML / Embed</div>
              <div class="designer-desc">iFrame, YouTube, HTML-Code</div>
            </div>
            <div class="designer-option" @click="designerStep = 'text'">
              <div class="designer-icon">&#128221;</div>
              <div class="designer-label">Text / Notiz</div>
              <div class="designer-desc">Einfache Textmeldung erstellen</div>
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
            >
              <span v-html="categoryIcons[cat] || ''"></span>
              {{ categoryLabels[cat] || cat }}
            </button>
          </div>
          <div class="template-pick-grid">
            <div
              v-for="tmpl in filteredTemplates" :key="tmpl.id"
              class="template-pick-card"
              @click="selectTemplate(tmpl)"
            >
              <div class="tpc-icon" v-html="tmpl.icon || '&#127912;'"></div>
              <div class="tpc-info">
                <div class="tpc-name">{{ tmpl.name }}</div>
                <div class="tpc-desc">{{ tmpl.description }}</div>
              </div>
              <span class="tpc-arrow">&#8594;</span>
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
            <div class="drop-icon">&#128449;</div>
            <p>Datei hierher ziehen oder klicken</p>
            <p class="drop-hint">PDF, Bilder, Videos, HTML</p>
            <input ref="fileInput" type="file" accept="image/*,video/*,.pdf,.html" hidden @change="handleFileSelect" />
          </div>
          <div v-if="uploadedFile" class="file-preview-card">
            <img v-if="filePreview" :src="filePreview" class="file-preview-img" alt="" />
            <div v-else class="file-preview-icon" v-html="typeIcons[newContent.type] || '&#128196;'"></div>
            <div class="file-preview-info">
              <div class="file-preview-name">{{ uploadedFile.name }}</div>
              <div class="file-preview-meta">{{ formatSize(uploadedFile.size) }} &bull; {{ uploadedFile.mimeType }}</div>
            </div>
            <button class="file-preview-remove" @click="removeFile">&times;</button>
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
          <button class="btn-primary" @click="addContent" :disabled="!newContent.title">Erstellen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-page { max-width: 1200px; }

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.toolbar-left { display: flex; gap: 8px; flex: 1; }

.search-input {
  flex: 1;
  max-width: 320px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--blickle-white);
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
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  padding: 8px 20px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

/* Content Grid */
.content-grid { display: flex; flex-direction: column; gap: 8px; }

.content-card {
  background: var(--blickle-white);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}

.card-icon-wrap {
  width: 48px; height: 48px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--gray-50);
}
.card-thumbnail { width: 100%; height: 100%; object-fit: cover; }
.card-icon { font-size: 1.5rem; }

.card-info { flex: 1; min-width: 0; }
.card-title { font-size: var(--font-size-base); font-weight: 600; color: var(--blickle-navy); margin-bottom: 2px; }
.card-desc { font-size: var(--font-size-sm); color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-meta { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; align-items: center; }

.status-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.status-badge.approved { background: var(--color-success-light); color: var(--color-success); }
.status-badge.in_review { background: var(--color-warning-light); color: #92400E; }
.status-badge.draft { background: var(--gray-100); color: var(--gray-600); }
.status-badge.rejected { background: var(--color-danger-light); color: var(--color-danger); }

.tag-badge { font-size: 0.6rem; padding: 1px 6px; background: var(--gray-100); color: var(--gray-600); border-radius: 4px; }
.template-badge { font-size: 0.6rem; padding: 1px 6px; background: rgba(181, 204, 24, 0.15); color: #6B7F00; border-radius: 4px; font-weight: 600; }
.file-badge { font-size: 0.6rem; padding: 1px 6px; background: rgba(22, 58, 108, 0.08); color: var(--blickle-navy); border-radius: 4px; font-family: monospace; }
.size-badge { font-size: 0.6rem; color: var(--gray-400); }

.card-actions { display: flex; gap: 6px; flex-shrink: 0; }
.btn-sm { padding: 4px 10px; font-size: var(--font-size-xs); border-radius: var(--radius-sm); font-weight: 500; }
.btn-outline { border: 1px solid var(--blickle-navy); color: var(--blickle-navy); }
.btn-outline:hover { background: var(--blickle-navy); color: white; }
.btn-danger { color: var(--color-danger); }
.btn-danger:hover { background: var(--color-danger-light); }

.empty-text { text-align: center; color: var(--color-text-secondary); padding: 40px; }

/* ===== MODAL ===== */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--blickle-white); border-radius: var(--radius-lg); width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
.modal-wide { width: 720px; }
.modal-header { padding: 16px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.modal-header-left { display: flex; align-items: center; gap: 10px; }
.modal-header h3 { font-size: var(--font-size-lg); font-weight: 600; color: var(--blickle-navy); }
.modal-close { font-size: 1.5rem; color: var(--gray-400); padding: 4px; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 8px; }

.back-btn {
  width: 32px; height: 32px; border-radius: var(--radius-md);
  background: var(--gray-100); color: var(--blickle-navy);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 600;
  transition: background 0.15s ease;
}
.back-btn:hover { background: var(--gray-200); }

/* ===== DESIGNER STEP 1: CHOOSE ===== */
.designer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.designer-option {
  padding: 24px 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}
.designer-option:hover {
  border-color: var(--blickle-navy);
  background: rgba(22, 58, 108, 0.03);
  transform: translateY(-2px);
}

.designer-icon { font-size: 2rem; margin-bottom: 8px; }
.designer-label { font-size: var(--font-size-base); font-weight: 700; color: var(--blickle-navy); margin-bottom: 4px; }
.designer-desc { font-size: var(--font-size-xs); color: var(--color-text-secondary); line-height: 1.4; }

/* ===== DESIGNER STEP 2a: TEMPLATE PICKER ===== */
.template-filter-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cat-chip {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: var(--gray-100);
  color: var(--gray-600);
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
}
.cat-chip:hover { background: var(--gray-200); }
.cat-chip.active {
  background: var(--blickle-navy);
  color: white;
}

.template-pick-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
}

.template-pick-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}
.template-pick-card:hover {
  border-color: var(--blickle-navy);
  background: rgba(22, 58, 108, 0.03);
}

.tpc-icon { font-size: 1.5rem; flex-shrink: 0; }
.tpc-info { flex: 1; min-width: 0; }
.tpc-name { font-size: var(--font-size-sm); font-weight: 600; color: var(--blickle-navy); }
.tpc-desc { font-size: var(--font-size-xs); color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tpc-arrow { color: var(--gray-400); font-size: 1.1rem; flex-shrink: 0; }

.empty-text-small { font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; padding: 20px; }

/* ===== UPLOAD STEP ===== */
.drop-zone {
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  color: var(--gray-500);
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.drop-zone:hover { border-color: var(--blickle-green); background: rgba(181, 204, 24, 0.04); }
.drop-zone-active { border-color: var(--blickle-green); background: rgba(181, 204, 24, 0.08); border-style: solid; }
.drop-icon { font-size: 2rem; margin-bottom: 8px; }
.drop-hint { font-size: var(--font-size-xs); color: var(--gray-400); margin-top: 4px; }

.file-preview-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px; background: var(--gray-50);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  margin-bottom: 20px;
}
.file-preview-img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
.file-preview-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: white; border-radius: var(--radius-sm); flex-shrink: 0; }
.file-preview-info { flex: 1; min-width: 0; }
.file-preview-name { font-size: var(--font-size-sm); font-weight: 600; color: var(--blickle-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-preview-meta { font-size: var(--font-size-xs); color: var(--gray-500); margin-top: 2px; }
.file-preview-remove { width: 28px; height: 28px; border-radius: 50%; background: var(--gray-200); color: var(--gray-600); font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.file-preview-remove:hover { background: var(--color-danger-light); color: var(--color-danger); }

/* ===== EMBED STEP ===== */
.embed-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  background: #0d1420;
  color: #E8ECF4;
  border: 1px solid rgba(255,255,255,0.08);
}

.embed-preview-wrap {
  margin-bottom: 16px;
}
.embed-preview-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-500);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.embed-preview {
  background: #0d1420;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  min-height: 200px;
  overflow: hidden;
}
.embed-preview :deep(iframe) {
  width: 100%;
  min-height: 200px;
  border: none;
}

/* ===== FORMS ===== */
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: var(--font-size-sm); font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.form-input {
  width: 100%; padding: 8px 12px;
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.form-input:focus { outline: none; border-color: var(--blickle-navy); box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1); }
</style>
