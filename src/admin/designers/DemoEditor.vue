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

const kicker = field('kicker', 'HR · MITARBEITER-FOKUS')
const headline = field('headline', 'Wie geht es dir gerade?')
const body = field('body', 'Anonyme 3-Minuten-Umfrage. Deine Meinung zaehlt.')
const videoUrl = field('videoUrl', '')
const videoPoster = field('videoPoster', '/Blicklelogo.png')
const qr1Url = field('qr1Url', 'https://blickle.com/motivationsindex-video')
const qr1Label = field('qr1Label', 'Zum Video')
const qr2Url = field('qr2Url', 'https://blickle.com/umfrage-motivation')
const qr2Label = field('qr2Label', 'Zur Umfrage')
const validUntil = field('validUntil', '2026-06-30')
const authorLabel = field('authorLabel', 'HR Blickle')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Signal-Rot', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Blau', value: '#3B82F6' },
]

function qrSrc(url) {
  if (!url) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=400x400&margin=4`
}

function onVideoPick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  videoUrl.value = URL.createObjectURL(file)
  videoPoster.value = ''
}

const formattedUntil = computed(() => {
  if (!validUntil.value) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(validUntil.value))
  } catch { return validUntil.value }
})

const previewFrame = ref(null)
const scale = ref(0.4)
function recomputeScale() {
  if (!previewFrame.value) return
  scale.value = Math.min(previewFrame.value.clientWidth / 1920, (previewFrame.value.clientHeight || Infinity) / 1080)
}
let ro = null
onMounted(() => {
  recomputeScale()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(recomputeScale)
    if (previewFrame.value) ro.observe(previewFrame.value)
  }
})
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <!-- Display-Mode: canvas only, fits container -->
  <div v-if="displayMode" class="display-wrap" ref="previewFrame">
    <div
      :class="['canvas', `theme-${theme}`]"
      :style="{ '--accent': accent, transform: `scale(${scale})` }"
    >
      <div class="block block-kicker"><span class="kicker-dot"></span><span class="kicker-text">{{ kicker }}</span></div>
      <div class="block block-headline">{{ headline }}</div>
      <div class="block block-media">
        <video v-if="videoUrl" :src="videoUrl" :poster="videoPoster || undefined" autoplay loop muted playsinline class="media-video"></video>
        <div v-else class="media-placeholder"><img v-if="videoPoster" :src="videoPoster" alt="" /></div>
      </div>
      <div class="block block-qr"><div class="qr-box"><img v-if="qr1Url" :src="qrSrc(qr1Url)" alt="" /></div><div class="qr-label">{{ qr1Label }}</div></div>
      <div class="block block-qr block-qr-2"><div class="qr-box"><img v-if="qr2Url" :src="qrSrc(qr2Url)" alt="" /></div><div class="qr-label">{{ qr2Label }}</div></div>
      <div class="block block-body">{{ body }}</div>
      <div class="block block-footer">
        <span>Gueltig bis {{ formattedUntil }}</span>
        <span class="dot-sep">·</span>
        <span>{{ authorLabel }}</span>
        <span class="footer-spacer"></span>
        <img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" />
      </div>
    </div>
  </div>

  <!-- Editor-Mode: form + preview -->
  <div v-else class="designer-split">
    <aside class="designer-form" v-if="!readonly">
      <div class="form-section">
        <h4 class="form-section-title">Inhalt</h4>
        <label class="fld">
          <span class="fld-label">Kicker / Ueberzeile</span>
          <input v-model="kicker" type="text" class="fld-input" />
          <span class="fld-hint">Kurz, GROSS, Akzentfarbe. Max. 30 Zeichen.</span>
        </label>
        <label class="fld">
          <span class="fld-label">Headline</span>
          <textarea v-model="headline" class="fld-input fld-textarea-sm" rows="2" />
        </label>
        <label class="fld">
          <span class="fld-label">Begleittext</span>
          <textarea v-model="body" class="fld-input" rows="3" />
        </label>
      </div>
      <div class="form-section">
        <h4 class="form-section-title">Video</h4>
        <label class="fld">
          <span class="fld-label">Datei waehlen</span>
          <input type="file" accept="video/*" class="fld-input fld-file" @change="onVideoPick" />
        </label>
        <label class="fld">
          <span class="fld-label">Poster-Bild (Fallback)</span>
          <input v-model="videoPoster" type="text" class="fld-input" />
        </label>
      </div>
      <div class="form-section">
        <h4 class="form-section-title">QR-Codes</h4>
        <div class="qr-fields">
          <label class="fld"><span class="fld-label">QR 1 — URL</span><input v-model="qr1Url" type="url" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">QR 1 — Beschriftung</span><input v-model="qr1Label" type="text" class="fld-input" /></label>
        </div>
        <div class="qr-fields">
          <label class="fld"><span class="fld-label">QR 2 — URL</span><input v-model="qr2Url" type="url" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">QR 2 — Beschriftung</span><input v-model="qr2Label" type="text" class="fld-input" /></label>
        </div>
      </div>
      <div class="form-section">
        <h4 class="form-section-title">Meta</h4>
        <div class="qr-fields">
          <label class="fld"><span class="fld-label">Gueltig bis</span><input v-model="validUntil" type="date" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">Autor</span><input v-model="authorLabel" type="text" class="fld-input" /></label>
        </div>
      </div>
      <div class="form-section">
        <h4 class="form-section-title">Gestaltung</h4>
        <div class="fld">
          <span class="fld-label">Akzentfarbe</span>
          <div class="accent-row">
            <button v-for="p in accentPresets" :key="p.value" class="accent-swatch"
              :class="{ active: accent === p.value }" :style="{ background: p.value }"
              :title="p.name" @click="accent = p.value"></button>
          </div>
        </div>
        <div class="fld">
          <span class="fld-label">Theme</span>
          <div class="theme-row">
            <button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button>
            <button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light</button>
          </div>
        </div>
      </div>
    </aside>

    <section class="designer-preview">
      <div class="preview-header">
        <span class="preview-label">Live-Vorschau · 1920 × 1080</span>
      </div>
      <div class="preview-frame" ref="previewFrame">
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
          <div class="block block-kicker"><span class="kicker-dot"></span><span class="kicker-text">{{ kicker }}</span></div>
          <div class="block block-headline">{{ headline }}</div>
          <div class="block block-media">
            <video v-if="videoUrl" :src="videoUrl" :poster="videoPoster || undefined" autoplay loop muted playsinline class="media-video"></video>
            <div v-else class="media-placeholder"><img v-if="videoPoster" :src="videoPoster" alt="" /><div class="media-hint">Video hier ablegen</div></div>
          </div>
          <div class="block block-qr"><div class="qr-box"><img v-if="qr1Url" :src="qrSrc(qr1Url)" alt="" /></div><div class="qr-label">{{ qr1Label }}</div></div>
          <div class="block block-qr block-qr-2"><div class="qr-box"><img v-if="qr2Url" :src="qrSrc(qr2Url)" alt="" /></div><div class="qr-label">{{ qr2Label }}</div></div>
          <div class="block block-body">{{ body }}</div>
          <div class="block block-footer">
            <span>Gueltig bis {{ formattedUntil }}</span>
            <span class="dot-sep">·</span>
            <span>{{ authorLabel }}</span>
            <span class="footer-spacer"></span>
            <img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.designer-split { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; }
.designer-form { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 220px); overflow-y: auto; position: sticky; top: 20px; }
.form-section { margin-bottom: 22px; }
.form-section-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin-bottom: 10px; }
.fld { display: block; margin-bottom: 12px; }
.fld-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
.fld-input:focus { outline: none; border-color: var(--blickle-navy); box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08); }
.fld-textarea-sm { resize: vertical; min-height: 50px; }
.fld-file { padding: 4px; font-size: 0.75rem; }
.fld-hint { display: block; font-size: 0.7rem; color: var(--gray-400); margin-top: 3px; font-style: italic; }
.qr-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; }
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; }
.theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; }
.theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.designer-preview { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06); background: #000; }

.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; background: #000; }

.canvas { position: absolute; top: 50%; left: 50%; width: 1920px; height: 1080px; margin: -540px 0 0 -960px; transform-origin: center center; display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto; gap: 28px; padding: 56px 72px; font-family: var(--font-body); box-sizing: border-box; align-content: space-between; }
.canvas.theme-dark { background: linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }

.block-kicker { grid-column: 1 / 13; display: flex; align-items: center; gap: 14px; font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: 0.2em; color: var(--accent); text-transform: uppercase; }
.kicker-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 16px var(--accent); }
.block-headline { grid-column: 1 / 13; font-family: var(--font-display); font-size: 96px; font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; }
.theme-dark .block-headline { color: #fff; }
.theme-light .block-headline { color: #0B1F3A; }
.block-media { grid-column: 1 / 7; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; background: rgba(0,0,0,0.2); position: relative; box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
.media-video, .media-placeholder img { width: 100%; height: 100%; object-fit: cover; }
.media-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); flex-direction: column; gap: 8px; }
.theme-light .media-placeholder { background: rgba(0,0,0,0.04); }
.media-placeholder img { width: 30%; height: auto; opacity: 0.45; object-fit: contain; }
.media-hint { font-size: 0.85rem; color: rgba(255,255,255,0.45); font-style: italic; }
.theme-light .media-hint { color: rgba(0,0,0,0.4); }
.block-qr { grid-column: 7 / 10; display: flex; flex-direction: column; align-items: center; gap: 14px; justify-content: center; }
.block-qr-2 { grid-column: 10 / 13; }
.qr-box { aspect-ratio: 1; width: 100%; background: #fff; border-radius: 14px; padding: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 28px rgba(0,0,0,0.3); box-sizing: border-box; }
.qr-box img { width: 100%; height: 100%; object-fit: contain; }
.qr-label { font-family: var(--font-display); font-size: 28px; font-weight: 700; text-align: center; color: var(--accent); letter-spacing: 0.04em; }
.block-body { grid-column: 1 / 13; font-size: 34px; line-height: 1.35; font-weight: 400; max-width: 85%; }
.theme-dark .block-body { color: rgba(255,255,255,0.82); }
.theme-light .block-body { color: rgba(11, 31, 58, 0.78); }
.block-footer { grid-column: 1 / 13; display: flex; align-items: center; gap: 14px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 18px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
.theme-light .block-footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11, 31, 58, 0.6); }
.theme-dark .block-footer { color: rgba(255,255,255,0.55); }
.dot-sep { opacity: 0.6; }
.footer-spacer { flex: 1; }
.footer-logo { height: 32px; filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
