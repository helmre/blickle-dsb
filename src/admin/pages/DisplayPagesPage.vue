<script setup>
import { computed, ref, watch } from 'vue'
import { Layers, MapPin, Monitor, RefreshCcw, Save } from 'lucide-vue-next'
import DisplayGrid from '../../display/DisplayGrid.vue'
import '../../display/display-themes.css'
import { DISPLAY_WIDGETS, DISPLAY_SOURCE_TYPES } from '../../shared/displayEngine/sourceRegistry.js'
import { buildDisplayPageFromConfig } from '../../shared/displayEngine/displayPageBuilder.js'
import { useDisplayPageStore } from '../../shared/stores/displayPageStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'

const displayPageStore = useDisplayPageStore()
const locationStore = useLocationStore()
const toastStore = useToastStore()

const selectedPageId = ref('home')
const selectedLocationId = ref('')
const draft = ref(null)
const isSaving = ref(false)
const isResetting = ref(false)
const BUSY_RELEASE_MS = 250

const availablePages = computed(() => [
  { id: 'home', label: 'Startseite', description: 'Kuratierte Kacheln fuer die erste Display-Seite' },
])

const selectedLocationName = computed(() => {
  if (!selectedLocationId.value) return 'Global'
  return locationStore.getById(selectedLocationId.value)?.name || selectedLocationId.value
})

const selectedPageMeta = computed(() =>
  availablePages.value.find(page => page.id === selectedPageId.value) || availablePages.value[0]
)

const previewPage = computed(() => draft.value ? buildDisplayPageFromConfig(draft.value) : null)

const slotSummary = computed(() => {
  const slots = draft.value?.slots || []
  return {
    count: slots.length,
    widgets: slots.filter(slot => slot.source?.type === DISPLAY_SOURCE_TYPES.WIDGET).length,
    columns: draft.value?.layout?.columns || 1,
    rows: draft.value?.layout?.rows || 1,
  }
})

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadDraft() {
  draft.value = displayPageStore.getPageConfig(selectedPageId.value, selectedLocationId.value)
}

function updateSlotSource(slot, widgetId) {
  const widget = DISPLAY_WIDGETS.find(item => item.id === widgetId)
  if (!widget) return
  slot.source = {
    type: DISPLAY_SOURCE_TYPES.WIDGET,
    id: widget.id,
    title: slot.source?.title || widget.label,
    settings: {},
  }
}

function saveDraft() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const next = clone(draft.value)
    if (selectedLocationId.value) {
      next.id = `${selectedPageId.value}-${selectedLocationId.value}`
      next.pageId = selectedPageId.value
      next.locationId = selectedLocationId.value
      next.locationIds = [selectedLocationId.value]
    } else {
      next.id = selectedPageId.value
      delete next.pageId
      delete next.locationId
      next.locationIds = []
    }

    displayPageStore.savePageConfig(next)
    loadDraft()
    toastStore.success('Display-Seite gespeichert.')
  } finally {
    setTimeout(() => {
      isSaving.value = false
    }, BUSY_RELEASE_MS)
  }
}

function resetConfig() {
  if (isResetting.value) return
  isResetting.value = true
  try {
    displayPageStore.resetPageConfig(selectedPageId.value, selectedLocationId.value)
    loadDraft()
    toastStore.info('Display-Seite wurde auf den Fallback zurueckgesetzt.')
  } finally {
    setTimeout(() => {
      isResetting.value = false
    }, BUSY_RELEASE_MS)
  }
}

watch([selectedPageId, selectedLocationId], loadDraft, { immediate: true })
</script>

<template>
  <div class="display-pages-page">
    <section class="page-intro">
      <div>
        <p class="eyebrow">Display Composition</p>
        <h2>Seiten aus Slots und Quellen zusammenstellen</h2>
        <p>
          Die Startseite nutzt jetzt denselben Baukasten wie Inhalte, Widgets,
          Standorte und Simulation. Diese erste Version fokussiert bewusst die
          Kachel-Belegung ohne Drag-and-drop.
        </p>
      </div>
      <div class="intro-stats">
        <span><Layers :size="16" /> {{ slotSummary.count }} Slots</span>
        <span><Monitor :size="16" /> {{ slotSummary.columns }}x{{ slotSummary.rows }}</span>
        <span><MapPin :size="16" /> {{ selectedLocationName }}</span>
      </div>
    </section>

    <section class="control-strip">
      <label class="control-field">
        <span>Display-Seite</span>
        <select v-model="selectedPageId">
          <option v-for="page in availablePages" :key="page.id" :value="page.id">
            {{ page.label }}
          </option>
        </select>
      </label>
      <label class="control-field">
        <span>Geltungsbereich</span>
        <select v-model="selectedLocationId">
          <option value="">Globaler Standard</option>
          <option v-for="location in locationStore.displayLocations" :key="location.id" :value="location.id">
            {{ location.name }}
          </option>
        </select>
      </label>
      <div class="actions">
        <button type="button" class="btn-secondary" :disabled="isResetting || isSaving" @click="resetConfig">
          <RefreshCcw :size="16" />
          <span>{{ isResetting ? 'Setzt zurueck...' : 'Zuruecksetzen' }}</span>
        </button>
        <button type="button" class="btn-primary" :disabled="isSaving || isResetting" @click="saveDraft">
          <Save :size="16" />
          <span>{{ isSaving ? 'Speichert...' : 'Speichern' }}</span>
        </button>
      </div>
    </section>

    <div class="composer-grid">
      <main class="slot-panel">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">{{ selectedPageMeta.description }}</span>
            <h3>{{ selectedPageMeta.label }}</h3>
          </div>
          <span class="page-duration">{{ draft?.duration || 15 }}s</span>
        </div>

        <div class="slot-list">
          <article v-for="slot in draft?.slots || []" :key="slot.id" class="slot-card">
            <div class="slot-card-head">
              <div>
                <strong>{{ slot.label }}</strong>
                <small>{{ slot.gridColumn }} / {{ slot.gridRow }}</small>
              </div>
              <span class="slot-type">{{ slot.source?.type || 'leer' }}</span>
            </div>

            <label class="form-field">
              <span>Titel</span>
              <input v-model="slot.source.title" class="form-input" />
            </label>

            <label class="form-field">
              <span>Quelle</span>
              <select
                class="form-input"
                :value="slot.source?.id"
                @change="updateSlotSource(slot, $event.target.value)"
              >
                <option v-for="widget in DISPLAY_WIDGETS" :key="widget.id" :value="widget.id">
                  {{ widget.label }}
                </option>
              </select>
            </label>
          </article>
        </div>
      </main>

      <aside class="preview-panel">
        <div class="preview-toolbar">
          <div>
            <span class="panel-kicker">Live-Vorschau</span>
            <h3>{{ previewPage?.label || 'DISPLAY' }}</h3>
          </div>
          <span>{{ selectedLocationName }}</span>
        </div>
        <div class="preview-frame">
          <div class="preview-stage" data-theme="dark">
            <DisplayGrid v-if="previewPage" :page="previewPage" :mediaPaused="true" />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.display-pages-page {
  max-width: 1480px;
  margin: 0 auto;
  padding: 22px 0 34px;
}

.page-intro {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 20px;
}

.eyebrow,
.panel-kicker {
  margin: 0 0 6px;
  color: var(--blickle-green);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.page-intro h2,
.panel-header h3,
.preview-toolbar h3 {
  margin: 0;
  color: var(--blickle-navy);
  font-family: var(--font-display);
}

.page-intro h2 {
  font-size: 1.85rem;
}

.page-intro p {
  max-width: 700px;
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  line-height: 1.55;
}

.intro-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.intro-stats span,
.page-duration,
.slot-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
}

.control-strip {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(260px, 1fr) auto;
  gap: 14px;
  align-items: end;
  padding: 16px;
  margin-bottom: 18px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.control-field,
.form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.control-field span,
.form-field span {
  color: var(--color-text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
}

.control-field select,
.form-input {
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  color: var(--color-text);
  font: inherit;
}

.control-field select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.1);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: var(--blickle-navy);
  color: #fff;
}

.btn-primary:hover {
  background: var(--blickle-navy-light);
}

.btn-secondary {
  background: #fff;
  color: var(--blickle-navy);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--blickle-navy);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:disabled:hover {
  background: var(--blickle-navy);
}

.btn-secondary:disabled:hover {
  border-color: var(--color-border);
}

.composer-grid {
  display: grid;
  grid-template-columns: minmax(420px, 0.82fr) minmax(560px, 1.18fr);
  gap: 18px;
  align-items: start;
}

.slot-panel,
.preview-panel {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header,
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
}

.slot-list {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.slot-card {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #f8fafc;
}

.slot-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.slot-card strong {
  display: block;
  color: var(--blickle-navy);
  font-family: var(--font-display);
}

.slot-card small {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.slot-type {
  background: rgba(181, 204, 24, 0.12);
  border-color: rgba(181, 204, 24, 0.35);
  color: var(--blickle-navy);
  text-transform: uppercase;
}

.form-field + .form-field {
  margin-top: 12px;
}

.preview-toolbar span:last-child {
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
}

.preview-frame {
  padding: 16px;
  background: #0f172a;
}

.preview-stage {
  width: 100%;
  aspect-ratio: 16 / 9;
  padding: 14px;
  background: var(--d-bg);
  overflow: hidden;
}

@media (max-width: 1180px) {
  .page-intro,
  .composer-grid {
    grid-template-columns: 1fr;
  }

  .page-intro {
    display: block;
  }

  .intro-stats {
    justify-content: flex-start;
    margin-top: 14px;
  }

  .control-strip {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
