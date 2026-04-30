<script setup>
import { computed } from 'vue'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  HeartHandshake,
  Info,
  UsersRound,
} from 'lucide-vue-next'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)

const badge = field('badge', 'INFO')
const kicker = field('kicker', 'ANKÜNDIGUNG · BLICKLE')
const headline = field('headline', 'Held des Alltags: Stammzellspende')
const leadText = field('leadText', 'Ein Blickle-Mitarbeiter hat durch eine Stammzellspende über die DKMS einem Menschen das Leben gerettet.')
const bodyText = field('bodyText', 'Wir sind stolz und dankbar für so viel Engagement.')
const highlightText = field('highlightText', 'Auch Du kannst Dich registrieren lassen!')
const imageUrl = field('imageUrl', '/content/dkms/hands-heart.png')
const dateLabel = field('dateLabel', '2025')
const readingTime = field('readingTime', '2 min')
const audienceLabel = field('audienceLabel', 'Für alle Mitarbeiter:innen')
const audienceValue = field('audienceValue', 'Blickle Gruppe')
const footerStrong = field('footerStrong', 'Gemeinsam können wir Leben retten.')
const footerText = field('footerText', 'Jede Registrierung zählt.')
const ctaLabel = field('ctaLabel', 'Mehr Infos zur DKMS')
const ctaUrl = field('ctaUrl', 'https://www.dkms.de/')

const metaCards = computed(() => [
  { icon: CalendarDays, label: 'Datum', value: dateLabel.value },
  { icon: Clock3, label: 'Lesezeit', value: readingTime.value },
  { icon: UsersRound, label: audienceLabel.value, value: audienceValue.value },
])
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div class="canvas">
      <section class="copy-panel">
        <div class="eyebrow-row">
          <div class="badge-pill">{{ badge }}</div>
          <div class="icon-mark">
            <Info :size="88" :stroke-width="2.4" />
          </div>
          <div class="kicker">{{ kicker }}</div>
        </div>

        <h1>{{ headline }}</h1>
        <div class="headline-rule"></div>

        <div class="message-box">
          <p>{{ leadText }}</p>
          <p>{{ bodyText }}</p>
          <p class="highlight">{{ highlightText }}</p>
        </div>
      </section>

      <section class="visual-panel" aria-hidden="true">
        <img :src="imageUrl" alt="" />
      </section>

      <aside class="meta-stack">
        <div v-for="card in metaCards" :key="card.label" class="meta-card">
          <div class="meta-icon">
            <component :is="card.icon" :size="54" :stroke-width="2.1" />
          </div>
          <div>
            <div class="meta-label">{{ card.label }}</div>
            <div class="meta-value">{{ card.value }}</div>
          </div>
        </div>
      </aside>

      <section class="action-strip">
        <div class="action-icon">
          <HeartHandshake :size="42" :stroke-width="2.2" />
        </div>
        <p>
          <strong>{{ footerStrong }}</strong>
          <span>{{ footerText }}</span>
        </p>
        <a class="cta-button" :href="ctaUrl" target="_blank" rel="noreferrer">
          <span>{{ ctaLabel }}</span>
          <ArrowRight :size="32" :stroke-width="2.4" />
        </a>
      </section>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs">
        <h4 class="fs-title">Inhalt</h4>
        <label class="fld">
          <span class="fld-label">Badge</span>
          <input v-model="badge" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">Kicker</span>
          <input v-model="kicker" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">Überschrift</span>
          <textarea v-model="headline" class="fld-input fld-small" rows="2" />
        </label>
        <label class="fld">
          <span class="fld-label">Lead</span>
          <textarea v-model="leadText" class="fld-input" rows="3" />
        </label>
        <label class="fld">
          <span class="fld-label">Text</span>
          <textarea v-model="bodyText" class="fld-input" rows="3" />
        </label>
        <label class="fld">
          <span class="fld-label">Hervorhebung</span>
          <input v-model="highlightText" type="text" class="fld-input" />
        </label>
      </section>

      <section class="fs">
        <h4 class="fs-title">Visual</h4>
        <label class="fld">
          <span class="fld-label">Bild-URL</span>
          <input v-model="imageUrl" type="text" class="fld-input" />
        </label>
      </section>

      <section class="fs">
        <h4 class="fs-title">Meta & CTA</h4>
        <div class="row-2">
          <label class="fld">
            <span class="fld-label">Datum</span>
            <input v-model="dateLabel" type="text" class="fld-input" />
          </label>
          <label class="fld">
            <span class="fld-label">Lesezeit</span>
            <input v-model="readingTime" type="text" class="fld-input" />
          </label>
        </div>
        <label class="fld">
          <span class="fld-label">Zielgruppe Label</span>
          <input v-model="audienceLabel" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">Zielgruppe Wert</span>
          <input v-model="audienceValue" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">Fußzeile fett</span>
          <input v-model="footerStrong" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">Fußzeile Text</span>
          <input v-model="footerText" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">CTA Label</span>
          <input v-model="ctaLabel" type="text" class="fld-input" />
        </label>
        <label class="fld">
          <span class="fld-label">CTA URL</span>
          <input v-model="ctaUrl" type="url" class="fld-input" />
        </label>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · DKMS</span></div>
      <div class="preview-frame">
        <div class="canvas">
          <section class="copy-panel">
            <div class="eyebrow-row">
              <div class="badge-pill">{{ badge }}</div>
              <div class="icon-mark">
                <Info :size="88" :stroke-width="2.4" />
              </div>
              <div class="kicker">{{ kicker }}</div>
            </div>
            <h1>{{ headline }}</h1>
            <div class="headline-rule"></div>
            <div class="message-box">
              <p>{{ leadText }}</p>
              <p>{{ bodyText }}</p>
              <p class="highlight">{{ highlightText }}</p>
            </div>
          </section>

          <section class="visual-panel" aria-hidden="true">
            <img :src="imageUrl" alt="" />
          </section>

          <aside class="meta-stack">
            <div v-for="card in metaCards" :key="card.label" class="meta-card">
              <div class="meta-icon">
                <component :is="card.icon" :size="54" :stroke-width="2.1" />
              </div>
              <div>
                <div class="meta-label">{{ card.label }}</div>
                <div class="meta-value">{{ card.value }}</div>
              </div>
            </div>
          </aside>

          <section class="action-strip">
            <div class="action-icon">
              <HeartHandshake :size="42" :stroke-width="2.2" />
            </div>
            <p>
              <strong>{{ footerStrong }}</strong>
              <span>{{ footerText }}</span>
            </p>
            <a class="cta-button" :href="ctaUrl" target="_blank" rel="noreferrer">
              <span>{{ ctaLabel }}</span>
              <ArrowRight :size="32" :stroke-width="2.4" />
            </a>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.split {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  align-items: start;
}

.form,
.preview-panel {
  background: var(--blickle-white);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.form {
  padding: 20px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
}

.fs {
  margin-bottom: 22px;
}

.fs-title {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.fld {
  display: block;
  margin-bottom: 12px;
}

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

.fld-small {
  min-height: 50px;
  resize: vertical;
}

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preview-panel {
  padding: 16px;
}

.preview-header {
  margin-bottom: 12px;
  font-size: 0.7rem;
  color: var(--gray-500);
  text-transform: uppercase;
  font-weight: 600;
}

.preview-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 14px 48px rgba(11, 31, 58, 0.16);
  background: #f7f8fa;
  container-type: size;
}

.display-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  container-type: size;
}

.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  --u: min(calc(100cqw / 1920), calc(100cqh / 1080));
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: 1fr auto;
  gap: calc(34 * var(--u));
  padding: calc(74 * var(--u)) calc(118 * var(--u)) calc(58 * var(--u));
  box-sizing: border-box;
  font-family: var(--font-body);
  color: #10274d;
  background:
    linear-gradient(90deg, rgba(181, 204, 24, 0.08), transparent 36%),
    radial-gradient(circle at 76% 28%, rgba(181, 204, 24, 0.12), transparent 34%),
    #f8f9fb;
}

.canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.36)),
    repeating-linear-gradient(90deg, rgba(22, 58, 108, 0.035) 0 1px, transparent 1px 150px);
  pointer-events: none;
}

.copy-panel,
.visual-panel,
.meta-stack,
.action-strip {
  position: relative;
  z-index: 1;
}

.copy-panel {
  grid-column: 1 / 7;
  grid-row: 1;
  align-self: center;
  padding-left: calc(8 * var(--u));
}

.eyebrow-row {
  display: grid;
  grid-template-columns: calc(112 * var(--u)) 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: calc(36 * var(--u));
  margin-bottom: calc(24 * var(--u));
}

.badge-pill {
  grid-column: 1;
  justify-self: center;
  padding: calc(8 * var(--u)) calc(24 * var(--u));
  border-radius: calc(999 * var(--u));
  background: linear-gradient(135deg, #c7dc18, #acc40f);
  color: #062967;
  font-family: var(--font-display);
  font-size: calc(18 * var(--u));
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: 0 calc(8 * var(--u)) calc(20 * var(--u)) rgba(181, 204, 24, 0.28);
}

.icon-mark {
  grid-column: 1;
  grid-row: 2;
  width: calc(104 * var(--u));
  height: calc(104 * var(--u));
  justify-self: center;
  margin-top: calc(22 * var(--u));
  border: calc(4 * var(--u)) solid #0058c8;
  border-radius: 50%;
  color: #0058c8;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
}

.kicker {
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
  font-family: var(--font-display);
  font-size: calc(19 * var(--u));
  font-weight: 800;
  color: #0058c8;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  max-width: calc(720 * var(--u));
  font-family: var(--font-display);
  font-size: calc(74 * var(--u));
  line-height: 1.02;
  font-weight: 800;
  color: #073376;
}

.headline-rule {
  width: calc(108 * var(--u));
  height: calc(5 * var(--u));
  margin: calc(36 * var(--u)) 0 calc(38 * var(--u)) calc(132 * var(--u));
  border-radius: calc(999 * var(--u));
  background: #b5cc18;
}

.message-box {
  max-width: calc(795 * var(--u));
  border: 1px solid rgba(22, 58, 108, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 calc(18 * var(--u)) calc(48 * var(--u)) rgba(22, 58, 108, 0.08);
  padding: calc(32 * var(--u)) calc(44 * var(--u));
}

.message-box p {
  margin: 0 0 calc(24 * var(--u));
  font-size: calc(28 * var(--u));
  line-height: 1.38;
  color: #1a2945;
}

.message-box p:last-child {
  margin-bottom: 0;
}

.message-box .highlight {
  font-weight: 700;
  color: #073376;
}

.visual-panel {
  grid-column: 7 / 11;
  grid-row: 1;
  align-self: center;
  min-height: calc(580 * var(--u));
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 calc(22 * var(--u)) calc(58 * var(--u)) rgba(22, 58, 108, 0.14);
  background: #eee0d4;
}

.visual-panel img {
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: block;
  object-fit: cover;
}

.meta-stack {
  grid-column: 10 / 13;
  grid-row: 1;
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: calc(20 * var(--u));
  transform: translateX(calc(18 * var(--u)));
}

.meta-card {
  display: grid;
  grid-template-columns: calc(96 * var(--u)) 1fr;
  gap: calc(24 * var(--u));
  align-items: center;
  min-height: calc(136 * var(--u));
  padding: calc(20 * var(--u)) calc(28 * var(--u));
  border-right: calc(10 * var(--u)) solid #b5cc18;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 calc(20 * var(--u)) calc(52 * var(--u)) rgba(22, 58, 108, 0.12);
}

.meta-icon {
  width: calc(80 * var(--u));
  height: calc(80 * var(--u));
  border-radius: 50%;
  background: #eef2f7;
  color: #073376;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-label {
  margin-bottom: calc(10 * var(--u));
  font-family: var(--font-display);
  font-size: calc(17 * var(--u));
  line-height: 1.18;
  font-weight: 800;
  color: #0058c8;
  text-transform: uppercase;
}

.meta-value {
  font-family: var(--font-display);
  font-size: calc(32 * var(--u));
  line-height: 1.05;
  font-weight: 500;
  color: #17223b;
}

.action-strip {
  grid-column: 1 / 13;
  grid-row: 2;
  display: grid;
  grid-template-columns: calc(70 * var(--u)) 1fr auto;
  gap: calc(30 * var(--u));
  align-items: center;
  min-height: calc(104 * var(--u));
  border: 1px solid rgba(22, 58, 108, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 calc(14 * var(--u)) calc(42 * var(--u)) rgba(22, 58, 108, 0.08);
  padding: calc(18 * var(--u)) calc(30 * var(--u));
}

.action-icon {
  width: calc(64 * var(--u));
  height: calc(64 * var(--u));
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, #c8dc18, #abc30d);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-strip p {
  margin: 0;
  font-size: calc(27 * var(--u));
  line-height: 1.25;
  color: #13223e;
}

.action-strip strong {
  margin-right: calc(10 * var(--u));
  color: #073376;
}

.cta-button {
  height: calc(68 * var(--u));
  min-width: calc(360 * var(--u));
  padding: 0 calc(28 * var(--u));
  border-radius: calc(999 * var(--u));
  background: linear-gradient(135deg, #c8dc18, #adc80e);
  color: #073376;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(20 * var(--u));
  font-family: var(--font-display);
  font-size: calc(23 * var(--u));
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
  box-shadow: 0 calc(14 * var(--u)) calc(30 * var(--u)) rgba(181, 204, 24, 0.22);
}

@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }

  .form {
    position: static;
    max-height: none;
  }
}
</style>
