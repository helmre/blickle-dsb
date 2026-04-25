<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)

function defaultDateTime() {
  const d = new Date(Date.now() + 2 * 3600 * 1000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const kicker = field('kicker', 'EINLADUNG · BETRIEBSVERSAMMLUNG')
const dateTimeValue = field('dateTimeValue', defaultDateTime())
const location = field('location', 'Betriebsrestaurant')
const topic = field('topic', 'GF-Ansprache: Q2-Ausblick')
const body = field('body', 'Alle Mitarbeiterinnen und Mitarbeiter sind herzlich eingeladen.')
const audienceNote = field('audienceNote', 'Alle MA · Schichten bitte informieren')
const showCountdown = field('showCountdown', true)
const authorLabel = field('authorLabel', 'Geschäftsleitung')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Grün', value: '#B5CC18' }, { name: 'Navy', value: '#163A6C' },
  { name: 'Orange', value: '#F97316' }, { name: 'Rot', value: '#EF4444' },
]

const parsed = computed(() => new Date(dateTimeValue.value))
const timeStr = computed(() => { const d = parsed.value; return isNaN(d) ? '—:—' : new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(d) })
const dayLabel = computed(() => { const d = parsed.value; return isNaN(d) ? '' : new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(d).replace('.', '') + '.' })
const dateLabel = computed(() => { const d = parsed.value; return isNaN(d) ? '' : new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d) })

const now = ref(Date.now())
let nowTimer = null
const deltaMs = computed(() => parsed.value.getTime() - now.value)
const isToday = computed(() => { const d = parsed.value; const n = new Date(now.value); return !isNaN(d) && d.toDateString() === n.toDateString() })
const isPast = computed(() => deltaMs.value < 0)
const countdownText = computed(() => {
  if (isNaN(parsed.value)) return ''
  if (isPast.value) { const m = Math.floor(-deltaMs.value / 60000); return m < 60 ? `Vor ${m} Min. begonnen` : `Vor ${Math.floor(m/60)} Std. begonnen` }
  const total = Math.floor(deltaMs.value / 60000)
  if (total < 60) return `In ${total} Min.`
  const h = Math.floor(total / 60), m = total % 60
  if (h < 24) return `In ${h} Std. ${m} Min.`
  const days = Math.floor(h / 24)
  return days === 1 ? 'Morgen' : `In ${days} Tagen`
})
const countdownPulse = computed(() => isToday.value && !isPast.value && deltaMs.value < 2 * 3600 * 1000)

onMounted(() => { nowTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (nowTimer) clearInterval(nowTimer) })
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
      <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
      <div class="meta-cards">
        <div class="time-card"><div class="time-icon">&#9200;</div><div class="time-value">{{ timeStr }}</div><div class="time-label">Uhr</div></div>
        <div class="where-card">
          <div class="where-day"><div class="day-weekday">{{ dayLabel }}</div><div class="day-date">{{ dateLabel }}</div></div>
          <div class="where-location"><div class="loc-icon">&#9873;</div><div class="loc-name">{{ location }}</div></div>
        </div>
      </div>
      <div class="topic">{{ topic }}</div>
      <div class="body-row"><div class="body">{{ body }}</div><div class="audience" v-if="audienceNote"><span class="audience-tag">{{ audienceNote }}</span></div></div>
      <div v-if="showCountdown" :class="['countdown', { pulse: countdownPulse, past: isPast }]">
        <div class="countdown-pulse"></div>
        <div class="countdown-text">{{ countdownText }}</div>
      </div>
      <div class="footer"><span>{{ authorLabel }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kernaussage</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Thema</span><textarea v-model="topic" class="fld-input fld-small" rows="2" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Termin</h4>
        <label class="fld"><span class="fld-label">Datum &amp; Uhrzeit</span><input v-model="dateTimeValue" type="datetime-local" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Ort</span><input v-model="location" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Zielgruppe</span><input v-model="audienceNote" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Countdown</span>
          <label class="toggle-inline"><input type="checkbox" v-model="showCountdown" /><span>{{ showCountdown ? 'Sichtbar' : 'Aus' }}</span></label>
        </label>
      </section>
      <section class="fs"><h4 class="fs-title">Details</h4>
        <label class="fld"><span class="fld-label">Beschreibung</span><textarea v-model="body" class="fld-input" rows="3" /></label>
        <label class="fld"><span class="fld-label">Autor</span><input v-model="authorLabel" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Gestaltung</h4>
        <div class="fld"><span class="fld-label">Akzent</span>
          <div class="accent-row"><button v-for="p in accentPresets" :key="p.value" class="accent-swatch" :class="{ active: accent === p.value }" :style="{ background: p.value }" @click="accent = p.value"></button></div>
        </div>
        <div class="fld"><span class="fld-label">Theme</span>
          <div class="theme-row"><button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button><button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light</button></div>
        </div>
      </section>
    </aside>
    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · fluid</span></div>
      <div class="preview-frame">
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
          <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
          <div class="meta-cards">
            <div class="time-card"><div class="time-icon">&#9200;</div><div class="time-value">{{ timeStr }}</div><div class="time-label">Uhr</div></div>
            <div class="where-card">
              <div class="where-day"><div class="day-weekday">{{ dayLabel }}</div><div class="day-date">{{ dateLabel }}</div></div>
              <div class="where-location"><div class="loc-icon">&#9873;</div><div class="loc-name">{{ location }}</div></div>
            </div>
          </div>
          <div class="topic">{{ topic }}</div>
          <div class="body-row"><div class="body">{{ body }}</div><div class="audience" v-if="audienceNote"><span class="audience-tag">{{ audienceNote }}</span></div></div>
          <div v-if="showCountdown" :class="['countdown', { pulse: countdownPulse, past: isPast }]"><div class="countdown-pulse"></div><div class="countdown-text">{{ countdownText }}</div></div>
          <div class="footer"><span>{{ authorLabel }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 400px 1fr; gap: 20px; align-items: start; }
.form { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 220px); overflow-y: auto; position: sticky; top: 20px; }
.fs { margin-bottom: 22px; } .fs-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin-bottom: 10px; }
.fld { display: block; margin-bottom: 12px; } .fld-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
.fld-small { min-height: 50px; resize: vertical; }
.toggle-inline { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; }
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

/* Fluid canvas — fills full container, scales typography via --u unit.
   --u equals 1 design-pixel when container matches a 1920×1080 reference,
   using min() so text never outgrows the shorter dimension. Grid uses 1fr
   columns, so extra horizontal space in wide zones is distributed naturally. */
.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  --u: min(calc(100cqw / 1920), calc(100cqh / 1080));
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: calc(28 * var(--u));
  padding: calc(60 * var(--u)) calc(80 * var(--u));
  box-sizing: border-box;
  font-family: var(--font-body);
  align-content: space-between;
}
.canvas.theme-dark { background: radial-gradient(ellipse at 20% 0%, rgba(181,204,24,0.08) 0%, transparent 50%), linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }

.kicker-row { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(14 * var(--u)); font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: calc(14 * var(--u)); height: calc(14 * var(--u)); border-radius: 50%; background: var(--accent); box-shadow: 0 0 calc(18 * var(--u)) var(--accent); }

.meta-cards { grid-column: 1 / 13; display: grid; grid-template-columns: 1fr 1fr; gap: calc(32 * var(--u)); }
.time-card { padding: calc(40 * var(--u)) calc(48 * var(--u)); border-radius: calc(20 * var(--u)); background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.1); border-left: calc(6 * var(--u)) solid var(--accent); position: relative; overflow: hidden; }
.time-icon { font-size: calc(48 * var(--u)); color: var(--accent); filter: drop-shadow(0 0 calc(18 * var(--u)) var(--accent)); margin-bottom: calc(8 * var(--u)); }
.time-value { font-family: var(--font-display); font-size: calc(180 * var(--u)); font-weight: 800; line-height: 0.9; letter-spacing: -0.04em; color: #fff; }
.theme-light .time-value { color: #0B1F3A; }
.time-label { font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: calc(4 * var(--u)); }
.theme-light .time-label { color: rgba(11,31,58,0.5); }
.where-card { padding: calc(40 * var(--u)) calc(44 * var(--u)); border-radius: calc(20 * var(--u)); background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; min-height: calc(240 * var(--u)); }
.day-weekday { font-family: var(--font-display); font-size: calc(40 * var(--u)); font-weight: 700; color: var(--accent); letter-spacing: 0.04em; text-transform: uppercase; }
.day-date { margin-top: calc(6 * var(--u)); font-family: var(--font-display); font-size: calc(58 * var(--u)); font-weight: 700; color: #fff; letter-spacing: -0.02em; }
.theme-light .day-date { color: #0B1F3A; }
.where-location { display: flex; align-items: center; gap: calc(16 * var(--u)); padding-top: calc(20 * var(--u)); border-top: 1px solid rgba(255,255,255,0.1); }
.theme-light .where-location { border-top-color: rgba(0,0,0,0.12); }
.loc-icon { font-size: calc(42 * var(--u)); color: var(--accent); filter: drop-shadow(0 0 calc(14 * var(--u)) var(--accent)); }
.loc-name { font-family: var(--font-display); font-size: calc(42 * var(--u)); font-weight: 700; color: #fff; }
.theme-light .loc-name { color: #0B1F3A; }

.topic { grid-column: 1 / 13; font-family: var(--font-display); font-size: calc(70 * var(--u)); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; color: #fff; }
.theme-light .topic { color: #0B1F3A; }

.body-row { grid-column: 1 / 13; display: grid; grid-template-columns: 2fr 1fr; gap: calc(24 * var(--u)); align-items: center; }
.body { font-size: calc(30 * var(--u)); line-height: 1.35; color: rgba(255,255,255,0.82); }
.theme-light .body { color: rgba(11,31,58,0.78); }
.audience { text-align: right; }
.audience-tag { display: inline-block; padding: calc(12 * var(--u)) calc(22 * var(--u)); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; font-size: calc(20 * var(--u)); font-weight: 600; color: rgba(255,255,255,0.85); }
.theme-light .audience-tag { background: rgba(11,31,58,0.06); border-color: rgba(11,31,58,0.15); color: rgba(11,31,58,0.8); }

.countdown { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(18 * var(--u)); padding: calc(20 * var(--u)) calc(32 * var(--u)); border-radius: calc(16 * var(--u)); background: rgba(181,204,24,0.08); border: 1px solid rgba(181,204,24,0.25); }
.countdown.past { background: rgba(148,163,184,0.1); border-color: rgba(148,163,184,0.25); }
.countdown.pulse { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.4); }
.countdown-pulse { width: calc(18 * var(--u)); height: calc(18 * var(--u)); border-radius: 50%; background: var(--accent); box-shadow: 0 0 calc(20 * var(--u)) var(--accent); }
.countdown.pulse .countdown-pulse { background: #EF4444; box-shadow: 0 0 calc(24 * var(--u)) #EF4444; }
.countdown-text { font-family: var(--font-display); font-size: calc(38 * var(--u)); font-weight: 700; color: #fff; }
.theme-light .countdown-text { color: #0B1F3A; }

.footer { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(14 * var(--u)); padding-top: calc(16 * var(--u)); border-top: 1px solid rgba(255,255,255,0.08); font-size: calc(17 * var(--u)); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.spacer { flex: 1; }
.footer-logo { height: calc(30 * var(--u)); filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
