<script setup>
import { computed } from 'vue'
import { useDesignerMediaUpload } from '../composables/useDesignerMediaUpload.js'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field, update } = useParamModel(props, emit)
const { pickDesignerMedia } = useDesignerMediaUpload()

const kicker = field('kicker', 'GAESTE HEUTE')
const dateLabel = field('dateLabel', '2026-04-16')
const welcome = field('welcome', 'Willkommen in Rosenfeld')
const subline = field('subline', 'Bitte freundlich grüßen')
const visitors = field('visitors', [])
const theme = field('theme', 'light')
const accent = field('accent', '#163A6C')

const accentPresets = [
  { name: 'Navy', value: '#163A6C' }, { name: 'Grün', value: '#B5CC18' },
  { name: 'Blau', value: '#3B82F6' }, { name: 'Grau', value: '#475569' },
]

function addVisitor() {
  const a = [...(visitors.value || [])]
  if (a.length >= 5) return
  a.push({ name: 'Neuer Gast', role: '', company: '', timeWindow: '', area: '', host: '', logoUrl: '', color: '#6B7280' })
  update('visitors', a)
}
function removeVisitor(i) { const a = [...(visitors.value || [])]; a.splice(i, 1); update('visitors', a) }
function setVisitor(i, k, v) { const a = [...(visitors.value || [])]; a[i] = { ...a[i], [k]: v }; update('visitors', a) }
async function onLogoPick(i, e) {
  await pickDesignerMedia(e, {
    kind: 'image',
    errorMessage: 'Logo konnte nicht geladen werden.',
    onLoaded(dataUrl) {
      setVisitor(i, 'logoUrl', dataUrl)
    },
  })
}

const formattedDate = computed(() => { if (!dateLabel.value) return ''; try { return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateLabel.value)) } catch { return dateLabel.value } })
function initials(name) {
  if (!name) return '?'
  const p = name.trim().replace(/^Dr\.?\s*/i, '').split(/\s+/)
  return p.length === 1 ? p[0][0] : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
      <div class="head">
        <div class="head-left">
          <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span><span class="head-divider"></span><span class="date-text">{{ formattedDate }}</span></div>
          <h1 class="welcome">{{ welcome }}</h1>
          <div class="count">Heute {{ visitors.length }} {{ visitors.length === 1 ? 'Gast' : 'Gäste' }} im Haus</div>
        </div>
        <div class="head-right"><div class="greet-card"><div class="greet-icon">&#9996;</div><div class="greet-text">{{ subline }}</div></div></div>
      </div>
      <div class="visitors">
        <div v-for="(v, i) in visitors" :key="i" class="visitor-card" :style="{ '--vcolor': v.color }">
          <div class="avatar"><img v-if="v.logoUrl" :src="v.logoUrl" alt="" /><span v-else class="avatar-initials">{{ initials(v.name) }}</span></div>
          <div class="v-head"><div class="v-name">{{ v.name }}</div><div class="v-role">{{ v.role }}<span v-if="v.role && v.company"> · </span>{{ v.company }}</div></div>
          <div class="v-meta">
            <div class="meta-item"><span class="meta-icon">&#9200;</span><span>{{ v.timeWindow }}</span></div>
            <div class="meta-item" v-if="v.area"><span class="meta-icon">&#9873;</span><span>{{ v.area }}</span></div>
          </div>
          <div class="v-host" v-if="v.host"><span class="host-label">Gastgeber</span><span class="host-name">{{ v.host }}</span></div>
        </div>
      </div>
      <div class="footer"><span>Empfang Blickle</span><span class="dot">·</span><span>Aushang für heute</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kopf</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Datum</span><input v-model="dateLabel" type="date" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Willkommen</span><input v-model="welcome" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Hinweis</span><input v-model="subline" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Gäste ({{ visitors.length }})</h4>
        <div v-for="(v, i) in visitors" :key="i" class="visitor-card-edit">
          <div class="vc-head"><span class="vc-nr">#{{ i + 1 }}</span><button class="btn-x" @click="removeVisitor(i)" v-if="visitors.length > 1">&times;</button></div>
          <label class="fld"><span class="fld-label">Name</span><input :value="v.name" @input="e => setVisitor(i, 'name', e.target.value)" type="text" class="fld-input" /></label>
          <div class="row-2">
            <label class="fld"><span class="fld-label">Funktion</span><input :value="v.role" @input="e => setVisitor(i, 'role', e.target.value)" type="text" class="fld-input" /></label>
            <label class="fld"><span class="fld-label">Firma</span><input :value="v.company" @input="e => setVisitor(i, 'company', e.target.value)" type="text" class="fld-input" /></label>
          </div>
          <div class="row-2">
            <label class="fld"><span class="fld-label">Zeit</span><input :value="v.timeWindow" @input="e => setVisitor(i, 'timeWindow', e.target.value)" type="text" class="fld-input" /></label>
            <label class="fld"><span class="fld-label">Bereich</span><input :value="v.area" @input="e => setVisitor(i, 'area', e.target.value)" type="text" class="fld-input" /></label>
          </div>
          <label class="fld"><span class="fld-label">Gastgeber</span><input :value="v.host" @input="e => setVisitor(i, 'host', e.target.value)" type="text" class="fld-input" /></label>
          <div class="row-2">
            <label class="fld"><span class="fld-label">Farbe</span><input :value="v.color" @input="e => setVisitor(i, 'color', e.target.value)" type="color" class="fld-input fld-color" /></label>
            <label class="fld"><span class="fld-label">Logo</span><input type="file" accept="image/*" class="fld-input fld-file" @change="e => onLogoPick(i, e)" /></label>
          </div>
        </div>
        <button class="btn-add" @click="addVisitor" v-if="visitors.length < 5">+ Gast</button>
      </section>
      <section class="fs"><h4 class="fs-title">Gestaltung</h4>
        <div class="fld"><span class="fld-label">Akzent</span>
          <div class="accent-row"><button v-for="p in accentPresets" :key="p.value" class="accent-swatch" :class="{ active: accent === p.value }" :style="{ background: p.value }" @click="accent = p.value"></button></div>
        </div>
        <div class="fld"><span class="fld-label">Theme</span>
          <div class="theme-row"><button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light</button><button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button></div>
        </div>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · fluid</span></div>
      <div class="preview-frame">
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
          <div class="head">
            <div class="head-left">
              <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span><span class="head-divider"></span><span class="date-text">{{ formattedDate }}</span></div>
              <h1 class="welcome">{{ welcome }}</h1>
              <div class="count">Heute {{ visitors.length }} {{ visitors.length === 1 ? 'Gast' : 'Gäste' }} im Haus</div>
            </div>
            <div class="head-right"><div class="greet-card"><div class="greet-icon">&#9996;</div><div class="greet-text">{{ subline }}</div></div></div>
          </div>
          <div class="visitors">
            <div v-for="(v, i) in visitors" :key="i" class="visitor-card" :style="{ '--vcolor': v.color }">
              <div class="avatar"><img v-if="v.logoUrl" :src="v.logoUrl" alt="" /><span v-else class="avatar-initials">{{ initials(v.name) }}</span></div>
              <div class="v-head"><div class="v-name">{{ v.name }}</div><div class="v-role">{{ v.role }}<span v-if="v.role && v.company"> · </span>{{ v.company }}</div></div>
              <div class="v-meta">
                <div class="meta-item"><span class="meta-icon">&#9200;</span><span>{{ v.timeWindow }}</span></div>
                <div class="meta-item" v-if="v.area"><span class="meta-icon">&#9873;</span><span>{{ v.area }}</span></div>
              </div>
              <div class="v-host" v-if="v.host"><span class="host-label">Gastgeber</span><span class="host-name">{{ v.host }}</span></div>
            </div>
          </div>
          <div class="footer"><span>Empfang Blickle</span><span class="dot">·</span><span>Aushang für heute</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 420px 1fr; gap: 20px; align-items: start; }
.form { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 220px); overflow-y: auto; position: sticky; top: 20px; }
.fs { margin-bottom: 22px; } .fs-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin-bottom: 10px; }
.fld { display: block; margin-bottom: 10px; } .fld-label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 7px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.82rem; font-family: inherit; box-sizing: border-box; }
.fld-file { padding: 4px; font-size: 0.72rem; } .fld-color { padding: 2px; height: 32px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.visitor-card-edit { background: var(--gray-50); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
.vc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.vc-nr { font-family: var(--font-display); font-size: 0.75rem; font-weight: 700; color: var(--gray-500); letter-spacing: 0.06em; }
.btn-x { width: 24px; height: 24px; background: transparent; border: 1px solid var(--color-border); border-radius: 4px; color: var(--gray-500); cursor: pointer; }
.btn-add { margin-top: 4px; padding: 7px 12px; background: var(--gray-50); border: 1px dashed var(--color-border); border-radius: 6px; color: var(--gray-600); font-size: 0.78rem; cursor: pointer; width: 100%; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; }
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.canvas { position: absolute; inset: 0; width: 100%; height: 100%; --u: min(calc(100cqw / 1920), calc(100cqh / 1080)); display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto; gap: calc(28 * var(--u)); padding: calc(60 * var(--u)) calc(80 * var(--u)); box-sizing: border-box; font-family: var(--font-body); }
.canvas.theme-light { background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%); color: #0B1F3A; }
.canvas.theme-dark { background: linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.head { grid-column: 1 / 13; display: grid; grid-template-columns: 2fr 1fr; gap: calc(28 * var(--u)); align-items: end; padding-bottom: calc(20 * var(--u)); border-bottom: 2px solid rgba(11,31,58,0.08); }
.theme-dark .head { border-bottom-color: rgba(255,255,255,0.1); }
.kicker-row { display: flex; align-items: center; gap: calc(14 * var(--u)); font-family: var(--font-display); font-size: calc(20 * var(--u)); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); margin-bottom: calc(14 * var(--u)); }
.theme-dark .kicker-row { color: #B5CC18; }
.kicker-dot { width: calc(12 * var(--u)); height: calc(12 * var(--u)); border-radius: 50%; background: currentColor; box-shadow: 0 0 calc(10 * var(--u)) currentColor; }
.head-divider { width: 1px; height: calc(18 * var(--u)); background: rgba(11,31,58,0.2); }
.theme-dark .head-divider { background: rgba(255,255,255,0.2); }
.date-text { font-family: var(--font-body); font-size: calc(18 * var(--u)); font-weight: 500; color: rgba(11,31,58,0.55); letter-spacing: 0.02em; text-transform: none; }
.theme-dark .date-text { color: rgba(255,255,255,0.6); }
.welcome { font-family: var(--font-display); font-size: calc(96 * var(--u)); font-weight: 700; line-height: 1; letter-spacing: -0.02em; margin: 0; }
.theme-dark .welcome { color: #fff; }
.count { margin-top: calc(12 * var(--u)); font-family: var(--font-body); font-size: calc(28 * var(--u)); font-weight: 500; color: rgba(11,31,58,0.65); }
.theme-dark .count { color: rgba(255,255,255,0.75); }
.greet-card { display: flex; align-items: center; gap: calc(14 * var(--u)); padding: calc(18 * var(--u)) calc(24 * var(--u)); background: rgba(11,31,58,0.04); border: 1px solid rgba(11,31,58,0.08); border-radius: calc(14 * var(--u)); }
.theme-dark .greet-card { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
.greet-icon { font-size: calc(38 * var(--u)); opacity: 0.75; }
.greet-text { font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 600; color: rgba(11,31,58,0.78); line-height: 1.2; }
.theme-dark .greet-text { color: rgba(255,255,255,0.88); }
.visitors { grid-column: 1 / 13; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: calc(22 * var(--u)); align-items: stretch; }
.visitor-card { background: rgba(255,255,255,0.95); border-radius: calc(18 * var(--u)); padding: calc(28 * var(--u)) calc(28 * var(--u)) calc(24 * var(--u)); display: flex; flex-direction: column; gap: calc(16 * var(--u)); box-shadow: 0 calc(8 * var(--u)) calc(24 * var(--u)) rgba(11,31,58,0.08); border-top: calc(6 * var(--u)) solid var(--vcolor); }
.theme-dark .visitor-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-top: calc(6 * var(--u)) solid var(--vcolor); }
.avatar { width: calc(90 * var(--u)); height: calc(90 * var(--u)); border-radius: calc(22 * var(--u)); background: var(--vcolor); color: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: var(--font-display); font-size: calc(40 * var(--u)); font-weight: 800; }
.avatar img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
.v-name { font-family: var(--font-display); font-size: calc(34 * var(--u)); font-weight: 700; color: #0B1F3A; line-height: 1.05; }
.theme-dark .v-name { color: #fff; }
.v-role { font-family: var(--font-body); font-size: calc(20 * var(--u)); font-weight: 500; color: rgba(11,31,58,0.6); }
.theme-dark .v-role { color: rgba(255,255,255,0.7); }
.v-meta { display: flex; flex-direction: column; gap: calc(8 * var(--u)); padding-top: calc(14 * var(--u)); border-top: 1px solid rgba(11,31,58,0.08); }
.theme-dark .v-meta { border-top-color: rgba(255,255,255,0.1); }
.meta-item { display: flex; align-items: baseline; gap: calc(12 * var(--u)); font-size: calc(18 * var(--u)); font-weight: 500; color: rgba(11,31,58,0.75); }
.theme-dark .meta-item { color: rgba(255,255,255,0.82); }
.meta-icon { font-size: calc(20 * var(--u)); color: var(--vcolor); width: calc(24 * var(--u)); text-align: center; }
.v-host { display: flex; align-items: baseline; gap: calc(10 * var(--u)); margin-top: auto; padding-top: calc(14 * var(--u)); border-top: 1px dashed rgba(11,31,58,0.12); }
.theme-dark .v-host { border-top-color: rgba(255,255,255,0.12); }
.host-label { font-size: calc(12 * var(--u)); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(11,31,58,0.45); }
.theme-dark .host-label { color: rgba(255,255,255,0.5); }
.host-name { font-family: var(--font-display); font-size: calc(20 * var(--u)); font-weight: 700; color: var(--accent); }
.theme-dark .host-name { color: #B5CC18; }
.footer { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(14 * var(--u)); padding-top: calc(18 * var(--u)); border-top: 1px solid rgba(11,31,58,0.08); font-size: calc(15 * var(--u)); color: rgba(11,31,58,0.5); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; margin-top: calc(14 * var(--u)); }
.theme-dark .footer { color: rgba(255,255,255,0.55); border-top-color: rgba(255,255,255,0.1); }
.dot { opacity: 0.6; } .spacer { flex: 1; }
.footer-logo { height: calc(26 * var(--u)); opacity: 0.7; }
.theme-dark .footer-logo { filter: brightness(0) invert(1); opacity: 0.85; }
</style>
