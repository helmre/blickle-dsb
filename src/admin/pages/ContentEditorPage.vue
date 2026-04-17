<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { getTemplateById } from '../../shared/templates/registry.js'
import { editorRegistry } from '../../shared/templates/editorRegistry.js'

const route = useRoute()
const router = useRouter()
const contentStore = useContentStore()
const locationStore = useLocationStore()
const userStore = useUserStore()
const toast = useToastStore()
const auditStore = useAuditStore()

const content = computed(() => contentStore.getById(route.params.id))
const template = computed(() => content.value?.templateId ? getTemplateById(content.value.templateId) : null)
const editorComponent = computed(() => {
  if (!template.value || template.value.renderer !== 'component') return null
  return editorRegistry[template.value.editorComponent] || null
})

// Local mirror of templateParams so v-model updates feel instant; debounced persist.
const localParams = ref({})
watch(content, (c) => { if (c) localParams.value = { ...(c.templateParams || {}) } }, { immediate: true })

let persistTimer = null
function onUpdateParams(next) {
  localParams.value = next
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    if (!content.value) return
    contentStore.update(content.value.id, { templateParams: { ...next } })
  }, 400)
}

function updateField(key, value) {
  if (!content.value) return
  contentStore.update(content.value.id, { [key]: value })
}

function updateTags(str) {
  const tags = (str || '').split(',').map(s => s.trim()).filter(Boolean)
  updateField('tags', tags)
}

function toggleLocation(id) {
  if (!content.value) return
  const current = new Set(content.value.locationIds || [])
  if (current.has(id)) current.delete(id); else current.add(id)
  updateField('locationIds', [...current])
}

function saveDraft() {
  if (!content.value) return
  contentStore.update(content.value.id, { status: 'draft' })
  auditStore.log('content.save_draft', 'content', content.value.id, userStore.currentUser?.id, { title: content.value.title })
  toast.success('Als Entwurf gespeichert')
}

function submitForReview() {
  if (!content.value) return
  contentStore.update(content.value.id, { status: 'in_review' })
  auditStore.log('content.submit', 'content', content.value.id, userStore.currentUser?.id, { title: content.value.title })
  toast.success('Zur Pruefung eingereicht')
  router.push({ name: 'admin-content' })
}

function remove() {
  if (!content.value) return
  if (!confirm('Diesen Inhalt wirklich loeschen?')) return
  const id = content.value.id
  const title = content.value.title
  contentStore.remove(id)
  auditStore.log('content.delete', 'content', id, userStore.currentUser?.id, { title })
  toast.success('Inhalt geloescht')
  router.push({ name: 'admin-templates' })
}

const statusLabels = { draft: 'Entwurf', in_review: 'Zur Pruefung', approved: 'Freigegeben', rejected: 'Abgelehnt' }

// For html-params templates, render preview by substituting params into htmlTemplate
const htmlPreview = computed(() => {
  if (!template.value || template.value.renderer !== 'html-params') return ''
  let html = template.value.htmlTemplate || ''
  const params = localParams.value || {}
  ;(template.value.parameters || []).forEach(p => {
    const key = p.key || p.name
    const val = params[key] ?? p.defaultValue ?? p.default ?? `[${p.label || key}]`
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
  })
  Object.keys(params).forEach(key => {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), params[key] || `[${key}]`)
  })
  return html
})

function setParam(key, value) {
  onUpdateParams({ ...localParams.value, [key]: value })
}
</script>

<template>
  <div class="editor-page" v-if="content">
    <header class="editor-toolbar">
      <div class="tb-left">
        <button class="btn-back" @click="router.push({ name: 'admin-templates' })">&larr; Katalog</button>
        <div class="tb-divider"></div>
        <div class="tb-meta">
          <h1 class="tb-title">{{ content.title || template?.name || 'Neuer Inhalt' }}</h1>
          <div class="tb-sub">
            <span :class="['status-pill', `status-${content.status}`]">{{ statusLabels[content.status] || content.status }}</span>
            <span v-if="template" class="tpl-pill">{{ template.name }}</span>
          </div>
        </div>
      </div>
      <div class="tb-right">
        <button class="btn-ghost btn-danger" @click="remove">Loeschen</button>
        <button class="btn-ghost" @click="saveDraft">Entwurf speichern</button>
        <button class="btn-primary" @click="submitForReview" :disabled="content.status === 'in_review'">Zur Pruefung einreichen</button>
      </div>
    </header>

    <div class="editor-layout">
      <aside class="meta-panel">
        <section class="meta-sec">
          <h3 class="meta-title">Metadaten</h3>
          <label class="fld">
            <span class="fld-label">Titel</span>
            <input :value="content.title" @input="e => updateField('title', e.target.value)" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Beschreibung</span>
            <textarea :value="content.description" @input="e => updateField('description', e.target.value)" class="fld-input" rows="2"></textarea>
          </label>
          <label class="fld">
            <span class="fld-label">Tags (Komma-getrennt)</span>
            <input :value="(content.tags || []).join(', ')" @input="e => updateTags(e.target.value)" type="text" class="fld-input" />
          </label>
        </section>

        <section class="meta-sec">
          <h3 class="meta-title">Gueltigkeit</h3>
          <div class="fld-row">
            <label class="fld"><span class="fld-label">Ab</span>
              <input :value="content.validFrom" @input="e => updateField('validFrom', e.target.value || null)" type="date" class="fld-input" /></label>
            <label class="fld"><span class="fld-label">Bis</span>
              <input :value="content.validUntil" @input="e => updateField('validUntil', e.target.value || null)" type="date" class="fld-input" /></label>
          </div>
        </section>

        <section class="meta-sec">
          <h3 class="meta-title">Standorte</h3>
          <div class="loc-list">
            <label v-for="loc in locationStore.items" :key="loc.id" class="loc-item">
              <input type="checkbox" :checked="(content.locationIds || []).includes(loc.id)" @change="toggleLocation(loc.id)" />
              <span>{{ loc.name }}</span>
            </label>
          </div>
        </section>

        <section v-if="template && template.renderer === 'html-params' && template.parameters?.length" class="meta-sec">
          <h3 class="meta-title">Parameter</h3>
          <label v-for="p in template.parameters" :key="p.key || p.name" class="fld">
            <span class="fld-label">{{ p.label || p.key || p.name }}</span>
            <textarea v-if="p.type === 'textarea' || p.type === 'code'"
              :value="localParams[p.key || p.name]"
              @input="e => setParam(p.key || p.name, e.target.value)"
              class="fld-input" rows="3"></textarea>
            <select v-else-if="p.type === 'select'"
              :value="localParams[p.key || p.name]"
              @change="e => setParam(p.key || p.name, e.target.value)"
              class="fld-input">
              <option v-for="opt in (p.options || [])" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <input v-else
              :value="localParams[p.key || p.name]"
              @input="e => setParam(p.key || p.name, e.target.value)"
              :type="p.type === 'date' ? 'date' : 'text'"
              class="fld-input" />
          </label>
        </section>
      </aside>

      <main class="editor-main">
        <!-- Component-based designer -->
        <component
          v-if="editorComponent"
          :is="editorComponent"
          :params="localParams"
          @update:params="onUpdateParams"
        />

        <!-- Legacy html-params preview -->
        <div v-else-if="template && template.renderer === 'html-params'" class="legacy-preview-wrap">
          <div class="legacy-header"><span>Live-Vorschau · {{ template.name }}</span></div>
          <div class="legacy-frame">
            <component :is="'style'" v-if="template.cssTemplate">{{ template.cssTemplate }}</component>
            <div class="legacy-content" v-html="htmlPreview"></div>
          </div>
        </div>

        <div v-else class="no-template">
          <div class="empty-icon">&#128188;</div>
          <h3>Keine Vorlage hinterlegt</h3>
          <p>Dieser Inhalt hat keine Vorlage. Setze eine Vorlage ueber den <router-link :to="{ name: 'admin-templates' }">Katalog</router-link> oder bearbeite die Datei-Felder im klassischen Editor.</p>
        </div>
      </main>
    </div>
  </div>

  <div v-else class="empty-page">
    <div class="empty-icon">&#128269;</div>
    <h3>Inhalt nicht gefunden</h3>
    <p>Der angeforderte Inhalt existiert nicht oder wurde geloescht.</p>
    <button class="btn-primary" @click="router.push({ name: 'admin-templates' })">Zum Katalog</button>
  </div>
</template>

<style scoped>
.editor-page { display: flex; flex-direction: column; gap: 0; }
.editor-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 16px 0; margin-bottom: 16px; border-bottom: 1px solid var(--color-border); flex-wrap: wrap; }
.tb-left { display: flex; align-items: center; gap: 16px; }
.btn-back { background: transparent; border: 1px solid var(--color-border); border-radius: 8px; padding: 8px 14px; font-size: 0.85rem; color: var(--gray-600); cursor: pointer; }
.btn-back:hover { border-color: var(--blickle-navy); color: var(--blickle-navy); }
.tb-divider { width: 1px; height: 32px; background: var(--color-border); }
.tb-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--blickle-navy); margin: 0; letter-spacing: -0.01em; }
.tb-sub { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.status-pill { font-size: 0.68rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; letter-spacing: 0.05em; text-transform: uppercase; }
.status-draft { background: rgba(148,163,184,0.2); color: #475569; }
.status-in_review { background: rgba(245,158,11,0.18); color: #b45309; }
.status-approved { background: rgba(16,185,129,0.18); color: #047857; }
.status-rejected { background: rgba(239,68,68,0.18); color: #b91c1c; }
.tpl-pill { font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: rgba(22,58,108,0.08); color: var(--blickle-navy); }
.tb-right { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-ghost { padding: 8px 16px; background: transparent; border: 1px solid var(--color-border); border-radius: 8px; color: var(--gray-600); font-size: 0.85rem; font-weight: 500; cursor: pointer; }
.btn-ghost:hover { border-color: var(--blickle-navy); color: var(--blickle-navy); }
.btn-danger { border-color: rgba(239,68,68,0.3); color: #b91c1c; }
.btn-danger:hover { background: rgba(239,68,68,0.08); border-color: #ef4444; color: #991b1b; }
.btn-primary { padding: 8px 18px; background: var(--blickle-navy); color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-primary:hover:not(:disabled) { background: #122E54; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.editor-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
.meta-panel { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 140px); overflow-y: auto; position: sticky; top: 20px; }
.meta-sec { margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px dashed var(--color-border); }
.meta-sec:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.meta-title { font-family: var(--font-display); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin: 0 0 10px; }
.fld { display: block; margin-bottom: 12px; }
.fld-label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 7px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.82rem; font-family: inherit; box-sizing: border-box; }
.fld-input:focus { outline: none; border-color: var(--blickle-navy); box-shadow: 0 0 0 3px rgba(22,58,108,0.08); }
.fld-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.loc-list { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; }
.loc-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--gray-700); cursor: pointer; }

.editor-main { min-width: 0; }
.legacy-preview-wrap { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.legacy-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.legacy-frame { aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 14px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06); position: relative; }
.legacy-content { width: 100%; height: 100%; }

.no-template { background: var(--blickle-white); border-radius: 12px; padding: 60px 30px; text-align: center; color: var(--gray-500); }
.empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: 0.5; }
.no-template h3 { font-family: var(--font-display); color: var(--blickle-navy); margin-bottom: 8px; }
.no-template p { font-size: 0.9rem; max-width: 480px; margin: 0 auto; }
.no-template a { color: var(--blickle-navy); font-weight: 600; }

.empty-page { text-align: center; padding: 80px 20px; color: var(--gray-500); }
.empty-page h3 { font-family: var(--font-display); color: var(--blickle-navy); margin-bottom: 8px; }
.empty-page p { margin-bottom: 20px; }
</style>
