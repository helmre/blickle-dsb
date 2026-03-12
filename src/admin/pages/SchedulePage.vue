<script setup>
import { ref, computed } from 'vue'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const scheduleStore = useScheduleStore()
const contentStore = useContentStore()
const playlistStore = usePlaylistStore()
const locationStore = useLocationStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const showModal = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const newSchedule = ref({
  targetType: 'content',
  targetId: '',
  startDate: '',
  endDate: '',
  locationIds: [],
  recurrence: 'none'
})

const monthNames = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7 // Monday start
  const days = []

  for (let i = 0; i < startPad; i++) {
    days.push({ day: null, date: null })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const hasSchedule = scheduleStore.items.some(s =>
      s.startDate <= dateStr && s.endDate >= dateStr
    )
    days.push({ day: d, date: dateStr, hasSchedule })
  }
  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function getTargetName(schedule) {
  if (schedule.targetType === 'content') {
    const c = contentStore.getById(schedule.targetId)
    return c ? c.title : 'Unbekannt'
  } else {
    const p = playlistStore.getById(schedule.targetId)
    return p ? p.name : 'Unbekannt'
  }
}

function getLocationNames(locationIds) {
  return (locationIds || []).map(id => {
    const loc = locationStore.getById(id)
    return loc ? loc.name : id
  }).join(', ')
}

function toggleActive(schedule) {
  scheduleStore.update(schedule.id, { isActive: !schedule.isActive })
  auditStore.log('schedule.toggled', 'schedule', schedule.id, userStore.currentUser.id, { isActive: !schedule.isActive })
}

function openNewSchedule() {
  newSchedule.value = { targetType: 'content', targetId: '', startDate: '', endDate: '', locationIds: [], recurrence: 'none' }
  showModal.value = true
}

function toggleLocation(locId) {
  const idx = newSchedule.value.locationIds.indexOf(locId)
  if (idx >= 0) {
    newSchedule.value.locationIds.splice(idx, 1)
  } else {
    newSchedule.value.locationIds.push(locId)
  }
}

function saveSchedule() {
  if (!newSchedule.value.targetId || !newSchedule.value.startDate || !newSchedule.value.endDate) return
  const item = scheduleStore.add({
    targetType: newSchedule.value.targetType,
    targetId: newSchedule.value.targetId,
    startDate: newSchedule.value.startDate,
    endDate: newSchedule.value.endDate,
    locationIds: newSchedule.value.locationIds,
    recurrence: newSchedule.value.recurrence
  })
  auditStore.log('schedule.created', 'schedule', item.id, userStore.currentUser.id, { targetId: item.targetId })
  showModal.value = false
}

function deleteSchedule(id) {
  scheduleStore.remove(id)
  auditStore.log('schedule.deleted', 'schedule', id, userStore.currentUser.id)
}

const availableTargets = computed(() => {
  if (newSchedule.value.targetType === 'content') {
    return contentStore.items.map(c => ({ id: c.id, name: c.title }))
  }
  return playlistStore.items.map(p => ({ id: p.id, name: p.name }))
})
</script>

<template>
  <div class="schedule-page">
    <div class="page-toolbar">
      <h2 class="page-title">Zeitplaene</h2>
      <button class="btn-primary" @click="openNewSchedule">+ Neuer Zeitplan</button>
    </div>

    <!-- Calendar -->
    <div class="calendar-card">
      <div class="calendar-header">
        <button class="btn-icon" @click="prevMonth">&larr;</button>
        <h3 class="calendar-title">{{ monthNames[currentMonth] }} {{ currentYear }}</h3>
        <button class="btn-icon" @click="nextMonth">&rarr;</button>
      </div>
      <div class="calendar-grid">
        <div class="cal-day-header" v-for="d in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" :key="d">{{ d }}</div>
        <div
          v-for="(cell, idx) in calendarDays"
          :key="idx"
          :class="['cal-day', { empty: !cell.day, 'has-schedule': cell.hasSchedule }]"
        >
          <span v-if="cell.day">{{ cell.day }}</span>
        </div>
      </div>
    </div>

    <!-- Schedule List -->
    <div class="schedule-list">
      <div v-for="schedule in scheduleStore.items" :key="schedule.id" class="schedule-item">
        <div class="schedule-info">
          <span class="schedule-name">
            <span class="type-badge">{{ schedule.targetType === 'content' ? 'Inhalt' : 'Playlist' }}</span>
            {{ getTargetName(schedule) }}
          </span>
          <span class="schedule-dates">
            {{ schedule.startDate }} &mdash; {{ schedule.endDate }}
          </span>
          <span class="schedule-locations">Standorte: {{ getLocationNames(schedule.locationIds) || 'Keine' }}</span>
        </div>
        <div class="schedule-actions">
          <label class="toggle-switch">
            <input type="checkbox" :checked="schedule.isActive" @change="toggleActive(schedule)" />
            <span class="toggle-label-text">{{ schedule.isActive ? 'Aktiv' : 'Inaktiv' }}</span>
          </label>
          <button class="btn-sm btn-danger" @click="deleteSchedule(schedule.id)">Loeschen</button>
        </div>
      </div>
      <p v-if="!scheduleStore.items.length" class="empty-text">Keine Zeitplaene vorhanden.</p>
    </div>

    <!-- New Schedule Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Neuer Zeitplan</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Typ</label>
            <select v-model="newSchedule.targetType" class="form-input">
              <option value="content">Inhalt</option>
              <option value="playlist">Playlist</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ newSchedule.targetType === 'content' ? 'Inhalt' : 'Playlist' }} auswaehlen</label>
            <select v-model="newSchedule.targetId" class="form-input">
              <option value="">-- Bitte waehlen --</option>
              <option v-for="t in availableTargets" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Startdatum</label>
              <input v-model="newSchedule.startDate" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label>Enddatum</label>
              <input v-model="newSchedule.endDate" type="date" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Standorte</label>
            <div class="checkbox-group">
              <label v-for="loc in locationStore.items" :key="loc.id" class="checkbox-label">
                <input
                  type="checkbox"
                  :checked="newSchedule.locationIds.includes(loc.id)"
                  @change="toggleLocation(loc.id)"
                />
                {{ loc.name }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Wiederholung</label>
            <select v-model="newSchedule.recurrence" class="form-input">
              <option value="none">Keine</option>
              <option value="daily">Taeglich</option>
              <option value="weekly">Woechentlich</option>
              <option value="monthly">Monatlich</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal = false">Abbrechen</button>
          <button class="btn-primary" @click="saveSchedule">Erstellen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-page { max-width: 1200px; }

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

.calendar-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  margin-bottom: 24px;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.calendar-title {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: 600;
  color: var(--blickle-navy);
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-day-header {
  text-align: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--gray-500);
  padding: 4px;
}
.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}
.cal-day.empty { background: transparent; }
.cal-day:not(.empty) { background: var(--gray-50); }
.cal-day.has-schedule { background: var(--blickle-green); color: white; font-weight: 700; }

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.schedule-item {
  background: var(--blickle-white);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}
.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.schedule-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--blickle-navy);
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-badge {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--gray-100);
  color: var(--gray-600);
  font-weight: 700;
}
.schedule-dates {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.schedule-locations {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.schedule-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.toggle-label-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
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
  padding: 4px 12px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.btn-danger { color: var(--color-danger); }
.btn-danger:hover { background: var(--color-danger-light); }
.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--gray-500);
  background: var(--gray-50);
  border: 1px solid var(--color-border);
  font-size: 1rem;
}
.btn-icon:hover { background: var(--gray-100); }

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
