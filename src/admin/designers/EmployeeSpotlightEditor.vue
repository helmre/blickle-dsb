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

const kicker = field('kicker', 'MITARBEITER-SPOTLIGHT')
const name = field('name', 'Daniel Hirschler')
const department = field('department', 'Fertigung · Halle 2')
const quote = field('quote', 'Bei Blickle zaehlt nicht nur was du machst, sondern wer du bist.')
const hobby = field('hobby', 'Motorrad-Touren durch die Schwaebische Alb')
const since = field('since', '2011')
const photoUrl = field('photoUrl', '')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
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
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
      <div class="photo-col">
        <div v-if="photoUrl" class="photo-frame"><img :src="photoUrl" :alt="name" class="portrait" /></div>
        <div v-else class="photo-placeholder">
          <span class="initials-big">{{ (name || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() }}</span>
        </div>
        <div class="photo-badge"><span class="badge-dot"></span><span>{{ kicker }}</span></div>
      </div>
      <div class="info-col">
        <h1 class="name">{{ name }}</h1>
        <div class="dept">{{ department }}</div>
        <div class="quote-block">
          <div class="quote-mark">&ldquo;</div>
          <p class="quote-text">{{ quote }}</p>
        </div>
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-icon">&#9733;</div>
            <div class="meta-body">
              <div class="meta-label">Leidenschaft</div>
              <div class="meta-value">{{ hobby }}</div>
            </div>
          </div>
          <div class="meta-card" v-if="since">
            <div class="meta-icon">&#127874;</div>
            <div class="meta-body">
              <div class="meta-label">Bei Blickle seit</div>
              <div class="meta-value">{{ since }}</div>
            </div>
          </div>
        </div>
        <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>#MenschenBeiBlickle</span></div>
      </div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Person</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Name</span><input v-model="name" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Abteilung / Rolle</span><input v-model="department" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Bei Blickle seit</span><input v-model="since" type="text" class="fld-input" placeholder="z. B. 2011" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Portrait</h4>
        <label class="fld"><span class="fld-label">Foto</span><input type="file" accept="image/*" class="fld-input fld-file" @change="onPhotoPick" /></label>
        <label class="fld"><span class="fld-label">URL (Fallback)</span><input v-model="photoUrl" type="text" class="fld-input" placeholder="/media/mitarbeiter.jpg" /></label>
        <span class="fld-hint">Ohne Foto werden die Initialen angezeigt.</span>
      </section>
      <section class="fs"><h4 class="fs-title">Zitat &amp; Hobby</h4>
        <label class="fld"><span class="fld-label">Zitat</span><textarea v-model="quote" class="fld-input" rows="4" /></label>
        <label class="fld"><span class="fld-label">Hobby / Besonderheit</span><input v-model="hobby" type="text" class="fld-input" /></label>
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
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
          <div class="photo-col">
            <div v-if="photoUrl" class="photo-frame"><img :src="photoUrl" :alt="name" class="portrait" /></div>
            <div v-else class="photo-placeholder">
              <span class="initials-big">{{ (name || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() }}</span>
            </div>
            <div class="photo-badge"><span class="badge-dot"></span><span>{{ kicker }}</span></div>
          </div>
          <div class="info-col">
            <h1 class="name">{{ name }}</h1>
            <div class="dept">{{ department }}</div>
            <div class="quote-block">
              <div class="quote-mark">&ldquo;</div>
              <p class="quote-text">{{ quote }}</p>
            </div>
            <div class="meta-grid">
              <div class="meta-card">
                <div class="meta-icon">&#9733;</div>
                <div class="meta-body">
                  <div class="meta-label">Leidenschaft</div>
                  <div class="meta-value">{{ hobby }}</div>
                </div>
              </div>
              <div class="meta-card" v-if="since">
                <div class="meta-icon">&#127874;</div>
                <div class="meta-body">
                  <div class="meta-label">Bei Blickle seit</div>
                  <div class="meta-value">{{ since }}</div>
                </div>
              </div>
            </div>
            <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>#MenschenBeiBlickle</span></div>
          </div>
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
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; } .accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; background: #000; }

.canvas { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; transform-origin: top left; display: grid; grid-template-columns: 820px 1fr; gap: 72px; padding: 72px 96px; box-sizing: border-box; font-family: var(--font-body); }
.canvas.theme-dark { background: radial-gradient(ellipse at 0% 50%, rgba(181,204,24,0.1) 0%, transparent 55%), linear-gradient(135deg, #0A1A33 0%, #0B2442 40%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }

.photo-col { position: relative; display: flex; flex-direction: column; gap: 24px; }
.photo-frame { width: 100%; height: 820px; border-radius: 32px; overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08); position: relative; }
.photo-frame::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 60%, color-mix(in srgb, var(--accent) 20%, transparent) 100%); pointer-events: none; }
.portrait { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-placeholder { width: 100%; height: 820px; border-radius: 32px; background: radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 20%, transparent) 0%, rgba(0,0,0,0.3) 70%); display: flex; align-items: center; justify-content: center; box-shadow: 0 50px 100px rgba(0,0,0,0.5); }
.initials-big { font-family: var(--font-display); font-size: 280px; font-weight: 800; color: var(--accent); letter-spacing: -0.04em; text-shadow: 0 0 60px color-mix(in srgb, var(--accent) 40%, transparent); }
.photo-badge { position: absolute; bottom: 48px; left: 32px; display: inline-flex; align-items: center; gap: 12px; background: rgba(10,26,51,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 14px 24px; font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #fff; }
.badge-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); }

.info-col { display: flex; flex-direction: column; gap: 28px; justify-content: center; }
.name { margin: 0; font-family: var(--font-display); font-size: 110px; font-weight: 700; line-height: 0.95; letter-spacing: -0.02em; color: #fff; }
.theme-light .name { color: #0B1F3A; }
.dept { font-family: var(--font-display); font-size: 32px; font-weight: 500; color: var(--accent); letter-spacing: 0.01em; }

.quote-block { position: relative; padding: 28px 32px 28px 56px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-left: 6px solid var(--accent); border-radius: 16px; }
.theme-light .quote-block { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08); border-left-color: var(--accent); }
.quote-mark { position: absolute; top: -16px; left: 24px; font-family: Georgia, serif; font-size: 120px; line-height: 1; color: var(--accent); font-weight: 700; }
.quote-text { margin: 0; font-family: var(--font-display); font-size: 34px; font-weight: 500; line-height: 1.3; color: #fff; font-style: italic; }
.theme-light .quote-text { color: #0B1F3A; }

.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.meta-card { display: flex; gap: 18px; align-items: center; padding: 20px 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; }
.theme-light .meta-card { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08); }
.meta-icon { font-size: 36px; color: var(--accent); filter: drop-shadow(0 0 12px var(--accent)); width: 40px; text-align: center; }
.meta-body { min-width: 0; flex: 1; }
.meta-label { font-family: var(--font-display); font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
.theme-light .meta-label { color: rgba(11,31,58,0.55); }
.meta-value { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: #fff; line-height: 1.2; }
.theme-light .meta-value { color: #0B1F3A; }

.footer { display: flex; align-items: center; gap: 16px; margin-top: auto; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 16px; color: rgba(255,255,255,0.55); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.spacer { flex: 1; }
.footer-logo { height: 32px; filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
