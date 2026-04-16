<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const variant = ref('warn')
const kicker = ref('WICHTIGE MITTEILUNG · BETRIEBSRAT')
const headline = ref('Neue Betriebsvereinbarung Arbeitszeit')
const body = ref('Ab dem 01.05.2026 tritt die neue Betriebsvereinbarung zum Thema Gleitzeit und mobiles Arbeiten in Kraft. Alle Mitarbeiterinnen und Mitarbeiter werden gebeten, die vollstaendige Version im Intranet zu lesen und die Kenntnisnahme zu bestaetigen.')
const validFrom = ref('2026-05-01')
const source = ref('Betriebsrat & Geschaeftsleitung')
const ackLabel = ref('Bitte Kenntnis im Intranet bestaetigen')
const docRef = ref('BV-2026-05 · Version 1.0')
const readingTime = ref('ca. 3 Min. Lesezeit')

const variants = {
  info: {
    label: 'Information',
    primary: '#3B82F6',
    bg: ['#1E3A8A', '#0F2555', '#172554'],
    iconSvg: '<circle cx="32" cy="32" r="28"/><path d="M32 20v16M32 44h.01" stroke-width="5"/>',
    badgeLabel: 'INFO',
  },
  warn: {
    label: 'Warnung',
    primary: '#F59E0B',
    bg: ['#7C2D12', '#451A03', '#78350F'],
    iconSvg: '<path d="M32 6 L58 54 L6 54 Z"/><path d="M32 24v16M32 46h.01" stroke-width="5"/>',
    badgeLabel: 'WARNUNG',
  },
  danger: {
    label: 'Dringend',
    primary: '#EF4444',
    bg: ['#7F1D1D', '#450A0A', '#991B1B'],
    iconSvg: '<circle cx="32" cy="32" r="28"/><path d="M20 20l24 24M44 20l-24 24" stroke-width="5"/>',
    badgeLabel: 'DRINGEND',
  },
}

const currentVariant = computed(() => variants[variant.value])

const formattedFrom = computed(() => {
  if (!validFrom.value) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(validFrom.value))
  } catch { return validFrom.value }
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
  <div class="ln-page">
    <div class="ln-toolbar">
      <div>
        <h2 class="page-title">Rechtliche Mitteilung <span class="demo-tag">Template 07</span></h2>
        <p class="page-sub">Formale Mitteilung mit Warn-Icon, klarem Geltungsbereich und Quelle.</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-ghost" disabled>Als Entwurf speichern</button>
        <button class="btn-primary" disabled>Zur Pruefung einreichen</button>
      </div>
    </div>

    <div class="ln-split">
      <aside class="ln-form">
        <section class="fs">
          <h4 class="fs-title">Variante</h4>
          <div class="variant-row">
            <button
              v-for="(v, k) in variants"
              :key="k"
              class="variant-btn"
              :class="{ active: variant === k }"
              :style="{ borderColor: variant === k ? v.primary : 'var(--color-border)', color: variant === k ? v.primary : 'var(--gray-600)' }"
              @click="variant = k"
            >
              {{ v.label }}
            </button>
          </div>
        </section>

        <section class="fs">
          <h4 class="fs-title">Inhalt</h4>
          <label class="fld">
            <span class="fld-label">Kicker / Herkunft</span>
            <input v-model="kicker" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Ueberschrift</span>
            <textarea v-model="headline" class="fld-input fld-small" rows="2" />
          </label>
          <label class="fld">
            <span class="fld-label">Fliesstext</span>
            <textarea v-model="body" class="fld-input" rows="6" />
          </label>
        </section>

        <section class="fs">
          <h4 class="fs-title">Formale Angaben</h4>
          <div class="row-2">
            <label class="fld">
              <span class="fld-label">Gueltig ab</span>
              <input v-model="validFrom" type="date" class="fld-input" />
            </label>
            <label class="fld">
              <span class="fld-label">Lesezeit</span>
              <input v-model="readingTime" type="text" class="fld-input" />
            </label>
          </div>
          <label class="fld">
            <span class="fld-label">Quelle / Aussteller</span>
            <input v-model="source" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Dokument-Referenz</span>
            <input v-model="docRef" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Handlungshinweis</span>
            <input v-model="ackLabel" type="text" class="fld-input" />
          </label>
        </section>
      </aside>

      <section class="ln-preview">
        <div class="preview-header">
          <span>Live-Vorschau &middot; 1920 × 1080</span>
          <span class="pv-hint">Variante steuert Icon-Symbol + Farb-Palette</span>
        </div>
        <div class="preview-frame" ref="previewFrame">
          <div
            class="canvas"
            :style="{
              '--primary': currentVariant.primary,
              background: `radial-gradient(ellipse at 25% 0%, ${currentVariant.bg[2]} 0%, transparent 60%), linear-gradient(135deg, ${currentVariant.bg[1]} 0%, ${currentVariant.bg[0]} 100%)`,
              transform: `scale(${scale})`
            }"
          >
            <div class="topline">
              <div class="icon-badge">
                <div class="badge-label">{{ currentVariant.badgeLabel }}</div>
                <div class="icon-halo"></div>
                <svg viewBox="0 0 64 64" width="120" height="120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" v-html="currentVariant.iconSvg"></svg>
              </div>
              <div class="topline-text">
                <div class="kicker">{{ kicker }}</div>
                <div class="headline">{{ headline }}</div>
              </div>
            </div>

            <div class="body-wrap">
              <div class="body-inner">
                <p class="body-text">{{ body }}</p>
              </div>
              <div class="meta-col">
                <div class="meta-block">
                  <div class="meta-label">Gueltig ab</div>
                  <div class="meta-value">{{ formattedFrom }}</div>
                </div>
                <div class="meta-block">
                  <div class="meta-label">Lesezeit</div>
                  <div class="meta-value">{{ readingTime }}</div>
                </div>
                <div class="meta-block" v-if="docRef">
                  <div class="meta-label">Dokument</div>
                  <div class="meta-value meta-doc">{{ docRef }}</div>
                </div>
              </div>
            </div>

            <div class="ack-strip">
              <span class="ack-icon">&#9757;</span>
              <span class="ack-text">{{ ackLabel }}</span>
              <span class="spacer"></span>
              <span class="source">{{ source }}</span>
            </div>

            <div class="footer">
              <img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" />
              <span class="spacer"></span>
              <span class="footer-note">Aushang gueltig bis zur Aktualisierung &middot; Blickle Raeder+Rollen GmbH</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ln-page { max-width: 1680px; margin: 0 auto; }
.ln-toolbar {
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

.ln-split {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  align-items: start;
}
.ln-form {
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
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.variant-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.variant-btn {
  padding: 10px 8px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--gray-50);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 140ms;
}
.variant-btn.active {
  background: rgba(0, 0, 0, 0.02);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.ln-preview {
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

.canvas {
  position: absolute;
  top: 0; left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto 1fr auto auto;
  gap: 36px;
  padding: 60px 80px;
  box-sizing: border-box;
  font-family: var(--font-body);
  color: #fff;
  position: absolute;
}

/* Diagonal warning stripes in the background */
.canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    135deg,
    transparent 0px,
    transparent 140px,
    rgba(255, 255, 255, 0.025) 140px,
    rgba(255, 255, 255, 0.025) 180px
  );
  pointer-events: none;
}

.topline {
  grid-column: 1 / 13;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  align-items: center;
  position: relative;
}

.icon-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  color: var(--primary);
  filter: drop-shadow(0 0 32px var(--primary));
}
.icon-halo {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0.1;
  filter: blur(20px);
  animation: halo 3s ease-in-out infinite;
}
.badge-label {
  position: absolute;
  top: -14px;
  right: -14px;
  background: var(--primary);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.12em;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}
@keyframes halo {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.22; transform: scale(1.05); }
}

.topline-text { position: relative; }
.kicker {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 10px;
}
.headline {
  font-family: var(--font-display);
  font-size: 78px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #fff;
}

.body-wrap {
  grid-column: 1 / 13;
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: 36px;
  position: relative;
}
.body-inner {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 6px solid var(--primary);
  border-radius: 14px;
  padding: 32px 40px;
}
.body-text {
  font-size: 32px;
  line-height: 1.4;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.92);
  margin: 0;
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.meta-block {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 16px 22px;
}
.meta-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 4px;
}
.meta-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.05;
}
.meta-doc {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.02em;
}

.ack-strip {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 28px;
  background: var(--primary);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  position: relative;
}
.ack-icon {
  font-size: 26px;
  color: #fff;
}
.ack-text {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}
.spacer { flex: 1; }
.source {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.footer {
  grid-column: 1 / 13;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 500;
  position: relative;
}
.footer-logo {
  height: 28px;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}
.footer-note {
  font-size: 13px;
}
</style>
