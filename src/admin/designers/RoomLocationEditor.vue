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

const kicker = field('kicker', 'NEU BEI BLICKLE')
const headline = field('headline', 'Raum für Arbeitskleidung')
const subHeadline = field('subHeadline', 'Anprobe jederzeit möglich')
const body = field('body', 'Ab sofort können alle Mitarbeiterinnen und Mitarbeiter ihre Arbeitskleidung im neuen Anprobe-Raum testen.')
const imageUrl = field('imageUrl', '/Blicklelogo.png')
const buildingName = field('buildingName', 'Gebäude 2 · Verwaltung')
const floor = field('floor', 'Erdgeschoss')
const roomLabel = field('roomLabel', 'Raum EG-12')
const openingHours = field('openingHours', [])
const directionHint = field('directionHint', 'Vom Haupteingang rechts, 2. Tür links')
const authorLabel = field('authorLabel', 'Personalabteilung')
const validUntil = field('validUntil', '2026-12-31')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Grün', value: '#B5CC18' }, { name: 'Navy', value: '#163A6C' },
  { name: 'Blau', value: '#3B82F6' }, { name: 'Orange', value: '#F97316' },
]

async function onImagePick(e) {
  await pickDesignerMedia(e, {
    kind: 'image',
    errorMessage: 'Bild konnte nicht geladen werden.',
    onLoaded(dataUrl) {
      imageUrl.value = dataUrl
    },
  })
}
function addHour() { const a = [...(openingHours.value || [])]; if (a.length >= 4) return; a.push({ day: '', time: '' }); update('openingHours', a) }
function removeHour(i) { const a = [...(openingHours.value || [])]; a.splice(i, 1); update('openingHours', a) }
function setHour(i, k, v) { const a = [...(openingHours.value || [])]; a[i] = { ...a[i], [k]: v }; update('openingHours', a) }

const formattedUntil = computed(() => { if (!validUntil.value) return ''; try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(validUntil.value)) } catch { return validUntil.value } })
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
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
            <div class="way-line"><div class="way-num">1</div><div class="way-body"><div class="way-hdr">Gebäude</div><div class="way-val">{{ buildingName }}</div></div></div>
            <div class="way-line"><div class="way-num">2</div><div class="way-body"><div class="way-hdr">Etage</div><div class="way-val">{{ floor }}</div></div></div>
            <div class="way-line"><div class="way-num">3</div><div class="way-body"><div class="way-hdr">Raum</div><div class="way-val">{{ roomLabel }}</div></div></div>
          </div>
          <div class="direction-hint" v-if="directionHint">&#10148; {{ directionHint }}</div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="body-text">{{ body }}</div>
        <div class="hours-card">
          <div class="hours-title">Öffnungszeiten</div>
          <div class="hours-list"><div v-for="(oh, i) in openingHours" :key="i" class="hour-item"><span class="hour-day">{{ oh.day }}</span><span class="hour-dots"></span><span class="hour-time">{{ oh.time }}</span></div></div>
        </div>
      </div>
      <div class="footer"><span>Gültig bis {{ formattedUntil }}</span><span class="dot">·</span><span>{{ authorLabel }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kernaussage</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Überschrift</span><textarea v-model="headline" class="fld-input fld-small" rows="2" /></label>
        <label class="fld"><span class="fld-label">Unterzeile</span><input v-model="subHeadline" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Foto</h4>
        <label class="fld"><span class="fld-label">Bild wählen</span><input type="file" accept="image/*" class="fld-input fld-file" @change="onImagePick" /></label>
        <label class="fld"><span class="fld-label">Pfad (Fallback)</span><input v-model="imageUrl" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Wegweiser</h4>
        <label class="fld"><span class="fld-label">Gebäude</span><input v-model="buildingName" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Etage</span><input v-model="floor" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Raum</span><input v-model="roomLabel" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Wegbeschreibung</span><input v-model="directionHint" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Öffnungszeiten</h4>
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
          <label class="fld"><span class="fld-label">Gültig bis</span><input v-model="validUntil" type="date" class="fld-input" /></label>
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
      <div class="preview-header"><span>Live-Vorschau · fluid</span></div>
      <div class="preview-frame">
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
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
                <div class="way-line"><div class="way-num">1</div><div class="way-body"><div class="way-hdr">Gebäude</div><div class="way-val">{{ buildingName }}</div></div></div>
                <div class="way-line"><div class="way-num">2</div><div class="way-body"><div class="way-hdr">Etage</div><div class="way-val">{{ floor }}</div></div></div>
                <div class="way-line"><div class="way-num">3</div><div class="way-body"><div class="way-hdr">Raum</div><div class="way-val">{{ roomLabel }}</div></div></div>
              </div>
              <div class="direction-hint" v-if="directionHint">&#10148; {{ directionHint }}</div>
            </div>
          </div>
          <div class="bottom-row">
            <div class="body-text">{{ body }}</div>
            <div class="hours-card">
              <div class="hours-title">Öffnungszeiten</div>
              <div class="hours-list"><div v-for="(oh, i) in openingHours" :key="i" class="hour-item"><span class="hour-day">{{ oh.day }}</span><span class="hour-dots"></span><span class="hour-time">{{ oh.time }}</span></div></div>
            </div>
          </div>
          <div class="footer"><span>Gültig bis {{ formattedUntil }}</span><span class="dot">·</span><span>{{ authorLabel }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="" class="footer-logo" /></div>
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
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.canvas { position: absolute; inset: 0; width: 100%; height: 100%; --u: min(calc(100cqw / 1920), calc(100cqh / 1080)); display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto; gap: calc(24 * var(--u)); padding: calc(56 * var(--u)) calc(72 * var(--u)); box-sizing: border-box; font-family: var(--font-body); align-content: start; }
.canvas.theme-dark { background: radial-gradient(ellipse at 80% 100%, rgba(181,204,24,0.06) 0%, transparent 55%), linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }
.kicker-row { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(14 * var(--u)); font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: calc(14 * var(--u)); height: calc(14 * var(--u)); border-radius: 50%; background: var(--accent); box-shadow: 0 0 calc(18 * var(--u)) var(--accent); }
.headline-row { grid-column: 1 / 13; }
.headline { font-family: var(--font-display); font-size: calc(92 * var(--u)); font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; margin: 0; }
.theme-dark .headline { color: #fff; } .theme-light .headline { color: #0B1F3A; }
.sub-headline { margin-top: calc(10 * var(--u)); font-family: var(--font-display); font-size: calc(34 * var(--u)); font-weight: 500; color: var(--accent); }
.main-row { grid-column: 1 / 13; display: grid; grid-template-columns: 7fr 5fr; gap: calc(32 * var(--u)); margin-top: calc(6 * var(--u)); }
.photo-card { position: relative; aspect-ratio: 16 / 10; border-radius: calc(20 * var(--u)); overflow: hidden; box-shadow: 0 calc(30 * var(--u)) calc(60 * var(--u)) rgba(0,0,0,0.45); background: rgba(0,0,0,0.25); }
.photo { width: 100%; height: 100%; object-fit: cover; }
.photo-caption { position: absolute; left: calc(24 * var(--u)); bottom: calc(24 * var(--u)); display: flex; align-items: center; gap: calc(12 * var(--u)); background: rgba(10,26,51,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: calc(10 * var(--u)) calc(22 * var(--u)); font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 600; color: #fff; }
.caption-dot { width: calc(10 * var(--u)); height: calc(10 * var(--u)); background: var(--accent); border-radius: 50%; box-shadow: 0 0 calc(10 * var(--u)) var(--accent); }
.wayfinder { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border-radius: calc(20 * var(--u)); border: 1px solid rgba(255,255,255,0.1); padding: calc(30 * var(--u)) calc(34 * var(--u)); display: flex; flex-direction: column; gap: calc(20 * var(--u)); position: relative; overflow: hidden; }
.way-label { font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.65); }
.theme-light .way-label { color: rgba(11,31,58,0.65); }
.way-lines { display: flex; flex-direction: column; gap: calc(10 * var(--u)); }
.way-line { display: flex; gap: calc(16 * var(--u)); align-items: center; padding: calc(14 * var(--u)) calc(16 * var(--u)); background: rgba(0,0,0,0.25); border-radius: calc(12 * var(--u)); border: 1px solid rgba(255,255,255,0.08); }
.theme-light .way-line { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08); }
.way-num { width: calc(38 * var(--u)); height: calc(38 * var(--u)); border-radius: 50%; background: var(--accent); color: #0B1F3A; font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.way-hdr { font-size: calc(13 * var(--u)); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: calc(2 * var(--u)); }
.theme-light .way-hdr { color: rgba(11,31,58,0.5); }
.way-val { font-family: var(--font-display); font-size: calc(28 * var(--u)); font-weight: 700; color: #fff; }
.theme-light .way-val { color: #0B1F3A; }
.direction-hint { padding: calc(12 * var(--u)) calc(16 * var(--u)); background: rgba(181,204,24,0.08); border: 1px solid rgba(181,204,24,0.2); border-radius: calc(10 * var(--u)); font-size: calc(17 * var(--u)); color: rgba(255,255,255,0.85); font-weight: 500; }
.theme-light .direction-hint { color: rgba(11,31,58,0.85); background: rgba(181,204,24,0.12); }
.bottom-row { grid-column: 1 / 13; display: grid; grid-template-columns: 7fr 5fr; gap: calc(32 * var(--u)); align-items: center; }
.body-text { font-size: calc(30 * var(--u)); line-height: 1.35; color: rgba(255,255,255,0.82); }
.theme-light .body-text { color: rgba(11,31,58,0.8); }
.hours-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-top: calc(5 * var(--u)) solid var(--accent); border-radius: calc(14 * var(--u)); padding: calc(22 * var(--u)) calc(26 * var(--u)); }
.hours-title { font-family: var(--font-display); font-size: calc(18 * var(--u)); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: calc(12 * var(--u)); }
.theme-light .hours-title { color: rgba(11,31,58,0.6); }
.hours-list { display: flex; flex-direction: column; gap: calc(6 * var(--u)); }
.hour-item { display: flex; align-items: baseline; gap: calc(10 * var(--u)); }
.hour-day { font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 700; color: #fff; min-width: calc(90 * var(--u)); }
.theme-light .hour-day { color: #0B1F3A; }
.hour-dots { flex: 1; border-bottom: 2px dotted rgba(255,255,255,0.2); transform: translateY(-4px); }
.theme-light .hour-dots { border-bottom-color: rgba(0,0,0,0.15); }
.hour-time { font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 600; color: var(--accent); }
.footer { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(14 * var(--u)); padding-top: calc(14 * var(--u)); border-top: 1px solid rgba(255,255,255,0.08); font-size: calc(16 * var(--u)); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: calc(8 * var(--u)); }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.dot { opacity: 0.6; } .spacer { flex: 1; }
.footer-logo { height: calc(30 * var(--u)); filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
