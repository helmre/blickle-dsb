<script setup>
import { useDesignerMediaUpload } from '../composables/useDesignerMediaUpload.js'
import { useParamModel } from '../../shared/composables/useParamModel.js'

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  displayMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:params'])
const { field } = useParamModel(props, emit)
const { pickDesignerMedia } = useDesignerMediaUpload()

const kicker = field('kicker', 'PROJEKT-SHOWCASE')
const kategorie = field('kategorie', 'NACHHALTIGKEIT')
const projektname = field('projektname', 'Frida Hochbeet')
const beschreibung = field('beschreibung', 'Mitarbeiter haben gemeinsam Hochbeete für den Außenbereich gebaut. Frisches Gemüse und Kräuter fürs s\'Rädle — nachhaltig und selbst angebaut.')
const imageUrl = field('imageUrl', '/content/einblickle/projekte.jpg')
const authorLabel = field('authorLabel', 'Blickle Team')
const accent = field('accent', '#10B981')
const theme = field('theme', 'dark')

const accentPresets = [
  { name: 'Grün', value: '#10B981' }, { name: 'Blickle-Grün', value: '#B5CC18' },
  { name: 'Navy', value: '#163A6C' }, { name: 'Orange', value: '#F97316' },
  { name: 'Blau', value: '#3B82F6' },
]

async function onImagePick(e) {
  await pickDesignerMedia(e, {
    kind: 'image',
    errorMessage: 'Bild konnte nicht geladen werden.',
    onLoaded(dataUrl) {
      imageUrl.value = dataUrl
    },
  })
}
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <div :class="['canvas', `theme-${theme}`]" :style="{ '--accent': accent }">
      <div class="photo-layer"><img v-if="imageUrl" :src="imageUrl" :alt="projektname" class="photo" /></div>
      <div class="scrim"></div>
      <div class="category-pill" v-if="kategorie">{{ kategorie }}</div>
      <div class="content">
        <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
        <h1 class="project-name">{{ projektname }}</h1>
        <div class="title-rule"></div>
        <p class="project-desc">{{ beschreibung }}</p>
      </div>
      <div class="footer"><img src="/Blicklelogo.png" alt="Blickle" class="footer-logo" /><span class="spacer"></span><span>{{ authorLabel }}</span></div>
    </div>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs"><h4 class="fs-title">Kopf</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Kategorie</span><input v-model="kategorie" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Inhalt</h4>
        <label class="fld"><span class="fld-label">Projektname</span><input v-model="projektname" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Beschreibung</span><textarea v-model="beschreibung" class="fld-input" rows="5" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Bild</h4>
        <label class="fld"><span class="fld-label">Bild wählen</span><input type="file" accept="image/*" class="fld-input fld-file" @change="onImagePick" /></label>
        <label class="fld"><span class="fld-label">Pfad (Fallback)</span><input v-model="imageUrl" type="text" class="fld-input" /></label>
      </section>
      <section class="fs"><h4 class="fs-title">Gestaltung</h4>
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
          <div class="photo-layer"><img v-if="imageUrl" :src="imageUrl" :alt="projektname" class="photo" /></div>
          <div class="scrim"></div>
          <div class="category-pill" v-if="kategorie">{{ kategorie }}</div>
          <div class="content">
            <div class="kicker-row"><span class="kicker-dot"></span><span>{{ kicker }}</span></div>
            <h1 class="project-name">{{ projektname }}</h1>
            <div class="title-rule"></div>
            <p class="project-desc">{{ beschreibung }}</p>
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
.fld-file { padding: 4px; font-size: 0.75rem; }
.accent-row { display: flex; gap: 8px; flex-wrap: wrap; } .accent-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); cursor: pointer; } .accent-swatch.active { border-color: var(--blickle-navy); transform: scale(1.12); }
.theme-row { display: flex; gap: 6px; } .theme-btn { flex: 1; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--gray-50); font-size: 0.8rem; font-weight: 500; } .theme-btn.active { background: var(--blickle-navy); color: #fff; border-color: var(--blickle-navy); }
.preview-panel { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #000; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.canvas { position: absolute; inset: 0; width: 100%; height: 100%; --u: min(calc(100cqw / 1920), calc(100cqh / 1080)); box-sizing: border-box; font-family: var(--font-body); border-radius: calc(8 * var(--u)); overflow: hidden; box-shadow: 0 calc(20 * var(--u)) calc(58 * var(--u)) rgba(22, 58, 108, 0.14); }
.canvas.theme-dark { background: linear-gradient(135deg, #0A1A33 0%, #163A6C 100%); color: #fff; }
.canvas.theme-light { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); color: #0B1F3A; }

.photo-layer { position: absolute; inset: 0; overflow: hidden; }
.photo { width: 100%; height: 100%; object-fit: cover; object-position: center 52%; display: block; transform: scale(1.02); }
.scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7, 36, 80, 0.95) 0%, rgba(7, 36, 80, 0.78) 28%, rgba(7, 36, 80, 0.18) 58%, rgba(7, 36, 80, 0.02) 100%), linear-gradient(180deg, rgba(7, 36, 80, 0.05) 0%, rgba(7, 36, 80, 0.08) 48%, rgba(7, 36, 80, 0.54) 100%); pointer-events: none; }
.theme-light .scrim { background: linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.72) 30%, rgba(255,255,255,0.14) 62%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(11,31,58,0.02) 0%, rgba(11,31,58,0.05) 52%, rgba(11,31,58,0.34) 100%); }

.content { position: absolute; left: calc(88 * var(--u)); bottom: calc(116 * var(--u)); width: calc(760 * var(--u)); display: flex; flex-direction: column; align-items: flex-start; gap: calc(18 * var(--u)); z-index: 2; }

.kicker-row { display: flex; align-items: center; gap: calc(14 * var(--u)); font-family: var(--font-display); font-size: calc(24 * var(--u)); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
.kicker-dot { width: calc(14 * var(--u)); height: calc(14 * var(--u)); border-radius: 50%; background: var(--accent); box-shadow: 0 0 calc(18 * var(--u)) var(--accent); }
.category-pill { position: absolute; right: calc(84 * var(--u)); top: calc(460 * var(--u)); z-index: 3; padding: calc(13 * var(--u)) calc(34 * var(--u)); background: var(--accent); color: #073376; border-radius: 999px; font-family: var(--font-display); font-size: calc(22 * var(--u)); font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; box-shadow: 0 calc(16 * var(--u)) calc(34 * var(--u)) rgba(0,0,0,0.24); }

.project-name { margin: 0; font-family: var(--font-display); font-size: calc(104 * var(--u)); font-weight: 800; line-height: 0.98; color: #fff; text-shadow: 0 calc(4 * var(--u)) calc(24 * var(--u)) rgba(0,0,0,0.42); }
.theme-light .project-name { color: #0B1F3A; text-shadow: none; }

.title-rule { width: calc(64 * var(--u)); height: calc(5 * var(--u)); border-radius: 999px; background: var(--accent); margin: calc(2 * var(--u)) 0 calc(6 * var(--u)); }

.project-desc { margin: 0; font-size: calc(28 * var(--u)); line-height: 1.4; color: rgba(255,255,255,0.94); max-width: calc(650 * var(--u)); text-shadow: 0 calc(2 * var(--u)) calc(12 * var(--u)) rgba(0,0,0,0.5); }
.theme-light .project-desc { color: rgba(11,31,58,0.9); text-shadow: none; }

.footer { position: absolute; left: calc(88 * var(--u)); right: calc(84 * var(--u)); bottom: calc(42 * var(--u)); z-index: 3; display: flex; align-items: center; gap: calc(16 * var(--u)); font-size: calc(18 * var(--u)); color: rgba(255,255,255,0.86); font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.theme-light .footer { border-top-color: rgba(0,0,0,0.15); color: rgba(11,31,58,0.6); }
.spacer { flex: 1; }
.footer-logo { height: calc(36 * var(--u)); filter: brightness(0) invert(1); opacity: 0.95; }
.theme-light .footer-logo { filter: none; opacity: 0.7; }
</style>
