<script setup>
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)

const kicker = field('kicker', 'NEWS · KURZ & KNACKIG')
const titel = field('titel', 'Kurznachrichten')
const news1_titel = field('news1_titel', '5 Jahre ErgoMove')
const news1_text = field('news1_text', 'Unser ergonomischer Antrieb feiert 5-jähriges Jubiläum. Über 10.000 Einheiten weltweit.')
const news2_titel = field('news2_titel', '100 Jahre Boudrant')
const news2_text = field('news2_text', 'Unser französischer Partner Boudrant feiert 100-jähriges Bestehen. Herzlichen Glückwunsch!')
const news3_titel = field('news3_titel', 'Lean-Arbeitskreis gestartet')
const news3_text = field('news3_text', 'Der neue Lean-Arbeitskreis trifft sich regelmäßig, um Prozesse zu verbessern.')
const authorLabel = field('authorLabel', 'Blickle Redaktion')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Blickle-Grün', value: '#B5CC18' }, { name: 'Navy', value: '#163A6C' },
  { name: 'Blau', value: '#3B82F6' }, { name: 'Orange', value: '#F97316' },
]
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
      <div class="header">
        <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
        <h1 class="title">{{ titel }}</h1>
      </div>
      <div class="news-grid">
        <article class="news-card">
          <div class="news-num">01</div>
          <div class="news-body"><h3 class="news-title">{{ news1_titel }}</h3><p class="news-text">{{ news1_text }}</p></div>
        </article>
        <article class="news-card">
          <div class="news-num">02</div>
          <div class="news-body"><h3 class="news-title">{{ news2_titel }}</h3><p class="news-text">{{ news2_text }}</p></div>
        </article>
        <article class="news-card">
          <div class="news-num">03</div>
          <div class="news-body"><h3 class="news-title">{{ news3_titel }}</h3><p class="news-text">{{ news3_text }}</p></div>
        </article>
      </div>
      <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>{{ authorLabel }}</span></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kopf</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Titel</span><input v-model="titel" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">News 1</h4>
        <label class="fld"><span class="fld-label">Titel</span><input v-model="news1_titel" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Text</span><textarea v-model="news1_text" class="fld-input" rows="2" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">News 2</h4>
        <label class="fld"><span class="fld-label">Titel</span><input v-model="news2_titel" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Text</span><textarea v-model="news2_text" class="fld-input" rows="2" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">News 3</h4>
        <label class="fld"><span class="fld-label">Titel</span><input v-model="news3_titel" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Text</span><textarea v-model="news3_text" class="fld-input" rows="2" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Meta &amp; Gestaltung</h4>
        <label class="fld"><span class="fld-label">Autor</span><input v-model="authorLabel" type="text" class="fld-input" /></label>
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
          <div class="header">
            <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
            <h1 class="title">{{ titel }}</h1>
          </div>
          <div class="news-grid">
            <article class="news-card"><div class="news-num">01</div><div class="news-body"><h3 class="news-title">{{ news1_titel }}</h3><p class="news-text">{{ news1_text }}</p></div></article>
            <article class="news-card"><div class="news-num">02</div><div class="news-body"><h3 class="news-title">{{ news2_titel }}</h3><p class="news-text">{{ news2_text }}</p></div></article>
            <article class="news-card"><div class="news-num">03</div><div class="news-body"><h3 class="news-title">{{ news3_titel }}</h3><p class="news-text">{{ news3_text }}</p></div></article>
          </div>
          <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>{{ authorLabel }}</span></div>
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
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; } .accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.canvas { position: absolute; inset: 0; width: 100%; height: 100%; --u: min(calc(100cqw / 1920), calc(100cqh / 1080)); display: grid; grid-template-rows: auto 1fr auto; gap: calc(36 * var(--u)); padding: calc(60 * var(--u)) calc(80 * var(--u)); box-sizing: border-box; font-family: var(--font-body); }
.canvas.theme-dark { background: radial-gradient(ellipse at 80% 0%, rgba(181,204,24,0.08) 0%, transparent 55%), linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }

.header { display: flex; flex-direction: column; gap: calc(14 * var(--u)); }
.kicker-row { display: flex; align-items: center; gap: calc(14 * var(--u)); font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: calc(14 * var(--u)); height: calc(14 * var(--u)); border-radius: 50%; background: var(--accent); box-shadow: 0 0 calc(18 * var(--u)) var(--accent); }
.title { margin: 0; font-family: var(--font-display); font-size: calc(108 * var(--u)); font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
.theme-dark .title { color: #fff; } .theme-light .title { color: #0B1F3A; }

.news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(32 * var(--u)); align-items: stretch; }
.news-card { display: flex; flex-direction: column; gap: calc(18 * var(--u)); padding: calc(36 * var(--u)) calc(36 * var(--u)) calc(32 * var(--u)); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-top: calc(6 * var(--u)) solid var(--accent); border-radius: calc(18 * var(--u)); }
.theme-light .news-card { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08); border-top-color: var(--accent); }
.news-num { font-family: var(--font-display); font-size: calc(60 * var(--u)); font-weight: 800; color: var(--accent); line-height: 0.8; letter-spacing: -0.03em; opacity: 0.75; }
.news-body { display: flex; flex-direction: column; gap: calc(12 * var(--u)); }
.news-title { margin: 0; font-family: var(--font-display); font-size: calc(34 * var(--u)); font-weight: 700; line-height: 1.15; letter-spacing: -0.01em; color: #fff; }
.theme-light .news-title { color: #0B1F3A; }
.news-text { margin: 0; font-size: calc(22 * var(--u)); line-height: 1.4; color: rgba(255,255,255,0.78); }
.theme-light .news-text { color: rgba(11,31,58,0.78); }

.footer { display: flex; align-items: center; gap: calc(14 * var(--u)); padding-top: calc(16 * var(--u)); border-top: 1px solid rgba(255,255,255,0.1); font-size: calc(16 * var(--u)); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11,31,58,0.55); }
.spacer { flex: 1; }
.footer-logo { height: calc(30 * var(--u)); filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
