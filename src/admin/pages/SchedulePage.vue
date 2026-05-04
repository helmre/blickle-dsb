<script setup>
import { ref, computed } from 'vue'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useDisplayProgramStore } from '../../shared/stores/displayProgramStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import {
  DEFAULT_TZ,
  WEEKDAYS,
  buildCalendarDays,
  createDefaultScheduleDraft,
  describeSchedule,
  normalizeScheduleDraft,
  scheduleCoversDate,
  validateScheduleDraft,
  weekdayPreset,
} from '../../shared/scheduling/scheduleRules.js'
import { getLocationScopeIds } from '../../shared/displayEngine/contentEligibility.js'
import {
  scheduleMatchesLocation as scheduleMatchesLocationScope,
  schedulesForTarget,
} from '../../shared/displayEngine/playlistResolver.js'
import { isCurrentlyValid, isScheduleActiveNow } from '../../shared/utils/datetime.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const scheduleStore = useScheduleStore()
const contentStore = useContentStore()
const playlistStore = usePlaylistStore()
const programStore = useDisplayProgramStore()
const locationStore = useLocationStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const showModal = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedLocationId = ref('')
const selectedTargetType = ref('all')
const selectedStatus = ref('active')
const selectedTimeFilter = ref('all')
const selectedRangePreset = ref('thisWeek')
const customStartDate = ref('')
const customEndDate = ref('')

const newSchedule = ref(createDefaultScheduleDraft())
const modalTouched = ref(false)
const pendingScheduleDelete = ref(null)
const isDeletingSchedule = ref(false)
const BUSY_RELEASE_MS = 250

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

function pad(value) {
  return String(value).padStart(2, '0')
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateKey(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfWeek(date) {
  const next = new Date(date)
  const day = (next.getDay() + 6) % 7
  next.setDate(next.getDate() - day)
  return next
}

function endOfWeek(date) {
  return addDays(startOfWeek(date), 6)
}

function minutesFromTime(value) {
  if (!value) return null
  const [h, m] = String(value).split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function scheduleOverlapsMinutes(schedule, rangeStart, rangeEnd) {
  const start = minutesFromTime(schedule.timeStart)
  const end = minutesFromTime(schedule.timeEnd)
  if (start === null || end === null) return false
  if (start <= end) return start < rangeEnd && end > rangeStart
  return (start < 1440 && 1440 > rangeStart) || (0 < rangeEnd && end > 0)
}

function timeSegments(schedule) {
  const start = minutesFromTime(schedule.timeStart)
  const end = minutesFromTime(schedule.timeEnd)
  if (start === null || end === null) return [[0, 1440]]
  if (start <= end) return [[start, end]]
  return [[start, 1440], [0, end]]
}

function schedulesOverlapInTime(a, b) {
  return timeSegments(a).some(([aStart, aEnd]) =>
    timeSegments(b).some(([bStart, bEnd]) => aStart < bEnd && aEnd > bStart)
  )
}

function formatAgendaDate(dateStr) {
  const date = parseDateKey(dateStr)
  if (!date) return dateStr
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

const selectedRange = computed(() => {
  const today = new Date()
  if (selectedRangePreset.value === 'today') {
    const key = dateKey(today)
    return { start: key, end: key }
  }
  if (selectedRangePreset.value === 'tomorrow') {
    const key = dateKey(addDays(today, 1))
    return { start: key, end: key }
  }
  if (selectedRangePreset.value === 'nextWeek') {
    const start = startOfWeek(addDays(today, 7))
    return { start: dateKey(start), end: dateKey(endOfWeek(start)) }
  }
  if (selectedRangePreset.value === 'thisMonth') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { start: dateKey(start), end: dateKey(end) }
  }
  if (selectedRangePreset.value === 'custom') {
    return {
      start: customStartDate.value || dateKey(today),
      end: customEndDate.value || customStartDate.value || dateKey(today),
    }
  }

  const start = startOfWeek(today)
  return { start: dateKey(start), end: dateKey(endOfWeek(start)) }
})

const selectedRangeLabel = computed(() => {
  const { start, end } = selectedRange.value
  if (start === end) return formatAgendaDate(start)
  return `${formatAgendaDate(start)} bis ${formatAgendaDate(end)}`
})

function dateKeysInRange(start, end) {
  const startDate = parseDateKey(start)
  const endDate = parseDateKey(end)
  if (!startDate || !endDate) return []
  const dates = []
  for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
    dates.push(dateKey(date))
  }
  return dates
}

const selectedLocationScopeIds = computed(() => getLocationScopeIds(selectedLocationId.value, locationStore.items))

function scheduleMatchesSelectedLocation(schedule) {
  if (!selectedLocationId.value) return true
  return scheduleMatchesLocationScope(schedule, selectedLocationScopeIds.value)
}

function scheduleMatchesRange(schedule) {
  return dateKeysInRange(selectedRange.value.start, selectedRange.value.end)
    .some(date => scheduleCoversDate({ ...schedule, isActive: true }, date))
}

function scheduleMatchesStatus(schedule) {
  if (selectedStatus.value === 'all') return true
  if (selectedStatus.value === 'active') return schedule.isActive !== false
  if (selectedStatus.value === 'inactive') return schedule.isActive === false
  if (selectedStatus.value === 'current') {
    return isScheduleActiveNow(schedule, new Date())
  }
  if (selectedStatus.value === 'future') {
    return schedule.isActive !== false && (schedule.startDate || '') > dateKey(new Date())
  }
  if (selectedStatus.value === 'expired') {
    return schedule.endDate && schedule.endDate < dateKey(new Date())
  }
  return true
}

function scheduleMatchesTimeFilter(schedule) {
  if (selectedTimeFilter.value === 'all') return true
  const hasWindow = Boolean(schedule.timeStart && schedule.timeEnd)
  if (selectedTimeFilter.value === 'timed') return hasWindow
  if (selectedTimeFilter.value === 'allDay') return !hasWindow
  if (selectedTimeFilter.value === 'morning') return scheduleOverlapsMinutes(schedule, 0, 12 * 60)
  if (selectedTimeFilter.value === 'afternoon') return scheduleOverlapsMinutes(schedule, 12 * 60, 18 * 60)
  return true
}

function contentMatchesSelectedLocation(content) {
  if (!selectedLocationId.value) return true
  if (!content.locationIds || content.locationIds.length === 0) return true
  return content.locationIds.some(id => selectedLocationScopeIds.value.includes(id))
}

function contentVisibleOnDate(content, date) {
  const noon = new Date(`${date}T12:00:00`)
  return content.status === 'approved' &&
    isCurrentlyValid(content.validFrom, content.validUntil, noon.getTime()) &&
    contentMatchesSelectedLocation(content)
}

function makeImplicitContentEntry(content, date) {
  return {
    id: `implicit-${date}-${content.id}`,
    targetType: 'content',
    targetId: content.id,
    sourceKind: 'implicit-content',
    startDate: date,
    endDate: date,
    locationIds: content.locationIds || [],
    recurrence: 'none',
    timeStart: null,
    timeEnd: null,
    weekdays: null,
    isActive: true,
  }
}

function implicitContentEntriesForDate(date) {
  if (
    (selectedTargetType.value !== 'all' && selectedTargetType.value !== 'content') ||
    selectedStatus.value === 'inactive' ||
    selectedTimeFilter.value === 'timed'
  ) {
    return []
  }

  return contentStore.items
    .filter(content => schedulesForTarget(scheduleStore.items, 'content', content.id).length === 0)
    .filter(content => contentVisibleOnDate(content, date))
    .map(content => makeImplicitContentEntry(content, date))
}

const filteredSchedules = computed(() => {
  return scheduleStore.items
    .filter(schedule => selectedTargetType.value === 'all' || schedule.targetType === selectedTargetType.value)
    .filter(scheduleMatchesSelectedLocation)
    .filter(scheduleMatchesRange)
    .filter(scheduleMatchesStatus)
    .filter(scheduleMatchesTimeFilter)
})

const calendarDays = computed(() => {
  return buildCalendarDays({
    year: currentYear.value,
    month: currentMonth.value,
    schedules: [
      ...filteredSchedules.value.map(schedule => ({ ...schedule, isActive: true })),
      ...dateKeysInRange(
        dateKey(new Date(currentYear.value, currentMonth.value, 1)),
        dateKey(new Date(currentYear.value, currentMonth.value + 1, 0))
      ).flatMap(date => implicitContentEntriesForDate(date)),
    ],
  })
})

const contentById = computed(() => new Map(contentStore.items.map(content => [content.id, content])))
const playlistById = computed(() => new Map(playlistStore.items.map(playlist => [playlist.id, playlist])))
const programById = computed(() => new Map(programStore.items.map(program => [program.id, program])))
const locationById = computed(() => new Map(locationStore.items.map(location => [location.id, location])))
const scheduleIssues = computed(() => validateScheduleDraft(newSchedule.value))
const canSaveSchedule = computed(() => scheduleIssues.value.length === 0)
const canManage = computed(() => userStore.can(PERMISSIONS.SCHEDULE_MANAGE))
const pendingScheduleDeleteMessage = computed(() => {
  if (!pendingScheduleDelete.value) return ''
  return `Zeitplan "${describe(pendingScheduleDelete.value).targetName}" wirklich löschen?`
})
const activeSchedulesCount = computed(() => scheduleStore.items.filter(schedule => schedule.isActive !== false).length)
const playlistSchedulesCount = computed(() => scheduleStore.items.filter(schedule => schedule.targetType === 'playlist').length)
const programSchedulesCount = computed(() => scheduleStore.items.filter(schedule => schedule.targetType === 'program').length)
const timedSchedulesCount = computed(() => scheduleStore.items.filter(schedule => schedule.timeStart && schedule.timeEnd).length)
const agendaDays = computed(() => {
  return dateKeysInRange(selectedRange.value.start, selectedRange.value.end)
    .map(date => {
      const explicitSchedules = filteredSchedules.value
        .filter(schedule => scheduleCoversDate({ ...schedule, isActive: true }, date))
      const implicitContent = implicitContentEntriesForDate(date)

      return {
        date,
        label: formatAgendaDate(date),
        schedules: [...explicitSchedules, ...implicitContent]
        .sort((a, b) => {
          const aTime = a.timeStart || '00:00'
          const bTime = b.timeStart || '00:00'
          return aTime.localeCompare(bTime) || describe(a).targetName.localeCompare(describe(b).targetName)
        }),
      }
    })
    .filter(day => day.schedules.length > 0)
})

function agendaTypeLabel(schedule) {
  if (schedule.sourceKind === 'implicit-content') return 'Sichtbar ohne Zeitplan'
  if (schedule.targetType === 'content') return 'Zeitplan: Inhalt'
  if (schedule.targetType === 'playlist') return 'Zeitplan: Playlist'
  return 'Zeitplan: Programm'
}

function agendaStatusLabel(schedule) {
  if (schedule.sourceKind === 'implicit-content') return 'Sichtbar'
  return schedule.isActive === false ? 'Inaktiv' : 'Aktiv'
}

function scheduleLocationIds(schedule) {
  const ids = schedule.locationIds || []
  if (!ids.length || ids.includes('loc-global')) {
    return locationStore.displayLocations.map(location => location.id)
  }
  return ids
}

function targetExists(schedule) {
  if (schedule.targetType === 'content') return contentById.value.has(schedule.targetId)
  if (schedule.targetType === 'playlist') return playlistById.value.has(schedule.targetId)
  if (schedule.targetType === 'program') return programById.value.has(schedule.targetId)
  return false
}

const planningWarnings = computed(() => {
  const warnings = []
  const seen = new Set()
  const rangeDates = dateKeysInRange(selectedRange.value.start, selectedRange.value.end)

  filteredSchedules.value.forEach(schedule => {
    const description = describe(schedule)
    if (!targetExists(schedule)) {
      warnings.push({
        key: `missing-${schedule.id}`,
        level: 'critical',
        title: 'Ziel nicht gefunden',
        text: `${description.targetName} verweist auf einen gelöschten oder unbekannten Datensatz.`,
      })
    }

    if (schedule.targetType === 'content') {
      const content = contentById.value.get(schedule.targetId)
      if (content && content.status !== 'approved') {
        warnings.push({
          key: `approval-${schedule.id}`,
          level: 'warning',
          title: 'Inhalt nicht freigegeben',
          text: `"${content.title}" ist geplant, hat aber den Status "${content.status || 'unbekannt'}".`,
        })
      }
    }
  })

  rangeDates.forEach(date => {
    const playlistSchedules = filteredSchedules.value
      .filter(schedule => schedule.targetType === 'playlist')
      .filter(schedule => schedule.isActive !== false)
      .filter(schedule => scheduleCoversDate({ ...schedule, isActive: true }, date))

    for (let i = 0; i < playlistSchedules.length; i++) {
      for (let j = i + 1; j < playlistSchedules.length; j++) {
        const a = playlistSchedules[i]
        const b = playlistSchedules[j]
        if (!schedulesOverlapInTime(a, b)) continue
        const sharedLocations = scheduleLocationIds(a).filter(id => scheduleLocationIds(b).includes(id))
        sharedLocations.forEach(locationId => {
          const key = `playlist-overlap-${date}-${locationId}-${a.id}-${b.id}`
          if (seen.has(key)) return
          seen.add(key)
          const locationName = locationById.value.get(locationId)?.name || locationId
          warnings.push({
            key,
            level: 'warning',
            title: 'Playlist-Überschneidung',
            text: `${formatAgendaDate(date)} in ${locationName}: "${describe(a).targetName}" und "${describe(b).targetName}" sind gleichzeitig geplant.`,
          })
        })
      }
    }
  })

  return warnings
})

function issueFor(key) {
  return scheduleIssues.value.find(issue => issue.key === key)
}

function describe(schedule) {
  return describeSchedule(schedule, {
    contentById: contentById.value,
    playlistById: playlistById.value,
    programById: programById.value,
    locationById: locationById.value,
  })
}

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

function toggleActive(schedule) {
  if (!canManage.value) return
  const nextActive = schedule.isActive === false
  scheduleStore.update(schedule.id, { isActive: nextActive })
  safeAuditLog(auditStore, 'schedule.toggled', 'schedule', schedule.id, userStore.currentUser.id, { isActive: nextActive })
}

function openNewSchedule() {
  if (!canManage.value) return
  newSchedule.value = createDefaultScheduleDraft()
  modalTouched.value = false
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

function toggleWeekday(value) {
  const arr = newSchedule.value.weekdays
  const idx = arr.indexOf(value)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(value)
}

function selectWeekdayPreset(preset) {
  newSchedule.value.weekdays = weekdayPreset(preset)
}

function onRecurrenceChange() {
  const r = newSchedule.value.recurrence
  if (r === 'daily') selectWeekdayPreset('all')
  else if (r === 'weekly' && newSchedule.value.weekdays.length === 0) selectWeekdayPreset('workdays')
}

function saveSchedule() {
  if (!canManage.value) return
  modalTouched.value = true
  if (!canSaveSchedule.value) return
  const item = scheduleStore.add(normalizeScheduleDraft(newSchedule.value))
  safeAuditLog(auditStore, 'schedule.created', 'schedule', item.id, userStore.currentUser.id, { targetId: item.targetId })
  showModal.value = false
}

function deleteSchedule(schedule) {
  if (!canManage.value) return
  pendingScheduleDelete.value = schedule
}

async function confirmDeleteSchedule() {
  if (!canManage.value || !pendingScheduleDelete.value || isDeletingSchedule.value) return
  isDeletingSchedule.value = true
  const id = pendingScheduleDelete.value.id
  try {
    scheduleStore.remove(id)
    safeAuditLog(auditStore, 'schedule.deleted', 'schedule', id, userStore.currentUser.id)
    pendingScheduleDelete.value = null
  } finally {
    setTimeout(() => {
      isDeletingSchedule.value = false
    }, BUSY_RELEASE_MS)
  }
}

const availableTargets = computed(() => {
  if (newSchedule.value.targetType === 'content') {
    return contentStore.items.map(c => ({ id: c.id, name: c.title }))
  }
  if (newSchedule.value.targetType === 'program') {
    return programStore.items.map(p => ({ id: p.id, name: p.name }))
  }
  return playlistStore.items.map(p => ({ id: p.id, name: p.name }))
})

function targetTypeLabel(type) {
  if (type === 'content') return 'Inhalt'
  if (type === 'playlist') return 'Playlist'
  if (type === 'program') return 'Programm'
  return 'Ziel'
}

function onTargetTypeChange() {
  newSchedule.value.targetId = ''
}

function syncCalendarToRange() {
  const start = parseDateKey(selectedRange.value.start)
  if (!start) return
  currentYear.value = start.getFullYear()
  currentMonth.value = start.getMonth()
}

function focusCalendarDay(cell) {
  if (!cell.date) return
  selectedRangePreset.value = 'custom'
  customStartDate.value = cell.date
  customEndDate.value = cell.date
}
</script>

<template>
  <div class="schedule-page">
    <div class="page-toolbar">
      <div>
        <h2 class="page-title">Zeitpläne</h2>
        <p class="page-subtitle">Regeln für Inhalte und Playlists: Zeitraum, Uhrzeit, Wochentage und Standorte.</p>
      </div>
      <button v-if="canManage" class="btn-primary" @click="openNewSchedule">+ Neuer Zeitplan</button>
    </div>

    <section class="schedule-stats">
      <article>
        <span>Gesamt</span>
        <strong>{{ scheduleStore.items.length }}</strong>
      </article>
      <article>
        <span>Aktiv</span>
        <strong>{{ activeSchedulesCount }}</strong>
      </article>
      <article>
        <span>Playlist-Regeln</span>
        <strong>{{ playlistSchedulesCount }}</strong>
      </article>
      <article>
        <span>Programm-Regeln</span>
        <strong>{{ programSchedulesCount }}</strong>
      </article>
      <article>
        <span>Mit Uhrzeit</span>
        <strong>{{ timedSchedulesCount }}</strong>
      </article>
      <article>
        <span>Gefiltert</span>
        <strong>{{ filteredSchedules.length }}</strong>
      </article>
    </section>

    <section class="filter-card">
      <div class="filter-head">
        <div>
          <h3>Ausspielung prüfen</h3>
          <p>{{ selectedRangeLabel }}</p>
        </div>
        <button class="btn-secondary" type="button" @click="syncCalendarToRange">Kalender ausrichten</button>
      </div>
      <div class="filter-grid">
        <label class="filter-field">
          <span>Standort</span>
          <select v-model="selectedLocationId" class="form-input">
            <option value="">Alle Standorte</option>
            <option v-for="loc in locationStore.displayLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </label>
        <label class="filter-field">
          <span>Zeitraum</span>
          <select v-model="selectedRangePreset" class="form-input">
            <option value="today">Heute</option>
            <option value="tomorrow">Morgen</option>
            <option value="thisWeek">Diese Woche</option>
            <option value="nextWeek">Nächste Woche</option>
            <option value="thisMonth">Dieser Monat</option>
            <option value="custom">Benutzerdefiniert</option>
          </select>
        </label>
        <label class="filter-field">
          <span>Typ</span>
          <select v-model="selectedTargetType" class="form-input">
            <option value="all">Alle</option>
            <option value="content">Inhalte</option>
            <option value="playlist">Playlists</option>
            <option value="program">Programme</option>
          </select>
        </label>
        <label class="filter-field">
          <span>Status</span>
          <select v-model="selectedStatus" class="form-input">
            <option value="all">Alle</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
            <option value="current">Heute laufend</option>
            <option value="future">Künftig</option>
            <option value="expired">Abgelaufen</option>
          </select>
        </label>
        <label class="filter-field">
          <span>Zeitfenster</span>
          <select v-model="selectedTimeFilter" class="form-input">
            <option value="all">Alle</option>
            <option value="timed">Nur mit Uhrzeit</option>
            <option value="allDay">Ganztägig</option>
            <option value="morning">Vormittags</option>
            <option value="afternoon">Nachmittags</option>
          </select>
        </label>
      </div>
      <div v-if="selectedRangePreset === 'custom'" class="custom-range">
        <label class="filter-field">
          <span>Von</span>
          <input v-model="customStartDate" type="date" class="form-input" />
        </label>
        <label class="filter-field">
          <span>Bis</span>
          <input v-model="customEndDate" type="date" class="form-input" />
        </label>
      </div>
      <div v-if="planningWarnings.length" class="warning-panel">
        <div class="warning-panel-head">
          <strong>Planungsprüfung</strong>
          <span>{{ planningWarnings.length }} Hinweis(e)</span>
        </div>
        <ul>
          <li v-for="warning in planningWarnings" :key="warning.key" :class="warning.level">
            <strong>{{ warning.title }}</strong>
            <span>{{ warning.text }}</span>
          </li>
        </ul>
      </div>
    </section>

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
          :class="['cal-day', { empty: !cell.day, 'has-schedule': cell.hasSchedule, selected: cell.date && selectedRange.start === cell.date && selectedRange.end === cell.date }]"
          @click="focusCalendarDay(cell)"
        >
          <span v-if="cell.day">{{ cell.day }}</span>
          <small v-if="cell.scheduleCount">{{ cell.scheduleCount }}</small>
        </div>
      </div>
    </div>

    <section class="agenda-card">
      <div class="agenda-header">
        <div>
          <h3>Agenda</h3>
          <p>Gefilterte Ausspielungen nach Tag, Uhrzeit und Standort.</p>
        </div>
        <span>{{ agendaDays.reduce((sum, day) => sum + day.schedules.length, 0) }} Einträge</span>
      </div>
      <div v-if="agendaDays.length" class="agenda-list">
        <article v-for="day in agendaDays" :key="day.date" class="agenda-day">
          <h4>{{ day.label }}</h4>
          <div class="agenda-items">
            <div v-for="schedule in day.schedules" :key="`${day.date}-${schedule.id}`" class="agenda-item">
              <span class="agenda-time">{{ describe(schedule).timeWindow }}</span>
              <div class="agenda-main">
                <strong>{{ describe(schedule).targetName }}</strong>
                <small>
                  {{ agendaTypeLabel(schedule) }}
                  · {{ describe(schedule).locationNames || 'Alle Standorte' }}
                  · {{ describe(schedule).weekdays }}
                </small>
              </div>
              <span :class="['agenda-status', { inactive: schedule.isActive === false, implicit: schedule.sourceKind === 'implicit-content' }]">
                {{ agendaStatusLabel(schedule) }}
              </span>
            </div>
          </div>
        </article>
      </div>
      <p v-else class="empty-text">Für diese Filter gibt es keine geplanten Ausspielungen.</p>
    </section>

    <!-- Schedule List -->
    <div class="schedule-list">
      <div v-for="schedule in filteredSchedules" :key="schedule.id" class="schedule-item">
        <div class="schedule-info">
          <span class="schedule-name">
            <span class="type-badge">{{ targetTypeLabel(schedule.targetType) }}</span>
            {{ describe(schedule).targetName }}
          </span>
          <span class="schedule-dates">
            {{ describe(schedule).dateRange }}
            <span class="time-window">{{ describe(schedule).timeWindow }}</span>
            <span class="tz-badge">{{ DEFAULT_TZ }}</span>
          </span>
          <span class="schedule-locations">Standorte: {{ describe(schedule).locationNames || 'Alle Standorte' }}</span>
          <span class="schedule-weekdays">Tage: {{ describe(schedule).weekdays }}</span>
        </div>
        <div v-if="canManage" class="schedule-actions">
          <label class="toggle-switch">
            <input type="checkbox" :checked="schedule.isActive !== false" @change="toggleActive(schedule)" />
            <span class="toggle-label-text">{{ schedule.isActive !== false ? 'Aktiv' : 'Inaktiv' }}</span>
          </label>
          <button class="btn-sm btn-danger" :disabled="isDeletingSchedule" @click="deleteSchedule(schedule)">
            {{ isDeletingSchedule ? 'Löscht...' : 'Löschen' }}
          </button>
        </div>
      </div>
      <p v-if="!filteredSchedules.length" class="empty-text">Keine Zeitpläne für die aktuelle Filterauswahl.</p>
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
            <select v-model="newSchedule.targetType" class="form-input" @change="onTargetTypeChange">
              <option value="content">Inhalt</option>
              <option value="playlist">Playlist</option>
              <option value="program">Programm</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ targetTypeLabel(newSchedule.targetType) }} auswählen</label>
            <select v-model="newSchedule.targetId" class="form-input">
              <option value="">-- Bitte wählen --</option>
              <option v-for="t in availableTargets" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <p v-if="modalTouched && issueFor('targetId')" class="field-error">{{ issueFor('targetId').message }}</p>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start <span class="tz-hint">({{ DEFAULT_TZ }})</span></label>
              <input v-model="newSchedule.startDate" type="date" class="form-input" />
              <p v-if="modalTouched && issueFor('startDate')" class="field-error">{{ issueFor('startDate').message }}</p>
            </div>
            <div class="form-group">
              <label>Ende <span class="tz-hint">({{ DEFAULT_TZ }})</span></label>
              <input v-model="newSchedule.endDate" type="date" class="form-input" />
              <p v-if="modalTouched && (issueFor('endDate') || issueFor('dateRange'))" class="field-error">
                {{ (issueFor('endDate') || issueFor('dateRange')).message }}
              </p>
            </div>
          </div>

          <div class="form-group">
            <label>Uhrzeit</label>
            <div class="radio-stack">
              <label class="radio-label">
                <input type="radio" :value="true" v-model="newSchedule.allDay" />
                Ganztägig
              </label>
              <label class="radio-label">
                <input type="radio" :value="false" v-model="newSchedule.allDay" />
                Nur zu bestimmter Uhrzeit
              </label>
            </div>
            <div v-if="!newSchedule.allDay" class="time-row">
              <div class="time-field">
                <label class="time-label">Von</label>
                <input v-model="newSchedule.timeStart" type="time" class="form-input" />
              </div>
              <div class="time-field">
                <label class="time-label">Bis</label>
                <input v-model="newSchedule.timeEnd" type="time" class="form-input" />
              </div>
            </div>
            <p v-if="!newSchedule.allDay" class="hint-text">
              Tipp: Ein Fenster über Mitternacht (z.B. 22:00&ndash;06:00) wird als durchgehend gewertet.
            </p>
            <p v-if="modalTouched && issueFor('timeWindow')" class="field-error">{{ issueFor('timeWindow').message }}</p>
          </div>

          <div class="form-group">
            <label>Wochentage</label>
            <div class="weekday-row">
              <button
                v-for="w in WEEKDAYS"
                :key="w.value"
                type="button"
                :class="['weekday-btn', { active: newSchedule.weekdays.includes(w.value) }]"
                @click="toggleWeekday(w.value)"
              >{{ w.label }}</button>
            </div>
            <div class="weekday-presets">
              <button type="button" class="chip-btn" @click="selectWeekdayPreset('all')">Alle</button>
              <button type="button" class="chip-btn" @click="selectWeekdayPreset('workdays')">Werktags</button>
              <button type="button" class="chip-btn" @click="selectWeekdayPreset('weekend')">Wochenende</button>
              <button type="button" class="chip-btn" @click="selectWeekdayPreset('none')">Keine</button>
            </div>
            <p class="hint-text">Leer = jeden Tag im Datumsbereich.</p>
          </div>

          <div class="form-group">
            <label>Standorte</label>
            <div class="checkbox-group">
              <label v-for="loc in locationStore.displayLocations" :key="loc.id" class="checkbox-label">
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
            <label>Wiederholung <span class="tz-hint">(Voreinstellung)</span></label>
            <select v-model="newSchedule.recurrence" class="form-input" @change="onRecurrenceChange">
              <option value="none">Keine</option>
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="monthly">Monatlich</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <span v-if="modalTouched && scheduleIssues.length" class="modal-error">{{ scheduleIssues.length }} Punkt(e) prüfen</span>
          <button class="btn-secondary" @click="showModal = false">Abbrechen</button>
          <button class="btn-primary" :disabled="modalTouched && !canSaveSchedule" @click="saveSchedule">Erstellen</button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="Boolean(pendingScheduleDelete)"
      title="Zeitplan löschen"
      :message="pendingScheduleDeleteMessage"
      confirm-label="Löschen"
      confirm-variant="danger"
      @confirm="confirmDeleteSchedule"
      @cancel="pendingScheduleDelete = null"
    />
  </div>
</template>

<style scoped>
.schedule-page { max-width: 1200px; }

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}
.page-title {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--blickle-navy);
  margin: 0;
}
.page-subtitle {
  margin: 4px 0 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.schedule-stats {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.schedule-stats article {
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
}
.schedule-stats span {
  display: block;
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}
.schedule-stats strong {
  display: block;
  margin-top: 4px;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.filter-card,
.agenda-card {
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 18px 20px;
  margin-bottom: 24px;
}

.filter-head,
.agenda-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-head h3,
.agenda-header h3 {
  margin: 0;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.05rem;
}

.filter-head p,
.agenda-header p {
  margin: 4px 0 0;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-field span {
  color: var(--gray-600);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.custom-range {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  margin-top: 12px;
}

.warning-panel {
  margin-top: 14px;
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-radius: var(--radius-md);
  background: #fffbeb;
  overflow: hidden;
}

.warning-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(245, 158, 11, 0.24);
  color: var(--blickle-navy);
}

.warning-panel-head strong {
  font-family: var(--font-display);
  font-size: 0.9rem;
}

.warning-panel-head span {
  color: #92400e;
  font-size: 0.72rem;
  font-weight: 800;
}

.warning-panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.warning-panel li {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid rgba(245, 158, 11, 0.18);
}

.warning-panel li:first-child {
  border-top: 0;
}

.warning-panel li.critical {
  background: #fef2f2;
}

.warning-panel li strong {
  color: var(--blickle-navy);
  font-size: 0.78rem;
}

.warning-panel li span {
  color: #78350f;
  font-size: 0.78rem;
  line-height: 1.4;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  gap: 2px;
}
.cal-day:not(.empty) { cursor: pointer; }
.cal-day.empty { background: transparent; cursor: default; }
.cal-day:not(.empty) { background: var(--gray-50); }
.cal-day.has-schedule { background: var(--blickle-green); color: white; font-weight: 700; }
.cal-day.selected {
  outline: 2px solid var(--blickle-navy);
  outline-offset: 2px;
}
.cal-day small {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.24);
  font-size: 0.65rem;
  }

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agenda-header span {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(181, 204, 24, 0.16);
  color: var(--blickle-navy);
  font-size: 0.72rem;
  font-weight: 800;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.agenda-day {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.agenda-day h4 {
  margin: 0;
  padding: 10px 14px;
  background: var(--gray-50);
  color: var(--blickle-navy);
  font-size: var(--font-size-sm);
  font-weight: 800;
}

.agenda-items {
  display: flex;
  flex-direction: column;
}

.agenda-item {
  display: grid;
  grid-template-columns: 112px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-top: 1px solid var(--color-border);
}

.agenda-time {
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 800;
}

.agenda-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.agenda-main strong {
  color: var(--blickle-navy);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agenda-main small {
  color: var(--gray-600);
  font-size: var(--font-size-xs);
}

.agenda-status {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(181, 204, 24, 0.16);
  color: var(--blickle-navy);
  font-size: 0.68rem;
  font-weight: 800;
}

.agenda-status.inactive {
  background: var(--gray-100);
  color: var(--gray-500);
}

.agenda-status.implicit {
  background: rgba(22, 58, 108, 0.09);
  color: var(--blickle-navy);
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
.schedule-weekdays {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.time-window {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(181, 204, 24, 0.18);
  color: var(--blickle-navy);
  font-weight: 600;
  font-size: 0.7rem;
}
.tz-badge {
  font-size: 0.65rem;
  padding: 1px 6px;
  margin-left: 6px;
  border-radius: 4px;
  background: var(--gray-100);
  color: var(--gray-500);
  font-weight: 500;
  letter-spacing: 0.02em;
}
.tz-hint {
  font-size: 0.7rem;
  color: var(--gray-500);
  font-weight: 400;
  margin-left: 4px;
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
.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
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
.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-danger { color: var(--color-danger); }
.btn-danger:hover:not(:disabled) { background: var(--color-danger-light); }
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

.radio-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}
.time-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.time-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-600);
}
.hint-text {
  margin-top: 6px;
  font-size: 0.7rem;
  color: var(--gray-500);
}
.field-error {
  margin: 5px 0 0;
  color: var(--color-danger);
  font-size: 0.74rem;
  line-height: 1.3;
}

.weekday-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.weekday-btn {
  flex: 1 1 auto;
  min-width: 40px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  background: var(--blickle-white);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.15s ease;
}
.weekday-btn:hover { background: var(--gray-50); }
.weekday-btn.active {
  background: var(--blickle-navy);
  color: var(--blickle-white);
  border-color: var(--blickle-navy);
}
.weekday-presets {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.chip-btn {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  background: var(--gray-50);
  color: var(--gray-600);
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
}
.chip-btn:hover { background: var(--gray-100); }

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
  align-items: center;
  gap: 8px;
}
.modal-error {
  margin-right: auto;
  color: var(--color-danger);
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 760px) {
  .page-toolbar,
  .schedule-item {
    align-items: stretch;
    flex-direction: column;
  }

  .schedule-stats,
  .filter-grid,
  .form-row,
  .time-row {
    grid-template-columns: 1fr;
  }

  .custom-range {
    grid-template-columns: 1fr;
  }

  .agenda-item {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .warning-panel li {
    grid-template-columns: 1fr;
  }
}
</style>
