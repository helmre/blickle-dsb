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

const kicker = field('kicker', 'BOTSCHAFT DER GESCHAEFTSLEITUNG')
const quote = field('quote', 'Unser Erfolg ist kein Zufall — er entsteht, weil wir als Team jeden Tag Verantwortung uebernehmen und fueinander einstehen.')
const authorName = field('authorName', 'David Blickle')
const authorPosition = field('authorPosition', 'Geschaeftsfuehrung')
const photoUrl = field('photoUrl', '')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Gold', value: '#F59E0B' },
  { name: 'Blau', value: '#3B82F6' },
]

function onPhotoPick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  photoUrl.value = URL.createObjectURL(file)
}

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
  <div v-if="displayMode" class="display-wrap" ref="previewFrame">
    <div :class="['canvas', `theme-${theme}`, { 'has-photo': photoUrl }]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
      <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
      <div class="main-row">
        <div v-if="photoUrl" class="photo-col">
          <div class="photo-frame">
            <img :src="photoUrl" :alt="authorName" class="portrait" />
            <div class="photo-glow"></div>
          </div>
        </div>
        <div class="quote-col">
          <div class="quote-mark-big">&ldquo;</div>
          <blockquote class="quote-text">{{ quote }}</blockquote>
          <div class="author-block">
            <div class="author-accent"></div>
            <div class="author-info">
              <div class="author-name">{{ authorName }}</div>
              <div class="author-position">{{ authorPosition }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>Blickle Raeder+Rollen GmbH · Rosenfeld</span></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kicker</h4>
        <label class="fld"><span class="fld-label">Ueberzeile</span><input v-model="kicker" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Zitat</h4>
        <label class="fld"><span class="fld-label">Text</span><textarea v-model="quote" class="fld-input" rows="6" /></label>
        <span class="fld-hint">Kurz und pointiert. Max. 2-3 Saetze.</span>
      </section>
      <section class="fs"><h4 class="fs-title">Autor</h4>
        <label class="fld"><span class="fld-label">Name</span><input v-model="authorName" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Position</span><input v-model="authorPosition" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Portrait (optional)</h4>
        <label class="fld"><span class="fld-label">Datei</span><input type="file" accept="image/*" class="fld-input fld-file" @change="onPhotoPick" /></label>
        <label class="fld"><span class="fld-label">URL (Fallback)</span><input v-model="photoUrl" type="text" class="fld-input" placeholder="/media/ceo.jpg" /></label>
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
      <div class="preview-header"><span>Live-Vorschau · 1920 × 1080</span></div>
      <div class="preview-frame" ref="previewFrame">
        <div :class="['canvas', `theme-${theme}`, { 'has-photo': photoUrl }]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
          <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
          <div class="main-row">
            <div v-if="photoUrl" class="photo-col">
              <div class="photo-frame">
                <img :src="photoUrl" :alt="authorName" class="portrait" />
                <div class="photo-glow"></div>
              </div>
            </div>
            <div class="quote-col">
              <div class="quote-mark-big">&ldquo;</div>
              <blockquote class="quote-text">{{ quote }}</blockquote>
              <div class="author-block">
                <div class="author-accent"></div>
                <div class="author-info">
                  <div class="author-name">{{ authorName }}</div>
                  <div class="author-position">{{ authorPosition }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>Blickle Raeder+Rollen GmbH · Rosenfeld</span></div>
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
.fld-file { padding: 4px; font-size: 0.75rem; }
.fld-hint { display: block; font-size: 0.7rem; color: var(--gray-400); margin-top: 3px; font-style: italic; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; }
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; }
.theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; }
.theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; background: #000; }

.canvas { position: absolute; top: 50%; left: 50%; width: 1920px; height: 1080px; margin: -540px 0 0 -960px; transform-origin: center center; display: grid; grid-template-rows: auto 1fr auto; gap: 40px; padding: 72px 96px; box-sizing: border-box; font-family: var(--font-body); }
.canvas.theme-dark { background: radial-gradient(ellipse at 30% 20%, rgba(181,204,24,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(22,58,108,0.3) 0%, transparent 50%), linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }
.canvas::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(135deg, transparent 0px, transparent 120px, rgba(255,255,255,0.02) 120px, rgba(255,255,255,0.02) 160px); pointer-events: none; }

.kicker-row { display: flex; align-items: center; gap: 16px; font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); z-index: 2; }
.kicker-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 18px var(--accent); }

.main-row { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; z-index: 1; position: relative; }
.has-photo .main-row { grid-template-columns: 420px 1fr; }

.photo-col { display: flex; align-items: center; justify-content: center; }
.photo-frame { position: relative; width: 380px; height: 460px; border-radius: 24px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08); }
.portrait { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-glow { position: absolute; inset: 0; box-shadow: inset 0 -120px 80px -60px rgba(0,0,0,0.5); pointer-events: none; }

.quote-col { display: flex; flex-direction: column; gap: 36px; justify-content: center; }
.quote-mark-big { font-family: Georgia, 'Times New Roman', serif; font-size: 240px; font-weight: 700; line-height: 0.7; color: var(--accent); opacity: 0.85; text-shadow: 0 0 40px color-mix(in srgb, var(--accent) 40%, transparent); }
.quote-text { margin: 0; font-family: var(--font-display); font-size: 64px; font-weight: 500; line-height: 1.15; letter-spacing: -0.015em; color: #fff; font-style: italic; }
.theme-light .quote-text { color: #0B1F3A; }

.author-block { display: flex; align-items: stretch; gap: 24px; }
.author-accent { width: 6px; border-radius: 3px; background: var(--accent); box-shadow: 0 0 16px var(--accent); }
.author-info { display: flex; flex-direction: column; gap: 6px; }
.author-name { font-family: var(--font-display); font-size: 42px; font-weight: 700; color: #fff; letter-spacing: -0.02em; line-height: 1; }
.theme-light .author-name { color: #0B1F3A; }
.author-position { font-family: var(--font-body); font-size: 22px; font-weight: 500; color: rgba(255,255,255,0.6); letter-spacing: 0.02em; text-transform: uppercase; }
.theme-light .author-position { color: rgba(11,31,58,0.6); }

.footer { display: flex; align-items: center; gap: 16px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 16px; color: rgba(255,255,255,0.55); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; z-index: 2; }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.spacer { flex: 1; }
.footer-logo { height: 32px; filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
