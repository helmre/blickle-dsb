<script setup>
import { ref, computed } from 'vue'
import { useEmergencyStore } from '../../shared/stores/emergencyStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const emergencyStore = useEmergencyStore()
const locationStore = useLocationStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const message = ref('')
const severity = ref('warning')
const duration = ref(60)
const selectedLocations = ref([])
const showConfirm = ref(false)

function toggleLocation(locId) {
  const idx = selectedLocations.value.indexOf(locId)
  if (idx >= 0) {
    selectedLocations.value.splice(idx, 1)
  } else {
    selectedLocations.value.push(locId)
  }
}

function selectAllLocations() {
  if (selectedLocations.value.length === locationStore.items.length) {
    selectedLocations.value = []
  } else {
    selectedLocations.value = locationStore.items.map(l => l.id)
  }
}

function confirmSend() {
  if (!message.value.trim()) return
  showConfirm.value = true
}

function sendEmergency() {
  const emergency = emergencyStore.trigger({
    message: message.value,
    severity: severity.value,
    targetLocationIds: selectedLocations.value,
    displayDuration: duration.value,
    triggeredBy: userStore.currentUser.id
  })
  auditStore.log('emergency.triggered', 'emergency', emergency.id, userStore.currentUser.id, {
    message: message.value,
    severity: severity.value,
    duration: duration.value
  })
  message.value = ''
  severity.value = 'warning'
  duration.value = 60
  selectedLocations.value = []
  showConfirm.value = false
}

function getUserName(userId) {
  const u = userStore.getById(userId)
  return u ? u.name : userId
}

function getLocationNames(ids) {
  return (ids || []).map(id => {
    const loc = locationStore.getById(id)
    return loc ? loc.name : id
  }).join(', ')
}

const historyItems = computed(() => emergencyStore.history)
</script>

<template>
  <div class="emergency-page">
    <div class="page-toolbar">
      <h2 class="page-title">Notfall-Management</h2>
    </div>

    <!-- Active Emergency Banner -->
    <div v-if="emergencyStore.activeEmergency" class="active-banner">
      <span class="active-icon">&#9888;</span>
      <div class="active-info">
        <strong>Aktiver Notfall:</strong> {{ emergencyStore.activeEmergency.message }}
      </div>
    </div>

    <!-- Emergency Form -->
    <div class="emergency-card">
      <div class="warning-icon">&#9888;</div>
      <h3 class="emergency-title">Notfallnachricht senden</h3>
      <p class="emergency-subtitle">Diese Nachricht wird sofort auf allen ausgewaehlten Displays angezeigt.</p>

      <div class="form-group">
        <label>Nachricht</label>
        <textarea
          v-model="message"
          class="form-input message-input"
          rows="3"
          placeholder="Notfallnachricht eingeben..."
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Schweregrad</label>
          <select v-model="severity" class="form-input">
            <option value="warning">Warnung</option>
            <option value="critical">Kritisch</option>
          </select>
        </div>
        <div class="form-group">
          <label>Anzeigedauer</label>
          <select v-model.number="duration" class="form-input">
            <option :value="30">30 Sekunden</option>
            <option :value="60">60 Sekunden</option>
            <option :value="120">120 Sekunden</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>
          Standorte
          <button class="select-all-btn" @click="selectAllLocations">
            {{ selectedLocations.length === locationStore.items.length ? 'Keine' : 'Alle' }} auswaehlen
          </button>
        </label>
        <div class="location-checkboxes">
          <label v-for="loc in locationStore.items" :key="loc.id" class="checkbox-label">
            <input
              type="checkbox"
              :checked="selectedLocations.includes(loc.id)"
              @change="toggleLocation(loc.id)"
            />
            {{ loc.name }}
          </label>
        </div>
      </div>

      <button
        class="btn-emergency"
        @click="confirmSend"
        :disabled="!message.trim()"
      >
        &#9888; NOTFALL SENDEN
      </button>
    </div>

    <!-- History -->
    <div class="history-section">
      <h3 class="section-title">Verlauf</h3>
      <div class="history-table-wrapper">
        <table class="history-table">
          <thead>
            <tr>
              <th>Zeitstempel</th>
              <th>Nachricht</th>
              <th>Schweregrad</th>
              <th>Dauer</th>
              <th>Ausgeloest von</th>
              <th>Standorte</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in historyItems" :key="entry.id">
              <td>{{ new Date(entry.triggeredAt).toLocaleString('de-DE') }}</td>
              <td>{{ entry.message }}</td>
              <td>
                <span :class="['severity-badge', entry.severity]">
                  {{ entry.severity === 'critical' ? 'Kritisch' : 'Warnung' }}
                </span>
              </td>
              <td>{{ entry.displayDuration }}s</td>
              <td>{{ getUserName(entry.triggeredBy) }}</td>
              <td>{{ getLocationNames(entry.targetLocationIds) || 'Alle' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!historyItems.length" class="empty-text">Keine Notfaelle im Verlauf.</p>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="modal confirm-modal">
        <div class="modal-header modal-header-danger">
          <h3>&#9888; Notfall bestaetigen</h3>
          <button class="modal-close" @click="showConfirm = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">Sind Sie sicher, dass Sie folgende Notfallnachricht senden moechten?</p>
          <div class="confirm-preview">
            <p><strong>Nachricht:</strong> {{ message }}</p>
            <p><strong>Schweregrad:</strong> {{ severity === 'critical' ? 'Kritisch' : 'Warnung' }}</p>
            <p><strong>Dauer:</strong> {{ duration }} Sekunden</p>
            <p><strong>Standorte:</strong> {{ selectedLocations.length ? getLocationNames(selectedLocations) : 'Keine ausgewaehlt' }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showConfirm = false">Abbrechen</button>
          <button class="btn-danger-solid" @click="sendEmergency">Jetzt senden</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emergency-page { max-width: 900px; }

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

.active-banner {
  background: #FEF2F2;
  border: 2px solid var(--color-danger);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.active-icon { font-size: 1.5rem; }
.active-info {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.emergency-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 32px;
  text-align: center;
  margin-bottom: 32px;
  border-top: 4px solid var(--color-danger);
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.emergency-title {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--color-danger);
  margin-bottom: 4px;
}

.emergency-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.message-input {
  font-size: var(--font-size-base) !important;
}

.btn-emergency {
  width: 100%;
  padding: 16px;
  background: #DC2626;
  color: white;
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: 700;
  border-radius: var(--radius-md);
  margin-top: 8px;
  transition: background 0.2s;
  letter-spacing: 0.05em;
}
.btn-emergency:hover { background: #B91C1C; }
.btn-emergency:disabled { opacity: 0.5; cursor: not-allowed; }

.location-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  font-weight: 400;
  cursor: pointer;
}

.select-all-btn {
  font-size: var(--font-size-xs);
  color: var(--blickle-navy);
  font-weight: 400;
  margin-left: 8px;
  text-decoration: underline;
  cursor: pointer;
}

.history-section { margin-top: 8px; }
.section-title {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 16px;
}

.history-table-wrapper {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}
.history-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  background: var(--gray-50);
  border-bottom: 1px solid var(--color-border);
}
.history-table td {
  padding: 12px 16px;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--gray-100);
}

.severity-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.severity-badge.critical { background: #FEE2E2; color: #DC2626; }
.severity-badge.warning { background: var(--color-warning-light); color: #92400E; }

.form-group {
  margin-bottom: 16px;
  text-align: left;
}
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
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.btn-secondary {
  padding: 8px 20px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
}
.btn-danger-solid {
  padding: 8px 20px;
  background: #DC2626;
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
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
  box-shadow: var(--shadow-lg);
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header-danger { background: #FEF2F2; }
.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-danger);
}
.modal-close { font-size: 1.5rem; color: var(--gray-400); padding: 4px; }
.modal-body { padding: 24px; }
.confirm-text { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 16px; }
.confirm-preview {
  background: var(--gray-50);
  border-radius: var(--radius-md);
  padding: 16px;
  font-size: var(--font-size-sm);
}
.confirm-preview p { margin-bottom: 4px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
