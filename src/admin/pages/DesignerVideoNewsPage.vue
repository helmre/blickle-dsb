<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const kicker = ref('PRODUKTION · NEUE MASCHINE')
const headline = ref('Neue Kantenpresse Halle 1')
const body = ref('Ab heute im Einsatz. 40 % schneller, 30 % leiser. Demo auf Anfrage bei Meister Huber.')
const videoUrl = ref('')
const videoPoster = ref('/Blicklelogo.png')
const quote = ref('Damit fahren wir endlich zweischichtig ohne Kapazitaetsgrenze.')
const quoteAuthor = ref('Bernd Maier, Abteilungsleiter')
const showQuote = ref(true)
const validUntil = ref('2026-05-15')
const authorLabel = ref('Produktion · M. Huber')
const accent = ref('#B5CC18')
const theme = ref('dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Rot', value: '#EF4444' },
]

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
  <div class="vn-page">
    <div class="vn-toolbar">
      <div>
        <h2 class="page-title">Video-News <span class="demo-tag">Template 02</span></h2>
        <p class="page-sub">Bereichs-News mit grossem Hero-Video, kurzer Erklaerung, optionalem Zitat.</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-ghost" disabled>Als Entwurf speichern</button>
        <button class="btn-primary" disabled>Zur Pruefung einreichen</button>
      </div>
    </div>

    <div class="vn-split">
      <aside class="vn-form">
        <section class="fs">
          <h4 class="fs-title">Inhalt</h4>
          <label class="fld">
            <span class="fld-label">Kicker / Bereich</span>
            <input v-model="kicker" type="text" class="fld-input" placeholder="z.B. PRODUKTION · NEUE MASCHINE" />
          </label>
          <label class="fld">
            <span class="fld-label">Headline</span>
            <textarea v-model="headline" class="fld-input fld-small" rows="2" />
          </label>
          <label class="fld">
            <span class="fld-label">Begleittext (1-3 Zeilen)</span>
            <textarea v-model="body" class="fld-input" rows="3" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Video</h4>
          <label class="fld">
            <span class="fld-label">Datei waehlen</span>
            <input type="file" accept="video/*" class="fld-input fld-file" @change="onVideoPick" />
            <span class="fld-hint">Autoplay + stumm. MP4 empfohlen. Hochkant OK (wird 16:9 gecroppt).</span>
          </label>
          <label class="fld">
            <span class="fld-label">Poster-Bild (Fallback)</span>
            <input v-model="videoPoster" type="text" class="fld-input" placeholder="/media/bild.jpg" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Zitat (optional)</h4>
          <label class="fld">
            <span class="fld-label">Aktiv</span>
            <label class="toggle-inline">
              <input type="checkbox" v-model="showQuote" />
              <span>{{ showQuote ? 'Angezeigt' : 'Ausgeblendet' }}</span>
            </label>
          </label>
          <label class="fld" v-if="showQuote">
            <span class="fld-label">Zitat</span>
            <textarea v-model="quote" class="fld-input" rows="2" />
          </label>
          <label class="fld" v-if="showQuote">
            <span class="fld-label">Zitat-Quelle</span>
            <input v-model="quoteAuthor" type="text" class="fld-input" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Meta</h4>
          <div class="row-2">
            <label class="fld">
              <span class="fld-label">Gueltig bis</span>
              <input v-model="validUntil" type="date" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">Autor</span>
              <input v-model="authorLabel" type="text" class="fld-input" />
            </label>
          </div>
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

      <section class="vn-preview">
        <div class="preview-header">
          <span>Live-Vorschau &middot; 1920 × 1080</span>
          <span class="pv-hint">Hero-Video, Zitat ueberlagernd rechts unten</span>
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

            <div class="headline">{{ headline }}</div>

            <div class="media-row">
              <div class="media-box">
                <video
                  v-if="videoUrl"
                  :src="videoUrl"
                  :poster="videoPoster || undefined"
                  autoplay loop muted playsinline
                  class="media-video"
                ></video>
                <div v-else class="media-placeholder">
                  <img v-if="videoPoster" :src="videoPoster" alt="" />
                  <div class="media-hint">Video hier ablegen</div>
                </div>
                <div class="media-vignette"></div>
                <div v-if="showQuote && quote" class="quote-overlay">
                  <div class="quote-mark">&ldquo;</div>
                  <div class="quote-body">
                    <div class="quote-text">{{ quote }}</div>
                    <div class="quote-author">{{ quoteAuthor }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="body">{{ body }}</div>

            <div class="footer">
              <span>Gueltig bis {{ formattedUntil }}</span>
              <span class="dot">&middot;</span>
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
.vn-page { max-width: 1680px; margin: 0 auto; }

.vn-toolbar {
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

.vn-split {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  align-items: start;
}

.vn-form {
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
.fld-file { padding: 4px; font-size: 0.75rem; }
.fld-hint {
  display: block;
  font-size: 0.7rem;
  color: var(--gray-400);
  margin-top: 3px;
  font-style: italic;
}
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.toggle-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--gray-700);
  font-weight: 500;
  cursor: pointer;
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

.vn-preview {
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

/* Canvas — fixed 1920x1080 */
.canvas {
  position: absolute;
  top: 0; left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto 1fr auto auto;
  gap: 32px;
  padding: 60px 80px;
  box-sizing: border-box;
  font-family: var(--font-body);
}
.theme-dark {
  background: linear-gradient(135deg, #0A1A33 0%, #0B2442 40%, #163A6C 100%);
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
  font-size: 26px;
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

.headline {
  grid-column: 1 / 13;
  font-family: var(--font-display);
  font-size: 108px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}
.theme-dark .headline { color: #fff; }
.theme-light .headline { color: #0B1F3A; }

.media-row {
  grid-column: 1 / 13;
  align-self: stretch;
  min-height: 0;
}
.media-box {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 440px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
  background: rgba(0,0,0,0.3);
}
.media-video, .media-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255,255,255,0.04);
}
.theme-light .media-placeholder { background: rgba(0,0,0,0.04); }
.media-placeholder img {
  width: 20%;
  height: auto;
  opacity: 0.5;
  object-fit: contain;
}
.media-hint {
  font-size: 22px;
  color: rgba(255,255,255,0.5);
  font-style: italic;
}
.theme-light .media-hint { color: rgba(0,0,0,0.45); }
.media-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55) 100%);
  pointer-events: none;
}

.quote-overlay {
  position: absolute;
  bottom: 36px;
  right: 36px;
  max-width: 42%;
  background: rgba(10, 26, 51, 0.82);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 5px solid var(--accent);
  border-radius: 14px;
  padding: 24px 30px 22px;
  display: flex;
  gap: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}
.quote-mark {
  font-family: Georgia, serif;
  font-size: 64px;
  color: var(--accent);
  line-height: 0.6;
  font-weight: 700;
  margin-top: 8px;
}
.quote-text {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 500;
  color: #fff;
  line-height: 1.3;
  font-style: italic;
}
.quote-author {
  margin-top: 8px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.03em;
}

.body {
  grid-column: 1 / 13;
  font-size: 38px;
  line-height: 1.3;
  font-weight: 400;
  max-width: 82%;
}
.theme-dark .body { color: rgba(255, 255, 255, 0.82); }
.theme-light .body { color: rgba(11, 31, 58, 0.78); }

.footer {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11, 31, 58, 0.6); }
.theme-dark .footer { color: rgba(255,255,255,0.55); }
.dot { opacity: 0.6; }
.spacer { flex: 1; }
.footer-logo {
  height: 32px;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
