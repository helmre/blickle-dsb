<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const kicker = ref('GAESTE HEUTE')
const dateLabel = ref('2026-04-16')
const welcome = ref('Willkommen in Rosenfeld')
const subline = ref('Bitte freundlich gruessen')
const visitors = ref([
  {
    name: 'Dr. Andreas Weber',
    role: 'CTO',
    company: 'Musterfirma GmbH',
    timeWindow: '09:00 – 12:00',
    area: 'Besprechung · Halle 3',
    host: 'Thomas Braun',
    logoUrl: '',
    color: '#3B82F6',
  },
  {
    name: 'Sabine Richter',
    role: 'Einkauf',
    company: 'Beispiel AG',
    timeWindow: '13:30 – 15:00',
    area: 'Fertigungsrundgang',
    host: 'Maria Schulz',
    logoUrl: '',
    color: '#F59E0B',
  },
  {
    name: 'Michael Bauer',
    role: 'Auditor',
    company: 'Inspect GmbH',
    timeWindow: '14:00 – 17:00',
    area: 'ISO-Audit · QS',
    host: 'Julia Meier',
    logoUrl: '',
    color: '#10B981',
  },
])
const theme = ref('light')
const accent = ref('#163A6C')

const accentPresets = [
  { name: 'Navy', value: '#163A6C' },
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Grau', value: '#475569' },
]

function addVisitor() {
  if (visitors.value.length >= 5) return
  visitors.value.push({
    name: 'Neuer Gast',
    role: '',
    company: '',
    timeWindow: '',
    area: '',
    host: '',
    logoUrl: '',
    color: '#6B7280',
  })
}
function removeVisitor(i) {
  visitors.value.splice(i, 1)
}
function onLogoPick(i, e) {
  const file = e.target.files?.[0]
  if (!file) return
  visitors.value[i].logoUrl = URL.createObjectURL(file)
}

const formattedDate = computed(() => {
  if (!dateLabel.value) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateLabel.value))
  } catch { return dateLabel.value }
})

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().replace(/^Dr\.?\s*/i, '').split(/\s+/)
  if (parts.length === 1) return parts[0][0]
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
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
</script>

<template>
  <div class="va-page">
    <div class="va-toolbar">
      <div>
        <h2 class="page-title">Besucher-Anzeige <span class="demo-tag">Template 05</span></h2>
        <p class="page-sub">Sachlicher Hinweis auf externe Gaeste &mdash; dezent, nicht ablenkend, Default Light.</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-ghost" disabled>Als Entwurf speichern</button>
        <button class="btn-primary" disabled>Zur Pruefung einreichen</button>
      </div>
    </div>

    <div class="va-split">
      <aside class="va-form">
        <section class="fs">
          <h4 class="fs-title">Kopf</h4>
          <label class="fld">
            <span class="fld-label">Kicker</span>
            <input v-model="kicker" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Datum</span>
            <input v-model="dateLabel" type="date" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Willkommen-Zeile</span>
            <input v-model="welcome" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Handlungshinweis</span>
            <input v-model="subline" type="text" class="fld-input" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Gaeste ({{ visitors.length }})</h4>
          <div v-for="(v, i) in visitors" :key="i" class="visitor-card-edit">
            <div class="vc-head">
              <span class="vc-nr">#{{ i + 1 }}</span>
              <button class="btn-x" @click="removeVisitor(i)" v-if="visitors.length > 1">&times;</button>
            </div>
            <label class="fld">
              <span class="fld-label">Name</span>
              <input v-model="v.name" type="text" class="fld-input" />
            </label>
            <div class="row-2">
              <label class="fld">
                <span class="fld-label">Funktion</span>
                <input v-model="v.role" type="text" class="fld-input" />
              </label>
              <label class="fld">
                <span class="fld-label">Firma</span>
                <input v-model="v.company" type="text" class="fld-input" />
              </label>
            </div>
            <div class="row-2">
              <label class="fld">
                <span class="fld-label">Zeitfenster</span>
                <input v-model="v.timeWindow" type="text" class="fld-input" placeholder="09:00 – 12:00" />
              </label>
              <label class="fld">
                <span class="fld-label">Bereich / Anlass</span>
                <input v-model="v.area" type="text" class="fld-input" />
              </label>
            </div>
            <label class="fld">
              <span class="fld-label">Gastgeber</span>
              <input v-model="v.host" type="text" class="fld-input" />
            </label>
            <div class="row-2">
              <label class="fld">
                <span class="fld-label">Akzentfarbe</span>
                <input v-model="v.color" type="color" class="fld-input fld-color" />
              </label>
              <label class="fld">
                <span class="fld-label">Firmenlogo</span>
                <input type="file" accept="image/*" class="fld-input fld-file" @change="e => onLogoPick(i, e)" />
              </label>
            </div>
          </div>
          <button class="btn-add" @click="addVisitor" v-if="visitors.length < 5">+ Gast hinzufuegen</button>
        </section>

        <section class="fs">
          <h4 class="fs-title">Gestaltung</h4>
          <div class="fld">
            <span class="fld-label">Akzentfarbe (Header)</span>
            <div class="accent-row">
              <button
                v-for="p in accentPresets"
                :key="p.value"
                class="accent-swatch"
                :class="{ active: accent === p.value }"
                :style="{ background: p.value }"
                :title="p.name"
                @click="accent = p.value"
              ></button>
            </div>
          </div>
          <div class="fld">
            <span class="fld-label">Theme</span>
            <div class="theme-row">
              <button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light <span class="default-tag">Default</span></button>
              <button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button>
            </div>
          </div>
        </section>
      </aside>

      <section class="va-preview">
        <div class="preview-header">
          <span>Live-Vorschau &middot; 1920 × 1080</span>
          <span class="pv-hint">Sachlich, leise, empfang-geeignet</span>
        </div>
        <div class="preview-frame" ref="previewFrame">
          <div
            :class="['canvas', `theme-${theme}`]"
            :style="{ '--accent': accent, transform: `scale(${scale})` }"
          >
            <div class="head">
              <div class="head-left">
                <div class="kicker-row">
                  <span class="kicker-dot"></span>
                  <span class="kicker-text">{{ kicker }}</span>
                  <span class="head-divider"></span>
                  <span class="date-text">{{ formattedDate }}</span>
                </div>
                <h1 class="welcome">{{ welcome }}</h1>
                <div class="count">
                  Heute {{ visitors.length }} {{ visitors.length === 1 ? 'Gast' : 'Gaeste' }} im Haus
                </div>
              </div>
              <div class="head-right">
                <div class="greet-card">
                  <div class="greet-icon">&#9996;</div>
                  <div class="greet-text">{{ subline }}</div>
                </div>
              </div>
            </div>

            <div class="visitors">
              <div v-for="(v, i) in visitors" :key="i" class="visitor-card" :style="{ '--vcolor': v.color }">
                <div class="avatar">
                  <img v-if="v.logoUrl" :src="v.logoUrl" alt="" />
                  <span v-else class="avatar-initials">{{ initials(v.name) }}</span>
                </div>
                <div class="v-head">
                  <div class="v-name">{{ v.name }}</div>
                  <div class="v-role">{{ v.role }}<span v-if="v.role && v.company"> &middot; </span>{{ v.company }}</div>
                </div>
                <div class="v-meta">
                  <div class="meta-item">
                    <span class="meta-icon">&#9200;</span>
                    <span class="meta-val">{{ v.timeWindow }}</span>
                  </div>
                  <div class="meta-item" v-if="v.area">
                    <span class="meta-icon">&#9873;</span>
                    <span class="meta-val">{{ v.area }}</span>
                  </div>
                </div>
                <div class="v-host" v-if="v.host">
                  <span class="host-label">Gastgeber</span>
                  <span class="host-name">{{ v.host }}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <span>Empfang Blickle</span>
              <span class="dot">&middot;</span>
              <span>Aushang nur fuer heute gueltig</span>
              <span class="spacer"></span>
              <img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.va-page { max-width: 1680px; margin: 0 auto; }
.va-toolbar {
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
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-ghost {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--gray-600);
  font-size: 0.85rem;
  opacity: 0.5;
  cursor: not-allowed;
}

.va-split {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
}
.va-form {
  background: var(--blickle-white);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
}
.fs { margin-bottom: 22px; }
.fs-title {
  font-family: var(--font-display);
  font-size: 0.7rem;
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
  font-size: 0.82rem;
  font-family: inherit;
  box-sizing: border-box;
}
.fld-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08);
}
.fld-file { padding: 4px; font-size: 0.72rem; }
.fld-color { padding: 2px; height: 32px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }

.visitor-card-edit {
  background: var(--gray-50);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}
.vc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.vc-nr {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gray-500);
  letter-spacing: 0.06em;
}
.btn-x {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--gray-500);
  cursor: pointer;
}
.btn-x:hover { color: var(--color-danger); border-color: var(--color-danger); }

.btn-add {
  margin-top: 4px;
  padding: 7px 12px;
  background: var(--gray-50);
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  color: var(--gray-600);
  font-size: 0.78rem;
  cursor: pointer;
  width: 100%;
}

.accent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.accent-swatch {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
  cursor: pointer;
}
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; }
.theme-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--gray-50);
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.default-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  background: rgba(181, 204, 24, 0.2);
  color: #556b00;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.theme-btn.active .default-tag {
  background: rgba(181, 204, 24, 0.3);
  color: #B5CC18;
}

.va-preview {
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

/* Canvas */
.canvas {
  position: absolute;
  top: 0; left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: auto;
  gap: 28px;
  padding: 60px 80px;
  box-sizing: border-box;
  font-family: var(--font-body);
}
.theme-light {
  background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
  color: #0B1F3A;
}
.theme-dark {
  background: linear-gradient(135deg, #0A1A33 0%, #0B2442 40%, #163A6C 100%);
  color: #fff;
}

.head {
  grid-column: 1 / 13;
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: 28px;
  align-items: end;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(11, 31, 58, 0.08);
}
.theme-dark .head { border-bottom-color: rgba(255,255,255,0.1); }

.kicker-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}
.theme-dark .kicker-row { color: #B5CC18; }
.kicker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}
.head-divider {
  width: 1px;
  height: 18px;
  background: rgba(11, 31, 58, 0.2);
}
.theme-dark .head-divider { background: rgba(255,255,255,0.2); }
.date-text {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: rgba(11, 31, 58, 0.55);
  letter-spacing: 0.02em;
  text-transform: none;
}
.theme-dark .date-text { color: rgba(255,255,255,0.6); }

.welcome {
  font-family: var(--font-display);
  font-size: 96px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 0;
}
.theme-light .welcome { color: #0B1F3A; }
.theme-dark .welcome { color: #fff; }

.count {
  margin-top: 12px;
  font-family: var(--font-body);
  font-size: 28px;
  font-weight: 500;
  color: rgba(11, 31, 58, 0.65);
}
.theme-dark .count { color: rgba(255,255,255,0.75); }

.greet-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  background: rgba(11, 31, 58, 0.04);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 14px;
}
.theme-dark .greet-card {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}
.greet-icon {
  font-size: 38px;
  filter: grayscale(100%);
  opacity: 0.75;
}
.greet-text {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: rgba(11, 31, 58, 0.78);
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.theme-dark .greet-text { color: rgba(255,255,255,0.88); }

/* Visitors grid adapts to count */
.visitors {
  grid-column: 1 / 13;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 22px;
  align-items: stretch;
}

.visitor-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(11, 31, 58, 0.08);
  border-top: 6px solid var(--vcolor);
  position: relative;
}
.theme-dark .visitor-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 6px solid var(--vcolor);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 22px;
  background: var(--vcolor);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.03em;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.v-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.v-name {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 700;
  color: #0B1F3A;
  line-height: 1.05;
  letter-spacing: -0.01em;
}
.theme-dark .v-name { color: #fff; }
.v-role {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 500;
  color: rgba(11, 31, 58, 0.6);
}
.theme-dark .v-role { color: rgba(255,255,255,0.7); }

.v-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(11, 31, 58, 0.08);
}
.theme-dark .v-meta { border-top-color: rgba(255,255,255,0.1); }
.meta-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 18px;
  font-weight: 500;
  color: rgba(11, 31, 58, 0.75);
}
.theme-dark .meta-item { color: rgba(255,255,255,0.82); }
.meta-icon {
  font-size: 20px;
  color: var(--vcolor);
  width: 24px;
  text-align: center;
}
.meta-val { line-height: 1.3; }

.v-host {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed rgba(11, 31, 58, 0.12);
}
.theme-dark .v-host { border-top-color: rgba(255,255,255,0.12); }
.host-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(11, 31, 58, 0.45);
}
.theme-dark .host-label { color: rgba(255,255,255,0.5); }
.host-name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}
.theme-dark .host-name { color: #B5CC18; }

.footer {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid rgba(11, 31, 58, 0.08);
  font-size: 15px;
  color: rgba(11, 31, 58, 0.5);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 14px;
}
.theme-dark .footer { color: rgba(255,255,255,0.55); border-top-color: rgba(255,255,255,0.1); }
.dot { opacity: 0.6; }
.spacer { flex: 1; }
.footer-logo {
  height: 26px;
  opacity: 0.7;
}
.theme-dark .footer-logo { filter: brightness(0) invert(1); opacity: 0.85; }
</style>
