<script setup>
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)

const kicker = field('kicker', 'DASHBOARD · KW 16')
const titel = field('titel', 'Produktionskennzahlen')
const wert1 = field('wert1', '98.5%')
const label1 = field('label1', 'Qualitätsrate')
const trend1 = field('trend1', 'up')
const wert2 = field('wert2', '1.247')
const label2 = field('label2', 'Stück/Tag')
const trend2 = field('trend2', 'up')
const wert3 = field('wert3', '0')
const label3 = field('label3', 'Unfälle')
const trend3 = field('trend3', 'flat')
const authorLabel = field('authorLabel', 'Produktion · Auto-Feed')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Blickle-Grün', value: '#B5CC18' }, { name: 'Navy', value: '#163A6C' },
  { name: 'Blau', value: '#3B82F6' }, { name: 'Orange', value: '#F97316' },
]
const trendOptions = [
  { key: 'up', label: '▲ Aufwärts', color: '#10B981' },
  { key: 'flat', label: '● Stabil', color: '#94A3B8' },
  { key: 'down', label: '▼ Abwärts', color: '#EF4444' },
]
function trendColor(t) { const o = trendOptions.find(x => x.key === t); return o?.color || '#94A3B8' }
function trendGlyph(t) { return t === 'up' ? '▲' : t === 'down' ? '▼' : '●' }
function trendLabel(t) { return t === 'up' ? 'Aufwärts' : t === 'down' ? 'Abwärts' : 'Stabil' }
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
      <div class="header">
        <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
        <h1 class="title">{{ titel }}</h1>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-trend" :style="{ color: trendColor(trend1) }">{{ trendGlyph(trend1) }} <span class="trend-word">{{ trendLabel(trend1) }}</span></div>
          <div class="kpi-value">{{ wert1 }}</div>
          <div class="kpi-label">{{ label1 }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-trend" :style="{ color: trendColor(trend2) }">{{ trendGlyph(trend2) }} <span class="trend-word">{{ trendLabel(trend2) }}</span></div>
          <div class="kpi-value">{{ wert2 }}</div>
          <div class="kpi-label">{{ label2 }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-trend" :style="{ color: trendColor(trend3) }">{{ trendGlyph(trend3) }} <span class="trend-word">{{ trendLabel(trend3) }}</span></div>
          <div class="kpi-value">{{ wert3 }}</div>
          <div class="kpi-label">{{ label3 }}</div>
        </div>
      </div>
      <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>{{ authorLabel }}</span></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kopf</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Titel</span><input v-model="titel" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">KPI 1</h4>
        <label class="fld"><span class="fld-label">Wert</span><input v-model="wert1" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Bezeichnung</span><input v-model="label1" type="text" class="fld-input" /></label>
        <div class="fld"><span class="fld-label">Trend</span>
          <div class="trend-row"><button v-for="t in trendOptions" :key="t.key" :class="['trend-btn', { active: trend1 === t.key }]" :style="{ color: trend1 === t.key ? t.color : '' }" @click="trend1 = t.key">{{ t.label }}</button></div>
        </div>
      </section>
      <section class="fs"><h4 class="fs-title">KPI 2</h4>
        <label class="fld"><span class="fld-label">Wert</span><input v-model="wert2" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Bezeichnung</span><input v-model="label2" type="text" class="fld-input" /></label>
        <div class="fld"><span class="fld-label">Trend</span>
          <div class="trend-row"><button v-for="t in trendOptions" :key="t.key" :class="['trend-btn', { active: trend2 === t.key }]" :style="{ color: trend2 === t.key ? t.color : '' }" @click="trend2 = t.key">{{ t.label }}</button></div>
        </div>
      </section>
      <section class="fs"><h4 class="fs-title">KPI 3</h4>
        <label class="fld"><span class="fld-label">Wert</span><input v-model="wert3" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Bezeichnung</span><input v-model="label3" type="text" class="fld-input" /></label>
        <div class="fld"><span class="fld-label">Trend</span>
          <div class="trend-row"><button v-for="t in trendOptions" :key="t.key" :class="['trend-btn', { active: trend3 === t.key }]" :style="{ color: trend3 === t.key ? t.color : '' }" @click="trend3 = t.key">{{ t.label }}</button></div>
        </div>
      </section>
      <section class="fs"><h4 class="fs-title">Meta &amp; Gestaltung</h4>
        <label class="fld"><span class="fld-label">Autor</span><input v-model="authorLabel" type="text" class="fld-input" /></label>
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
          <div class="header">
            <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
            <h1 class="title">{{ titel }}</h1>
          </div>
          <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-trend" :style="{ color: trendColor(trend1) }">{{ trendGlyph(trend1) }} <span class="trend-word">{{ trendLabel(trend1) }}</span></div><div class="kpi-value">{{ wert1 }}</div><div class="kpi-label">{{ label1 }}</div></div>
            <div class="kpi-card"><div class="kpi-trend" :style="{ color: trendColor(trend2) }">{{ trendGlyph(trend2) }} <span class="trend-word">{{ trendLabel(trend2) }}</span></div><div class="kpi-value">{{ wert2 }}</div><div class="kpi-label">{{ label2 }}</div></div>
            <div class="kpi-card"><div class="kpi-trend" :style="{ color: trendColor(trend3) }">{{ trendGlyph(trend3) }} <span class="trend-word">{{ trendLabel(trend3) }}</span></div><div class="kpi-value">{{ wert3 }}</div><div class="kpi-label">{{ label3 }}</div></div>
          </div>
          <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>{{ authorLabel }}</span></div>
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
.trend-row { display: flex; gap: 4px; } .trend-btn { flex: 1; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.72rem; font-weight: 500; } .trend-btn.active { border-width: 2px; font-weight: 700; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; } .accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.canvas { position: absolute; inset: 0; width: 100%; height: 100%; --u: min(calc(100cqw / 1920), calc(100cqh / 1080)); display: grid; grid-template-rows: auto 1fr auto; gap: calc(32 * var(--u)); padding: calc(64 * var(--u)) calc(96 * var(--u)); box-sizing: border-box; font-family: var(--font-body); }
.canvas.theme-dark { background: radial-gradient(ellipse at 50% 30%, rgba(181,204,24,0.08) 0%, transparent 60%), linear-gradient(135deg, #0A1A33 0%, #0B2442 50%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }

.header { display: flex; flex-direction: column; gap: calc(12 * var(--u)); }
.kicker-row { display: flex; align-items: center; gap: calc(14 * var(--u)); font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: calc(14 * var(--u)); height: calc(14 * var(--u)); border-radius: 50%; background: var(--accent); box-shadow: 0 0 calc(18 * var(--u)) var(--accent); }
.title { margin: 0; font-family: var(--font-display); font-size: calc(88 * var(--u)); font-weight: 700; line-height: 1; letter-spacing: -0.02em; }

.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(32 * var(--u)); align-items: stretch; }
.kpi-card { position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: calc(24 * var(--u)); padding: calc(48 * var(--u)) calc(48 * var(--u)) calc(44 * var(--u)); background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.12); border-radius: calc(24 * var(--u)); overflow: hidden; }
.theme-light .kpi-card { background: linear-gradient(180deg, #fff, rgba(255,255,255,0.6)); border-color: rgba(0,0,0,0.08); box-shadow: 0 calc(12 * var(--u)) calc(32 * var(--u)) rgba(11,31,58,0.08); }
.kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: calc(6 * var(--u)); background: var(--accent); opacity: 0.9; }

.kpi-trend { display: inline-flex; align-items: center; gap: calc(10 * var(--u)); font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.trend-word { font-size: calc(18 * var(--u)); opacity: 0.85; }
.kpi-value { font-family: var(--font-display); font-size: calc(160 * var(--u)); font-weight: 800; line-height: 0.9; letter-spacing: -0.04em; color: #fff; text-shadow: 0 0 calc(40 * var(--u)) rgba(181,204,24,0.2); }
.theme-light .kpi-value { color: #0B1F3A; text-shadow: none; }
.kpi-label { font-family: var(--font-display); font-size: calc(30 * var(--u)); font-weight: 600; letter-spacing: 0.03em; color: rgba(255,255,255,0.72); }
.theme-light .kpi-label { color: rgba(11,31,58,0.72); }

.footer { display: flex; align-items: center; gap: calc(14 * var(--u)); padding-top: calc(16 * var(--u)); border-top: 1px solid rgba(255,255,255,0.1); font-size: calc(16 * var(--u)); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.spacer { flex: 1; }
.footer-logo { height: calc(30 * var(--u)); filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
