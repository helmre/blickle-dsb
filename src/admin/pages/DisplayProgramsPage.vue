<script setup>
import { computed, ref, watch } from 'vue'
import { useDisplayProgramStore } from '../../shared/stores/displayProgramStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import {
  createProgramEntry,
  getProgramEntryCatalog,
} from '../../shared/displayEngine/displayProgramRules.js'
import { schedulesForTarget } from '../../shared/displayEngine/playlistResolver.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'

const programStore = useDisplayProgramStore()
const locationStore = useLocationStore()
const scheduleStore = useScheduleStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const catalog = getProgramEntryCatalog()
const selectedProgramId = ref(programStore.items[0]?.id || '')
const draft = ref(null)
const saved = ref(false)

const canManage = computed(() => userStore.can(PERMISSIONS.DISPLAY_PROGRAMS_MANAGE))
const selectedProgram = computed(() => programStore.getById(selectedProgramId.value) || programStore.items[0] || null)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function syncDraft() {
  draft.value = selectedProgram.value ? clone(selectedProgram.value) : null
}

watch(selectedProgramId, syncDraft, { immediate: true })
watch(() => programStore.items.length, () => {
  if (!selectedProgramId.value && programStore.items[0]) selectedProgramId.value = programStore.items[0].id
})

function locationNames(ids = []) {
  if (!ids.length) return 'Alle Standorte'
  return ids.map(id => locationStore.getById(id)?.name || id).join(', ')
}

function entryDescription(entry) {
  const match = catalog.find(item => item.type === entry.type && item.targetId === entry.targetId)
  return match?.description || 'Baustein der Sendeschleife'
}

function scheduledCount(program) {
  return schedulesForTarget(scheduleStore.items, 'program', program.id).length
}

function moveEntry(index, delta) {
  if (!canManage.value || !draft.value) return
  const nextIndex = index + delta
  if (nextIndex < 0 || nextIndex >= draft.value.entries.length) return
  const next = [...draft.value.entries]
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  draft.value.entries = next
}

function removeEntry(index) {
  if (!canManage.value || !draft.value) return
  draft.value.entries.splice(index, 1)
}

function addEntry(catalogEntry = catalog[0]) {
  if (!canManage.value || !draft.value) return
  draft.value.entries.push(createProgramEntry({
    type: catalogEntry.type,
    targetId: catalogEntry.targetId,
    duration: catalogEntry.type === 'playlist' ? null : 15,
  }))
}

function onEntryCatalogChange(entry, value) {
  const match = catalog.find(item => `${item.type}:${item.targetId}` === value)
  if (!match) return
  entry.type = match.type
  entry.targetId = match.targetId
}

function toggleLocation(locationId) {
  if (!canManage.value || !draft.value) return
  const ids = draft.value.locationIds || []
  const index = ids.indexOf(locationId)
  draft.value.locationIds = index >= 0
    ? ids.filter(id => id !== locationId)
    : [...ids, locationId]
}

function saveProgram() {
  if (!canManage.value || !draft.value) return
  programStore.update(draft.value.id, draft.value)
  safeAuditLog(auditStore, 'display_program.updated', 'display_program', draft.value.id, userStore.currentUser.id, { name: draft.value.name })
  saved.value = true
  setTimeout(() => { saved.value = false }, 1600)
}

function duplicateProgram() {
  if (!canManage.value || !draft.value) return
  const copy = programStore.add({
    ...draft.value,
    name: `${draft.value.name} Kopie`,
    priority: 0,
    isActive: false,
  })
  safeAuditLog(auditStore, 'display_program.created', 'display_program', copy.id, userStore.currentUser.id, { sourceId: draft.value.id })
  selectedProgramId.value = copy.id
}
</script>

<template>
  <div class="programs-page">
    <div class="page-toolbar">
      <div>
        <h2 class="page-title">Programme</h2>
        <p class="page-subtitle">Sendeschleifen für Displays: Reihenfolge, Dauer, Standort und spätere Zeitplanung.</p>
      </div>
      <div class="toolbar-actions">
        <button v-if="canManage && draft" class="btn-secondary" type="button" @click="duplicateProgram">Duplizieren</button>
        <button v-if="canManage && draft" class="btn-primary" type="button" @click="saveProgram">{{ saved ? 'Gespeichert' : 'Speichern' }}</button>
      </div>
    </div>

    <section class="program-shell">
      <aside class="program-list">
        <button
          v-for="program in programStore.items"
          :key="program.id"
          type="button"
          :class="['program-card', { active: program.id === selectedProgramId }]"
          @click="selectedProgramId = program.id"
        >
          <strong>{{ program.name }}</strong>
          <span>{{ program.entries?.length || 0 }} Bausteine · {{ scheduledCount(program) }} Zeitplan-Regel(n)</span>
          <small>{{ locationNames(program.locationIds) }}</small>
        </button>
      </aside>

      <main v-if="draft" class="program-editor">
        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <h3>Programmrahmen</h3>
              <p>Das Programm bestimmt die Reihenfolge. Die Zeitplanung bestimmt, wann dieses Programm gilt.</p>
            </div>
            <label class="toggle-label">
              <input v-model="draft.isActive" type="checkbox" :disabled="!canManage" />
              <span>{{ draft.isActive === false ? 'Inaktiv' : 'Aktiv' }}</span>
            </label>
          </div>

          <div class="form-grid">
            <label class="form-group">
              <span>Name</span>
              <input v-model="draft.name" class="form-input" type="text" :disabled="!canManage" />
            </label>
            <label class="form-group">
              <span>Priorität</span>
              <input v-model.number="draft.priority" class="form-input" type="number" min="0" :disabled="!canManage" />
            </label>
          </div>
          <label class="form-group">
            <span>Beschreibung</span>
            <textarea v-model="draft.description" class="form-input" rows="2" :disabled="!canManage"></textarea>
          </label>
          <div class="form-group">
            <span>Standorte</span>
            <div class="location-row">
              <button
                v-for="location in locationStore.displayLocations"
                :key="location.id"
                type="button"
                :class="['location-chip', { active: draft.locationIds?.includes(location.id) }]"
                :disabled="!canManage"
                @click="toggleLocation(location.id)"
              >{{ location.name }}</button>
            </div>
            <p class="hint-text">Keine Auswahl bedeutet: als Standardprogramm für alle passenden Displays nutzbar.</p>
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-heading">
            <div>
              <h3>Sendeschleife</h3>
              <p>Diese Reihenfolge läuft auf dem Display. Playlists bringen ihre eigenen Inhaltsdauern mit.</p>
            </div>
            <button v-if="canManage" class="btn-secondary" type="button" @click="addEntry()">Baustein hinzufügen</button>
          </div>

          <div class="program-entries">
            <article v-for="(entry, index) in draft.entries" :key="entry.id" class="program-entry">
              <div class="entry-order">{{ index + 1 }}</div>
              <div class="entry-main">
                <select
                  class="form-input"
                  :value="`${entry.type}:${entry.targetId}`"
                  :disabled="!canManage"
                  @change="onEntryCatalogChange(entry, $event.target.value)"
                >
                  <option v-for="item in catalog" :key="`${item.type}:${item.targetId}`" :value="`${item.type}:${item.targetId}`">
                    {{ item.label }}
                  </option>
                </select>
                <small>{{ entryDescription(entry) }}</small>
              </div>
              <label class="duration-field">
                <span>Dauer</span>
                <input v-model.number="entry.duration" class="form-input" type="number" min="5" max="300" placeholder="auto" :disabled="!canManage || entry.type === 'playlist'" />
              </label>
              <label class="toggle-label compact">
                <input v-model="entry.enabled" type="checkbox" :disabled="!canManage" />
                <span>{{ entry.enabled === false ? 'Aus' : 'Ein' }}</span>
              </label>
              <div class="entry-actions">
                <button class="btn-icon" type="button" :disabled="!canManage || index === 0" title="Nach oben" @click="moveEntry(index, -1)">&uarr;</button>
                <button class="btn-icon" type="button" :disabled="!canManage || index === draft.entries.length - 1" title="Nach unten" @click="moveEntry(index, 1)">&darr;</button>
                <button v-if="canManage" class="btn-icon danger" type="button" title="Entfernen" @click="removeEntry(index)">&times;</button>
              </div>
            </article>
            <p v-if="!draft.entries.length" class="empty-text">Dieses Programm hat noch keine Bausteine.</p>
          </div>
        </section>
      </main>
    </section>
  </div>
</template>

<style scoped>
.programs-page {
  max-width: 1440px;
}

.page-toolbar,
.toolbar-actions,
.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-toolbar {
  margin-bottom: 20px;
}

.toolbar-actions {
  align-items: center;
}

.page-title {
  margin: 0;
  color: var(--blickle-navy);
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 800;
}

.page-subtitle,
.panel-heading p,
.hint-text {
  margin: 4px 0 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.program-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
}

.program-list,
.program-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.program-card,
.panel-card {
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  background: var(--blickle-white);
  box-shadow: var(--shadow-sm);
}

.program-card {
  width: 100%;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.program-card.active {
  border-color: var(--blickle-green);
  box-shadow: 0 0 0 2px rgba(181, 204, 24, 0.18);
}

.program-card strong,
.panel-heading h3 {
  display: block;
  margin: 0;
  color: var(--blickle-navy);
  font-size: var(--font-size-md);
}

.program-card span,
.program-card small {
  display: block;
  margin-top: 4px;
  color: var(--gray-600);
  font-size: var(--font-size-xs);
}

.panel-card {
  padding: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 12px;
  margin-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.form-group span,
.duration-field span {
  color: var(--gray-600);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--blickle-white);
  color: var(--color-text);
  padding: 9px 11px;
  font: inherit;
}

.location-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-chip {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--gray-50);
  color: var(--gray-600);
  padding: 6px 11px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  cursor: pointer;
}

.location-chip.active {
  background: var(--blickle-navy);
  border-color: var(--blickle-navy);
  color: var(--blickle-white);
}

.program-entries {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.program-entry {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 110px 80px auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--gray-50);
}

.entry-order {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--blickle-navy);
  color: var(--blickle-white);
  font-weight: 800;
  font-size: var(--font-size-xs);
}

.entry-main {
  min-width: 0;
}

.entry-main small {
  display: block;
  margin-top: 4px;
  color: var(--gray-600);
  font-size: var(--font-size-xs);
}

.duration-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--blickle-navy);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.toggle-label.compact {
  justify-content: center;
}

.entry-actions {
  display: flex;
  gap: 4px;
}

.btn-primary,
.btn-secondary,
.btn-icon {
  border: 0;
  cursor: pointer;
  font-weight: 700;
}

.btn-primary,
.btn-secondary {
  border-radius: var(--radius-md);
  padding: 9px 16px;
}

.btn-primary {
  background: var(--blickle-navy);
  color: var(--blickle-white);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--blickle-navy);
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--blickle-white);
  color: var(--blickle-navy);
}

.btn-icon.danger {
  color: var(--color-danger);
}

button:disabled,
input:disabled,
select:disabled,
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.empty-text {
  color: var(--gray-500);
  text-align: center;
}

@media (max-width: 920px) {
  .program-shell,
  .form-grid,
  .program-entry {
    grid-template-columns: 1fr;
  }

  .page-toolbar,
  .panel-heading {
    flex-direction: column;
  }
}
</style>
