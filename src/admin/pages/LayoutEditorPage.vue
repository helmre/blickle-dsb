<script setup>
import { ref, computed } from 'vue'
import { useLayoutStore } from '../../shared/stores/layoutStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { formatGridLine, getLayoutGridSize, normalizeLayout, parseGridLine, zoneGridStyle } from '../../shared/utils/layoutSchema.js'
import { getLayoutDeletionBlockers } from '../../shared/layouts/layoutRules.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const layoutStore = useLayoutStore()
const locationStore = useLocationStore()
const auditStore = useAuditStore()
const userStore = useUserStore()
const toast = useToastStore()

const selectedLayoutId = ref(null)
const showNewModal = ref(false)
const newLayoutName = ref('')
const newLayoutColumns = ref(2)
const newLayoutRows = ref(2)

const selectedLayout = computed(() => {
  if (!selectedLayoutId.value) return null
  return layoutStore.getById(selectedLayoutId.value)
})

const editColumns = ref(2)
const editRows = ref(2)
const pendingLayoutDeleteId = ref(null)
const isDeletingLayout = ref(false)

function selectLayout(id) {
  selectedLayoutId.value = id
  const layout = layoutStore.getById(id)
  if (layout) {
    const grid = getLayoutGridSize(layout)
    editColumns.value = grid.columns || 2
    editRows.value = grid.rows || 2
  }
}

function createLayout() {
  if (!newLayoutName.value.trim()) return
  const zones = []
  for (let r = 0; r < newLayoutRows.value; r++) {
    for (let c = 0; c < newLayoutColumns.value; c++) {
      zones.push({
        id: `zone-${r}-${c}`,
        name: `Zone ${r * newLayoutColumns.value + c + 1}`,
        gridColumnStart: c + 1,
        gridColumnEnd: c + 2,
        gridRowStart: r + 1,
        gridRowEnd: r + 2,
        type: 'content'
      })
    }
  }
  const item = layoutStore.add({
    name: newLayoutName.value,
    gridColumns: newLayoutColumns.value,
    gridRows: newLayoutRows.value,
    zones
  })
  safeAuditLog(auditStore, 'layout.created', 'layout', item.id, userStore.currentUser.id, { name: item.name })
  newLayoutName.value = ''
  newLayoutColumns.value = 2
  newLayoutRows.value = 2
  showNewModal.value = false
  selectLayout(item.id)
}

function updateLayoutGrid() {
  if (!selectedLayout.value) return
  layoutStore.update(selectedLayoutId.value, {
    gridColumns: editColumns.value,
    gridRows: editRows.value
  })
  safeAuditLog(auditStore, 'layout.updated', 'layout', selectedLayoutId.value, userStore.currentUser.id, {
    columns: editColumns.value,
    rows: editRows.value
  })
}

function updateZone(zoneIndex, field, value) {
  const layout = selectedLayout.value
  if (!layout) return
  const zones = [...layout.zones]
  zones[zoneIndex] = { ...zones[zoneIndex], [field]: value }
  layoutStore.update(selectedLayoutId.value, { zones })
}

function updateZoneGridLine(zoneIndex, axis, value) {
  const layout = selectedLayout.value
  if (!layout) return
  const zones = [...layout.zones]
  const normalized = normalizeLayout(layout).zones[zoneIndex]
  const fallbackStart = axis === 'column' ? normalized.gridColumnStart : normalized.gridRowStart
  const fallbackEnd = axis === 'column' ? normalized.gridColumnEnd : normalized.gridRowEnd
  const parsed = parseGridLine(value, fallbackStart, fallbackEnd)
  const patch = axis === 'column'
    ? { gridColumnStart: parsed.start, gridColumnEnd: parsed.end, gridColumn: undefined }
    : { gridRowStart: parsed.start, gridRowEnd: parsed.end, gridRow: undefined }
  zones[zoneIndex] = { ...zones[zoneIndex], ...patch }
  layoutStore.update(selectedLayoutId.value, { zones })
}

function addZone() {
  const layout = selectedLayout.value
  if (!layout) return
  const zones = [...(layout.zones || [])]
  const idx = zones.length
  zones.push({
    id: `zone-${Date.now()}`,
    name: `Zone ${idx + 1}`,
    gridColumnStart: 1,
    gridColumnEnd: 2,
    gridRowStart: 1,
    gridRowEnd: 2,
    type: 'content'
  })
  layoutStore.update(selectedLayoutId.value, { zones })
}

function removeZone(zoneIndex) {
  const layout = selectedLayout.value
  if (!layout) return
  const zones = [...layout.zones]
  zones.splice(zoneIndex, 1)
  layoutStore.update(selectedLayoutId.value, { zones })
}

const pendingLayoutDelete = computed(() => {
  return pendingLayoutDeleteId.value ? layoutStore.getById(pendingLayoutDeleteId.value) : null
})

const deleteLayoutConfirmMessage = computed(() => {
  return pendingLayoutDelete.value
    ? `"${pendingLayoutDelete.value.name}" wirklich löschen?`
    : 'Dieses Layout wirklich löschen?'
})

function requestDeleteLayout(id) {
  if (isDeletingLayout.value) return
  pendingLayoutDeleteId.value = id
}

function cancelDeleteLayout() {
  if (isDeletingLayout.value) return
  pendingLayoutDeleteId.value = null
}

function confirmDeleteLayout() {
  const id = pendingLayoutDeleteId.value
  if (!id || isDeletingLayout.value) return
  isDeletingLayout.value = true
  try {
    const layout = layoutStore.getById(id)
    const blockers = getLayoutDeletionBlockers(id, locationStore.items)
    if (blockers.length) {
      toast.error(`Layout kann nicht gelöscht werden: ${blockers.join(', ')}`)
      pendingLayoutDeleteId.value = null
      return
    }
    layoutStore.remove(id)
    safeAuditLog(auditStore, 'layout.deleted', 'layout', id, userStore.currentUser?.id, { name: layout?.name })
    if (selectedLayoutId.value === id) {
      selectedLayoutId.value = null
    }
    toast.success('Layout gelöscht')
    pendingLayoutDeleteId.value = null
  } catch (error) {
    toast.error(error?.message || 'Layout konnte nicht gelöscht werden')
  } finally {
    isDeletingLayout.value = false
  }
}

const zoneColors = ['#163A6C', '#B5CC18', '#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#EC4899']
</script>

<template>
  <div class="layout-page">
    <div class="page-toolbar">
      <h2 class="page-title">Layouts</h2>
      <button class="btn-primary" @click="showNewModal = true">+ Neues Layout</button>
    </div>

    <div class="layout-content">
      <!-- Layout Cards Grid -->
      <div class="layout-grid">
        <div
          v-for="layout in layoutStore.items"
          :key="layout.id"
          :class="['layout-card', { selected: selectedLayoutId === layout.id }]"
          @click="selectLayout(layout.id)"
        >
          <div class="card-header-row">
            <h4 class="card-title">{{ layout.name }}</h4>
            <button class="btn-sm btn-danger" :disabled="isDeletingLayout" @click.stop="requestDeleteLayout(layout.id)">&#128465;</button>
          </div>
          <!-- Mini Preview -->
          <div class="mini-preview" :style="{ gridTemplateColumns: `repeat(${getLayoutGridSize(layout).columns || 2}, 1fr)`, gridTemplateRows: `repeat(${getLayoutGridSize(layout).rows || 2}, 1fr)` }">
            <div
              v-for="(zone, zi) in normalizeLayout(layout).zones"
              :key="zone.id"
              class="mini-zone"
              :style="{
                ...zoneGridStyle(zone),
                background: zoneColors[zi % zoneColors.length]
              }"
            >
              <span class="mini-zone-label">{{ zi + 1 }}</span>
            </div>
          </div>
          <div class="card-meta-row">
            <span class="meta-text">{{ (layout.zones || []).length }} Zonen</span>
            <span class="meta-text">{{ getLayoutGridSize(layout).columns || 2 }}x{{ getLayoutGridSize(layout).rows || 2 }}</span>
          </div>
        </div>
        <p v-if="!layoutStore.items.length" class="empty-text">Keine Layouts vorhanden.</p>
      </div>

      <!-- Zone Editor -->
      <div v-if="selectedLayout" class="zone-editor">
        <div class="editor-card">
          <h3 class="panel-title">{{ selectedLayout.name }} - Zonen bearbeiten</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Spalten</label>
              <input v-model.number="editColumns" type="number" min="1" max="12" class="form-input" @change="updateLayoutGrid" />
            </div>
            <div class="form-group">
              <label>Zeilen</label>
              <input v-model.number="editRows" type="number" min="1" max="12" class="form-input" @change="updateLayoutGrid" />
            </div>
          </div>

          <!-- Large Preview -->
          <div class="large-preview" :style="{ gridTemplateColumns: `repeat(${editColumns}, 1fr)`, gridTemplateRows: `repeat(${editRows}, 1fr)` }">
            <div
              v-for="(zone, zi) in normalizeLayout(selectedLayout).zones"
              :key="zone.id"
              class="preview-zone"
              :style="{
                ...zoneGridStyle(zone),
                background: zoneColors[zi % zoneColors.length]
              }"
            >
              {{ zone.name }}
            </div>
          </div>

          <!-- Zone List -->
          <div class="zone-list">
            <h4 class="zone-list-title">Zonen</h4>
            <div v-for="(zone, zi) in (selectedLayout.zones || [])" :key="zone.id" class="zone-item">
              <div class="zone-color" :style="{ background: zoneColors[zi % zoneColors.length] }"></div>
              <input
                :value="zone.name"
                class="form-input zone-name-input"
                @change="updateZone(zi, 'name', $event.target.value)"
              />
              <label class="zone-field">
                <span>Spalte:</span>
                <input
                  :value="formatGridLine(normalizeLayout(selectedLayout).zones[zi].gridColumnStart, normalizeLayout(selectedLayout).zones[zi].gridColumnEnd)"
                  class="form-input zone-pos-input"
                  @change="updateZoneGridLine(zi, 'column', $event.target.value)"
                  placeholder="1 / 2"
                />
              </label>
              <label class="zone-field">
                <span>Zeile:</span>
                <input
                  :value="formatGridLine(normalizeLayout(selectedLayout).zones[zi].gridRowStart, normalizeLayout(selectedLayout).zones[zi].gridRowEnd)"
                  class="form-input zone-pos-input"
                  @change="updateZoneGridLine(zi, 'row', $event.target.value)"
                  placeholder="1 / 2"
                />
              </label>
              <button class="btn-sm btn-danger" @click="removeZone(zi)">&times;</button>
            </div>
            <button class="btn-sm btn-outline add-zone-btn" @click="addZone">+ Zone hinzufügen</button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="Boolean(pendingLayoutDeleteId)"
      title="Layout löschen"
      :message="deleteLayoutConfirmMessage"
      confirm-label="Löschen"
      confirm-variant="danger"
      @confirm="confirmDeleteLayout"
      @cancel="cancelDeleteLayout"
    />

    <!-- New Layout Modal -->
    <div v-if="showNewModal" class="modal-overlay" @click.self="showNewModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Neues Layout erstellen</h3>
          <button class="modal-close" @click="showNewModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newLayoutName" type="text" class="form-input" placeholder="Layout-Name..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Spalten</label>
              <input v-model.number="newLayoutColumns" type="number" min="1" max="12" class="form-input" />
            </div>
            <div class="form-group">
              <label>Zeilen</label>
              <input v-model.number="newLayoutRows" type="number" min="1" max="12" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showNewModal = false">Abbrechen</button>
          <button class="btn-primary" @click="createLayout">Erstellen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-page { max-width: 1400px; }

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

.layout-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.layout-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
}
.layout-card:hover { border-color: var(--gray-300); }
.layout-card.selected { border-color: var(--blickle-navy); }

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
}

.mini-preview {
  display: grid;
  gap: 3px;
  aspect-ratio: 16 / 9;
  background: var(--gray-100);
  border-radius: var(--radius-sm);
  padding: 3px;
  margin-bottom: 8px;
}

.mini-zone {
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}
.mini-zone-label {
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
}
.meta-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.zone-editor { width: 100%; }

.editor-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}
.panel-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 16px;
}

.large-preview {
  display: grid;
  gap: 4px;
  aspect-ratio: 16 / 9;
  background: var(--gray-100);
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 20px;
  max-height: 300px;
}

.preview-zone {
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 600;
  opacity: 0.85;
}

.zone-list-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 12px;
}

.zone-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zone-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--gray-50);
  border-radius: var(--radius-sm);
}

.zone-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.zone-name-input {
  width: 120px;
  padding: 4px 8px;
  font-size: var(--font-size-xs);
}

.zone-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.zone-pos-input {
  width: 70px;
  padding: 4px 6px;
  font-size: var(--font-size-xs);
}

.add-zone-btn {
  align-self: flex-start;
  margin-top: 4px;
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
.btn-sm {
  padding: 4px 10px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.btn-outline {
  border: 1px solid var(--blickle-navy);
  color: var(--blickle-navy);
}
.btn-outline:hover { background: var(--blickle-navy); color: white; }
.btn-danger { color: var(--color-danger); }
.btn-danger:hover { background: var(--color-danger-light); }

.form-group { margin-bottom: 16px; }
.form-group > label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.form-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.form-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1);
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  width: 480px;
  box-shadow: var(--shadow-lg);
}
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
