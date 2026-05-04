<script setup>
import { ref, computed } from 'vue'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useLayoutStore } from '../../shared/stores/layoutStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useEmergencyStore } from '../../shared/stores/emergencyStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const locationStore = useLocationStore()
const layoutStore = useLayoutStore()
const auditStore = useAuditStore()
const userStore = useUserStore()
const contentStore = useContentStore()
const scheduleStore = useScheduleStore()
const emergencyStore = useEmergencyStore()
const toast = useToastStore()

const editingId = ref(null)
const editName = ref('')
const editLayoutId = ref('')
const showAddChild = ref(null)
const newChildName = ref('')
const newChildLayoutId = ref('')
const pendingLocationDeleteId = ref(null)
const isDeletingLocation = ref(false)
const BUSY_RELEASE_MS = 250

function buildTree(parentId = 'loc-global', depth = 0) {
  const children = locationStore.items.filter(l => l.parentId === parentId)
  const result = []
  for (const child of children) {
    result.push({ ...child, depth })
    result.push(...buildTree(child.id, depth + 1))
  }
  return result
}

const locationTree = computed(() => [
  ...buildTree('loc-global'),
  ...locationStore.items
    .filter(location => location.parentId === null && location.id !== 'loc-global')
    .flatMap(location => [{ ...location, depth: 0 }, ...buildTree(location.id, 1)])
])

function getLayoutName(layoutId) {
  if (!layoutId) return 'Kein Layout'
  const layout = layoutStore.getById(layoutId)
  return layout ? layout.name : 'Unbekannt'
}

function startEdit(loc) {
  editingId.value = loc.id
  editName.value = loc.name
  editLayoutId.value = loc.layoutId || ''
}

function saveEdit(locId) {
  locationStore.update(locId, { name: editName.value, layoutId: editLayoutId.value || null })
  safeAuditLog(auditStore, 'location.updated', 'location', locId, userStore.currentUser.id, { name: editName.value })
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function toggleActive(loc) {
  locationStore.update(loc.id, { isActive: !loc.isActive })
  safeAuditLog(auditStore, 'location.toggled', 'location', loc.id, userStore.currentUser.id, { isActive: !loc.isActive })
}

function openAddChild(parentId) {
  showAddChild.value = parentId
  newChildName.value = ''
  newChildLayoutId.value = ''
}

function addChild(parentId) {
  if (!newChildName.value.trim()) return
  const item = locationStore.add({
    name: newChildName.value,
    parentId: parentId,
    layoutId: newChildLayoutId.value || null
  })
  safeAuditLog(auditStore, 'location.created', 'location', item.id, userStore.currentUser.id, { name: item.name, parentId })
  showAddChild.value = null
}

function addRootLocation() {
  const item = locationStore.add({
    name: 'Neuer Standort',
    parentId: 'loc-global',
    layoutId: null
  })
  safeAuditLog(auditStore, 'location.created', 'location', item.id, userStore.currentUser.id, { name: item.name })
  startEdit(item)
}

function deletionBlockers(id) {
  const descendantIds = locationStore.getDescendantIds(id)
  const targetIds = new Set([id, ...descendantIds])
  const blockers = []

  if (descendantIds.length) blockers.push(`${descendantIds.length} untergeordnete Standorte`)

  const contentCount = contentStore.items.filter(content =>
    (content.locationIds || []).some(locationId => targetIds.has(locationId))
  ).length
  if (contentCount) blockers.push(`${contentCount} Inhalte`)

  const scheduleCount = scheduleStore.items.filter(schedule =>
    (schedule.locationIds || []).some(locationId => targetIds.has(locationId))
  ).length
  if (scheduleCount) blockers.push(`${scheduleCount} Zeitpläne`)

  const userCount = userStore.items.filter(user =>
    (user.locationAccess || []).some(locationId => targetIds.has(locationId))
  ).length
  if (userCount) blockers.push(`${userCount} Benutzerzugriffe`)

  const emergencyCount = emergencyStore.items.filter(emergency =>
    (emergency.targetLocationIds || []).some(locationId => targetIds.has(locationId))
  ).length
  if (emergencyCount) blockers.push(`${emergencyCount} Notfälle`)

  return blockers
}

function requestDeleteLocation(id) {
  if (isDeletingLocation.value) return
  pendingLocationDeleteId.value = id
}

async function deleteLocation() {
  const id = pendingLocationDeleteId.value
  if (!id || isDeletingLocation.value) return
  isDeletingLocation.value = true
  const loc = locationStore.getById(id)
  try {
    const blockers = deletionBlockers(id)
    if (blockers.length) {
      toast.error(`Standort kann nicht gelöscht werden: ${blockers.join(', ')}`)
      pendingLocationDeleteId.value = null
      return
    }
    try {
      locationStore.remove(id)
      safeAuditLog(auditStore, 'location.deleted', 'location', id, userStore.currentUser.id, { name: loc?.name }, { toast })
      toast.success('Standort gelöscht')
      pendingLocationDeleteId.value = null
    } catch (error) {
      toast.error(error?.message || 'Standort konnte nicht gelöscht werden')
    }
  } finally {
    setTimeout(() => {
      isDeletingLocation.value = false
    }, BUSY_RELEASE_MS)
  }
}
</script>

<template>
  <div class="location-page">
    <div class="page-toolbar">
      <h2 class="page-title">Standorte</h2>
      <button class="btn-primary" @click="addRootLocation">+ Neuer Standort</button>
    </div>

    <div class="tree-card">
      <div v-for="loc in locationTree" :key="loc.id" class="tree-item" :style="{ paddingLeft: (loc.depth * 32 + 16) + 'px' }">
        <!-- Indent indicator -->
        <span v-if="loc.depth > 0" class="tree-branch">&#9492;</span>

        <template v-if="editingId === loc.id">
          <input v-model="editName" class="form-input inline-input" @keyup.enter="saveEdit(loc.id)" />
          <select v-model="editLayoutId" class="form-input inline-select">
            <option value="">Kein Layout</option>
            <option v-for="layout in layoutStore.items" :key="layout.id" :value="layout.id">{{ layout.name }}</option>
          </select>
          <button class="btn-sm btn-save" @click="saveEdit(loc.id)">Speichern</button>
          <button class="btn-sm btn-cancel" @click="cancelEdit">Abbrechen</button>
        </template>

        <template v-else>
          <span class="loc-name">{{ loc.name }}</span>
          <span :class="['status-badge', loc.isActive ? 'active' : 'inactive']">
            {{ loc.isActive ? 'Aktiv' : 'Inaktiv' }}
          </span>
          <span class="layout-badge">{{ getLayoutName(loc.layoutId) }}</span>
          <div class="tree-actions">
            <button class="btn-sm btn-outline" @click="toggleActive(loc)">
              {{ loc.isActive ? 'Deaktivieren' : 'Aktivieren' }}
            </button>
            <button class="btn-sm btn-outline" @click="openAddChild(loc.id)">+ Kind</button>
            <button class="btn-sm btn-outline" @click="startEdit(loc)">Bearbeiten</button>
            <button class="btn-sm btn-danger" :disabled="isDeletingLocation" @click="requestDeleteLocation(loc.id)">
              {{ isDeletingLocation ? 'Löscht...' : 'Löschen' }}
            </button>
          </div>
        </template>
      </div>

      <!-- Add Child Inline Form -->
      <div v-if="showAddChild !== null" class="add-child-form">
        <input v-model="newChildName" class="form-input inline-input" placeholder="Name des Standorts..." @keyup.enter="addChild(showAddChild)" />
        <select v-model="newChildLayoutId" class="form-input inline-select">
          <option value="">Kein Layout</option>
          <option v-for="layout in layoutStore.items" :key="layout.id" :value="layout.id">{{ layout.name }}</option>
        </select>
        <button class="btn-sm btn-save" @click="addChild(showAddChild)">Hinzufügen</button>
        <button class="btn-sm btn-cancel" @click="showAddChild = null">Abbrechen</button>
      </div>

      <p v-if="!locationTree.length" class="empty-text">Keine Standorte vorhanden.</p>
    </div>

    <ConfirmDialog
      :open="Boolean(pendingLocationDeleteId)"
      title="Standort löschen"
      message="Sind Sie sicher, dass Sie diesen Standort löschen möchten?"
      confirm-label="Löschen"
      confirm-variant="danger"
      @confirm="deleteLocation"
      @cancel="pendingLocationDeleteId = null"
    />
  </div>
</template>

<style scoped>
.location-page { max-width: 1000px; }

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

.tree-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 8px 0;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--gray-100);
  flex-wrap: wrap;
}
.tree-item:last-child { border-bottom: none; }

.tree-branch {
  color: var(--gray-400);
  font-size: 1rem;
  flex-shrink: 0;
}

.loc-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
}

.status-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.status-badge.active { background: var(--color-success-light); color: var(--color-success); }
.status-badge.inactive { background: var(--gray-100); color: var(--gray-600); }

.layout-badge {
  font-size: 0.6rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--gray-100);
  color: var(--gray-600);
}

.tree-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.inline-input {
  width: 180px;
  padding: 4px 8px;
  font-size: var(--font-size-sm);
}

.inline-select {
  width: 150px;
  padding: 4px 8px;
  font-size: var(--font-size-sm);
}

.add-child-form {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--gray-50);
  border-top: 1px solid var(--color-border);
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
.btn-sm {
  padding: 4px 10px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-outline {
  border: 1px solid var(--blickle-navy);
  color: var(--blickle-navy);
}
.btn-outline:hover:not(:disabled) { background: var(--blickle-navy); color: white; }
.btn-danger { color: var(--color-danger); }
.btn-danger:hover:not(:disabled) { background: var(--color-danger-light); }
.btn-save {
  background: var(--blickle-green);
  color: white;
}
.btn-cancel {
  background: var(--gray-100);
  color: var(--gray-600);
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

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px;
  font-size: var(--font-size-sm);
}

</style>
