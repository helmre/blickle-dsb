<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'

const userStore = useUserStore()
const locationStore = useLocationStore()
const auditStore = useAuditStore()

const showModal = ref(false)
const editingUser = ref(null)
const showDeleteConfirm = ref(null)

const formData = ref({
  name: '',
  email: '',
  role: 'viewer',
  locationAccess: []
})

const roleLabels = {
  viewer: 'Betrachter',
  editor: 'Bearbeiter',
  reviewer: 'Prüfer',
  admin: 'Administrator'
}

const roleColors = {
  admin: { bg: '#DBEAFE', color: '#1E40AF' },
  reviewer: { bg: '#E0E7FF', color: '#3730A3' },
  editor: { bg: '#D1FAE5', color: '#065F46' },
  viewer: { bg: '#F3F4F6', color: '#374151' }
}

function getLocationNames(locationIds) {
  if (!locationIds || !locationIds.length) return 'Alle'
  return locationIds.map(id => {
    const loc = locationStore.getById(id)
    return loc ? loc.name : id
  }).join(', ')
}

function openNewUser() {
  editingUser.value = null
  formData.value = { name: '', email: '', role: 'viewer', locationAccess: [] }
  showModal.value = true
}

function openEditUser(user) {
  editingUser.value = user.id
  formData.value = {
    name: user.name,
    email: user.email || '',
    role: user.role,
    locationAccess: [...(user.locationAccess || [])]
  }
  showModal.value = true
}

function toggleLocationAccess(locId) {
  const idx = formData.value.locationAccess.indexOf(locId)
  if (idx >= 0) {
    formData.value.locationAccess.splice(idx, 1)
  } else {
    formData.value.locationAccess.push(locId)
  }
}

function saveUser() {
  if (!formData.value.name.trim()) return
  if (editingUser.value) {
    userStore.update(editingUser.value, {
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      locationAccess: formData.value.locationAccess
    })
    safeAuditLog(auditStore, 'user.updated', 'user', editingUser.value, userStore.currentUser.id, { name: formData.value.name })
  } else {
    const item = userStore.add({
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      locationAccess: formData.value.locationAccess
    })
    safeAuditLog(auditStore, 'user.created', 'user', item.id, userStore.currentUser.id, { name: item.name })
  }
  showModal.value = false
}

function deleteUser(id) {
  const user = userStore.getById(id)
  userStore.remove(id)
  safeAuditLog(auditStore, 'user.deleted', 'user', id, userStore.currentUser.id, { name: user?.name })
  showDeleteConfirm.value = null
}
</script>

<template>
  <div class="user-page">
    <div class="page-toolbar">
      <h2 class="page-title">Benutzerverwaltung</h2>
      <button class="btn-primary" @click="openNewUser">+ Neuer Benutzer</button>
    </div>

    <div class="table-card">
      <table class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Standortzugriff</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in userStore.items"
            :key="user.id"
            :class="{ 'current-user': user.id === userStore.currentUser.id }"
          >
            <td class="name-cell">
              {{ user.name }}
              <span v-if="user.id === userStore.currentUser.id" class="you-badge">(Sie)</span>
            </td>
            <td>{{ user.email || '-' }}</td>
            <td>
              <span
                class="role-badge"
                :style="{ background: roleColors[user.role]?.bg, color: roleColors[user.role]?.color }"
              >
                {{ roleLabels[user.role] || user.role }}
              </span>
            </td>
            <td class="locations-cell">{{ getLocationNames(user.locationAccess) }}</td>
            <td>
              <div class="row-actions">
                <button class="btn-sm btn-outline" @click="openEditUser(user)">Bearbeiten</button>
                <button
                  class="btn-sm btn-danger"
                  @click="showDeleteConfirm = user.id"
                  :disabled="user.id === userStore.currentUser.id"
                >Löschen</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!userStore.items.length" class="empty-text">Keine Benutzer vorhanden.</p>
    </div>

    <!-- User Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Name</label>
            <input v-model="formData.name" type="text" class="form-input" placeholder="Vollständiger Name..." />
          </div>
          <div class="form-group">
            <label>E-Mail</label>
            <input v-model="formData.email" type="email" class="form-input" placeholder="email@beispiel.de" />
          </div>
          <div class="form-group">
            <label>Rolle</label>
            <select v-model="formData.role" class="form-input">
              <option value="viewer">Betrachter</option>
              <option value="editor">Bearbeiter</option>
              <option value="reviewer">Prüfer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div class="form-group">
            <label>Standortzugriff</label>
            <div class="checkbox-group">
              <label v-for="loc in locationStore.displayLocations" :key="loc.id" class="checkbox-label">
                <input
                  type="checkbox"
                  :checked="formData.locationAccess.includes(loc.id)"
                  @change="toggleLocationAccess(loc.id)"
                />
                {{ loc.name }}
              </label>
            </div>
            <p class="help-text">Keine Auswahl = Zugriff auf alle Standorte</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal = false">Abbrechen</button>
          <button class="btn-primary" @click="saveUser">{{ editingUser ? 'Speichern' : 'Erstellen' }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Benutzer löschen</h3>
          <button class="modal-close" @click="showDeleteConfirm = null">&times;</button>
        </div>
        <div class="modal-body">
          <p>Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirm = null">Abbrechen</button>
          <button class="btn-danger-solid" @click="deleteUser(showDeleteConfirm)">Löschen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-page { max-width: 1100px; }

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

.table-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  background: var(--gray-50);
  border-bottom: 1px solid var(--color-border);
}
.user-table td {
  padding: 12px 16px;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--gray-100);
}

.current-user {
  background: rgba(22, 58, 108, 0.04);
}

.name-cell {
  font-weight: 600;
  color: var(--blickle-navy);
}
.you-badge {
  font-size: var(--font-size-xs);
  font-weight: 400;
  color: var(--blickle-green);
}

.role-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.locations-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-actions {
  display: flex;
  gap: 6px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  font-weight: 400;
  cursor: pointer;
}
.help-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
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
.btn-danger:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-danger-solid {
  padding: 8px 20px;
  background: var(--color-danger);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.form-group { margin-bottom: 16px; }
.form-group > label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.form-input {
  width: 100%;
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
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
.modal-body > p { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
