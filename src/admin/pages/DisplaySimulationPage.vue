<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CalendarClock, MapPin, Monitor } from 'lucide-vue-next'
import DisplayGrid from '../../display/DisplayGrid.vue'
import DisplayTicker from '../../display/DisplayTicker.vue'
import '../../display/display-themes.css'
import SimulationDiagnosticsPanel from '../components/display-simulation/SimulationDiagnosticsPanel.vue'
import SimulationInspector from '../components/display-simulation/SimulationInspector.vue'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { usePlaylistStore } from '../../shared/stores/playlistStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useDisplayContent } from '../../shared/composables/useDisplayContent.js'
import {
  buildContentDiagnostics,
  describeDisplayPage,
  explainPlaylistDecision,
} from '../../shared/displayEngine/displayDecisionEngine.js'

const contentStore = useContentStore()
const locationStore = useLocationStore()
const playlistStore = usePlaylistStore()
const scheduleStore = useScheduleStore()

function pad(value) {
  return String(value).padStart(2, '0')
}

function todayDateInput() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function currentTimeInput() {
  const now = new Date()
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const locationId = ref('')
const simulationDate = ref(todayDateInput())
const simulationTime = ref(currentTimeInput())
const selectedPageIndex = ref(0)
const displayFrameRef = ref(null)
const stageScale = ref(1)

let frameObserver = null

const simulatedNow = computed(() => `${simulationDate.value}T${simulationTime.value || '00:00'}`)
const simulatedDate = computed(() => {
  const date = new Date(simulatedNow.value)
  return Number.isNaN(date.getTime()) ? new Date() : date
})

const {
  activeDisplayProgram,
  activePlaylist,
  displayPages,
  locationContent,
  locationScopeIds,
  navGroups,
  tickerMessages,
} = useDisplayContent(locationId, { now: simulatedNow })

const selectedLocation = computed(() => locationStore.getById(locationId.value) || null)
const selectedPage = computed(() => displayPages.value[selectedPageIndex.value] || displayPages.value[0] || null)
const visibleContentIds = computed(() => new Set(locationContent.value.map(content => content.id)))
const contentById = computed(() => new Map(contentStore.items.map(content => [content.id, content])))
const totalDuration = computed(() => displayPages.value.reduce((sum, page) => sum + Number(page.duration || 0), 0))

watch(displayPages, (pages) => {
  if (selectedPageIndex.value >= pages.length) selectedPageIndex.value = Math.max(0, pages.length - 1)
})

function updateStageScale() {
  const width = displayFrameRef.value?.clientWidth || 0
  if (!width) return
  stageScale.value = width / 1920
}

onMounted(() => {
  updateStageScale()
  window.addEventListener('resize', updateStageScale)
  if (window.ResizeObserver && displayFrameRef.value) {
    frameObserver = new ResizeObserver(updateStageScale)
    frameObserver.observe(displayFrameRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateStageScale)
  frameObserver?.disconnect()
})

function formatDateTime(date) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const contentDiagnostics = computed(() => {
  return buildContentDiagnostics({
    contents: contentStore.items,
    locationId: locationId.value,
    locationScopeIds: locationScopeIds.value,
    now: simulatedDate.value,
    schedules: scheduleStore.items,
    visibleContentIds: visibleContentIds.value,
  })
})

const playlistDecision = computed(() => {
  return explainPlaylistDecision({
    activePlaylist: activePlaylist.value,
    playlists: playlistStore.items,
    schedules: scheduleStore.items,
    now: simulatedDate.value,
    locationScopeIds: locationScopeIds.value,
  })
})

const pageDecision = computed(() => {
  return describeDisplayPage(selectedPage.value, {
    activePlaylist: activePlaylist.value,
    contentById: contentById.value,
    locationName: selectedLocation.value?.name || 'Global / ungefiltert',
    locationScopeIds: locationScopeIds.value,
  })
})

const diagnosticSummary = computed(() => {
  const visible = contentDiagnostics.value.filter(item => item.visible).length
  return {
    visible,
    hidden: contentDiagnostics.value.length - visible,
    scheduled: contentDiagnostics.value.filter(item => item.scheduleCount > 0).length,
    blockedBySchedule: contentDiagnostics.value.filter(item =>
      !item.visible && item.reason === 'Zeitplan aktuell inaktiv'
    ).length,
  }
})

function pageContentLabel(page) {
  const ids = (page.zones || []).map(zone => zone.contentId).filter(Boolean)
  if (!ids.length) return 'Systemseite'
  return ids
    .map(id => contentStore.getById(id)?.title || id)
    .join(', ')
}

function selectGroup(group) {
  selectedPageIndex.value = group.firstPageIndex
}
</script>

<template>
  <div class="simulation-page">
    <header class="sim-header">
      <div>
        <p class="eyebrow">Display-Simulation</p>
        <h1>Was läuft wann auf welchem Bildschirm?</h1>
      </div>
      <a class="open-display" :href="`#/display/${locationId}`" target="_blank" rel="noopener noreferrer">
        <Monitor :size="16" />
        <span>Echte Display-Route öffnen</span>
      </a>
    </header>

    <section class="control-strip">
      <label class="control-field">
        <span><MapPin :size="15" /> Standort</span>
        <select v-model="locationId">
          <option value="">Global / ungefiltert</option>
          <option v-for="location in locationStore.displayLocations" :key="location.id" :value="location.id">
            {{ location.name }}
          </option>
        </select>
      </label>
      <label class="control-field">
        <span><CalendarClock :size="15" /> Datum</span>
        <input v-model="simulationDate" type="date" />
      </label>
      <label class="control-field">
        <span>Uhrzeit</span>
        <input v-model="simulationTime" type="time" />
      </label>
    </section>

    <div class="simulation-grid">
      <main class="preview-panel">
        <div class="preview-toolbar">
          <div>
            <span class="preview-kicker">{{ selectedLocation?.name || 'Global' }}</span>
            <h2>{{ selectedPage?.label || 'Keine Seite' }}</h2>
          </div>
          <div class="preview-meta">
            <span>{{ formatDateTime(simulatedDate) }}</span>
            <strong>{{ activeDisplayProgram?.name || 'Kein Programm' }} · {{ displayPages.length }} Seiten · {{ totalDuration }}s Zyklus</strong>
          </div>
        </div>

        <div ref="displayFrameRef" class="display-frame">
          <div class="sim-display" data-theme="dark" :style="{ transform: `scale(${stageScale})` }">
            <header class="sim-display-head">
              <img src="/Blicklelogo.png" alt="Blickle" />
              <strong>{{ selectedPage?.label || 'DISPLAY' }}</strong>
              <span>{{ simulationTime }}</span>
            </header>
            <div class="sim-display-body">
              <DisplayGrid v-if="selectedPage" :page="selectedPage" :mediaPaused="true" />
              <div v-else class="empty-display">Keine Display-Seite verfügbar</div>
            </div>
            <DisplayTicker :messages="tickerMessages.slice(0, 4)" />
          </div>
        </div>

        <div class="nav-groups">
          <button
            v-for="group in navGroups"
            :key="group.id"
            type="button"
            :class="['group-chip', { active: selectedPage?.navGroupId === group.id || selectedPage?.id === group.id }]"
            @click="selectGroup(group)"
          >
            {{ group.label }}
          </button>
        </div>
      </main>

      <SimulationInspector
        :diagnostic-summary="diagnosticSummary"
        :display-pages="displayPages"
        :get-page-content-label="pageContentLabel"
        :location-scope-ids="locationScopeIds"
        :page-decision="pageDecision"
        :playlist-decision="playlistDecision"
        :selected-page-index="selectedPageIndex"
        @select-page="selectedPageIndex = $event"
      />
    </div>

    <SimulationDiagnosticsPanel
      :diagnostics="contentDiagnostics"
      :summary="diagnosticSummary"
    />
  </div>
</template>

<style scoped>
.simulation-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 22px 0 34px;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 5px;
  color: var(--blickle-green);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sim-header h1 {
  margin: 0;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.65rem;
  line-height: 1.12;
}

.open-display {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--blickle-green);
  color: var(--blickle-navy);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 800;
}

.control-strip {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 180px 160px;
  gap: 12px;
  padding: 14px;
  margin-bottom: 16px;
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.control-field {
  display: grid;
  gap: 6px;
}

.control-field span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--gray-600);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.control-field select,
.control-field input {
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0 10px;
  font: inherit;
  background: #fff;
}

.simulation-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.preview-panel {
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: 16px;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.preview-kicker {
  display: block;
  margin-bottom: 4px;
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.preview-toolbar h2 {
  margin: 0;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.preview-meta {
  display: grid;
  gap: 4px;
  text-align: right;
  color: var(--gray-500);
  font-size: 0.78rem;
}

.preview-meta strong {
  color: var(--blickle-navy);
}

.display-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  background: #07182d;
  box-shadow: 0 18px 40px rgba(11, 31, 58, 0.22);
}

.sim-display {
  width: 1920px;
  height: 1080px;
  display: grid;
  grid-template-rows: 92px minmax(0, 1fr) 56px;
  gap: 18px;
  padding: 28px;
  box-sizing: border-box;
  background: var(--d-bg);
  color: var(--d-text);
  transform-origin: top left;
  overflow: hidden;
  font-family: var(--font-body);
}

.sim-display-head {
  display: flex;
  align-items: center;
  gap: 34px;
  padding: 0 30px;
  border-radius: 18px;
  background: var(--d-header-bg);
  color: var(--d-clock);
  min-height: 0;
}

.sim-display-head img {
  height: 48px;
  width: auto;
}

.sim-display-head strong {
  flex: 1;
  text-align: center;
  font-family: var(--font-display);
  font-size: 30px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sim-display-head span {
  font-weight: 800;
  font-size: 28px;
}

.sim-display-body {
  min-height: 0;
  overflow: hidden;
}

.empty-display {
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--d-subtitle);
}

.nav-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.group-chip {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--gray-600);
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
}

.group-chip.active {
  border-color: var(--blickle-navy);
  background: var(--blickle-navy);
  color: #fff;
}

:deep(.display-ticker) {
  height: 100%;
  border-radius: 10px;
}

:deep(.ticker-track) {
  animation: none;
}

:deep(.ticker-text) {
  font-size: 20px;
}

@media (max-width: 1180px) {
  .simulation-grid {
    grid-template-columns: 1fr;
  }

  .control-strip {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 780px) {
  .sim-header,
  .preview-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .control-strip {
    grid-template-columns: 1fr;
  }

  .preview-meta {
    text-align: left;
  }
}
</style>
