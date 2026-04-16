<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const kicker = ref('HR · MITARBEITER-FOKUS')
const headline = ref('Wie geht es dir gerade?')
const body = ref('Anonyme 3-Minuten-Umfrage. Deine Meinung zaehlt und hilft uns, die Zusammenarbeit bei Blickle noch besser zu machen.')
const videoUrl = ref('')
const videoPoster = ref('/Blicklelogo.png')
const qr1Url = ref('https://blickle.com/motivationsindex-video')
const qr1Label = ref('Zum Video')
const qr2Url = ref('https://blickle.com/umfrage-motivation')
const qr2Label = ref('Zur Umfrage')
const validUntil = ref('2026-04-30')
const authorLabel = ref('HR Blickle')
const accent = ref('#B5CC18')
const theme = ref('dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Signal-Rot', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Blau', value: '#3B82F6' },
]

function qrSrc(url) {
  if (!url) return ''
  const size = 400
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${size}x${size}&margin=4`
}

function onVideoPick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  videoUrl.value = url
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
  const w = previewFrame.value.clientWidth
  scale.value = w / 1920
}
let ro = null
onMounted(() => {
  recomputeScale()
  ro = new ResizeObserver(recomputeScale)
  if (previewFrame.value) ro.observe(previewFrame.value)
})
onUnmounted(() => { if (ro) ro.disconnect() })

const starters = [
  { id: 'qr-announcement', name: 'QR-Ankuendigung', desc: 'Video + 2 QRs + Text', selected: true },
  { id: 'video-news', name: 'Video-News', desc: 'Handy-Video mit kurzer Erklaerung', selected: false },
  { id: 'when-where', name: 'Termin-Hinweis', desc: 'Ort + Uhrzeit prominent', selected: false },
  { id: 'job-ad', name: 'Stellenanzeige', desc: 'Bewerbungs-QR + Anforderungen', selected: false },
]
</script>

<template>
  <div class="designer-page">
    <!-- Toolbar -->
    <div class="designer-toolbar">
      <div>
        <h2 class="page-title">Designer <span class="demo-tag">Klick-Prototyp</span></h2>
        <p class="page-sub">Szenario: Ankuendigung "Mitarbeiter-Motivationsindex" mit Video + 2 QR-Codes</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-ghost" disabled>Als Entwurf speichern</button>
        <button class="btn-primary" disabled>Zur Pruefung einreichen</button>
      </div>
    </div>

    <!-- Starter strip -->
    <div class="starter-strip">
      <span class="strip-label">Starter-Layout</span>
      <div class="starter-chips">
        <button
          v-for="s in starters"
          :key="s.id"
          :class="['starter-chip', { active: s.selected }]"
          :disabled="!s.selected"
          :title="s.selected ? s.desc : 'In dieser Demo nicht verfuegbar'"
        >
          <span class="chip-name">{{ s.name }}</span>
          <span class="chip-desc">{{ s.desc }}</span>
        </button>
      </div>
    </div>

    <!-- Split layout -->
    <div class="designer-split">
      <!-- Left: form -->
      <aside class="designer-form">
        <div class="form-section">
          <h4 class="form-section-title">Inhalt</h4>

          <label class="fld">
            <span class="fld-label">Kicker / Ueberzeile</span>
            <input v-model="kicker" type="text" class="fld-input" placeholder="z. B. HR · MITARBEITER-FOKUS" />
            <span class="fld-hint">Kurz, GROSS, Akzentfarbe. Max. 30 Zeichen.</span>
          </label>

          <label class="fld">
            <span class="fld-label">Headline</span>
            <textarea v-model="headline" class="fld-input fld-textarea-sm" rows="2" placeholder="Ein Satz, klar und einladend"></textarea>
          </label>

          <label class="fld">
            <span class="fld-label">Begleittext</span>
            <textarea v-model="body" class="fld-input" rows="3" placeholder="1-3 Zeilen, aus 5 m lesbar"></textarea>
          </label>
        </div>

        <div class="form-section">
          <h4 class="form-section-title">Video</h4>
          <label class="fld">
            <span class="fld-label">Datei waehlen</span>
            <input type="file" accept="video/*" class="fld-input fld-file" @change="onVideoPick" />
            <span class="fld-hint">Wird als autoplay/stumm abgespielt. MP4 empfohlen.</span>
          </label>
          <label class="fld">
            <span class="fld-label">Poster-Bild (Fallback)</span>
            <input v-model="videoPoster" type="text" class="fld-input" placeholder="/media/poster.jpg" />
          </label>
        </div>

        <div class="form-section">
          <h4 class="form-section-title">QR-Codes</h4>
          <div class="qr-fields">
            <label class="fld">
              <span class="fld-label">QR 1 — URL</span>
              <input v-model="qr1Url" type="url" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">QR 1 — Beschriftung</span>
              <input v-model="qr1Label" type="text" class="fld-input" />
            </label>
          </div>
          <div class="qr-fields">
            <label class="fld">
              <span class="fld-label">QR 2 — URL</span>
              <input v-model="qr2Url" type="url" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">QR 2 — Beschriftung</span>
              <input v-model="qr2Label" type="text" class="fld-input" />
            </label>
          </div>
        </div>

        <div class="form-section">
          <h4 class="form-section-title">Meta</h4>
          <div class="qr-fields">
            <label class="fld">
              <span class="fld-label">Gueltig bis</span>
              <input v-model="validUntil" type="date" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">Autor</span>
              <input v-model="authorLabel" type="text" class="fld-input" />
            </label>
          </div>
        </div>

        <div class="form-section">
          <h4 class="form-section-title">Gestaltung</h4>
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
        </div>
      </aside>

      <!-- Right: preview -->
      <section class="designer-preview">
        <div class="preview-header">
          <span class="preview-label">Live-Vorschau · 1920 × 1080 · 12-Spalten-Raster</span>
          <span class="preview-scale">skaliert</span>
        </div>

        <div class="preview-frame" ref="previewFrame">
          <div
            :class="['canvas', `theme-${theme}`]"
            :style="{ '--accent': accent, transform: `scale(${scale})` }"
          >
            <!-- Row 1: Kicker -->
            <div class="block block-kicker" data-cols="1 / 13">
              <span class="kicker-dot"></span>
              <span class="kicker-text">{{ kicker }}</span>
            </div>

            <!-- Row 2: Headline -->
            <div class="block block-headline" data-cols="1 / 13">
              {{ headline }}
            </div>

            <!-- Row 3: Media + 2 QRs -->
            <div class="block block-media" data-cols="1 / 7">
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
            </div>

            <div class="block block-qr" data-cols="7 / 10">
              <div class="qr-box">
                <img v-if="qr1Url" :src="qrSrc(qr1Url)" alt="" />
              </div>
              <div class="qr-label">{{ qr1Label }}</div>
            </div>

            <div class="block block-qr" data-cols="10 / 13">
              <div class="qr-box">
                <img v-if="qr2Url" :src="qrSrc(qr2Url)" alt="" />
              </div>
              <div class="qr-label">{{ qr2Label }}</div>
            </div>

            <!-- Row 6: Body -->
            <div class="block block-body" data-cols="1 / 13">
              {{ body }}
            </div>

            <!-- Row 7: Footer -->
            <div class="block block-footer" data-cols="1 / 13">
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
  </div>
</template>

<style scoped>
.designer-page {
  max-width: 1440px;
  margin: 0 auto;
}

.designer-toolbar {
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

/* Starter strip */
.starter-strip {
  background: var(--blickle-white);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.strip-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gray-500);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.starter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.starter-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  background: var(--gray-50);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-align: left;
  transition: all 160ms;
  min-width: 170px;
  opacity: 0.55;
}
.starter-chip.active {
  background: rgba(181, 204, 24, 0.12);
  border-color: var(--blickle-green);
  opacity: 1;
  cursor: default;
}
.chip-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--blickle-navy);
}
.chip-desc {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

/* Split */
.designer-split {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;
}

/* Form */
.designer-form {
  background: var(--blickle-white);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
}
.form-section { margin-bottom: 22px; }
.form-section:last-child { margin-bottom: 0; }
.form-section-title {
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
  background: var(--blickle-white);
}
.fld-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08);
}
.fld-textarea-sm { resize: vertical; min-height: 50px; }
.fld-file { padding: 4px; font-size: 0.75rem; }
.fld-hint {
  display: block;
  font-size: 0.7rem;
  color: var(--gray-400);
  margin-top: 3px;
  font-style: italic;
}
.qr-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.accent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.accent-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
  transition: all 140ms;
  cursor: pointer;
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

/* Preview */
.designer-preview {
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
.preview-scale { color: var(--gray-400); }
.preview-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
  background: #000;
}

/* Canvas — fixed 1920x1080, scaled via transform to fit frame */
.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: auto;
  gap: 28px;
  padding: 56px 72px;
  font-family: var(--font-body);
  box-sizing: border-box;
  align-content: space-between;
}
.canvas.theme-dark {
  background: linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%);
  color: #fff;
}
.canvas.theme-light {
  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
  color: #0B1F3A;
}

.block[data-cols="1 / 13"] { grid-column: 1 / 13; }
.block[data-cols="1 / 7"]  { grid-column: 1 / 7; }
.block[data-cols="7 / 10"] { grid-column: 7 / 10; }
.block[data-cols="10 / 13"]{ grid-column: 10 / 13; }

/* Blocks */
.block-kicker {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--accent);
  text-transform: uppercase;
}
.kicker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 16px var(--accent);
}

.block-headline {
  font-family: var(--font-display);
  font-size: 96px;
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.theme-dark .block-headline { color: #fff; }
.theme-light .block-headline { color: #0B1F3A; }

.block-media {
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(0,0,0,0.2);
  position: relative;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
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
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  flex-direction: column;
  gap: 8px;
}
.theme-light .media-placeholder { background: rgba(0,0,0,0.04); }
.media-placeholder img {
  width: 30%;
  height: auto;
  opacity: 0.45;
  object-fit: contain;
}
.media-hint {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
  font-style: italic;
}
.theme-light .media-hint { color: rgba(0,0,0,0.4); }

.block-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  justify-content: center;
}
.qr-box {
  aspect-ratio: 1;
  width: 100%;
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 28px rgba(0,0,0,0.3);
}
.qr-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.qr-label {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: var(--accent);
  letter-spacing: 0.04em;
}

.block-body {
  font-size: 34px;
  line-height: 1.35;
  font-weight: 400;
  max-width: 85%;
}
.theme-dark .block-body { color: rgba(255,255,255,0.82); }
.theme-light .block-body { color: rgba(11, 31, 58, 0.78); }

.block-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.theme-light .block-footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11, 31, 58, 0.6); }
.theme-dark .block-footer { color: rgba(255,255,255,0.55); }
.dot-sep { opacity: 0.6; }
.footer-spacer { flex: 1; }
.footer-logo {
  height: 32px;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
