<script setup>
import { computed } from 'vue'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)

const variant = field('variant', 'warn')
const kicker = field('kicker', 'WICHTIGE MITTEILUNG · BETRIEBSRAT')
const headline = field('headline', 'Neue Betriebsvereinbarung Arbeitszeit')
const body = field('body', 'Ab dem 01.05.2026 tritt die neue Betriebsvereinbarung in Kraft.')
const validFrom = field('validFrom', '2026-05-01')
const source = field('source', 'Betriebsrat & Geschäftsleitung')
const ackLabel = field('ackLabel', 'Bitte Kenntnis im Intranet bestätigen')
const docRef = field('docRef', 'BV-2026-05 · Version 1.0')
const readingTime = field('readingTime', 'ca. 3 Min. Lesezeit')

const variants = {
  info: { label: 'Information', primary: '#3B82F6', bg: ['#1E3A8A', '#0F2555', '#172554'], iconSvg: '<circle cx="32" cy="32" r="28"/><path d="M32 20v16M32 44h.01" stroke-width="5"/>', badgeLabel: 'INFO' },
  warn: { label: 'Warnung', primary: '#F59E0B', bg: ['#7C2D12', '#451A03', '#78350F'], iconSvg: '<path d="M32 6 L58 54 L6 54 Z"/><path d="M32 24v16M32 46h.01" stroke-width="5"/>', badgeLabel: 'WARNUNG' },
  danger: { label: 'Dringend', primary: '#EF4444', bg: ['#7F1D1D', '#450A0A', '#991B1B'], iconSvg: '<circle cx="32" cy="32" r="28"/><path d="M20 20l24 24M44 20l-24 24" stroke-width="5"/>', badgeLabel: 'DRINGEND' },
}

const currentVariant = computed(() => variants[variant.value] || variants.warn)
const formattedFrom = computed(() => { if (!validFrom.value) return ''; try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(validFrom.value)) } catch { return validFrom.value } })

const canvasStyle = computed(() => ({
  '--primary': currentVariant.value.primary,
  background: `radial-gradient(ellipse at 25% 0%, ${currentVariant.value.bg[2]} 0%, transparent 60%), linear-gradient(135deg, ${currentVariant.value.bg[1]} 0%, ${currentVariant.value.bg[0]} 100%)`,
}))
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div class="canvas" :style="canvasStyle">
      <div class="topline">
        <div class="icon-badge"><div class="badge-label">{{ currentVariant.badgeLabel }}</div><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" v-html="currentVariant.iconSvg"></svg></div>
        <div class="topline-text"><div class="kicker">{{ kicker }}</div><div class="headline">{{ headline }}</div></div>
      </div>
      <div class="body-wrap">
        <div class="body-inner"><p class="body-text">{{ body }}</p></div>
        <div class="meta-col">
          <div class="meta-block"><div class="meta-label">Gültig ab</div><div class="meta-value">{{ formattedFrom }}</div></div>
          <div class="meta-block"><div class="meta-label">Lesezeit</div><div class="meta-value">{{ readingTime }}</div></div>
          <div class="meta-block" v-if="docRef"><div class="meta-label">Dokument</div><div class="meta-value meta-doc">{{ docRef }}</div></div>
        </div>
      </div>
      <div class="ack-strip"><span class="ack-icon">&#9757;</span><span class="ack-text">{{ ackLabel }}</span><span class="spacer"></span><span class="source">{{ source }}</span></div>
      <div class="footer"><img src="/Blicklelogo.png" alt="" class="footer-logo" /><span class="spacer"></span><span class="footer-note">Aushang gültig bis zur Aktualisierung</span></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Variante</h4>
        <div class="variant-row">
          <button v-for="(v, k) in variants" :key="k" class="variant-btn" :class="{ active: variant === k }"
            :style="{ borderColor: variant === k ? v.primary : 'var(--color-border)', color: variant === k ? v.primary : 'var(--gray-600)' }"
            @click="variant = k">{{ v.label }}</button>
        </div>
      </section>
      <section class="fs"><h4 class="fs-title">Inhalt</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Überschrift</span><textarea v-model="headline" class="fld-input fld-small" rows="2" /></label>
        <label class="fld"><span class="fld-label">Fließtext</span><textarea v-model="body" class="fld-input" rows="6" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Formale Angaben</h4>
        <div class="row-2">
          <label class="fld"><span class="fld-label">Gültig ab</span><input v-model="validFrom" type="date" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">Lesezeit</span><input v-model="readingTime" type="text" class="fld-input" /></label>
        </div>
        <label class="fld"><span class="fld-label">Quelle</span><input v-model="source" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Dokument-Ref</span><input v-model="docRef" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Handlungshinweis</span><input v-model="ackLabel" type="text" class="fld-input" /></label>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · fluid</span></div>
      <div class="preview-frame">
        <div class="canvas" :style="canvasStyle">
          <div class="topline">
            <div class="icon-badge"><div class="badge-label">{{ currentVariant.badgeLabel }}</div><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" v-html="currentVariant.iconSvg"></svg></div>
            <div class="topline-text"><div class="kicker">{{ kicker }}</div><div class="headline">{{ headline }}</div></div>
          </div>
          <div class="body-wrap">
            <div class="body-inner"><p class="body-text">{{ body }}</p></div>
            <div class="meta-col">
              <div class="meta-block"><div class="meta-label">Gültig ab</div><div class="meta-value">{{ formattedFrom }}</div></div>
              <div class="meta-block"><div class="meta-label">Lesezeit</div><div class="meta-value">{{ readingTime }}</div></div>
              <div class="meta-block" v-if="docRef"><div class="meta-label">Dokument</div><div class="meta-value meta-doc">{{ docRef }}</div></div>
            </div>
          </div>
          <div class="ack-strip"><span class="ack-icon">&#9757;</span><span class="ack-text">{{ ackLabel }}</span><span class="spacer"></span><span class="source">{{ source }}</span></div>
          <div class="footer"><img src="/Blicklelogo.png" alt="" class="footer-logo" /><span class="spacer"></span><span class="footer-note">Aushang gültig bis zur Aktualisierung</span></div>
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
.fld-small { min-height: 50px; resize: vertical; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.variant-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.variant-btn { padding: 10px 8px; border: 2px solid var(--color-border); border-radius: 8px; background: var(--gray-50); font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.canvas { position: absolute; inset: 0; width: 100%; height: 100%; --u: min(calc(100cqw / 1920), calc(100cqh / 1080)); display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: auto 1fr auto auto; gap: calc(36 * var(--u)); padding: calc(60 * var(--u)) calc(80 * var(--u)); box-sizing: border-box; font-family: var(--font-body); color: #fff; }
.canvas::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(135deg, transparent 0, transparent calc(140 * var(--u)), rgba(255,255,255,0.025) calc(140 * var(--u)), rgba(255,255,255,0.025) calc(180 * var(--u))); pointer-events: none; }
.topline { grid-column: 1 / 13; display: grid; grid-template-columns: calc(200 * var(--u)) 1fr; gap: calc(40 * var(--u)); align-items: center; position: relative; }
.icon-badge { position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 1; color: var(--primary); filter: drop-shadow(0 0 calc(32 * var(--u)) var(--primary)); }
.icon-badge svg { width: calc(120 * var(--u)); height: calc(120 * var(--u)); }
.badge-label { position: absolute; top: calc(-14 * var(--u)); right: calc(-14 * var(--u)); background: var(--primary); color: #fff; padding: calc(6 * var(--u)) calc(14 * var(--u)); border-radius: 999px; font-family: var(--font-display); font-size: calc(18 * var(--u)); font-weight: 800; letter-spacing: 0.12em; z-index: 2; box-shadow: 0 calc(8 * var(--u)) calc(20 * var(--u)) rgba(0,0,0,0.35); }
.topline-text { position: relative; }
.kicker { font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--primary); margin-bottom: calc(10 * var(--u)); }
.headline { font-family: var(--font-display); font-size: calc(78 * var(--u)); font-weight: 700; line-height: 1; letter-spacing: -0.02em; color: #fff; }
.body-wrap { grid-column: 1 / 13; display: grid; grid-template-columns: 2fr 1fr; gap: calc(36 * var(--u)); position: relative; }
.body-inner { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-left: calc(6 * var(--u)) solid var(--primary); border-radius: calc(14 * var(--u)); padding: calc(32 * var(--u)) calc(40 * var(--u)); }
.body-text { font-size: calc(32 * var(--u)); line-height: 1.4; color: rgba(255,255,255,0.92); margin: 0; }
.meta-col { display: flex; flex-direction: column; gap: calc(18 * var(--u)); }
.meta-block { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: calc(12 * var(--u)); padding: calc(16 * var(--u)) calc(22 * var(--u)); }
.meta-label { font-size: calc(13 * var(--u)); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: calc(4 * var(--u)); }
.meta-value { font-family: var(--font-display); font-size: calc(28 * var(--u)); font-weight: 700; color: #fff; }
.meta-doc { font-family: var(--font-mono, monospace); font-size: calc(20 * var(--u)); color: rgba(255,255,255,0.85); letter-spacing: 0.02em; }
.ack-strip { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(18 * var(--u)); padding: calc(18 * var(--u)) calc(28 * var(--u)); background: var(--primary); border-radius: calc(14 * var(--u)); box-shadow: 0 calc(16 * var(--u)) calc(40 * var(--u)) rgba(0,0,0,0.35); position: relative; }
.ack-icon { font-size: calc(26 * var(--u)); color: #fff; }
.ack-text { font-family: var(--font-display); font-size: calc(26 * var(--u)); font-weight: 700; color: #fff; }
.spacer { flex: 1; }
.source { font-size: calc(20 * var(--u)); color: rgba(255,255,255,0.92); font-weight: 600; }
.footer { grid-column: 1 / 13; display: flex; align-items: center; gap: calc(16 * var(--u)); padding-top: calc(14 * var(--u)); border-top: 1px solid rgba(255,255,255,0.1); font-size: calc(16 * var(--u)); color: rgba(255,255,255,0.55); letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; }
.footer-logo { height: calc(28 * var(--u)); filter: brightness(0) invert(1); opacity: 0.85; }
.footer-note { font-size: calc(13 * var(--u)); }
</style>
