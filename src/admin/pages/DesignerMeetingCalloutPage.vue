<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 2 hours from now for realistic demo
function defaultDateTime() {
  const d = new Date(Date.now() + 2 * 3600 * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const kicker = ref('EINLADUNG · BETRIEBSVERSAMMLUNG')
const dateTimeValue = ref(defaultDateTime())
const location = ref('Betriebsrestaurant')
const topic = ref('GF-Ansprache: Q2-Ausblick')
const body = ref('Alle Mitarbeiterinnen und Mitarbeiter sind herzlich eingeladen. Ca. 30 Minuten, anschliessend Mittagessen.')
const audienceNote = ref('Alle MA · Schichten bitte informieren')
const showCountdown = ref(true)
const authorLabel = ref('Geschaeftsleitung')
const accent = ref('#B5CC18')
const theme = ref('dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Signal-Rot', value: '#EF4444' },
  { name: 'Blau', value: '#3B82F6' },
]

const parsed = computed(() => new Date(dateTimeValue.value))
const timeStr = computed(() => {
  const d = parsed.value
  return isNaN(d) ? '—:—' : new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(d)
})
const dayLabel = computed(() => {
  const d = parsed.value
  if (isNaN(d)) return ''
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(d).replace('.', '') + '.'
})
const dateLabel = computed(() => {
  const d = parsed.value
  if (isNaN(d)) return ''
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d)
})

const now = ref(Date.now())
let nowTimer = null
onMounted(() => { nowTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (nowTimer) clearInterval(nowTimer) })

const deltaMs = computed(() => parsed.value.getTime() - now.value)
const isToday = computed(() => {
  const d = parsed.value
  const n = new Date(now.value)
  return !isNaN(d) && d.toDateString() === n.toDateString()
})
const isPast = computed(() => deltaMs.value < 0)

const countdownText = computed(() => {
  if (isNaN(parsed.value)) return ''
  if (isPast.value) {
    const absMin = Math.floor(-deltaMs.value / 60000)
    if (absMin < 60) return `Vor ${absMin} Min. begonnen`
    const h = Math.floor(absMin / 60)
    return `Vor ${h} Std. begonnen`
  }
  const totalMin = Math.floor(deltaMs.value / 60000)
  if (totalMin < 60) return `In ${totalMin} Min.`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h < 24) return `In ${h} Std. ${m} Min.`
  const days = Math.floor(h / 24)
  return days === 1 ? 'Morgen' : `In ${days} Tagen`
})

const countdownPulse = computed(() => isToday.value && !isPast.value && deltaMs.value < 2 * 3600 * 1000)

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
  <div class="mc-page">
    <div class="mc-toolbar">
      <div>
        <h2 class="page-title">Termin-Hinweis <span class="demo-tag">Template 04</span></h2>
        <p class="page-sub">Meeting-Callout mit prominenter Uhrzeit, Ort und Live-Countdown.</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-ghost" disabled>Als Entwurf speichern</button>
        <button class="btn-primary" disabled>Zur Pruefung einreichen</button>
      </div>
    </div>

    <div class="mc-split">
      <aside class="mc-form">
        <section class="fs">
          <h4 class="fs-title">Kernaussage</h4>
          <label class="fld">
            <span class="fld-label">Kicker / Anlass-Typ</span>
            <input v-model="kicker" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Headline / Thema</span>
            <textarea v-model="topic" class="fld-input fld-small" rows="2" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Termin</h4>
          <label class="fld">
            <span class="fld-label">Datum &amp; Uhrzeit</span>
            <input v-model="dateTimeValue" type="datetime-local" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Ort</span>
            <input v-model="location" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Zielgruppe / Hinweis</span>
            <input v-model="audienceNote" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Live-Countdown</span>
            <label class="toggle-inline">
              <input type="checkbox" v-model="showCountdown" />
              <span>{{ showCountdown ? 'Sichtbar' : 'Ausgeblendet' }}</span>
            </label>
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Details</h4>
          <label class="fld">
            <span class="fld-label">Beschreibung (1-3 Zeilen)</span>
            <textarea v-model="body" class="fld-input" rows="3" />
          </label>
          <label class="fld">
            <span class="fld-label">Autor</span>
            <input v-model="authorLabel" type="text" class="fld-input" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Gestaltung</h4>
          <div class="fld">
            <span class="fld-label">Akzentfarbe</span>
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
              <button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button>
              <button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light</button>
            </div>
          </div>
        </section>
      </aside>

      <section class="mc-preview">
        <div class="preview-header">
          <span>Live-Vorschau &middot; 1920 × 1080</span>
          <span class="pv-hint" v-if="countdownPulse">Countdown pulsiert &lt; 2 Std. vor Termin</span>
        </div>
        <div class="preview-frame" ref="previewFrame">
          <div
            :class="['canvas', `theme-${theme}`]"
            :style="{ '--accent': accent, transform: `scale(${scale})` }"
          >
            <div class="kicker-row">
              <span class="kicker-dot"></span>
              <span class="kicker-text">{{ kicker }}</span>
            </div>

            <div class="meta-cards">
              <div class="time-card">
                <div class="time-icon">&#9200;</div>
                <div class="time-value">{{ timeStr }}</div>
                <div class="time-label">Uhr</div>
              </div>
              <div class="where-card">
                <div class="where-day">
                  <div class="day-weekday">{{ dayLabel }}</div>
                  <div class="day-date">{{ dateLabel }}</div>
                </div>
                <div class="where-location">
                  <div class="loc-icon">&#9873;</div>
                  <div class="loc-name">{{ location }}</div>
                </div>
              </div>
            </div>

            <div class="topic">{{ topic }}</div>

            <div class="body-row">
              <div class="body">{{ body }}</div>
              <div class="audience" v-if="audienceNote">
                <span class="audience-tag">{{ audienceNote }}</span>
              </div>
            </div>

            <div
              v-if="showCountdown"
              :class="['countdown', { pulse: countdownPulse, past: isPast, today: isToday }]"
            >
              <div class="countdown-pulse"></div>
              <div class="countdown-text">{{ countdownText }}</div>
              <div class="countdown-sub" v-if="isToday && !isPast">Heute &middot; nicht verpassen</div>
              <div class="countdown-sub" v-else-if="!isPast">Kalender bitte blocken</div>
            </div>

            <div class="footer">
              <span>{{ authorLabel }}</span>
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
.mc-page { max-width: 1680px; margin: 0 auto; }
.mc-toolbar {
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

.mc-split {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  align-items: start;
}
.mc-form {
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
.fld { display: block; margin-bottom: 12px; }
.fld-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.fld-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  box-sizing: border-box;
}
.fld-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08);
}
.fld-small { min-height: 50px; resize: vertical; }
.toggle-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--gray-700);
  font-weight: 500;
}

.accent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.accent-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 140ms;
}
.accent-swatch.active {
  border-color: var(--blickle-navy);
  transform: scale(1.12);
}
.theme-row { display: flex; gap: 6px; }
.theme-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--gray-50);
  font-size: 0.8rem;
  font-weight: 500;
}
.theme-btn.active {
  background: var(--blickle-navy);
  color: #fff;
  border-color: var(--blickle-navy);
}

.mc-preview {
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
.pv-hint { color: var(--accent, #B5CC18); font-style: italic; text-transform: none; letter-spacing: 0; font-weight: 600; }
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
  grid-template-rows: auto auto auto auto auto auto;
  gap: 28px;
  padding: 60px 80px;
  box-sizing: border-box;
  font-family: var(--font-body);
  align-content: space-between;
}
.theme-dark {
  background:
    radial-gradient(ellipse at 20% 0%, rgba(181, 204, 24, 0.08) 0%, transparent 50%),
    linear-gradient(135deg, #0A1A33 0%, #0B2442 40%, #163A6C 100%);
  color: #fff;
}
.theme-light {
  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
  color: #0B1F3A;
}

.kicker-row {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
}
.kicker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 18px var(--accent);
}

.meta-cards {
  grid-column: 1 / 13;
  display: grid;
  grid-template-columns: 6fr 6fr;
  gap: 32px;
}
.time-card {
  padding: 40px 48px;
  border-radius: 20px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 6px solid var(--accent);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
}
.time-card::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, var(--accent) 0%, transparent 60%);
  opacity: 0.25;
}
.time-icon {
  font-size: 48px;
  color: var(--accent);
  filter: drop-shadow(0 0 18px var(--accent));
  margin-bottom: 8px;
}
.time-value {
  font-family: var(--font-display);
  font-size: 180px;
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: #fff;
  text-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}
.theme-light .time-value { color: #0B1F3A; text-shadow: none; }
.time-label {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 4px;
}
.theme-light .time-label { color: rgba(11, 31, 58, 0.5); }

.where-card {
  padding: 40px 44px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
}
.where-day {
  font-family: var(--font-display);
}
.day-weekday {
  font-size: 40px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.day-date {
  margin-top: 6px;
  font-size: 58px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
}
.theme-light .day-date { color: #0B1F3A; }
.where-location {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.theme-light .where-location { border-top-color: rgba(0,0,0,0.12); }
.loc-icon {
  font-size: 42px;
  color: var(--accent);
  filter: drop-shadow(0 0 14px var(--accent));
}
.loc-name {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.01em;
}
.theme-light .loc-name { color: #0B1F3A; }

.topic {
  grid-column: 1 / 13;
  font-family: var(--font-display);
  font-size: 70px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #fff;
}
.theme-light .topic { color: #0B1F3A; }

.body-row {
  grid-column: 1 / 13;
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: 24px;
  align-items: center;
}
.body {
  font-size: 30px;
  line-height: 1.35;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.82);
}
.theme-light .body { color: rgba(11, 31, 58, 0.78); }
.audience {
  text-align: right;
}
.audience-tag {
  display: inline-block;
  padding: 12px 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.04em;
}
.theme-light .audience-tag {
  background: rgba(11, 31, 58, 0.06);
  border-color: rgba(11, 31, 58, 0.15);
  color: rgba(11, 31, 58, 0.8);
}

.countdown {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 32px;
  border-radius: 16px;
  background: rgba(181, 204, 24, 0.08);
  border: 1px solid rgba(181, 204, 24, 0.25);
  position: relative;
  overflow: hidden;
}
.countdown.past {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.25);
}
.countdown.pulse {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  animation: cdpulse 2s ease-in-out infinite;
}
.countdown-pulse {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 20px var(--accent);
  flex-shrink: 0;
}
.countdown.pulse .countdown-pulse {
  background: #EF4444;
  box-shadow: 0 0 24px #EF4444;
  animation: dotpulse 1s ease-in-out infinite;
}
.countdown-text {
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}
.theme-light .countdown-text { color: #0B1F3A; }
.countdown-sub {
  margin-left: auto;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.theme-light .countdown-sub { color: rgba(11, 31, 58, 0.55); }

@keyframes cdpulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.25); }
  50% { box-shadow: 0 0 0 18px rgba(239, 68, 68, 0); }
}
@keyframes dotpulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.7); }
}

.footer {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11, 31, 58, 0.55); }
.spacer { flex: 1; }
.footer-logo {
  height: 30px;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
