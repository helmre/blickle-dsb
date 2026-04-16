<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ShopfloorBoard from '../../shared/shopfloor/ShopfloorBoard.vue'
import { useShopfloorStore } from '../../shared/stores/shopfloorStore.js'
import { COLUMN_ORDER } from '../../shared/utils/shopfloorSeed.js'

const store = useShopfloorStore()
const isRunning = ref(false)
const activeCol = ref('S')

function toggleDayStatus(colKey, dayIdx) {
  const col = store.board.columns[colKey]
  const cycle = ['green', 'yellow', 'red', null]
  const current = col.monthStatuses[dayIdx]
  const idx = cycle.indexOf(current)
  col.monthStatuses[dayIdx] = cycle[(idx + 1) % cycle.length]
}

function cycleKpiStatus(colKey) {
  const kpi = store.board.columns[colKey].mainKpi
  const cycle = ['green', 'yellow', 'red']
  const idx = cycle.indexOf(kpi.status)
  kpi.status = cycle[(idx + 1) % cycle.length]
}

const previewFrame = ref(null)
const scale = ref(0.4)
function recomputeScale() {
  if (!previewFrame.value) return
  scale.value = previewFrame.value.clientWidth / 1920
}
let ro = null
onMounted(() => {
  recomputeScale()
  ro = new ResizeObserver(recomputeScale)
  if (previewFrame.value) ro.observe(previewFrame.value)
})
onUnmounted(() => { if (ro) ro.disconnect() })

const activeColData = computed(() => store.board.columns[activeCol.value])
</script>

<template>
  <div class="sfm-demo">
    <div class="demo-toolbar">
      <div>
        <h2 class="page-title">Shopfloor-Board <span class="demo-tag">Klick-Prototyp</span></h2>
        <p class="page-sub">Live-Editor links, 1920×1080-Vorschau rechts. Identisches Rendering wie auf dem Display.</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-ghost" @click="store.reset()">Auf Mock zuruecksetzen</button>
        <button
          class="btn-primary"
          @click="isRunning = !isRunning"
        >{{ isRunning ? 'Rundgang stoppen' : 'Rundgang starten (Timer)' }}</button>
      </div>
    </div>

    <div class="demo-split">
      <aside class="demo-form">
        <section class="fs">
          <h4 class="fs-title">Kopfzeile</h4>
          <label class="fld">
            <span class="fld-label">Abteilung</span>
            <input v-model="store.board.departmentName" type="text" class="fld-input" />
          </label>
          <div class="row-2">
            <label class="fld">
              <span class="fld-label">Monat</span>
              <input v-model="store.board.monthLabel" type="text" class="fld-input" placeholder="Apr 26" />
            </label>
            <label class="fld">
              <span class="fld-label">Heute (Tag 1-31)</span>
              <input v-model.number="store.board.todayDate" type="number" min="1" max="31" class="fld-input" />
            </label>
          </div>
          <label class="fld">
            <span class="fld-label">KW-Label</span>
            <input v-model="store.board.week" type="text" class="fld-input" placeholder="KW 16" />
          </label>
          <div class="row-2">
            <label class="fld">
              <span class="fld-label">Rundgang Uhrzeit</span>
              <input v-model="store.board.rundgang.time" type="text" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">Moderator</span>
              <input v-model="store.board.rundgang.moderator" type="text" class="fld-input" />
            </label>
          </div>
        </section>

        <section class="fs">
          <h4 class="fs-title">Spalte waehlen</h4>
          <div class="col-tabs">
            <button
              v-for="k in COLUMN_ORDER"
              :key="k"
              class="col-tab"
              :class="{ active: activeCol === k }"
              @click="activeCol = k"
            >
              <span class="col-tab-letter">{{ k }}</span>
              <span class="col-tab-label">{{ store.board.columns[k].label }}</span>
            </button>
          </div>
        </section>

        <section class="fs" v-if="activeColData">
          <h4 class="fs-title">Monats-Status {{ activeCol }} (klicken zum Wechseln)</h4>
          <div class="month-editor">
            <button
              v-for="(status, i) in activeColData.monthStatuses"
              :key="i"
              class="month-cell"
              :class="[status ? `s-${status}` : 's-null', { 'is-today': (i + 1) === store.board.todayDate }]"
              @click="toggleDayStatus(activeCol, i)"
            >
              {{ i + 1 }}
            </button>
          </div>
          <p class="editor-hint">Gruen &middot; Gelb &middot; Rot &middot; Leer &mdash; Klick zykliert</p>
        </section>

        <section class="fs" v-if="activeColData">
          <h4 class="fs-title">Haupt-KPI {{ activeCol }}</h4>
          <div class="row-2">
            <label class="fld">
              <span class="fld-label">Wert</span>
              <input v-model="activeColData.mainKpi.value" type="text" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">Einheit</span>
              <input v-model="activeColData.mainKpi.unit" type="text" class="fld-input" placeholder="z.B. Tage" />
            </label>
          </div>
          <label class="fld">
            <span class="fld-label">Beschreibung</span>
            <input v-model="activeColData.mainKpi.label" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Zusatz-Info</span>
            <input v-model="activeColData.mainKpi.subValue" type="text" class="fld-input" placeholder="optional" />
          </label>
          <button class="status-toggle" @click="cycleKpiStatus(activeCol)">
            Status: <span :class="`s-${activeColData.mainKpi.status}`">{{ activeColData.mainKpi.status }}</span> &ndash; klick zum Wechseln
          </button>
        </section>

        <section class="fs" v-if="activeColData?.themes?.length">
          <h4 class="fs-title">Themen {{ activeCol }}</h4>
          <div
            v-for="(theme, i) in activeColData.themes"
            :key="i"
            class="theme-editor"
          >
            <input
              v-model="theme.title"
              type="text"
              class="fld-input"
              :placeholder="'Thema ' + (i + 1)"
            />
            <input
              v-if="theme.pdca"
              v-model="theme.owner"
              type="text"
              class="fld-input fld-owner"
              placeholder="Verantwortlich"
            />
            <select v-if="theme.pdca" v-model="theme.pdca" class="fld-input fld-pdca">
              <option value="plan">Plan</option>
              <option value="do">Do</option>
              <option value="check">Check</option>
              <option value="act">Act</option>
            </select>
          </div>
        </section>
      </aside>

      <section class="demo-preview">
        <div class="preview-header">
          <span>Live-Vorschau &middot; 1920 × 1080 &middot; Maß 1 : 1</span>
          <span class="pv-hint">So erscheint das Board auf dem Display</span>
        </div>
        <div class="preview-frame" ref="previewFrame">
          <div class="canvas" :style="{ transform: `scale(${scale})` }">
            <ShopfloorBoard :board="store.board" :is-running="isRunning" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sfm-demo { max-width: 1680px; margin: 0 auto; }

.demo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--blickle-navy);
  display: flex;
  align-items: center;
  gap: 10px;
}
.demo-tag {
  background: rgba(181, 204, 24, 0.15);
  color: #556b00;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.page-sub {
  margin-top: 4px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
.toolbar-actions { display: flex; gap: 8px; }
.btn-primary {
  padding: 8px 18px;
  background: var(--blickle-navy);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}
.btn-primary:hover { background: var(--blickle-navy-light); }
.btn-ghost {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--gray-600);
  font-size: 0.85rem;
}

.demo-split {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
}

.demo-form {
  background: var(--blickle-white);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
}
.fs { margin-bottom: 24px; }
.fs:last-child { margin-bottom: 0; }
.fs-title {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--gray-500);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.fld { display: block; margin-bottom: 10px; }
.fld-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.fld-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--blickle-white);
  box-sizing: border-box;
}
.fld-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08);
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.col-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.col-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  border-radius: 8px;
  background: var(--gray-50);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 140ms;
}
.col-tab.active {
  background: rgba(22, 58, 108, 0.08);
  border-color: var(--blickle-navy);
}
.col-tab-letter {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--blickle-navy);
  line-height: 1;
}
.col-tab-label {
  font-size: 0.65rem;
  color: var(--gray-600);
  font-weight: 500;
}

.month-editor {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
}
.month-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  border: 2px solid var(--color-border);
  background: var(--gray-50);
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 120ms;
  display: flex;
  align-items: center;
  justify-content: center;
}
.month-cell.s-green  { background: rgba(16, 185, 129, 0.25); border-color: #10B981; color: #065F46; }
.month-cell.s-yellow { background: rgba(245, 158, 11, 0.25); border-color: #F59E0B; color: #92400E; }
.month-cell.s-red    { background: rgba(239, 68, 68, 0.25); border-color: #EF4444; color: #991B1B; }
.month-cell.is-today {
  box-shadow: 0 0 0 2px var(--blickle-navy);
  transform: scale(1.08);
}
.editor-hint {
  margin-top: 6px;
  font-size: 0.68rem;
  color: var(--gray-400);
  font-style: italic;
}

.status-toggle {
  padding: 8px 12px;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  background: var(--gray-50);
  font-size: 0.75rem;
  color: var(--gray-700);
  margin-top: 6px;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.status-toggle .s-green  { color: #10B981; font-weight: 700; text-transform: uppercase; }
.status-toggle .s-yellow { color: #F59E0B; font-weight: 700; text-transform: uppercase; }
.status-toggle .s-red    { color: #EF4444; font-weight: 700; text-transform: uppercase; }

.theme-editor {
  display: grid;
  grid-template-columns: 1fr 120px 80px;
  gap: 4px;
  margin-bottom: 6px;
}
.theme-editor .fld-owner, .theme-editor .fld-pdca { font-size: 0.72rem; padding: 6px 8px; }

.demo-preview {
  background: var(--blickle-white);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.7rem;
  color: var(--gray-500);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}
.pv-hint { color: var(--gray-400); font-style: italic; text-transform: none; letter-spacing: 0; }
.preview-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 14px 48px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06);
  background: #000;
}
.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
}
</style>
