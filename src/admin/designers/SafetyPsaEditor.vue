<script setup>
import { computed } from 'vue'
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock3,
  Footprints,
  Glasses,
  Headphones,
  ShieldCheck,
} from 'lucide-vue-next'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)

const kicker = field('kicker', 'SICHERHEIT')
const badge = field('badge', 'WARNUNG')
const headline = field('headline', 'PSA-Pflicht in der Produktion')
const body = field('body', 'In allen Produktionsbereichen gilt: Schutzbrille, Sicherheitsschuhe und Gehörschutz sind Pflicht. Bitte achten Sie auf Ihre eigene Sicherheit und auf die Ihrer Kolleginnen und Kollegen. Bei Fragen wenden Sie sich an Ihre Führungskraft.')
const validFrom = field('validFrom', '')
const readingTime = field('readingTime', 'ca. 15 Sek.')
const ackLabel = field('ackLabel', 'Bitte Sicherheitsvorschriften beachten')
const footerNote = field('footerNote', 'Aushang gültig bis zur Aktualisierung')
const backgroundImage = field('backgroundImage', '/content/karriere/blickle-produktion.jpg')
const source = field('source', 'Arbeitssicherheit Blickle')
const equipment1 = field('equipment1', 'Schutzbrille')
const equipment2 = field('equipment2', 'Sicherheitsschuhe')
const equipment3 = field('equipment3', 'Gehörschutz')

const equipmentItems = computed(() => [
  { label: equipment1.value, icon: Glasses },
  { label: equipment2.value, icon: Footprints },
  { label: equipment3.value, icon: Headphones },
].filter(item => item.label))

const formattedFrom = computed(() => {
  if (!validFrom.value) return 'ab sofort'
  const raw = String(validFrom.value)
  if (raw.toLowerCase().includes('sofort')) return raw
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
})
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div class="psa-canvas" :style="{ '--psa-bg': `url(${backgroundImage})` }">
      <div class="psa-hero">
        <section class="psa-copy" aria-label="Sicherheitshinweis">
          <div class="psa-kicker">{{ kicker }}</div>
          <div class="psa-title-row">
            <AlertTriangle class="psa-warning-icon" :stroke-width="2.4" />
            <div>
              <span class="psa-badge">{{ badge }}</span>
              <h1>{{ headline }}</h1>
            </div>
          </div>
          <p class="psa-body">{{ body }}</p>

          <div class="equipment-grid">
            <article v-for="(item, index) in equipmentItems" :key="item.label" class="equipment-card">
              <span class="equipment-number">{{ index + 1 }}</span>
              <component :is="item.icon" class="equipment-icon" :stroke-width="2.2" />
              <strong>{{ item.label }}</strong>
            </article>
          </div>
        </section>

        <aside class="psa-meta" aria-label="Formale Angaben">
          <div class="meta-card">
            <CalendarDays class="meta-icon" :stroke-width="2.5" />
            <div class="meta-separator"></div>
            <div>
              <span>Gültig ab</span>
              <strong>{{ formattedFrom }}</strong>
            </div>
          </div>
          <div class="meta-card">
            <Clock3 class="meta-icon" :stroke-width="2.5" />
            <div class="meta-separator"></div>
            <div>
              <span>Lesezeit</span>
              <strong>{{ readingTime }}</strong>
            </div>
          </div>
        </aside>

        <div class="factory-panel" aria-hidden="true">
          <div class="ppe-disc"><Glasses :stroke-width="2.1" /></div>
          <div class="ppe-disc"><Footprints :stroke-width="2.1" /></div>
          <div class="ppe-disc"><Headphones :stroke-width="2.1" /></div>
        </div>

        <div class="ack-strip">
          <ShieldCheck class="ack-shield" :stroke-width="2.5" />
          <strong>{{ ackLabel }}</strong>
          <ChevronRight class="ack-arrow" :stroke-width="3" />
        </div>
      </div>

      <footer class="psa-footer">
        <span>{{ footerNote }}</span>
      </footer>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs">
        <h4 class="fs-title">Kernaussage</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Badge</span><input v-model="badge" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Überschrift</span><textarea v-model="headline" class="fld-input fld-small" rows="2" /></label>
        <label class="fld"><span class="fld-label">Hinweistext</span><textarea v-model="body" class="fld-input" rows="6" /></label>
      </section>

      <section class="fs">
        <h4 class="fs-title">PSA-Punkte</h4>
        <label class="fld"><span class="fld-label">Punkt 1</span><input v-model="equipment1" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Punkt 2</span><input v-model="equipment2" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Punkt 3</span><input v-model="equipment3" type="text" class="fld-input" /></label>
      </section>

      <section class="fs">
        <h4 class="fs-title">Angaben</h4>
        <div class="row-2">
          <label class="fld"><span class="fld-label">Gültig ab</span><input v-model="validFrom" type="text" class="fld-input" placeholder="ab sofort oder Datum" /></label>
          <label class="fld"><span class="fld-label">Lesezeit</span><input v-model="readingTime" type="text" class="fld-input" /></label>
        </div>
        <label class="fld"><span class="fld-label">Handlungshinweis</span><input v-model="ackLabel" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Fußnote</span><input v-model="footerNote" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Quelle</span><input v-model="source" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Hintergrundbild</span><input v-model="backgroundImage" type="text" class="fld-input" /></label>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · 16:9</span></div>
      <div class="preview-frame">
        <div class="psa-canvas" :style="{ '--psa-bg': `url(${backgroundImage})` }">
          <div class="psa-hero">
            <section class="psa-copy">
              <div class="psa-kicker">{{ kicker }}</div>
              <div class="psa-title-row">
                <AlertTriangle class="psa-warning-icon" :stroke-width="2.4" />
                <div>
                  <span class="psa-badge">{{ badge }}</span>
                  <h1>{{ headline }}</h1>
                </div>
              </div>
              <p class="psa-body">{{ body }}</p>
              <div class="equipment-grid">
                <article v-for="(item, index) in equipmentItems" :key="item.label" class="equipment-card">
                  <span class="equipment-number">{{ index + 1 }}</span>
                  <component :is="item.icon" class="equipment-icon" :stroke-width="2.2" />
                  <strong>{{ item.label }}</strong>
                </article>
              </div>
            </section>
            <aside class="psa-meta">
              <div class="meta-card">
                <CalendarDays class="meta-icon" :stroke-width="2.5" />
                <div class="meta-separator"></div>
                <div><span>Gültig ab</span><strong>{{ formattedFrom }}</strong></div>
              </div>
              <div class="meta-card">
                <Clock3 class="meta-icon" :stroke-width="2.5" />
                <div class="meta-separator"></div>
                <div><span>Lesezeit</span><strong>{{ readingTime }}</strong></div>
              </div>
            </aside>
            <div class="factory-panel">
              <div class="ppe-disc"><Glasses :stroke-width="2.1" /></div>
              <div class="ppe-disc"><Footprints :stroke-width="2.1" /></div>
              <div class="ppe-disc"><Headphones :stroke-width="2.1" /></div>
            </div>
            <div class="ack-strip">
              <ShieldCheck class="ack-shield" :stroke-width="2.5" />
              <strong>{{ ackLabel }}</strong>
              <ChevronRight class="ack-arrow" :stroke-width="3" />
            </div>
          </div>
          <footer class="psa-footer">
            <span>{{ footerNote }}</span>
          </footer>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 400px 1fr; gap: 20px; align-items: start; }
.form { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 220px); overflow-y: auto; position: sticky; top: 20px; }
.fs { margin-bottom: 22px; }
.fs-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0; color: var(--gray-500); text-transform: uppercase; margin-bottom: 10px; }
.fld { display: block; margin-bottom: 12px; }
.fld-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
.fld-small { min-height: 50px; resize: vertical; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #eef2f6; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.psa-canvas {
  --u: min(calc(100cqw / 1920), calc(100cqh / 1080));
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: calc(24 * var(--u)) calc(26 * var(--u)) calc(30 * var(--u));
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  font-family: var(--font-body);
  color: #08235c;
  background:
    radial-gradient(circle at 8% 4%, rgba(181, 204, 24, 0.18), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%);
}

.psa-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) calc(360 * var(--u)) calc(540 * var(--u));
  grid-template-rows: 1fr auto;
  column-gap: calc(48 * var(--u));
  row-gap: calc(38 * var(--u));
  min-height: 0;
  padding: calc(60 * var(--u)) calc(62 * var(--u)) calc(32 * var(--u));
  border: 1px solid rgba(8, 35, 92, 0.08);
  border-radius: calc(18 * var(--u));
  background:
    linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 49%, rgba(255,255,255,0.16) 72%),
    linear-gradient(90deg, rgba(255,255,255,0) 58%, rgba(8,35,92,0.36) 100%),
    var(--psa-bg) center / cover no-repeat;
  box-shadow: 0 calc(18 * var(--u)) calc(52 * var(--u)) rgba(8, 35, 92, 0.16);
}

.psa-copy,
.psa-meta,
.factory-panel,
.ack-strip {
  position: relative;
  z-index: 1;
}

.psa-copy { grid-column: 1 / 2; min-width: 0; align-self: start; }
.psa-kicker {
  margin-left: calc(132 * var(--u));
  margin-bottom: calc(18 * var(--u));
  font-family: var(--font-display);
  font-size: calc(18 * var(--u));
  font-weight: 800;
  letter-spacing: 0;
  color: #0b3386;
  text-transform: uppercase;
}
.psa-title-row { display: grid; grid-template-columns: calc(100 * var(--u)) 1fr; gap: calc(34 * var(--u)); align-items: start; }
.psa-warning-icon { width: calc(92 * var(--u)); height: calc(92 * var(--u)); color: #f59e0b; margin-top: calc(18 * var(--u)); }
.psa-badge {
  display: inline-flex;
  align-items: center;
  min-height: calc(34 * var(--u));
  padding: 0 calc(16 * var(--u));
  border-radius: calc(18 * var(--u));
  background: #fff5e6;
  box-shadow: 0 calc(6 * var(--u)) calc(18 * var(--u)) rgba(245, 158, 11, 0.18);
  color: #f59e0b;
  font-family: var(--font-display);
  font-size: calc(15 * var(--u));
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}
.psa-title-row h1 {
  max-width: calc(850 * var(--u));
  margin: calc(20 * var(--u)) 0 calc(28 * var(--u));
  font-family: var(--font-display);
  font-size: calc(58 * var(--u));
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: 0;
  color: #082f86;
}
.psa-title-row h1::after {
  content: '';
  display: block;
  width: calc(124 * var(--u));
  height: calc(5 * var(--u));
  margin-top: calc(22 * var(--u));
  border-radius: calc(5 * var(--u));
  background: #b5cc18;
}
.psa-body {
  max-width: calc(860 * var(--u));
  margin: 0 0 calc(28 * var(--u)) calc(134 * var(--u));
  color: #14213d;
  font-size: calc(25 * var(--u));
  line-height: 1.45;
  font-weight: 500;
}
.equipment-grid {
  margin-left: calc(134 * var(--u));
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(26 * var(--u));
}
.equipment-card {
  position: relative;
  min-height: calc(186 * var(--u));
  display: grid;
  align-content: center;
  justify-items: center;
  gap: calc(14 * var(--u));
  padding: calc(22 * var(--u));
  border: 1px solid rgba(8, 47, 134, 0.12);
  border-radius: calc(10 * var(--u));
  background: rgba(255,255,255,0.88);
  box-shadow: 0 calc(9 * var(--u)) calc(28 * var(--u)) rgba(8, 35, 92, 0.12);
}
.equipment-number {
  position: absolute;
  top: calc(16 * var(--u));
  left: calc(18 * var(--u));
  width: calc(40 * var(--u));
  height: calc(40 * var(--u));
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #b5cc18;
  font-family: var(--font-display);
  font-size: calc(19 * var(--u));
  font-weight: 800;
  box-shadow: 0 calc(6 * var(--u)) calc(14 * var(--u)) rgba(181, 204, 24, 0.36);
}
.equipment-icon { width: calc(78 * var(--u)); height: calc(78 * var(--u)); color: #082f86; }
.equipment-card strong {
  font-family: var(--font-display);
  font-size: calc(22 * var(--u));
  line-height: 1.1;
  text-align: center;
  color: #082f86;
}

.psa-meta {
  grid-column: 2 / 3;
  align-self: center;
  display: grid;
  gap: calc(22 * var(--u));
}
.meta-card {
  min-height: calc(112 * var(--u));
  display: grid;
  grid-template-columns: calc(58 * var(--u)) calc(1 * var(--u)) 1fr;
  align-items: center;
  gap: calc(24 * var(--u));
  padding: calc(18 * var(--u)) calc(28 * var(--u));
  border: 1px solid rgba(8, 35, 92, 0.12);
  border-radius: calc(10 * var(--u));
  background: rgba(255,255,255,0.88);
  box-shadow: 0 calc(14 * var(--u)) calc(32 * var(--u)) rgba(8, 35, 92, 0.14);
  backdrop-filter: blur(8px);
}
.meta-icon { width: calc(48 * var(--u)); height: calc(48 * var(--u)); color: #082f86; }
.meta-separator { width: 1px; height: calc(68 * var(--u)); background: rgba(8, 35, 92, 0.18); }
.meta-card span {
  display: block;
  margin-bottom: calc(6 * var(--u));
  color: #6b7280;
  font-size: calc(18 * var(--u));
  font-weight: 500;
}
.meta-card strong {
  color: #082f86;
  font-family: var(--font-display);
  font-size: calc(22 * var(--u));
  line-height: 1.15;
}

.factory-panel {
  grid-column: 3 / 4;
  align-self: center;
  justify-self: end;
  width: calc(292 * var(--u));
  height: calc(160 * var(--u));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(12 * var(--u));
  border-radius: calc(6 * var(--u));
  background: rgba(255,255,255,0.86);
  box-shadow: 0 calc(20 * var(--u)) calc(40 * var(--u)) rgba(8, 35, 92, 0.16);
}
.ppe-disc {
  width: calc(58 * var(--u));
  height: calc(58 * var(--u));
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #082f86;
  color: #fff;
}
.ppe-disc svg { width: calc(36 * var(--u)); height: calc(36 * var(--u)); }

.ack-strip {
  grid-column: 1 / 4;
  align-self: end;
  display: grid;
  grid-template-columns: calc(62 * var(--u)) 1fr calc(38 * var(--u));
  align-items: center;
  gap: calc(24 * var(--u));
  margin: 0 calc(100 * var(--u)) 0 calc(132 * var(--u));
  min-height: calc(82 * var(--u));
  padding: 0 calc(34 * var(--u));
  border-radius: calc(8 * var(--u));
  background: #b5cc18;
  box-shadow: 0 calc(14 * var(--u)) calc(28 * var(--u)) rgba(128, 148, 0, 0.26);
  color: #082f86;
}
.ack-shield { width: calc(54 * var(--u)); height: calc(54 * var(--u)); color: #082f86; filter: drop-shadow(0 calc(2 * var(--u)) 0 rgba(255,255,255,0.9)); }
.ack-strip strong {
  min-width: 0;
  font-family: var(--font-display);
  font-size: calc(27 * var(--u));
  line-height: 1.1;
  font-weight: 800;
}
.ack-arrow { width: calc(36 * var(--u)); height: calc(36 * var(--u)); justify-self: end; }

.psa-footer {
  position: absolute;
  right: calc(80 * var(--u));
  bottom: calc(10 * var(--u));
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
}
.psa-footer span {
  font-size: calc(18 * var(--u));
  color: #6b7280;
  font-weight: 600;
}
</style>
