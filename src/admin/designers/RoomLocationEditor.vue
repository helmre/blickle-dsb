<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field, update } = useParamModel(props, emit)

const kicker = field('kicker', 'NEU BEI BLICKLE')
const headline = field('headline', 'Raum fuer Arbeitskleidung')
const subHeadline = field('subHeadline', 'Anprobe jederzeit moeglich')
const body = field('body', 'Ab sofort koennen alle Mitarbeiterinnen und Mitarbeiter ihre Arbeitskleidung im neuen Anprobe-Raum testen.')
const imageUrl = field('imageUrl', '/Blicklelogo.png')
const buildingName = field('buildingName', 'Gebaeude 2 · Verwaltung')
const floor = field('floor', 'Erdgeschoss')
const roomLabel = field('roomLabel', 'Raum EG-12')
const openingHours = field('openingHours', [])
const directionHint = field('directionHint', 'Vom Haupteingang rechts, 2. Tuer links')
const authorLabel = field('authorLabel', 'Personalabteilung')
const validUntil = field('validUntil', '2026-12-31')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Gruen', value: '#B5CC18' }, { name: 'Navy', value: '#163A6C' },
  { name: 'Blau', value: '#3B82F6' }, { name: 'Orange', value: '#F97316' },
]

function onImagePick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  imageUrl.value = URL.createObjectURL(file)
}
function addHour() { const a = [...(openingHours.value || [])]; if (a.length >= 4) return; a.push({ day: '', time: '' }); update('openingHours', a) }
function removeHour(i) { const a = [...(openingHours.value || [])]; a.splice(i, 1); update('openingHours', a) }
function setHour(i, k, v) { const a = [...(openingHours.value || [])]; a[i] = { ...a[i], [k]: v }; update('openingHours', a) }

const formattedUntil = computed(() => { if (!validUntil.value) return ''; try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(validUntil.value)) } catch { return validUntil.value } })

const previewFrame = ref(null)
const scale = ref(0.4)
function recomputeScale() { if (previewFrame.value) scale.value = previewFrame.value.clientWidth / 1920 }
let ro = null
onMounted(() => { recomputeScale(); if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(recomputeScale); if (previewFrame.value) ro.observe(previewFrame.value) } })
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div v-if="displayMode" class="display-wrap" ref="previewFrame">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
      <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
      <div class="headline-row"><h1 class="headline">{{ headline }}</h1><div class="sub-headline" v-if="subHeadline">{{ subHeadline }}</div></div>
      <div class="main-row">
        <div class="photo-card">
          <img v-if="imageUrl" :src="imageUrl" class="photo" alt="" />
          <div class="photo-caption"><span class="caption-dot"></span><span>{{ roomLabel }}</span></div>
        </div>
        <div class="wayfinder">
          <div class="wayfinder-top"><div class="way-label">So findest du hin</div></div>
          <div class="way-lines">
            <div class="way-line"><div class="way-num">1</div><div class="way-body"><div class="way-hdr">Gebaeude</div><div class="way-val">{{ buildingName }}</div></div></div>
            <div class="way-line"><div class="way-num">2</div><div class="way-body"><div class="way-hdr">Etage</div><div class="way-val">{{ floor }}</div></div></div>
            <div class="way-line"><div class="way-num">3</div><div class="way-body"><div class="way-hdr">Raum</div><div class="way-val">{{ roomLabel }}</div></div></div>
          </div>
          <div class="direction-hint" v-if="directionHint">&#10148; {{ directionHint }}</div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="body-text">{{ body }}</div>
        <div class="hours-card">
          <div class="hours-title">Oeffnungszeiten</div>
          <div class="hours-list"><div v-for="(oh, i) in openingHours" :key="i" class="hour-item"><span class="hour-day">{{ oh.day }}</span><span class="hour-dots"></span><span class="hour-time">{{ oh.time }}</span></div></div>
        </div>
      </div>
      <div class="footer"><span>Gueltig bis {{ formattedUntil }}</span><span class="dot">·</span><span>{{ authorLabel }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kernaussage</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Ueberschrift</span><textarea v-model="headline" class="fld-input fld-small" rows="2" /></label>
        <label class="fld"><span class="fld-label">Unterzeile</span><input v-model="subHeadline" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Foto</h4>
        <label class="fld"><span class="fld-label">Bild waehlen</span><input type="file" accept="image/*" class="fld-input fld-file" @change="onImagePick" /></label>
        <label class="fld"><span class="fld-label">Pfad (Fallback)</span><input v-model="imageUrl" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Wegweiser</h4>
        <label class="fld"><span class="fld-label">Gebaeude</span><input v-model="buildingName" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Etage</span><input v-model="floor" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Raum</span><input v-model="roomLabel" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Wegbeschreibung</span><input v-model="directionHint" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Oeffnungszeiten</h4>
        <div v-for="(oh, i) in openingHours" :key="i" class="hour-row">
          <input :value="oh.day" @input="e => setHour(i, 'day', e.target.value)" type="text" class="fld-input hour-day" placeholder="Mo – Fr" />
          <input :value="oh.time" @input="e => setHour(i, 'time', e.target.value)" type="text" class="fld-input hour-time" placeholder="07:00 – 17:00" />
          <button class="btn-x" @click="removeHour(i)" v-if="openingHours.length > 1">&times;</button>
        </div>
        <button class="btn-add" @click="addHour" v-if="openingHours.length < 4">+ Zeile</button>
      </section>
      <section class="fs"><h4 class="fs-title">Details &amp; Gestaltung</h4>
        <label class="fld"><span class="fld-label">Begleittext</span><textarea v-model="body" class="fld-input" rows="3" /></label>
        <div class="row-2">
          <label class="fld"><span class="fld-label">Gueltig bis</span><input v-model="validUntil" type="date" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">Autor</span><input v-model="authorLabel" type="text" class="fld-input" /></label>
        </div>
        <div class="fld"><span class="fld-label">Akzent</span>
          <div class="accent-row"><button v-for="p in accentPresets" :key="p.value" class="accent-swatch" :class="{ active: accent === p.value }" :style="{ background: p.value }" @click="accent = p.value"></button></div>
        </div>
        <div class="fld"><span class="fld-label">Theme</span>
          <div class="theme-row"><button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button><button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light</button></div>
        </div>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · 1920 × 1080</span></div>
      <div class="preview-frame" ref="previewFrame">
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
          <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
          <div class="headline-row"><h1 class="headline">{{ headline }}</h1><div class="sub-headline" v-if="subHeadline">{{ subHeadline }}</div></div>
          <div class="main-row">
            <div class="photo-card">
              <img v-if="imageUrl" :src="imageUrl" class="photo" alt="" />
              <div class="photo-caption"><span class="caption-dot"></span><span>{{ roomLabel }}</span></div>
            </div>
            <div class="wayfinder">
              <div class="wayfinder-top"><div class="way-label">So findest du hin</div></div>
              <div class="way-lines">
                <div class="way-line"><div class="way-num">1</div><div class="way-body"><div class="way-hdr">Gebaeude</div><div class="way-val">{{ buildingName }}</div></div></div>
                <div class="way-line"><div class="way-num">2</div><div class="way-body"><div class="way-hdr">Etage</div><div class="way-val">{{ floor }}</div></div></div>
                <div class="way-line"><div class="way-num">3</div><div class="way-body"><div class="way-hdr">Raum</div><div class="way-val">{{ roomLabel }}</div></div></div>
              </div>
              <div class="direction-hint" v-if="directionHint">&#10148; {{ directionHint }}</div>
            </div>
          </div>
          <div class="bottom-row">
            <div class="body-text">{{ body }}</div>
            <div class="hours-card">
              <div class="hours-title">Oeffnungszeiten</div>
              <div class="hours-list"><div v-for="(oh, i) in openingHours" :key="i" class="hour-item"><span class="hour-day">{{ oh.day }}</span><span class="hour-dots"></span><span class="hour-time">{{ oh.time }}</span></div></div>
            </div>
          </div>
          <div class="footer"><span>Gueltig bis {{ formattedUntil }}</span><span class="dot">·</span><span>{{ authorLabel }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
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
.fld-small { min-height: 50px; resize: vertical; } .fld-file { padding: 4px; font-size: 0.75rem; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.hour-row { display: grid; grid-template-columns: 1fr 1.3fr 32px; gap: 4px; margin-bottom: 4px; }
.btn-x { background: transparent; border: 1px solid var(--color-border); border-radius: 6px; color: var(--gray-500); cursor: pointer; }
.btn-add { margin-top: 6px; padding: 6px 12px; background: var(--gray-50); border: 1px dashed var(--color-border); border-radius: 6px; color: var(--gray-600); font-size: 0.78rem; cursor: pointer; width: 100%; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; }
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; }
.display-wrap { width: 100%; height: 100%; aspect-ratio: 16 / 9; overflow: hidden; position: relative; background: #000; }

.canvas { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; transform-origin: top left; display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto; gap: 24px; padding: 56px 72px; box-sizing: border-box; font-family: var(--font-body); align-content: start; }
.canvas.theme-dark { background: radial-gradient(ellipse at 80% 100%, rgba(181,204,24,0.06) 0%, transparent 55%), linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }
.kicker-row { grid-column: 1 / 13; display: flex; align-items: center; gap: 14px; font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 18px var(--accent); }
.headline-row { grid-column: 1 / 13; }
.headline { font-family: var(--font-display); font-size: 92px; font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; margin: 0; }
.theme-dark .headline { color: #fff; } .theme-light .headline { color: #0B1F3A; }
.sub-headline { margin-top: 10px; font-family: var(--font-display); font-size: 34px; font-weight: 500; color: var(--accent); }
.main-row { grid-column: 1 / 13; display: grid; grid-template-columns: 7fr 5fr; gap: 32px; margin-top: 6px; }
.photo-card { position: relative; aspect-ratio: 16 / 10; border-radius: 20px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.45); background: rgba(0,0,0,0.25); }
.photo { width: 100%; height: 100%; object-fit: cover; }
.photo-caption { position: absolute; left: 24px; bottom: 24px; display: flex; align-items: center; gap: 12px; background: rgba(10,26,51,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 10px 22px; font-family: var(--font-display); font-size: 22px; font-weight: 600; color: #fff; }
.caption-dot { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent); }
.wayfinder { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); padding: 30px 34px; display: flex; flex-direction: column; gap: 20px; position: relative; overflow: hidden; }
.way-label { font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.65); }
.theme-light .way-label { color: rgba(11,31,58,0.65); }
.way-lines { display: flex; flex-direction: column; gap: 10px; }
.way-line { display: flex; gap: 16px; align-items: center; padding: 14px 16px; background: rgba(0,0,0,0.25); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
.theme-light .way-line { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08); }
.way-num { width: 38px; height: 38px; border-radius: 50%; background: var(--accent); color: #0B1F3A; font-family: var(--font-display); font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.way-hdr { font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 2px; }
.theme-light .way-hdr { color: rgba(11,31,58,0.5); }
.way-val { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: #fff; }
.theme-light .way-val { color: #0B1F3A; }
.direction-hint { padding: 12px 16px; background: rgba(181,204,24,0.08); border: 1px solid rgba(181,204,24,0.2); border-radius: 10px; font-size: 17px; color: rgba(255,255,255,0.85); font-weight: 500; }
.theme-light .direction-hint { color: rgba(11,31,58,0.85); background: rgba(181,204,24,0.12); }
.bottom-row { grid-column: 1 / 13; display: grid; grid-template-columns: 7fr 5fr; gap: 32px; align-items: center; }
.body-text { font-size: 30px; line-height: 1.35; color: rgba(255,255,255,0.82); }
.theme-light .body-text { color: rgba(11,31,58,0.8); }
.hours-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-top: 5px solid var(--accent); border-radius: 14px; padding: 22px 26px; }
.hours-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
.theme-light .hours-title { color: rgba(11,31,58,0.6); }
.hours-list { display: flex; flex-direction: column; gap: 6px; }
.hour-item { display: flex; align-items: baseline; gap: 10px; }
.hour-day { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #fff; min-width: 90px; }
.theme-light .hour-day { color: #0B1F3A; }
.hour-dots { flex: 1; border-bottom: 2px dotted rgba(255,255,255,0.2); transform: translateY(-4px); }
.theme-light .hour-dots { border-bottom-color: rgba(0,0,0,0.15); }
.hour-time { font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--accent); }
.footer { grid-column: 1 / 13; display: flex; align-items: center; gap: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 16px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: 8px; }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.dot { opacity: 0.6; } .spacer { flex: 1; }
.footer-logo { height: 30px; filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
