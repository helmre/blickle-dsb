<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useTemplateStore } from '../../shared/stores/templateStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import { CATEGORY_LABELS, getAllTemplates, getCatalogTemplates } from '../../shared/templates/registry.js'

const router = useRouter()
const contentStore = useContentStore()
const templateStore = useTemplateStore()
const userStore = useUserStore()
const toast = useToastStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedTemplateId = ref('')
const draft = ref(null)
const saved = ref(false)

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Langtext' },
  { value: 'url', label: 'Link/QR' },
  { value: 'image', label: 'Bild' },
  { value: 'date', label: 'Datum' },
]

const DESIGN_PRESETS = [
  { value: 'classic', label: 'Klassisch' },
  { value: 'hero', label: 'Hero' },
  { value: 'compact', label: 'Kompakt' },
]

const allTemplates = computed(() => getAllTemplates())
const publishTemplates = computed(() => getCatalogTemplates())
const customTemplateIds = computed(() => new Set(templateStore.items.map(template => template.id)))
const selectedTemplate = computed(() => allTemplates.value.find(template => template.id === selectedTemplateId.value) || allTemplates.value[0] || null)
const isCustomSelected = computed(() => !!selectedTemplate.value && customTemplateIds.value.has(selectedTemplate.value.id))
const canCreateContent = computed(() => userStore.can(PERMISSIONS.CONTENT_CREATE))
const canManageTemplates = computed(() => userStore.can(PERMISSIONS.CONTENT_CREATE))

const categories = computed(() => {
  const cats = new Set()
  allTemplates.value.forEach(t => cats.add(t.category))
  return ['all', ...[...cats].sort()]
})

const filteredTemplates = computed(() => {
  let list = allTemplates.value
  if (selectedCategory.value !== 'all') list = list.filter(t => t.category === selectedCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      categoryLabel(t.category).toLowerCase().includes(q)
    )
  }
  return list
})

const activeTemplateCount = computed(() => publishTemplates.value.length)
const customTemplateCount = computed(() => templateStore.items.length)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function categoryLabel(cat) {
  if (cat === 'all') return 'Alle'
  return CATEGORY_LABELS[cat] || cat
}

function normalizeParams(template) {
  return clone(template.parameters || template.requiredFields || [])
    .map((field, index) => ({
      key: field.key || field.name || `feld_${index + 1}`,
      label: field.label || field.key || `Feld ${index + 1}`,
      type: field.type || (field.key?.toLowerCase().includes('url') ? 'url' : 'text'),
      defaultValue: field.defaultValue ?? template.defaultParams?.[field.key] ?? '',
      required: field.required === true,
    }))
}

function makeCss({ accent = '#B5CC18', theme = 'dark', density = 'normal', preset = 'classic' } = {}) {
  const padding = density === 'compact' ? '2rem 2.4rem' : density === 'generous' ? '4rem 4.8rem' : '3rem 3.6rem'
  const bg = theme === 'light' ? '#F7FAFC' : '#0B1F3A'
  const text = theme === 'light' ? '#0B1F3A' : '#E8ECF4'
  const body = theme === 'light' ? 'rgba(11,31,58,0.72)' : 'rgba(232,236,244,0.78)'
  const titleSize = preset === 'hero' ? '3.2rem' : preset === 'compact' ? '2rem' : '2.6rem'
  return `.tpl-builder { height:100%; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; gap:1rem; padding:${padding}; background:${bg}; color:${text}; font-family:"DM Sans",sans-serif; border-left:10px solid ${accent}; } .tpl-builder__kicker { color:${accent}; font-size:.78rem; font-weight:800; letter-spacing:.14em; text-transform:uppercase; } .tpl-builder__title { margin:0; color:${text}; font-family:"Outfit",sans-serif; font-size:${titleSize}; line-height:1.05; font-weight:850; } .tpl-builder__body { margin:0; color:${body}; font-size:1.25rem; line-height:1.45; max-width:70ch; } .tpl-builder__meta { margin-top:1rem; color:${accent}; font-size:.95rem; font-weight:800; }`
}

function makeHtml(fields = []) {
  const titleKey = fields.find(field => ['headline', 'titel', 'title', 'jobTitle', 'topic'].includes(field.key))?.key || fields[0]?.key || 'titel'
  const bodyKey = fields.find(field => ['body', 'text', 'hinweis', 'beschreibung', 'description'].includes(field.key))?.key || fields[1]?.key || titleKey
  const kickerKey = fields.find(field => field.key === 'kicker')?.key
  const metaKey = fields.find(field => ['datum', 'validUntil', 'source', 'authorLabel'].includes(field.key))?.key
  return `<div class="tpl-builder">${kickerKey ? `<div class="tpl-builder__kicker">{{${kickerKey}}}</div>` : ''}<h1 class="tpl-builder__title">{{${titleKey}}}</h1><p class="tpl-builder__body">{{${bodyKey}}}</p>${metaKey ? `<div class="tpl-builder__meta">{{${metaKey}}}</div>` : ''}</div>`
}

function createDraft(template) {
  if (!template) return null
  const params = normalizeParams(template)
  return {
    id: template.id,
    name: template.name || 'Neue Vorlage',
    description: template.description || '',
    category: template.category || 'kommunikation',
    isActive: template.catalogHidden !== true,
    design: {
      preset: template.design?.preset || 'classic',
      accent: template.thumbnailAccent || template.design?.accent || '#B5CC18',
      theme: template.defaultParams?.theme || template.design?.theme || 'dark',
      density: template.design?.density || 'normal',
    },
    parameters: params,
    htmlTemplate: template.htmlTemplate || makeHtml(params),
    cssTemplate: template.cssTemplate || makeCss({ accent: template.thumbnailAccent }),
    thumbnailAccent: template.thumbnailAccent || '#B5CC18',
    thumbnailBg: template.thumbnailBg || 'linear-gradient(135deg, #163A6C 0%, #0B1F3A 100%)',
  }
}

watch(selectedTemplate, template => {
  draft.value = createDraft(template)
}, { immediate: true })

watch(allTemplates, templates => {
  if (!selectedTemplateId.value && templates[0]) selectedTemplateId.value = templates[0].id
}, { immediate: true })

function selectTemplate(id) {
  selectedTemplateId.value = id
}

function createFromTemplate(tpl = selectedTemplate.value) {
  if (!canCreateContent.value) {
    toast.error('Keine Berechtigung zum Erstellen von Inhalten')
    return
  }
  const content = contentStore.createFromTemplate(tpl.id)
  if (!content) { toast.error('Vorlage konnte nicht geladen werden'); return }
  toast.success(`Neuer Entwurf: ${tpl.name}`)
  router.push({ name: 'admin-content-detail', params: { id: content.id } })
}

function duplicateTemplate(template = selectedTemplate.value) {
  if (!canManageTemplates.value || !template) return
  const params = normalizeParams(template)
  const copy = templateStore.add({
    name: `${template.name} Kopie`,
    description: template.description || '',
    category: template.category || 'kommunikation',
    isActive: false,
    catalogHidden: true,
    thumbnailAccent: template.thumbnailAccent || '#B5CC18',
    thumbnailBg: template.thumbnailBg || 'linear-gradient(135deg, #163A6C 0%, #0B1F3A 100%)',
    design: {
      preset: 'classic',
      accent: template.thumbnailAccent || '#B5CC18',
      theme: template.defaultParams?.theme || 'dark',
      density: 'normal',
    },
    htmlTemplate: template.htmlTemplate || makeHtml(params),
    cssTemplate: template.cssTemplate || makeCss({ accent: template.thumbnailAccent }),
    parameters: params,
  })
  selectedTemplateId.value = copy.id
  toast.success('Vorlage dupliziert')
}

function createBlankTemplate() {
  const fields = [
    { key: 'kicker', label: 'Kicker', type: 'text', defaultValue: 'BLICKLE', required: false },
    { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Neue Vorlage', required: true },
    { key: 'text', label: 'Text', type: 'textarea', defaultValue: 'Kurzer Text fuer die Anzeige.', required: true },
  ]
  const item = templateStore.add({
    name: 'Neue Vorlage',
    description: 'Eigene Vorlage aus dem Baukasten.',
    category: 'kommunikation',
    isActive: false,
    catalogHidden: true,
    thumbnailAccent: '#B5CC18',
    thumbnailBg: 'linear-gradient(135deg, #163A6C 0%, #0B1F3A 100%)',
    design: { preset: 'classic', accent: '#B5CC18', theme: 'dark', density: 'normal' },
    htmlTemplate: makeHtml(fields),
    cssTemplate: makeCss({ accent: '#B5CC18' }),
    parameters: fields,
  })
  selectedTemplateId.value = item.id
  toast.success('Neue Vorlage angelegt')
}

function syncDesignToTemplate() {
  if (!draft.value) return
  draft.value.thumbnailAccent = draft.value.design.accent
  draft.value.thumbnailBg = draft.value.design.theme === 'light'
    ? 'linear-gradient(135deg, #F7FAFC 0%, #DDE7F0 100%)'
    : 'linear-gradient(135deg, #163A6C 0%, #0B1F3A 100%)'
  draft.value.cssTemplate = makeCss(draft.value.design)
}

function addField() {
  if (!draft.value) return
  const index = draft.value.parameters.length + 1
  draft.value.parameters.push({
    key: `feld_${index}`,
    label: `Feld ${index}`,
    type: 'text',
    defaultValue: '',
    required: false,
  })
  draft.value.htmlTemplate = makeHtml(draft.value.parameters)
}

function removeField(index) {
  if (!draft.value) return
  draft.value.parameters.splice(index, 1)
  draft.value.htmlTemplate = makeHtml(draft.value.parameters)
}

function saveTemplate() {
  if (!canManageTemplates.value || !draft.value || !isCustomSelected.value) {
    toast.info('Systemvorlagen bitte zuerst duplizieren')
    return
  }
  syncDesignToTemplate()
  templateStore.update(draft.value.id, {
    name: draft.value.name,
    description: draft.value.description,
    category: draft.value.category,
    isActive: draft.value.isActive,
    catalogHidden: draft.value.isActive === false,
    thumbnailAccent: draft.value.thumbnailAccent,
    thumbnailBg: draft.value.thumbnailBg,
    design: clone(draft.value.design),
    parameters: clone(draft.value.parameters),
    htmlTemplate: draft.value.htmlTemplate,
    cssTemplate: draft.value.cssTemplate,
  })
  saved.value = true
  toast.success('Vorlage gespeichert')
  setTimeout(() => { saved.value = false }, 1600)
}

function previewValue(field) {
  return field.defaultValue || field.label || field.key
}
</script>

<template>
  <div class="builder-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Vorlagen-Baukasten</h1>
        <p class="page-sub">Vorlagen verwenden Redakteure beim Veröffentlichen. Hier werden sie gepflegt, dupliziert und als sicherer Baukasten vorbereitet.</p>
      </div>
      <div class="header-actions">
        <button v-if="canManageTemplates" class="btn-secondary" type="button" @click="createBlankTemplate">Neue Vorlage</button>
        <router-link v-if="canCreateContent" :to="{ name: 'admin-publish' }" class="wizard-link">Veröffentlichen</router-link>
      </div>
    </header>

    <section class="summary-strip">
      <article><span>Aktiv im Assistenten</span><strong>{{ activeTemplateCount }}</strong></article>
      <article><span>Eigene Vorlagen</span><strong>{{ customTemplateCount }}</strong></article>
      <article><span>Kategorien</span><strong>{{ categories.length - 1 }}</strong></article>
    </section>

    <div class="builder-layout">
      <aside class="library-panel">
        <div class="catalog-filters">
          <input v-model="searchQuery" type="search" class="search-input" placeholder="Vorlage suchen..." />
          <div class="category-chips">
            <button
              v-for="cat in categories"
              :key="cat"
              :class="['chip', { active: selectedCategory === cat }]"
              type="button"
              @click="selectedCategory = cat"
            >{{ categoryLabel(cat) }}</button>
          </div>
        </div>

        <div class="template-list" v-if="filteredTemplates.length">
          <button
            v-for="tpl in filteredTemplates"
            :key="tpl.id"
            :class="['template-row', { active: selectedTemplateId === tpl.id, inactive: tpl.catalogHidden }]"
            type="button"
            @click="selectTemplate(tpl.id)"
          >
            <span class="row-swatch" :style="{ background: tpl.thumbnailAccent || '#B5CC18' }"></span>
            <span class="row-main">
              <strong>{{ tpl.name }}</strong>
              <small>{{ categoryLabel(tpl.category) }} · {{ customTemplateIds.has(tpl.id) ? 'Eigene Vorlage' : 'Systemvorlage' }}</small>
            </span>
            <span v-if="tpl.catalogHidden" class="row-badge">Inaktiv</span>
          </button>
        </div>
        <p v-else class="empty-text">Keine Vorlagen gefunden.</p>
      </aside>

      <main v-if="draft && selectedTemplate" class="workbench">
        <section class="preview-panel">
          <div
            class="template-preview"
            :class="[`theme-${draft.design.theme}`, `preset-${draft.design.preset}`]"
            :style="{ '--accent': draft.design.accent }"
          >
            <span v-if="draft.parameters.find(field => field.key === 'kicker')" class="preview-kicker">
              {{ previewValue(draft.parameters.find(field => field.key === 'kicker')) }}
            </span>
            <h2>{{ previewValue(draft.parameters.find(field => ['headline', 'titel', 'title', 'jobTitle', 'topic'].includes(field.key)) || draft.parameters[0]) }}</h2>
            <p>{{ previewValue(draft.parameters.find(field => ['body', 'text', 'hinweis', 'beschreibung', 'description'].includes(field.key)) || draft.parameters[1] || draft.parameters[0]) }}</p>
            <strong>{{ categoryLabel(draft.category) }}</strong>
          </div>
          <div class="preview-actions">
            <button class="btn-primary" type="button" @click="createFromTemplate(selectedTemplate)">Mit Vorlage veröffentlichen</button>
            <button class="btn-secondary" type="button" @click="duplicateTemplate(selectedTemplate)">Duplizieren</button>
          </div>
        </section>

        <section class="editor-panel">
          <div class="panel-heading">
            <div>
              <h3>{{ isCustomSelected ? 'Vorlage bearbeiten' : 'Systemvorlage' }}</h3>
              <p>{{ isCustomSelected ? 'Eigene Vorlage mit Feldern und Design-Presets.' : 'Zum Anpassen zuerst duplizieren. Systemvorlagen bleiben stabil.' }}</p>
            </div>
            <button v-if="isCustomSelected" class="btn-primary" type="button" @click="saveTemplate">{{ saved ? 'Gespeichert' : 'Speichern' }}</button>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Name</span>
              <input v-model="draft.name" class="form-input" type="text" :disabled="!isCustomSelected" />
            </label>
            <label class="field">
              <span>Kategorie</span>
              <select v-model="draft.category" class="form-input" :disabled="!isCustomSelected">
                <option v-for="cat in categories.filter(cat => cat !== 'all')" :key="cat" :value="cat">{{ categoryLabel(cat) }}</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span>Beschreibung</span>
            <textarea v-model="draft.description" class="form-input" rows="2" :disabled="!isCustomSelected"></textarea>
          </label>

          <div class="builder-section">
            <div class="section-title">
              <strong>Design-Presets</strong>
              <small>Bewusst begrenzt, damit Display-Vorlagen lesbar bleiben.</small>
            </div>
            <div class="design-grid">
              <label class="field">
                <span>Layout</span>
                <select v-model="draft.design.preset" class="form-input" :disabled="!isCustomSelected" @change="syncDesignToTemplate">
                  <option v-for="preset in DESIGN_PRESETS" :key="preset.value" :value="preset.value">{{ preset.label }}</option>
                </select>
              </label>
              <label class="field">
                <span>Theme</span>
                <select v-model="draft.design.theme" class="form-input" :disabled="!isCustomSelected" @change="syncDesignToTemplate">
                  <option value="dark">Dunkel</option>
                  <option value="light">Hell</option>
                </select>
              </label>
              <label class="field">
                <span>Dichte</span>
                <select v-model="draft.design.density" class="form-input" :disabled="!isCustomSelected" @change="syncDesignToTemplate">
                  <option value="compact">Kompakt</option>
                  <option value="normal">Normal</option>
                  <option value="generous">Großzügig</option>
                </select>
              </label>
              <label class="field">
                <span>Akzent</span>
                <input v-model="draft.design.accent" class="form-input color-input" type="color" :disabled="!isCustomSelected" @input="syncDesignToTemplate" />
              </label>
            </div>
          </div>

          <div class="builder-section">
            <div class="section-title">
              <strong>Felder</strong>
              <button v-if="isCustomSelected" class="btn-secondary btn-small" type="button" @click="addField">Feld hinzufügen</button>
            </div>
            <div class="field-list">
              <article v-for="(field, index) in draft.parameters" :key="`${field.key}-${index}`" class="field-row">
                <input v-model="field.label" class="form-input" type="text" placeholder="Label" :disabled="!isCustomSelected" />
                <input v-model="field.key" class="form-input" type="text" placeholder="key" :disabled="!isCustomSelected" @change="draft.htmlTemplate = makeHtml(draft.parameters)" />
                <select v-model="field.type" class="form-input" :disabled="!isCustomSelected">
                  <option v-for="type in FIELD_TYPES" :key="type.value" :value="type.value">{{ type.label }}</option>
                </select>
                <label class="check-label">
                  <input v-model="field.required" type="checkbox" :disabled="!isCustomSelected" />
                  Pflicht
                </label>
                <button v-if="isCustomSelected" class="btn-icon danger" type="button" title="Feld entfernen" @click="removeField(index)">&times;</button>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.builder-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 22px 0 34px;
}

.page-header,
.header-actions,
.builder-layout,
.panel-heading,
.preview-actions,
.section-title {
  display: flex;
  gap: 16px;
}

.page-header,
.panel-heading,
.section-title {
  justify-content: space-between;
  align-items: flex-start;
}

.page-header {
  margin-bottom: 18px;
}

.header-actions,
.preview-actions {
  align-items: center;
  flex-wrap: wrap;
}

.page-title {
  margin: 0 0 6px;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 800;
}

.page-sub,
.panel-heading p,
.section-title small {
  margin: 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.summary-strip article {
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  background: var(--blickle-white);
  box-shadow: var(--shadow-sm);
  padding: 14px 16px;
}

.summary-strip span {
  display: block;
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.summary-strip strong {
  display: block;
  margin-top: 4px;
  color: var(--blickle-navy);
  font-size: 1.35rem;
}

.builder-layout {
  align-items: flex-start;
}

.library-panel {
  width: 360px;
  flex: 0 0 360px;
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  background: var(--blickle-white);
  box-shadow: var(--shadow-sm);
  padding: 14px;
  position: sticky;
  top: 18px;
}

.workbench {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(0, 1.1fr);
  gap: 16px;
}

.catalog-filters,
.template-list,
.editor-panel,
.field-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-input,
.form-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--blickle-white);
  color: var(--color-text);
  font: inherit;
  padding: 9px 11px;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip,
.btn-primary,
.btn-secondary,
.btn-icon,
.template-row {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.chip {
  padding: 6px 11px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--gray-50);
  color: var(--gray-600);
  font-size: 0.75rem;
  font-weight: 700;
}

.chip.active {
  background: var(--blickle-navy);
  border-color: var(--blickle-navy);
  color: var(--blickle-white);
}

.template-row {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 11px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--gray-50);
  text-align: left;
}

.template-row.active {
  border-color: var(--blickle-green);
  box-shadow: 0 0 0 2px rgba(181, 204, 24, 0.18);
}

.template-row.inactive {
  opacity: 0.72;
}

.row-swatch {
  width: 10px;
  height: 38px;
  border-radius: 999px;
}

.row-main {
  min-width: 0;
}

.row-main strong,
.row-main small {
  display: block;
}

.row-main strong {
  color: var(--blickle-navy);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main small,
.row-badge {
  color: var(--gray-500);
  font-size: var(--font-size-xs);
}

.row-badge {
  border-radius: 999px;
  background: var(--gray-100);
  padding: 3px 7px;
  font-weight: 800;
}

.preview-panel,
.editor-panel {
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  background: var(--blickle-white);
  box-shadow: var(--shadow-sm);
  padding: 16px;
}

.template-preview {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  border-radius: 8px;
  border-left: 10px solid var(--accent);
  padding: 42px;
  background: #0B1F3A;
  color: #E8ECF4;
  overflow: hidden;
}

.template-preview.theme-light {
  background: #F7FAFC;
  color: var(--blickle-navy);
}

.template-preview.preset-compact {
  padding: 30px;
}

.template-preview.preset-hero {
  padding: 52px;
}

.preview-kicker {
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.template-preview h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.35rem;
  line-height: 1.05;
  color: inherit;
}

.template-preview.preset-hero h2 {
  font-size: 3rem;
}

.template-preview.preset-compact h2 {
  font-size: 1.9rem;
}

.template-preview p {
  max-width: 68ch;
  margin: 0;
  color: currentColor;
  opacity: 0.78;
  line-height: 1.45;
}

.template-preview strong {
  margin-top: 8px;
  color: var(--accent);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.preview-actions {
  margin-top: 12px;
}

.panel-heading h3 {
  margin: 0 0 4px;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.form-grid,
.design-grid,
.field-row {
  display: grid;
  gap: 10px;
}

.form-grid {
  grid-template-columns: minmax(0, 1fr) 210px;
}

.design-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field span {
  color: var(--gray-600);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.color-input {
  min-height: 40px;
  padding: 3px;
}

.builder-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.section-title {
  margin-bottom: 10px;
  align-items: center;
}

.section-title strong {
  color: var(--blickle-navy);
}

.field-row {
  grid-template-columns: minmax(120px, 1fr) minmax(110px, 0.8fr) 120px 86px 34px;
  align-items: center;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--gray-600);
  font-size: var(--font-size-xs);
  font-weight: 800;
}

.btn-primary,
.btn-secondary,
.wizard-link {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  padding: 0 14px;
  text-decoration: none;
  font-weight: 800;
}

.btn-primary {
  background: var(--blickle-navy);
  color: var(--blickle-white);
}

.btn-secondary,
.wizard-link {
  background: var(--gray-100);
  color: var(--blickle-navy);
}

.wizard-link {
  background: var(--blickle-green);
}

.btn-small {
  min-height: 30px;
  font-size: var(--font-size-xs);
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: var(--gray-100);
  color: var(--blickle-navy);
  font-size: 1.1rem;
}

.btn-icon.danger {
  color: var(--color-danger);
}

button:disabled,
input:disabled,
select:disabled,
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.empty-text {
  color: var(--gray-500);
  text-align: center;
}

@media (max-width: 1180px) {
  .builder-layout,
  .workbench {
    display: block;
  }

  .library-panel {
    position: static;
    width: auto;
    margin-bottom: 16px;
  }

  .editor-panel {
    margin-top: 16px;
  }
}

@media (max-width: 760px) {
  .page-header,
  .panel-heading,
  .section-title,
  .preview-actions {
    flex-direction: column;
  }

  .summary-strip,
  .form-grid,
  .design-grid,
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
