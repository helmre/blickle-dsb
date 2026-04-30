<script setup>
import { computed } from 'vue'
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  Medal,
  Target,
  UserRound,
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

const kicker = field('kicker', 'ACADEMY | FÜHRUNGSKRÄFTEENTWICKLUNG')
const imageUrl = field('imageUrl', '/content/einblickle/martin-strobel-bei-blickle.jpeg')
const imageBadgeTitle = field('imageBadgeTitle', 'MARTIN STROBEL')
const imageBadgeSubtitle = field('imageBadgeSubtitle', 'zu Gast bei Blickle')
const headline = field('headline', 'Martin Strobel zu Gast bei Blickle')
const body = field('body', 'Martin Strobel, ehemaliger Handball-Nationalspieler, Europameister und Olympia-Bronzemedaillengewinner, war zu Gast bei Blickle.')
const quote = field('quote', 'In seinem Vortrag sprach er über Teamgeist, klare Rollen, Verantwortung und den Umgang mit Rückschlägen. Seine Botschaft: „Team statt Ego“ - Disziplin, Vertrauen und echter gemeinsamer Einsatz machen den Unterschied.')
const dateLabel = field('dateLabel', '29.04.2026')
const readingTime = field('readingTime', '1 min')
const card1Title = field('card1Title', 'Europameister & Olympia-Bronzemedaillengewinner')
const card2Title = field('card2Title', 'Impulse für Führungskräfte')
const card3Title = field('card3Title', 'Team statt Ego · Verantwortung · Rückschläge')
const footerTitle = field('footerTitle', 'AKTUELL IN DER BLICKLE ACADEMY')
const footerText = field('footerText', 'Praxisnahe Impulse für Führung, Teamgeist und Zusammenarbeit.')

const impulseCards = computed(() => [
  { text: card1Title.value, icon: Medal },
  { text: card2Title.value, icon: UsersRound },
  { text: card3Title.value, icon: Target },
].filter(item => String(item.text || '').trim()))
</script>

<template>
  <div v-if="displayMode" class="display-wrap">
    <section class="academy-canvas">
      <div class="academy-card">
        <figure class="photo-panel">
          <img :src="imageUrl" :alt="headline" />
          <figcaption class="photo-badge">
            <span class="badge-icon"><UserRound :stroke-width="2.4" /></span>
            <span><strong>{{ imageBadgeTitle }}</strong><small>{{ imageBadgeSubtitle }}</small></span>
          </figcaption>
        </figure>

        <main class="story-panel">
          <div class="kicker-row">
            <span class="academy-icon"><GraduationCap :stroke-width="2.5" /></span>
            <span>{{ kicker }}</span>
          </div>
          <h1>{{ headline }}</h1>
          <div class="title-rule"></div>
          <p class="lead">{{ body }}</p>
          <p class="body">{{ quote }}</p>

          <div class="impulse-grid">
            <article v-for="item in impulseCards" :key="item.text" class="impulse-card">
              <component :is="item.icon" class="impulse-icon" :stroke-width="2.2" />
              <strong>{{ item.text }}</strong>
            </article>
          </div>
        </main>

        <aside class="meta-card">
          <div class="meta-item">
            <CalendarDays class="meta-icon" :stroke-width="2.5" />
            <span>Zu Gast am:</span>
            <strong>{{ dateLabel }}</strong>
          </div>
          <div class="meta-line"></div>
          <div class="meta-item">
            <Clock3 class="meta-icon" :stroke-width="2.5" />
            <span>Lesezeit:</span>
            <strong>{{ readingTime }}</strong>
          </div>
        </aside>

        <footer class="academy-footer">
          <span class="footer-icon"><GraduationCap :stroke-width="2.4" /></span>
          <strong>{{ footerTitle }}</strong>
          <span>{{ footerText }}</span>
          <b>Blickle. ACADEMY</b>
        </footer>
      </div>
    </section>
  </div>

  <div v-else class="split">
    <aside class="form" v-if="!readonly">
      <section class="fs">
        <h4 class="fs-title">Inhalt</h4>
        <label class="fld"><span class="fld-label">Kicker</span><input v-model="kicker" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Überschrift</span><textarea v-model="headline" class="fld-input fld-small" rows="2" /></label>
        <label class="fld"><span class="fld-label">Einleitung</span><textarea v-model="body" class="fld-input" rows="4" /></label>
        <label class="fld"><span class="fld-label">Beschreibung</span><textarea v-model="quote" class="fld-input" rows="5" /></label>
      </section>

      <section class="fs">
        <h4 class="fs-title">Bild & Angaben</h4>
        <label class="fld"><span class="fld-label">Bild-URL</span><input v-model="imageUrl" type="text" class="fld-input" /></label>
        <div class="row-2">
          <label class="fld"><span class="fld-label">Badge Titel</span><input v-model="imageBadgeTitle" type="text" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">Badge Unterzeile</span><input v-model="imageBadgeSubtitle" type="text" class="fld-input" /></label>
        </div>
        <div class="row-2">
          <label class="fld"><span class="fld-label">Datum</span><input v-model="dateLabel" type="text" class="fld-input" /></label>
          <label class="fld"><span class="fld-label">Lesezeit</span><input v-model="readingTime" type="text" class="fld-input" /></label>
        </div>
      </section>

      <section class="fs">
        <h4 class="fs-title">Impulskarten</h4>
        <label class="fld"><span class="fld-label">Karte 1</span><input v-model="card1Title" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Karte 2</span><input v-model="card2Title" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Karte 3</span><input v-model="card3Title" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Footer Titel</span><input v-model="footerTitle" type="text" class="fld-input" /></label>
        <label class="fld"><span class="fld-label">Footer Text</span><input v-model="footerText" type="text" class="fld-input" /></label>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-header"><span>Live-Vorschau · 16:9</span></div>
      <div class="preview-frame">
        <section class="academy-canvas">
          <div class="academy-card">
            <figure class="photo-panel">
              <img :src="imageUrl" :alt="headline" />
              <figcaption class="photo-badge">
                <span class="badge-icon"><UserRound :stroke-width="2.4" /></span>
                <span><strong>{{ imageBadgeTitle }}</strong><small>{{ imageBadgeSubtitle }}</small></span>
              </figcaption>
            </figure>
            <main class="story-panel">
              <div class="kicker-row"><span class="academy-icon"><GraduationCap :stroke-width="2.5" /></span><span>{{ kicker }}</span></div>
              <h1>{{ headline }}</h1>
              <div class="title-rule"></div>
              <p class="lead">{{ body }}</p>
              <p class="body">{{ quote }}</p>
              <div class="impulse-grid">
                <article v-for="item in impulseCards" :key="item.text" class="impulse-card">
                  <component :is="item.icon" class="impulse-icon" :stroke-width="2.2" />
                  <strong>{{ item.text }}</strong>
                </article>
              </div>
            </main>
            <aside class="meta-card">
              <div class="meta-item"><CalendarDays class="meta-icon" :stroke-width="2.5" /><span>Zu Gast am:</span><strong>{{ dateLabel }}</strong></div>
              <div class="meta-line"></div>
              <div class="meta-item"><Clock3 class="meta-icon" :stroke-width="2.5" /><span>Lesezeit:</span><strong>{{ readingTime }}</strong></div>
            </aside>
            <footer class="academy-footer">
              <span class="footer-icon"><GraduationCap :stroke-width="2.4" /></span>
              <strong>{{ footerTitle }}</strong>
              <span>{{ footerText }}</span>
              <b>Blickle. ACADEMY</b>
            </footer>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.split { display: grid; grid-template-columns: 400px 1fr; gap: 20px; align-items: start; }
.form { background: var(--blickle-white); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 220px); overflow-y: auto; position: sticky; top: 20px; }
.fs { margin-bottom: 22px; }
.fs-title { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0; color: var(--gray-500); text-transform: uppercase; margin-bottom: 10px; }
.fld { display: block; margin-bottom: 12px; }
.fld-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-input { width: 100%; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
.fld-small { min-height: 50px; resize: vertical; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.preview-panel { background: var(--blickle-white); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm); }
.preview-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0; text-transform: uppercase; font-weight: 600; }
.preview-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 14px 48px rgba(0,0,0,0.22); background: #f6f8fb; container-type: size; }
.display-wrap { width: 100%; height: 100%; overflow: hidden; position: relative; container-type: size; }

.academy-canvas {
  --u: min(calc(100cqw / 1920), calc(100cqh / 820));
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255,255,255,0) 0 36%, rgba(181,204,24,0.08) 36% 36.25%, rgba(255,255,255,0) 36.25%),
    #f7f9fc;
  color: #0b2a63;
  font-family: var(--font-body, "DM Sans", sans-serif);
}

.academy-card {
  position: absolute;
  left: calc(32 * var(--u));
  right: calc(32 * var(--u));
  top: calc(28 * var(--u));
  bottom: calc(34 * var(--u));
  display: grid;
  grid-template-columns: calc(735 * var(--u)) 1fr calc(280 * var(--u));
  grid-template-rows: 1fr calc(90 * var(--u));
  gap: calc(30 * var(--u));
  padding: calc(28 * var(--u));
  background: rgba(255,255,255,0.93);
  border: 1px solid rgba(15, 38, 72, 0.07);
  border-radius: calc(8 * var(--u));
  box-shadow: 0 calc(18 * var(--u)) calc(52 * var(--u)) rgba(11, 31, 58, 0.13);
}

.photo-panel {
  position: relative;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  border-radius: calc(8 * var(--u));
  background: #dbe3eb;
  box-shadow: inset 0 0 0 1px rgba(8, 31, 64, 0.08);
}

.photo-panel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-badge {
  position: absolute;
  left: calc(18 * var(--u));
  top: calc(36 * var(--u));
  display: flex;
  align-items: center;
  gap: calc(16 * var(--u));
  width: calc(330 * var(--u));
  min-height: calc(78 * var(--u));
  padding: calc(10 * var(--u)) calc(20 * var(--u));
  background: #c7dc16;
  border-radius: calc(8 * var(--u));
  box-shadow: 0 calc(10 * var(--u)) calc(24 * var(--u)) rgba(53, 72, 0, 0.24);
  color: #082b66;
}

.badge-icon {
  display: grid;
  place-items: center;
  flex: 0 0 calc(52 * var(--u));
  width: calc(52 * var(--u));
  height: calc(52 * var(--u));
  border-radius: 50%;
  background: #fff;
  color: #abc400;
}

.photo-badge strong,
.photo-badge small {
  display: block;
  line-height: 1.12;
}

.photo-badge strong {
  font-family: var(--font-display, "Outfit", sans-serif);
  font-size: calc(24 * var(--u));
  font-weight: 800;
}

.photo-badge small {
  margin-top: calc(4 * var(--u));
  font-size: calc(20 * var(--u));
  color: #111827;
}

.story-panel {
  min-width: 0;
  align-self: center;
  padding: calc(8 * var(--u)) calc(12 * var(--u)) 0 calc(28 * var(--u));
}

.kicker-row {
  display: flex;
  align-items: center;
  gap: calc(20 * var(--u));
  margin-bottom: calc(18 * var(--u));
  color: #a9c300;
  font-family: var(--font-display, "Outfit", sans-serif);
  font-size: calc(19 * var(--u));
  font-weight: 800;
}

.academy-icon {
  display: grid;
  place-items: center;
  width: calc(54 * var(--u));
  height: calc(54 * var(--u));
  border-radius: 50%;
  background: #2176d2;
  color: #fff;
}

.story-panel h1 {
  margin: 0;
  max-width: calc(680 * var(--u));
  color: #082b66;
  font-family: var(--font-display, "Outfit", sans-serif);
  font-size: calc(62 * var(--u));
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: 0;
}

.title-rule {
  width: calc(86 * var(--u));
  height: calc(5 * var(--u));
  margin: calc(16 * var(--u)) 0 calc(16 * var(--u));
  background: #b5cc18;
  border-radius: 999px;
}

.lead,
.body {
  margin: 0;
  max-width: calc(660 * var(--u));
  color: #17325f;
  font-size: calc(19 * var(--u));
  line-height: 1.32;
}

.body {
  margin-top: calc(14 * var(--u));
}

.impulse-grid {
  position: absolute;
  left: calc(821 * var(--u));
  right: calc(28 * var(--u));
  bottom: calc(118 * var(--u));
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(26 * var(--u));
  margin: 0;
}

.impulse-card {
  min-height: calc(96 * var(--u));
  display: grid;
  grid-template-columns: calc(58 * var(--u)) 1fr;
  align-items: center;
  gap: calc(14 * var(--u));
  padding: calc(14 * var(--u)) calc(18 * var(--u));
  background: #fff;
  border: 1px solid rgba(15, 38, 72, 0.08);
  border-radius: calc(8 * var(--u));
  box-shadow: 0 calc(8 * var(--u)) calc(22 * var(--u)) rgba(11, 31, 58, 0.09);
}

.impulse-icon {
  width: calc(50 * var(--u));
  height: calc(50 * var(--u));
  color: #afc700;
}

.impulse-card strong {
  color: #082b66;
  font-size: calc(17 * var(--u));
  line-height: 1.35;
  font-weight: 700;
  hyphens: auto;
  overflow-wrap: break-word;
}

.meta-card {
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: calc(28 * var(--u));
  padding: calc(28 * var(--u));
  background: #fff;
  border: 1px solid rgba(15, 38, 72, 0.08);
  border-radius: calc(8 * var(--u));
  box-shadow: 0 calc(14 * var(--u)) calc(35 * var(--u)) rgba(11, 31, 58, 0.11);
}

.meta-item {
  display: grid;
  grid-template-columns: calc(56 * var(--u)) 1fr;
  gap: calc(10 * var(--u)) calc(18 * var(--u));
  align-items: center;
}

.meta-icon {
  grid-row: span 2;
  width: calc(54 * var(--u));
  height: calc(54 * var(--u));
  color: #afc700;
}

.meta-item span {
  color: #596375;
  font-size: calc(16 * var(--u));
}

.meta-item strong {
  color: #082b66;
  font-size: calc(21 * var(--u));
  font-weight: 800;
}

.meta-line {
  height: 1px;
  background: #cbd3dc;
}

.academy-footer {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: calc(54 * var(--u)) max-content 1fr max-content;
  align-items: center;
  gap: calc(24 * var(--u));
  padding: 0 calc(42 * var(--u));
  background: #c7dc16;
  color: #082b66;
  border-radius: calc(8 * var(--u));
}

.footer-icon {
  display: grid;
  place-items: center;
  width: calc(48 * var(--u));
  height: calc(48 * var(--u));
  border-radius: 50%;
  background: #082b66;
  color: #fff;
}

.academy-footer strong {
  font-family: var(--font-display, "Outfit", sans-serif);
  font-size: calc(23 * var(--u));
  font-weight: 800;
}

.academy-footer span {
  font-size: calc(18 * var(--u));
}

.academy-footer b {
  padding-left: calc(34 * var(--u));
  border-left: 2px solid rgba(8, 43, 102, 0.55);
  font-family: var(--font-display, "Outfit", sans-serif);
  font-size: calc(28 * var(--u));
  line-height: 0.92;
}

@container (max-width: 760px) {
  .academy-card {
    grid-template-columns: 1fr;
    grid-template-rows: calc(250 * var(--u)) auto calc(120 * var(--u)) calc(90 * var(--u));
  }

  .impulse-grid {
    position: static;
    margin-top: calc(20 * var(--u));
  }
}
</style>
