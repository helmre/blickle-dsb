<script setup>
import { ref, computed } from 'vue'
import { useTemplateStore } from '../../shared/stores/templateStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const templateStore = useTemplateStore()
const contentStore = useContentStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const selectedTemplate = ref(null)
const previewParams = ref({})

function selectTemplate(tmpl) {
  selectedTemplate.value = tmpl
  previewParams.value = {}
  if (tmpl.parameters) {
    for (const param of tmpl.parameters) {
      const k = param.key || param.name
      previewParams.value[k] = param.defaultValue || param.default || ''
    }
  }
}

function closePreview() {
  selectedTemplate.value = null
  previewParams.value = {}
}

function getParamCount(tmpl) {
  return tmpl.parameters ? tmpl.parameters.length : 0
}

const categoryColors = {
  info: { bg: '#DBEAFE', color: '#1E40AF' },
  alert: { bg: '#FEF3C7', color: '#92400E' },
  general: { bg: '#E0E7FF', color: '#3730A3' },
  safety: { bg: '#FEE2E2', color: '#991B1B' },
  production: { bg: '#D1FAE5', color: '#065F46' }
}

function getCategoryStyle(category) {
  return categoryColors[category] || categoryColors.general
}

function createContentFromTemplate() {
  if (!selectedTemplate.value) return
  const tmpl = selectedTemplate.value
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
    templateParams: { ...previewParams.value },
    metadata: {}
  })
  auditStore.log('content.created_from_template', 'content', item.id, userStore.currentUser.id, {
    templateId: tmpl.id,
    templateName: tmpl.name
  })
  closePreview()
}

function renderPreview(tmpl, params) {
  let html = tmpl.htmlTemplate || tmpl.html || '<p>Keine Vorschau verfuegbar</p>'
  for (const [key, val] of Object.entries(params)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `[${key}]`)
  }
  return html
}
</script>

<template>
  <div class="template-page">
    <div class="page-toolbar">
      <h2 class="page-title">Templates</h2>
    </div>

    <div class="template-grid">
      <div v-for="tmpl in templateStore.items" :key="tmpl.id" class="template-card" @click="selectTemplate(tmpl)">
        <div class="card-top">
          <h4 class="card-title">{{ tmpl.name }}</h4>
          <span
            class="category-badge"
            :style="{ background: getCategoryStyle(tmpl.category).bg, color: getCategoryStyle(tmpl.category).color }"
          >
            {{ tmpl.category || 'Allgemein' }}
          </span>
        </div>
        <p class="card-desc">{{ tmpl.description || 'Keine Beschreibung' }}</p>
        <div class="card-footer">
          <span class="param-count">{{ getParamCount(tmpl) }} Parameter</span>
        </div>
      </div>
      <p v-if="!templateStore.items.length" class="empty-text">Keine Templates vorhanden.</p>
    </div>

    <!-- Template Preview Modal -->
    <div v-if="selectedTemplate" class="modal-overlay" @click.self="closePreview">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3>{{ selectedTemplate.name }}</h3>
          <button class="modal-close" @click="closePreview">&times;</button>
        </div>
        <div class="modal-body">
          <div class="preview-layout">
            <!-- Parameters -->
            <div class="params-panel">
              <h4 class="params-title">Parameter</h4>
              <div v-if="selectedTemplate.parameters && selectedTemplate.parameters.length">
                <div v-for="param in selectedTemplate.parameters" :key="param.key || param.name" class="form-group">
                  <label>{{ param.label || param.key || param.name }}</label>
                  <input
                    v-if="param.type !== 'textarea' && param.type !== 'code' && param.type !== 'select'"
                    v-model="previewParams[param.key || param.name]"
                    :type="param.type === 'date' ? 'date' : 'text'"
                    class="form-input"
                    :placeholder="param.placeholder || param.defaultValue || ''"
                  />
                  <select
                    v-else-if="param.type === 'select'"
                    v-model="previewParams[param.key || param.name]"
                    class="form-input"
                  >
                    <option v-for="opt in param.options" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <textarea
                    v-else
                    v-model="previewParams[param.key || param.name]"
                    class="form-input"
                    :rows="param.type === 'code' ? 5 : 3"
                    :placeholder="param.placeholder || param.defaultValue || ''"
                    :style="param.type === 'code' ? { fontFamily: 'monospace', fontSize: '0.8rem' } : {}"
                  ></textarea>
                </div>
              </div>
              <p v-else class="empty-text-small">Keine Parameter definiert.</p>
            </div>
            <!-- Preview -->
            <div class="preview-panel">
              <h4 class="preview-title">Vorschau</h4>
              <div class="preview-frame" v-html="renderPreview(selectedTemplate, previewParams)"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closePreview">Schliessen</button>
          <button class="btn-primary" @click="createContentFromTemplate">Inhalt aus Template erstellen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-page { max-width: 1200px; }

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

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.template-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.template-card:hover { border-color: var(--blickle-navy); }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.card-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
}
.category-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}
.card-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.card-footer {
  margin-top: auto;
}
.param-count {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.preview-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  min-height: 300px;
}
.params-panel {
  border-right: 1px solid var(--color-border);
  padding-right: 20px;
}
.params-title, .preview-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 12px;
}
.preview-panel { overflow: auto; }
.preview-frame {
  background: #0d1420;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  min-height: 280px;
  font-size: var(--font-size-sm);
  color: #E8ECF4;
  overflow: hidden;
}

.empty-text-small {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  padding: 12px;
}

.btn-primary {
  padding: 8px 20px;
  background: var(--blickle-navy);
  color: var(--blickle-white);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
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

.form-group { margin-bottom: 12px; }
.form-group label {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.form-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.form-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1);
}

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px;
  font-size: var(--font-size-sm);
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
  width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.modal-wide { width: 800px; }
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
.modal-close { font-size: 1.5rem; color: var(--gray-400); padding: 4px; }
.modal-body { padding: 24px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
