<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field, update } = useParamModel(props, emit)

const kicker = field('kicker', 'KARRIERE · BLICKLE')
const jobTitle = field('jobTitle', 'Produktionsmitarbeiter (m/w/d)')
const department = field('department', 'Fertigung · Halle 2')
const departmentIcon = field('departmentIcon', 'gear')
const bullets = field('bullets', [])
const perks = field('perks', '38 Std./Woche · Tarif IG Metall')
const applyUrl = field('applyUrl', 'https://blickle.com/karriere')
const contactName = field('contactName', 'Maria Schulz')
const contactEmail = field('contactEmail', 'karriere@blickle.com')
const contactPhone = field('contactPhone', '+49 7428 932 0')
const validUntil = field('validUntil', '2026-05-31')
const accent = field('accent', '#B5CC18')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Blickle-Gruen', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Orange', value: '#F97316' },
]

const deptIcons = [
  { key: 'gear',    label: 'Fertigung',   svg: '<circle cx="32" cy="32" r="8"/><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M12 52l6-6M46 18l6-6"/>' },
  { key: 'wrench',  label: 'Werkzeug',    svg: '<path d="M45 5l-10 10 4 4 10-10-4-4ZM15 50L43 22l-3-3L12 47l3 3Z"/><circle cx="42" cy="22" r="3"/>' },
  { key: 'chip',    label: 'IT/Technik',  svg: '<rect x="14" y="14" width="36" height="36" rx="3"/><rect x="22" y="22" width="20" height="20"/><path d="M8 22h6M8 32h6M8 42h6M50 22h6M50 32h6M50 42h6M22 8v6M32 8v6M42 8v6M22 50v6M32 50v6M42 50v6"/>' },
  { key: 'truck',   label: 'Logistik',    svg: '<rect x="4" y="22" width="32" height="22" rx="2"/><path d="M36 28h12l8 8v8H36V28Z"/><circle cx="14" cy="48" r="5"/><circle cx="46" cy="48" r="5"/>' },
  { key: 'people',  label: 'Verwaltung',  svg: '<circle cx="24" cy="22" r="8"/><path d="M8 50c0-9 7-16 16-16s16 7 16 16"/><circle cx="44" cy="26" r="6"/><path d="M48 50c0-6-3-12-8-14"/>' },
  { key: 'flask',   label: 'Qualitaet',   svg: '<path d="M24 4v20L12 48c-2 4 1 8 5 8h30c4 0 7-4 5-8L40 24V4Z"/><path d="M20 4h24"/><path d="M18 34h28"/>' },
]

function updateBullet(i, value) {
  const arr = [...(bullets.value || [])]
  arr[i] = value
  update('bullets', arr)
}
function addBullet() {
  const arr = [...(bullets.value || [])]
  if (arr.length >= 6) return
  arr.push('Neue Anforderung')
  update('bullets', arr)
}
function removeBullet(i) {
  const arr = [...(bullets.value || [])]
  arr.splice(i, 1)
  update('bullets', arr)
}

const formattedUntil = computed(() => {
  if (!validUntil.value) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(validUntil.value))
  } catch { return validUntil.value }
})

function qrSrc(url) {
  if (!url) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=400x400&margin=4`
}

const currentDeptIcon = computed(() => deptIcons.find(i => i.key === departmentIcon.value) || deptIcons[0])

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
      <div class="kicker-row"><span class="kicker-dot"></span><span class="kicker-text">{{ kicker }}</span></div>
      <div class="title">{{ jobTitle }}</div>
      <div class="subtitle">{{ department }}</div>
      <div class="main-row">
        <div class="icon-card">
          <div class="icon-wrap" v-html="`<svg viewBox='0 0 64 64' width='140' height='140' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>${currentDeptIcon.svg}</svg>`"></div>
          <div class="icon-label">{{ currentDeptIcon.label }}</div>
        </div>
        <div class="bullets-card">
          <div class="bullets-header">Deine Aufgaben</div>
          <ul class="bullets">
            <li v-for="(b, i) in bullets" :key="i"><span class="check">&#10003;</span><span>{{ b }}</span></li>
          </ul>
          <div class="perks" v-if="perks">{{ perks }}</div>
        </div>
        <div class="qr-card">
          <div class="qr-box"><img v-if="applyUrl" :src="qrSrc(applyUrl)" alt="" /></div>
          <div class="qr-label">Jetzt bewerben</div>
          <div class="qr-sub">Scan &#8594; Online-Form</div>
        </div>
      </div>
      <div class="contact-strip">
        <div class="contact-person">
          <div class="contact-label">Ansprechpartner</div>
          <div class="contact-name">{{ contactName }}</div>
        </div>
        <div class="contact-divider"></div>
        <div class="contact-channels">
          <div v-if="contactEmail" class="channel">&#9993; {{ contactEmail }}</div>
          <div v-if="contactPhone" class="channel">&#9742; {{ contactPhone }}</div>
        </div>
      </div>
      <div class="footer"><span>Bewerbungsschluss {{ formattedUntil }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /></div>
    </div>
  </div>

  <div v-else class="jp-split">
    <aside class="jp-form" v-if="!readonly">
      <section class="fs">
        <h4 class="fs-title">Jobkopf</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Jobtitel</span><textarea v-model="jobTitle" class="fld-input fld-small" rows="2" /></label>
        <label class="fld"><span class="fld-label">Abteilung</span><input v-model="department" type="text" class="fld-input" /></label>
        <div class="fld">
          <span class="fld-label">Icon</span>
          <div class="icon-row">
            <button v-for="i in deptIcons" :key="i.key" class="icon-btn"
              :class="{ active: departmentIcon === i.key }" :title="i.label" @click="departmentIcon = i.key"
              v-html="`<svg viewBox='0 0 64 64' width='24' height='24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>${i.svg}</svg>`"></button>
          </div>
        </div>
      </section>
      <section class="fs">
        <h4 class="fs-title">Deine Aufgaben</h4>
        <div v-for="(b, i) in bullets" :key="i" class="bullet-row">
          <input :value="b" @input="e => updateBullet(i, e.target.value)" type="text" class="fld-input" />
          <button class="btn-x" @click="removeBullet(i)" v-if="bullets.length > 1">&times;</button>
        </div>
        <button class="btn-add" @click="addBullet" v-if="bullets.length < 6">+ Anforderung</button>
      </section>
      <section class="fs">
        <h4 class="fs-title">Rahmen</h4>
        <label class="fld"><span class="fld-label">Benefits</span><input v-model="perks" type="text" class="fld-input" /></label>
      </section>
      <section class="fs">
        <h4 class="fs-title">Bewerbung</h4>
        <label class="fld"><span class="fld-label">Bewerbungs-URL</span><input v-model="applyUrl" type="url" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Ansprechpartner</span><input v-model="contactName" type="text" class="fld-input" /></label>
        <div class="row-2">
          <label class="fld"><span class="fld-label">E-Mail</span><input v-model="contactEmail" type="email" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">Telefon</span><input v-model="contactPhone" type="text" class="fld-input" /></label>
        </div>
      </section>
      <section class="fs">
        <h4 class="fs-title">Meta</h4>
        <label class="fld"><span class="fld-label">Gueltig bis</span><input v-model="validUntil" type="date" class="fld-input" /></label>
        <div class="fld"><span class="fld-label">Akzentfarbe</span>
          <div class="accent-row">
            <button v-for="p in accentPresets" :key="p.value" class="accent-swatch"
              :class="{ active: accent === p.value }" :style="{ background: p.value }"
              @click="accent = p.value"></button>
          </div>
        </div>
        <div class="fld"><span class="fld-label">Theme</span>
          <div class="theme-row">
            <button :class="['theme-btn', { active: theme === 'dark' }]" @click="theme = 'dark'">Dark</button>
            <button :class="['theme-btn', { active: theme === 'light' }]" @click="theme = 'light'">Light</button>
          </div>
        </div>
      </section>
    </aside>

    <section class="jp-preview">
      <div class="preview-header"><span>Live-Vorschau · 1920 × 1080</span></div>
      <div class="preview-frame" ref="previewFrame">
        <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent, transform: `scale(${scale})` }">
          <div class="kicker-row"><span class="kicker-dot"></span><span class="kicker-text">{{ kicker }}</span></div>
          <div class="title">{{ jobTitle }}</div>
          <div class="subtitle">{{ department }}</div>
          <div class="main-row">
            <div class="icon-card">
              <div class="icon-wrap" v-html="`<svg viewBox='0 0 64 64' width='140' height='140' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>${currentDeptIcon.svg}</svg>`"></div>
              <div class="icon-label">{{ currentDeptIcon.label }}</div>
            </div>
            <div class="bullets-card">
              <div class="bullets-header">Deine Aufgaben</div>
              <ul class="bullets">
                <li v-for="(b, i) in bullets" :key="i"><span class="check">&#10003;</span><span>{{ b }}</span></li>
              </ul>
              <div class="perks" v-if="perks">{{ perks }}</div>
            </div>
            <div class="qr-card">
              <div class="qr-box"><img v-if="applyUrl" :src="qrSrc(applyUrl)" alt="" /></div>
              <div class="qr-label">Jetzt bewerben</div>
              <div class="qr-sub">Scan &#8594; Online-Form</div>
            </div>
          </div>
          <div class="contact-strip">
            <div class="contact-person">
              <div class="contact-label">Ansprechpartner</div>
              <div class="contact-name">{{ contactName }}</div>
            </div>
            <div class="contact-divider"></div>
            <div class="contact-channels">
              <div v-if="contactEmail" class="channel">&#9993; {{ contactEmail }}</div>
              <div v-if="contactPhone" class="channel">&#9742; {{ contactPhone }}</div>
            </div>
          </div>
          <div class="footer"><span>Bewerbungsschluss {{ formattedUntil }}</span><span class="spacer"></span><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.jp-split { display: grid; grid-template-columns: 420px 1fr; gap: 20px; align-items: start; }
.jp-form { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 220px); overflow-y: auto; position: sticky; top: 20px; }
.fs { margin-bottom: 22px; }
.fs-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin-bottom: 10px; }
.fld { display: block; margin-bottom: 12px; }
.fld-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
.fld-input:focus { outline: none; border-color: var(--blickle-navy); box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08); }
.fld-small { min-height: 50px; resize: vertical; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.icon-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
.icon-btn { aspect-ratio: 1; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); color: var(--gray-600); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.icon-btn.active { background: rgba(22, 58, 108, 0.08); border-color: var(--blickle-navy); color: var(--blickle-navy); }
.bullet-row { display: flex; gap: 4px; margin-bottom: 4px; }
.bullet-row .fld-input { flex: 1; }
.btn-x { width: 32px; background: transparent; border: 1px solid var(--color-border); border-radius: 6px; color: var(--gray-500); cursor: pointer; }
.btn-add { margin-top: 6px; padding: 6px 12px; background: var(--gray-50); border: 1px dashed var(--color-border); border-radius: 6px; color: var(--gray-600); font-size: 0.78rem; cursor: pointer; width: 100%; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; }
.accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; }
.accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; }
.theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; }
.theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.jp-preview { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06); background: #000; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; background: #000; }

.canvas { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; transform-origin: top left; display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: auto; gap: 24px; padding: 56px 72px; box-sizing: border-box; font-family: var(--font-body); align-content: start; }
.canvas.theme-dark { background: radial-gradient(ellipse at 85% 0%, rgba(181, 204, 24, 0.1) 0%, transparent 55%), linear-gradient(135deg, #0A1A33 0%, #0B2442 40%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }
.kicker-row { grid-column: 1 / 13; display: flex; align-items: center; gap: 14px; font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 18px var(--accent); }
.title { grid-column: 1 / 13; font-family: var(--font-display); font-size: 88px; font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; }
.theme-dark .title { color: #fff; } .theme-light .title { color: #0B1F3A; }
.subtitle { grid-column: 1 / 13; font-family: var(--font-display); font-size: 32px; font-weight: 500; color: var(--accent); margin-bottom: 14px; }
.main-row { grid-column: 1 / 13; display: grid; grid-template-columns: 3fr 6fr 3fr; gap: 24px; align-items: stretch; }
.icon-card { background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; overflow: hidden; }
.icon-wrap { color: var(--accent); filter: drop-shadow(0 0 28px var(--accent)); }
.icon-label { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.8); letter-spacing: 0.05em; text-transform: uppercase; }
.theme-light .icon-label { color: rgba(11, 31, 58, 0.75); }
.bullets-card { background: rgba(255,255,255,0.04); border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); border-top: 6px solid var(--accent); padding: 32px 40px; display: flex; flex-direction: column; gap: 16px; }
.bullets-header { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); }
.bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.bullets li { display: flex; gap: 14px; align-items: flex-start; font-size: 26px; line-height: 1.3; color: rgba(255,255,255,0.88); font-weight: 400; }
.theme-light .bullets li { color: rgba(11, 31, 58, 0.88); }
.check { color: var(--accent); font-weight: 800; flex-shrink: 0; width: 30px; font-size: 28px; }
.perks { padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 18px; color: rgba(255,255,255,0.6); font-weight: 500; }
.theme-light .perks { border-top-color: rgba(0,0,0,0.1); color: rgba(11, 31, 58, 0.6); }
.qr-card { background: rgba(255,255,255,0.04); border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.qr-box { width: 100%; aspect-ratio: 1; background: #fff; border-radius: 14px; padding: 14px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
.qr-box img { width: 100%; height: 100%; object-fit: contain; }
.qr-label { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--accent); text-align: center; letter-spacing: 0.04em; }
.qr-sub { font-size: 16px; color: rgba(255,255,255,0.55); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
.theme-light .qr-sub { color: rgba(11, 31, 58, 0.55); }
.contact-strip { grid-column: 1 / 13; display: flex; align-items: center; gap: 28px; padding: 20px 28px; margin-top: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; }
.contact-label { font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
.theme-light .contact-label { color: rgba(11, 31, 58, 0.5); }
.contact-name { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: #fff; line-height: 1; }
.theme-light .contact-name { color: #0B1F3A; }
.contact-divider { width: 1px; height: 44px; background: rgba(255,255,255,0.15); }
.theme-light .contact-divider { background: rgba(0,0,0,0.15); }
.contact-channels { display: flex; flex-direction: column; gap: 4px; }
.channel { font-size: 22px; font-weight: 500; color: rgba(255,255,255,0.85); letter-spacing: 0.02em; }
.theme-light .channel { color: rgba(11, 31, 58, 0.85); }
.footer { grid-column: 1 / 13; display: flex; align-items: center; gap: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 16px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: 6px; }
.theme-light .footer { border-top-color: rgba(0,0,0,0.1); color: rgba(11, 31, 58, 0.55); }
.spacer { flex: 1; }
.footer-logo { height: 30px; filter: brightness(0) invert(1); opacity: 0.85; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
