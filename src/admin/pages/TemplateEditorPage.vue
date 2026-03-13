<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplateStore } from '../../shared/stores/templateStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'

const route = useRoute()
const router = useRouter()
const templateStore = useTemplateStore()
const toastStore = useToastStore()

const isNew = computed(() => route.params.id === 'new')
const template = computed(() => isNew.value ? null : templateStore.getById(route.params.id))

const form = ref({
  name: '',
  category: 'info',
  description: '',
  html: '<div class="tpl-content">\n  <h2>{{title}}</h2>\n  <p>{{description}}</p>\n</div>',
  css: '.tpl-content {\n  padding: 2rem;\n  text-align: center;\n}\n\n.tpl-content h2 {\n  font-size: 1.4rem;\n  margin-bottom: 0.5rem;\n}',
  parameters: []
})

// Load existing template
if (template.value) {
  form.value = {
    name: template.value.name || '',
    category: template.value.category || 'info',
    description: template.value.description || '',
    html: template.value.html || '',
    css: template.value.css || '',
    parameters: template.value.parameters ? [...template.value.parameters] : []
  }
}

const categories = [
  { value: 'info', label: 'Information' },
  { value: 'alert', label: 'Warnung/Hinweis' },
  { value: 'general', label: 'Allgemein' },
  { value: 'safety', label: 'Sicherheit' },
  { value: 'production', label: 'Produktion' },
  { value: 'event', label: 'Event/Veranstaltung' },
]

const paramTypes = ['text', 'textarea', 'date', 'select']

// Live preview: replace {{param}} with defaults or param name
const previewHtml = computed(() => {
  let html = form.value.html || ''
  form.value.parameters.forEach(p => {
    const val = p.defaultValue || `[${p.key}]`
    html = html.replace(new RegExp(`\\{\\{${p.key}\\}\\}`, 'g'), val)
  })
  // Replace any remaining {{...}} with placeholder
  html = html.replace(/\{\{(\w+)\}\}/g, '[$1]')
  return html
})

function addParameter() {
  form.value.parameters.push({
    key: `param${form.value.parameters.length + 1}`,
    label: '',
    type: 'text',
    defaultValue: ''
  })
}

function removeParameter(index) {
  form.value.parameters.splice(index, 1)
}

function save() {
  const data = {
    name: form.value.name,
    category: form.value.category,
    description: form.value.description,
    html: form.value.html,
    css: form.value.css,
    parameters: form.value.parameters,
  }
  if (isNew.value) {
    templateStore.add(data)
    toastStore.success('Template erfolgreich erstellt')
  } else {
    templateStore.update(route.params.id, data)
    toastStore.success('Template erfolgreich gespeichert')
  }
  router.push('/admin/templates')
}
</script>

<template>
  <div class="tpl-editor-page">
    <div class="tpl-editor-header">
      <button class="btn-back" @click="router.push('/admin/templates')">&larr; Zurueck zu Templates</button>
      <h2>{{ isNew ? 'Neues Template' : 'Template bearbeiten' }}</h2>
      <button class="btn-save" @click="save">&#128190; Speichern</button>
    </div>

    <div class="tpl-editor-body">
      <!-- Left: Editor -->
      <div class="tpl-editor-left">
        <!-- Meta -->
        <div class="editor-card">
          <h4 class="card-title">META</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input v-model="form.name" class="form-input" placeholder="z.B. Sicherheitshinweis" />
            </div>
            <div class="form-group">
              <label>Kategorie</label>
              <select v-model="form.category" class="form-input">
                <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Beschreibung</label>
            <input v-model="form.description" class="form-input" placeholder="Kurzbeschreibung..." />
          </div>
        </div>

        <!-- HTML -->
        <div class="editor-card">
          <h4 class="card-title">HTML</h4>
          <textarea
            v-model="form.html"
            class="code-editor"
            rows="10"
            spellcheck="false"
            placeholder="<div>{{title}}</div>"
          ></textarea>
        </div>

        <!-- CSS -->
        <div class="editor-card">
          <h4 class="card-title">CSS</h4>
          <textarea
            v-model="form.css"
            class="code-editor"
            rows="8"
            spellcheck="false"
            placeholder=".tpl-content { padding: 1rem; }"
          ></textarea>
        </div>

        <!-- Parameters -->
        <div class="editor-card">
          <h4 class="card-title">PARAMETER</h4>
          <p class="hint">Verwende <code v-pre>{{key}}</code> im HTML um Parameter einzusetzen.</p>
          <div v-for="(param, i) in form.parameters" :key="i" class="param-row">
            <input v-model="param.key" class="form-input param-key" placeholder="key" />
            <input v-model="param.label" class="form-input param-label" placeholder="Label" />
            <select v-model="param.type" class="form-input param-type">
              <option v-for="t in paramTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <input v-model="param.defaultValue" class="form-input param-default" placeholder="Default" />
            <button class="btn-remove-param" @click="removeParameter(i)">&times;</button>
          </div>
          <button class="btn-add-param" @click="addParameter">+ Parameter hinzufuegen</button>
        </div>
      </div>

      <!-- Right: Live Preview -->
      <div class="tpl-editor-right">
        <div class="editor-card preview-card">
          <h4 class="card-title">LIVE-VORSCHAU</h4>
          <div class="preview-frame">
            <component :is="'style'" v-if="form.css">{{ form.css }}</component>
            <div v-html="previewHtml" class="preview-content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tpl-editor-page {
  max-width: 100%;
}

.tpl-editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.tpl-editor-header h2 {
  flex: 1;
  font-size: 1.2rem;
  color: var(--blickle-navy);
  margin: 0;
}

.btn-back {
  background: none;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--gray-600);
  transition: all 0.15s ease;
}

.btn-back:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.btn-save {
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.tpl-editor-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.editor-card {
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 14px;
}

.card-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--blickle-navy);
  margin: 0 0 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--gray-500);
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(181, 204, 24, 0.15);
}

.code-editor {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  background: #fafbfc;
  color: var(--gray-800);
  resize: vertical;
  box-sizing: border-box;
  tab-size: 2;
}

.code-editor:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(181, 204, 24, 0.15);
}

.hint {
  font-size: 0.75rem;
  color: var(--gray-400);
  margin-bottom: 10px;
}

.hint code {
  background: var(--gray-100);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.72rem;
}

.param-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.param-key { flex: 0.8; }
.param-label { flex: 1.2; }
.param-type { flex: 0.6; }
.param-default { flex: 1; }

.btn-remove-param {
  background: none;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  color: var(--gray-400);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-param:hover {
  background: #fce4ec;
  color: #c62828;
  border-color: #ef9a9a;
}

.btn-add-param {
  background: none;
  border: 1px dashed var(--gray-300);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--gray-500);
  width: 100%;
  transition: all 0.15s ease;
}

.btn-add-param:hover {
  background: var(--gray-50);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Preview */
.tpl-editor-right {
  position: sticky;
  top: 20px;
}

.preview-card {
  min-height: 400px;
}

.preview-frame {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 20px;
  min-height: 350px;
  overflow: hidden;
  color: #e8ecf4;
  font-family: 'DM Sans', sans-serif;
}

.preview-content {
  width: 100%;
  height: 100%;
}
</style>
