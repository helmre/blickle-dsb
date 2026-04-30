<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  Anchor,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CheckCircle,
  Cog,
  Factory,
  Gauge,
  HardHat,
  Handshake,
  Lightbulb,
  Medal,
  MessageCircle,
  MonitorCog,
  Network,
  PieChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Truck,
  Users,
  Wrench,
} from 'lucide-vue-next'

const STORAGE_KEY = 'dsb_p2030_progress'
const DEFAULT_DISCOVERED = [1, 2, 5, 7]

const fields = [
  {
    id: 1,
    title: 'Kultur & Zusammenarbeit',
    subtitle: 'Wir-Gefühl, Verantwortung, Vertrauen',
    icon: Users,
    teaser: 'Ein starkes Wir-Gefühl über Bereiche und Funktionen hinweg.',
    goal: 'Unsere Fertigung lebt ein starkes Wir-Gefühl: Wir arbeiten fair, offen und vertrauensvoll zusammen. Jeder übernimmt Verantwortung, spricht Probleme frühzeitig an und trägt aktiv dazu bei, dass wir gemeinsam besser werden.',
    anchors: ['Entscheidungen dort treffen, wo das Wissen ist', 'Probleme offen ansprechen und gemeinsam lösen', 'Andere Bereiche frühzeitig einbinden'],
    impulses: ['Informationen früh teilen', 'Feedback direkt geben', 'Verantwortung sichtbar machen'],
    behavior: ['Informationen aktiv teilen', 'Probleme offen ansprechen', 'Feedback direkt und konstruktiv geben'],
    avoid: ['Silodenken', 'Probleme zurückhalten', 'Verantwortung weitergeben'],
    measure: 'Mitarbeiterfeedback, Entscheidungsdauer, bereichsübergreifende Abstimmungen',
    state: 'freigeschaltet',
  },
  {
    id: 2,
    title: 'Internes Supply Chain Management',
    subtitle: 'Fluss, Planung, Lieferfähigkeit',
    icon: Truck,
    teaser: 'Material und Informationen fließen vom Bedarf bis zur Auslieferung.',
    goal: 'Unsere interne Supply Chain sorgt für einen durchgängigen Fluss von Material und Informationen. Mit klaren Regeln, verlässlichen Daten und vorausschauender Planung erkennen wir Engpässe früh und sichern Lieferfähigkeit und Wirtschaftlichkeit.',
    anchors: ['Engpässe frühzeitig erkennen und melden', 'Übergaben klar und termingerecht gestalten', 'Auswirkungen auf Folgeprozesse berücksichtigen'],
    impulses: ['Bestände sichtbar machen', 'Übergaben absichern', 'Bedarfe vorausschauend klären'],
    behavior: ['Engpässe früh melden', 'Übergaben vollständig machen', 'Folgeprozesse aktiv mitdenken'],
    avoid: ['Blind weitergeben', 'Ohne Rückmeldung arbeiten', 'Nur kurzfristig reagieren'],
    measure: 'Termintreue, Bestandsreichweiten, Störungen im Materialfluss',
    state: 'freigeschaltet',
  },
  {
    id: 3,
    title: 'Operational Excellence',
    subtitle: 'Standards, Wertschöpfung, Verbesserung',
    icon: TrendingUp,
    teaser: 'Klare Standards machen Abweichungen sichtbar und Verbesserungen wirksam.',
    goal: 'Unsere Abläufe sind klar standardisiert, sichtbar und konsequent auf Wertschöpfung ausgerichtet. Abweichungen nutzen wir als Chance, Prozesse dauerhaft besser zu machen.',
    anchors: ['Standards einhalten und weiterentwickeln', 'Abweichungen sofort sichtbar machen', 'Verbesserungen aktiv einbringen'],
    impulses: ['Standard kurz prüfen', 'Verschwendung markieren', 'Verbesserungsidee festhalten'],
    behavior: ['Nach Standards arbeiten', 'Ursachen lösen', 'Verbesserungen aktiv einbringen'],
    avoid: ['Workarounds ohne Klärung', 'Fehler ignorieren', 'Standards umgehen'],
    measure: 'Prozessstabilität, umgesetzte Verbesserungen, Audit-Ergebnisse',
    state: 'neu',
  },
  {
    id: 4,
    title: 'Betriebsorganisation',
    subtitle: 'Klarheit, Verantwortung, Umsetzung',
    icon: Network,
    teaser: 'Rollen, Zuständigkeiten und Entscheidungswege sind klar und verständlich.',
    goal: 'In unserer Fertigung sind Rollen, Verantwortlichkeiten und Entscheidungswege klar geregelt. So werden Entscheidungen schneller getroffen und Aufgaben wirksam umgesetzt.',
    anchors: ['Rollen und Zuständigkeiten kennen', 'Entscheidungen klar treffen und vertreten', 'Abstimmungen zielgerichtet halten'],
    impulses: ['Zuständigkeit sichtbar machen', 'Entscheidung dokumentieren', 'Eskalation sauber klären'],
    behavior: ['Zuständigkeiten klären', 'Entscheidungen treffen', 'Verantwortung sichtbar übernehmen'],
    avoid: ['Unklare Verantwortlichkeiten', 'Endlose Schleifen', 'Entscheidungen verzögern'],
    measure: 'Entscheidungsdauer, Eskalationen, wiederholter Klärungsbedarf',
  },
  {
    id: 5,
    title: 'Total Quality Management',
    subtitle: 'Qualität, Fehlervermeidung, Prozesssicherheit',
    icon: BadgeCheck,
    teaser: 'Qualität entsteht in jedem Prozessschritt, nicht erst am Ende.',
    goal: 'Qualität entsteht bei uns in jedem Prozessschritt, nicht erst bei der Endkontrolle. Jeder Mitarbeitende trägt zur Qualität bei, Fehler werden offen angesprochen und systematisch beseitigt.',
    anchors: ['Qualität im Prozess sicherstellen', 'Fehler sofort stoppen und analysieren', 'Ursachen nachhaltig beseitigen'],
    impulses: ['Fehler früh erkennen', 'Qualität absichern', 'Ursachen beseitigen'],
    metrics: ['Fehlerquoten', 'Nacharbeit / Ausschuss', 'Reklamationen'],
    behavior: ['Prüfen, bevor weitergegeben wird', 'Standards einhalten', 'Fehler offen ansprechen'],
    avoid: ['Fehler weitergeben', 'Nur Symptome beheben', 'Fehler verschweigen'],
    measure: 'Fehlerquoten, Nacharbeit, Ausschuss, Reklamationen',
  },
  {
    id: 6,
    title: 'Total Productive Management',
    subtitle: 'Verfügbarkeit, Stabilität, Verlustvermeidung',
    icon: Cog,
    teaser: 'Stabile Anlagen entstehen durch Transparenz, Wartung und gute Zusammenarbeit.',
    goal: 'Unsere Maschinen, Anlagen und Arbeitsprozesse laufen stabil, sicher und zuverlässig. Störungen, Ausfälle und Verluste werden transparent gemacht, konsequent reduziert und gemeinsam vermieden.',
    anchors: ['Anlagenzustände aktiv überwachen', 'Störungen strukturiert analysieren', 'Wartung vorausschauend planen'],
    impulses: ['Sauberkeit sichern', 'Anlagenverhalten beobachten', 'Stillstandursache klären'],
    behavior: ['Anlagenzustände überwachen', 'Störungen strukturiert analysieren', 'Vorausschauend warten'],
    avoid: ['Reagieren statt vorbeugen', 'Stillstände akzeptieren', 'Ursachen offen lassen'],
    measure: 'Anlagenverfügbarkeit, Stillstandszeiten, wiederkehrende Störungen',
  },
  {
    id: 7,
    title: 'Nachhaltigkeit & Arbeitssicherheit',
    subtitle: 'Sicherheit, Verantwortung, Ressourcenschonung',
    icon: HardHat,
    teaser: 'Sicherheit, Gesundheit, Ordnung und Ressourcenbewusstsein gehören zum Alltag.',
    goal: 'Sicherheit, Gesundheit, Ordnung und Sauberkeit sind feste Bestandteile unserer täglichen Arbeit. Gleichzeitig gehen wir verantwortungsvoll mit Energie, Material und Ressourcen um.',
    anchors: ['Sicherheitsregeln konsequent einhalten', 'Risiken sofort erkennen und melden', 'Ressourcen bewusst einsetzen'],
    impulses: ['PSA prüfen', 'Gefährdung melden', 'Verschwendung vermeiden'],
    behavior: ['PSA konsequent nutzen', 'Gefährdungen melden', 'Ordnung und Sauberkeit sichern'],
    avoid: ['Abkürzungen bei Sicherheit', 'Wegschauen bei Risiken', 'Verschwendung akzeptieren'],
    measure: 'Unfallzahlen, Beinahe-Unfälle, Energie- und Materialverbrauch',
  },
  {
    id: 8,
    title: 'Strategische Automatisierung / Investition',
    subtitle: 'Automatisierungsgrad, Flexibilität, Wettbewerbsfähigkeit',
    icon: Bot,
    teaser: 'Automatisierung unterstützt Menschen dort, wo sie sinnvoll und wirtschaftlich ist.',
    goal: 'Wir nutzen Automatisierung konsequent dort, wo sie sinnvoll und wirtschaftlich ist. Prozesse bleiben flexibel, Mitarbeitende werden eingebunden und Qualität sowie Produktivität nachhaltig gestärkt.',
    anchors: ['Automatisierung nutzenorientiert einsetzen', 'Prozesse vor Automatisierung verstehen', 'Mitarbeitende aktiv einbinden'],
    impulses: ['Nutzen bewerten', 'Prozess aufnehmen', 'Praxisfeedback einholen'],
    behavior: ['Nutzen bewerten', 'Prozesse zuerst verstehen', 'Mitarbeitende aktiv einbinden'],
    avoid: ['Technik ohne Mehrwert', 'Flexibilität gefährden', 'Ohne Prozessverständnis automatisieren'],
    measure: 'Produktivität, Qualitätsverbesserung, Automatisierungsgrad',
    state: 'challenge',
  },
  {
    id: 9,
    title: 'Digitalisierung',
    subtitle: 'Echtzeit, Unterstützung, Vernetzung',
    icon: MonitorCog,
    teaser: 'Informationen und Prozessdaten sind dort verfügbar, wo sie gebraucht werden.',
    goal: 'Digitale Lösungen unterstützen unsere Mitarbeitenden direkt im Arbeitsalltag. Informationen, Aufträge, Prozessdaten und Abweichungen sind aktuell, verständlich und dort verfügbar, wo sie gebraucht werden.',
    anchors: ['Daten aktiv nutzen und pflegen', 'Systeme konsequent verwenden', 'Entscheidungen auf Daten stützen'],
    impulses: ['Daten aktualisieren', 'System konsequent nutzen', 'Transparenz herstellen'],
    behavior: ['Daten aktiv nutzen', 'Systeme konsequent verwenden', 'Transparenz herstellen'],
    avoid: ['Schattenlisten führen', 'Ohne Daten entscheiden', 'Systeme umgehen'],
    measure: 'Datenqualität, Systemnutzung, Verfügbarkeit von Echtzeitdaten',
  },
  {
    id: 10,
    title: 'Transparenz & Kennzahlen',
    subtitle: 'Sichtbarkeit, Steuerung, Orientierung',
    icon: PieChart,
    teaser: 'Einheitliche Kennzahlen helfen beim Steuern, Priorisieren und Verbessern.',
    goal: 'Unsere Leistung, Ziele und Abweichungen sind für alle sichtbar und nachvollziehbar. Einheitliche Kennzahlen helfen uns, aktiv zu steuern, Prioritäten zu setzen und Verbesserungen messbar zu machen.',
    anchors: ['Kennzahlen regelmäßig nutzen', 'Abweichungen sofort adressieren', 'Maßnahmen ableiten und verfolgen'],
    impulses: ['Zahl erklären', 'Abweichung klären', 'Maßnahme verfolgen'],
    behavior: ['Zahlen verstehen', 'Abweichungen adressieren', 'Maßnahmen konsequent verfolgen'],
    avoid: ['Kennzahlen nur berichten', 'Keine Konsequenz ziehen', 'Zahlen intransparent halten'],
    measure: 'Zielerreichung, Reaktionsgeschwindigkeit, Umsetzungsgrad',
  },
]

const quizOptions = [
  { id: 'a', text: 'Sofort Technik bestellen, damit schnell sichtbar etwas passiert.', correct: false },
  { id: 'b', text: 'Den Prozess verstehen, Nutzen bewerten und Mitarbeitende einbinden.', correct: true },
  { id: 'c', text: 'Nur manuelle Tätigkeiten zählen und alles andere ausblenden.', correct: false },
]

const discoveredIds = ref([...DEFAULT_DISCOVERED])
const challengeDone = ref(false)
const selectedId = ref(8)
const view = ref('overview')
const selectedAnswer = ref('')

const selectedField = computed(() => fields.find(field => field.id === selectedId.value) || fields[0])
const nextRecommendedField = computed(() => fields[selectedField.value.id % fields.length] || fields[0])
const anchorItems = computed(() => selectedField.value.anchors || selectedField.value.behavior || [])
const metricItems = computed(() => selectedField.value.metrics || selectedField.value.measure.split(',').map(item => item.trim()).filter(Boolean))
const impulseItems = computed(() => {
  const source = selectedField.value.impulses || selectedField.value.behavior || []
  return source.slice(0, 3).map((title, index) => ({
    title,
    text: [
      'Direkt am Prozess beobachten, kurz bewerten und sichtbar machen.',
      'Standards anwenden, Ergebnis prüfen und bei Abweichung reagieren.',
      'Ursache klären, Maßnahme vereinbaren und Umsetzung nachhalten.',
    ][index] || selectedField.value.teaser,
    icon: [Lightbulb, ShieldCheck, Target][index] || Lightbulb,
  }))
})
const discoveredCount = computed(() => discoveredIds.value.length)
const progressPercent = computed(() => Math.round((discoveredCount.value / fields.length) * 100))
const points = computed(() => discoveredCount.value * 10 + (challengeDone.value ? 20 : 0))
const correctSelected = computed(() => quizOptions.find(option => option.id === selectedAnswer.value)?.correct || false)

function isDiscovered(id) {
  return discoveredIds.value.includes(id)
}

function persistProgress() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    discoveredIds: discoveredIds.value,
    challengeDone: challengeDone.value,
  }))
}

function loadProgress() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed.discoveredIds)) {
      discoveredIds.value = parsed.discoveredIds
        .map(Number)
        .filter(id => fields.some(field => field.id === id))
    }
    challengeDone.value = Boolean(parsed.challengeDone)
  } catch {
    discoveredIds.value = [...DEFAULT_DISCOVERED]
    challengeDone.value = false
  }
}

function discover(id) {
  if (isDiscovered(id)) return
  discoveredIds.value = [...discoveredIds.value, id].sort((a, b) => a - b)
}

function openField(id) {
  selectedId.value = id
  discover(id)
  view.value = 'detail'
}

function startChallenge(id = 8) {
  selectedId.value = id
  discover(id)
  selectedAnswer.value = ''
  view.value = 'quiz'
}

function chooseAnswer(id) {
  selectedAnswer.value = id
  if (quizOptions.find(option => option.id === id)?.correct) {
    challengeDone.value = true
  }
}

function backToOverview() {
  view.value = 'overview'
  selectedAnswer.value = ''
}

function nextField() {
  const next = selectedField.value.id >= fields.length ? 1 : selectedField.value.id + 1
  openField(next)
}

onMounted(loadProgress)
watch([discoveredIds, challengeDone], persistProgress, { deep: true })
</script>

<template>
  <div class="p2030">
    <div class="p2030-bg"></div>

    <section v-if="view === 'overview'" class="overview-layer">
      <header class="hero-row">
        <div class="hero-copy">
          <div class="eyebrow"><Factory :size="22" /> Produktion 2030</div>
          <h1>Produktion 2030 entdecken</h1>
          <p>10 Handlungsfelder. 1 gemeinsames Zielbild. Jetzt interaktiv erleben.</p>
          <div class="hero-accent"></div>
        </div>

        <div class="progress-card">
          <div class="progress-ring" :style="{ '--progress': `${progressPercent * 3.6}deg` }">
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="progress-copy">
            <span>Bereits entdeckt</span>
            <strong><b>{{ discoveredCount }}</b> von {{ fields.length }} Handlungsfeldern</strong>
            <div class="progress-cells">
              <i v-for="field in fields" :key="field.id" :class="{ active: isDiscovered(field.id) }"></i>
            </div>
            <small>Sammeln Sie alle Bereiche und testen Sie Ihr Wissen.</small>
          </div>
        </div>

        <div class="score-card">
          <div><Trophy /><strong>{{ discoveredCount }}/10</strong><span>entdeckt</span></div>
          <div><Star /><strong>{{ points }}</strong><span>Punkte</span></div>
          <div><Medal /><strong>{{ challengeDone ? 'Quiz' : 'Weiter' }}</strong><span>{{ challengeDone ? 'bestanden' : 'lohnt sich' }}</span></div>
        </div>
      </header>

      <div class="field-grid">
        <button
          v-for="field in fields"
          :key="field.id"
          class="field-card"
          :class="[`state-${field.state || 'open'}`, { discovered: isDiscovered(field.id) }]"
          type="button"
          @click.stop="openField(field.id)"
        >
          <span class="field-number">{{ field.id }}</span>
          <span v-if="field.state" class="field-ribbon">{{ field.state === 'challenge' ? 'Challenge' : field.state }}</span>
          <CheckCircle v-if="isDiscovered(field.id)" class="field-check" />
          <component :is="field.icon" class="field-icon" :stroke-width="1.8" />
          <strong>{{ field.title }}</strong>
          <small>{{ field.subtitle }}</small>
          <span class="field-footer">
            <span><Star :size="18" fill="currentColor" /> +{{ field.state === 'challenge' ? 20 : 10 }} Punkte</span>
            <b>{{ isDiscovered(field.id) ? 'Mehr erfahren' : 'Jetzt entdecken' }} <ArrowRight :size="18" /></b>
          </span>
        </button>
      </div>

      <div class="action-row">
        <button class="challenge-banner" type="button" @click.stop="startChallenge(8)">
          <span class="banner-label">Challenge der Woche</span>
          <Trophy class="banner-icon" />
          <span>
            <strong>Wie gut kennen Sie unser Zielbild 2030?</strong>
            <small>Testen Sie Ihr Wissen und sammeln Sie Punkte.</small>
          </span>
          <b>Zum Kurz-Quiz <ArrowRight /></b>
        </button>

        <button class="fact-card" type="button" @click.stop="openField(5)">
          <Lightbulb />
          <span><strong>Schon gewusst?</strong><small>Qualität entsteht in jedem Prozessschritt.</small></span>
        </button>

        <button class="rocket-card" type="button" @click.stop="openField(3)">
          <Rocket />
          <span><strong>Handlungsfelder entdecken</strong><small>Wissen sammeln. Verstehen. Vorankommen.</small></span>
          <b><ArrowRight /></b>
        </button>
      </div>
    </section>

    <section v-else-if="view === 'detail'" class="detail-layer">
      <button class="back-btn" type="button" @click.stop="backToOverview"><ArrowLeft /> Zurück zur Übersicht</button>
      <article class="detail-card detail-card-rich">
        <header class="detail-rich-header">
          <div class="detail-title-block">
            <component :is="selectedField.icon" class="detail-title-icon" :stroke-width="1.7" />
            <div>
              <h2>{{ selectedField.title }}</h2>
              <p>{{ selectedField.subtitle }}</p>
            </div>
          </div>

          <div class="detail-progress-card">
            <div class="progress-ring compact" :style="{ '--progress': `${progressPercent * 3.6}deg` }">
              <span>{{ progressPercent }}%</span>
            </div>
            <div class="detail-progress-copy">
              <strong>{{ discoveredCount }} von {{ fields.length }} entdeckt</strong>
              <div class="progress-cells">
                <i v-for="field in fields" :key="field.id" :class="{ active: isDiscovered(field.id) }"></i>
              </div>
            </div>
            <div class="detail-score"><Star fill="currentColor" /><strong>{{ points }}</strong><span>Punkte</span></div>
            <div class="detail-score"><Medal /><strong>Weiter so!</strong><span>Es lohnt sich.</span></div>
          </div>
        </header>

        <div class="detail-rich-grid">
          <section class="goal-panel">
            <div class="goal-icon"><component :is="selectedField.icon" :stroke-width="1.65" /></div>
            <div>
              <h3>Unser Zielbild</h3>
              <p>{{ selectedField.goal || selectedField.teaser }}</p>
            </div>
          </section>

          <aside class="next-panel">
            <span>Nächster Schritt</span>
            <component :is="nextRecommendedField.icon" class="next-icon" :stroke-width="1.65" />
            <small>Empfehlung</small>
            <h3>{{ nextRecommendedField.title }}</h3>
            <p>{{ nextRecommendedField.teaser }}</p>
            <button type="button" @click.stop="openField(nextRecommendedField.id)">
              Weiter zum nächsten Handlungsfeld
              <ArrowRight />
            </button>
          </aside>

          <section class="anchor-panel">
            <h3><Anchor /> Verhaltensanker</h3>
            <ul><li v-for="item in anchorItems" :key="item"><CheckCircle />{{ item }}</li></ul>
          </section>

          <section class="daily-panel">
            <h3><ThumbsUp /> Im Alltag wichtig</h3>
            <ul><li v-for="item in selectedField.behavior" :key="item"><CheckCircle />{{ item }}</li></ul>
          </section>

          <section class="metrics-panel">
            <h3><BarChart3 /> Woran messen wir Fortschritt?</h3>
            <div class="metric-tiles">
              <article v-for="(item, index) in metricItems" :key="item">
                <component :is="[PieChart, Wrench, MessageCircle][index] || Gauge" :stroke-width="1.6" />
                <strong>{{ item }}</strong>
              </article>
            </div>
          </section>

          <section class="impulse-panel">
            <h3>Praxisimpulse</h3>
            <div class="impulse-grid">
              <article v-for="item in impulseItems" :key="item.title">
                <component :is="item.icon" :stroke-width="1.7" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.text }}</p>
                </div>
                <ArrowRight class="impulse-arrow" />
              </article>
            </div>
          </section>

          <button class="detail-cta" type="button" @click.stop="nextField">
            <Handshake />
            <span>
              <strong>Gemeinsam handeln. Gemeinsam besser werden.</strong>
              <small>Jede Aktion zählt - für uns, unsere Kunden und unsere Zukunft.</small>
            </span>
            <b><ArrowRight /></b>
          </button>
        </div>
      </article>
    </section>

    <section v-else class="quiz-layer">
      <button class="back-btn" type="button" @click.stop="backToOverview"><ArrowLeft /> Zurück zur Übersicht</button>
      <article class="quiz-card">
        <div class="quiz-intro">
          <span>Challenge der Woche</span>
          <Trophy />
          <h2>Strategische Automatisierung</h2>
          <p>Was ist der wichtigste erste Schritt, bevor wir automatisieren?</p>
        </div>
        <div class="quiz-options">
          <button
            v-for="option in quizOptions"
            :key="option.id"
            type="button"
            :class="{ selected: selectedAnswer === option.id, correct: selectedAnswer === option.id && option.correct, wrong: selectedAnswer === option.id && !option.correct }"
            @click.stop="chooseAnswer(option.id)"
          >
            {{ option.text }}
          </button>
        </div>
        <footer class="quiz-result">
          <div v-if="!selectedAnswer"><Target /> Wählen Sie eine Antwort und sammeln Sie Bonuspunkte.</div>
          <div v-else-if="correctSelected"><CheckCircle /> Richtig. +20 Punkte: Prozess zuerst verstehen, dann automatisieren.</div>
          <div v-else><Lightbulb /> Fast. Der beste Weg startet mit Prozessverständnis und Nutzenbewertung.</div>
          <button type="button" @click.stop="backToOverview">Fortschritt ansehen <ArrowRight /></button>
        </footer>
      </article>
    </section>
  </div>
</template>

<style scoped>
.p2030 {
  --u: min(calc(100cqw / 1920), calc(100cqh / 880));
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  box-sizing: border-box;
  padding: calc(30 * var(--u)) calc(42 * var(--u)) calc(22 * var(--u));
  color: #082f86;
  font-family: var(--font-body);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,244,248,0.96)),
    url('/content/karriere/blickle-produktion.jpg') center / cover no-repeat;
}

.p2030-bg {
  position: absolute;
  inset: auto 0 0;
  height: 34%;
  opacity: 0.1;
  background:
    linear-gradient(180deg, transparent, #163a6c),
    url('/content/karriere/blickle-produktion.jpg') center bottom / cover no-repeat;
  pointer-events: none;
}

.overview-layer,
.detail-layer,
.quiz-layer {
  position: relative;
  z-index: 1;
  height: 100%;
}

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) calc(540 * var(--u)) calc(460 * var(--u));
  gap: calc(28 * var(--u));
  align-items: stretch;
  margin-bottom: calc(22 * var(--u));
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: calc(8 * var(--u));
  margin: 0 0 calc(8 * var(--u));
  font-family: var(--font-display);
  font-size: calc(18 * var(--u));
  font-weight: 900;
  color: #082f86;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: calc(56 * var(--u));
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0;
}

.hero-copy p {
  margin: calc(18 * var(--u)) 0 calc(16 * var(--u));
  font-size: calc(24 * var(--u));
  font-weight: 800;
}

.hero-accent {
  width: calc(112 * var(--u));
  height: calc(6 * var(--u));
  border-radius: calc(6 * var(--u));
  background: #b5cc18;
}

.progress-card,
.score-card,
.field-card,
.fact-card {
  border: 1px solid rgba(8, 47, 134, 0.12);
  background: rgba(255,255,255,0.86);
  box-shadow: 0 calc(12 * var(--u)) calc(30 * var(--u)) rgba(8, 35, 92, 0.1);
  backdrop-filter: blur(10px);
}

.progress-card {
  display: grid;
  grid-template-columns: calc(118 * var(--u)) 1fr;
  gap: calc(22 * var(--u));
  align-items: center;
  padding: calc(18 * var(--u));
  border-radius: calc(14 * var(--u));
}

.progress-ring {
  width: calc(106 * var(--u));
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#b5cc18 var(--progress), #e6e9ee 0);
}

.progress-ring::before {
  content: '';
  position: absolute;
  width: calc(72 * var(--u));
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
}

.progress-ring span {
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  font-size: calc(28 * var(--u));
  font-weight: 900;
}

.progress-copy span,
.progress-copy small {
  display: block;
  font-size: calc(15 * var(--u));
  color: #172554;
}

.progress-copy strong {
  display: block;
  margin: calc(3 * var(--u)) 0 calc(12 * var(--u));
  font-size: calc(24 * var(--u));
}

.progress-copy b { color: #b5cc18; font-size: calc(34 * var(--u)); }
.progress-cells { display: grid; grid-template-columns: repeat(10, 1fr); gap: calc(4 * var(--u)); margin-bottom: calc(12 * var(--u)); }
.progress-cells i { height: calc(18 * var(--u)); border-radius: calc(4 * var(--u)); background: #dfe3e8; }
.progress-cells i.active { background: #b5cc18; }

.score-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(10 * var(--u));
  align-items: center;
  padding: calc(18 * var(--u));
  border-radius: calc(14 * var(--u));
  color: #fff;
  background: linear-gradient(135deg, #082f86, #001e64);
}

.score-card div {
  display: grid;
  grid-template-columns: calc(46 * var(--u)) 1fr;
  align-items: center;
  column-gap: calc(10 * var(--u));
}
.score-card svg { grid-row: 1 / 3; width: calc(42 * var(--u)); height: calc(42 * var(--u)); color: #b5cc18; fill: rgba(181,204,24,0.28); }
.score-card strong { font-size: calc(24 * var(--u)); line-height: 1; }
.score-card span { font-size: calc(13 * var(--u)); color: rgba(255,255,255,0.82); }

.field-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: calc(18 * var(--u));
}

.field-card {
  position: relative;
  min-height: calc(192 * var(--u));
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  align-items: center;
  justify-items: center;
  padding: calc(20 * var(--u)) calc(16 * var(--u)) calc(12 * var(--u));
  border-radius: calc(12 * var(--u));
  color: #082f86;
  cursor: pointer;
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.field-card:hover,
.field-card:focus-visible {
  transform: translateY(calc(-4 * var(--u)));
  border-color: #b5cc18;
  box-shadow: 0 calc(18 * var(--u)) calc(34 * var(--u)) rgba(8, 47, 134, 0.16);
  outline: none;
}

.field-number {
  position: absolute;
  top: calc(14 * var(--u));
  left: calc(14 * var(--u));
  width: calc(38 * var(--u));
  height: calc(38 * var(--u));
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #082f86;
  color: #fff;
  font-weight: 900;
  font-size: calc(20 * var(--u));
}

.field-check {
  position: absolute;
  top: calc(16 * var(--u));
  right: calc(16 * var(--u));
  width: calc(28 * var(--u));
  color: #b5cc18;
  fill: rgba(181,204,24,0.18);
}

.field-ribbon {
  position: absolute;
  top: calc(15 * var(--u));
  right: calc(-38 * var(--u));
  width: calc(158 * var(--u));
  height: calc(28 * var(--u));
  display: grid;
  place-items: center;
  transform: rotate(45deg);
  background: #b5cc18;
  color: #fff;
  font-size: calc(11 * var(--u));
  font-weight: 900;
  text-transform: uppercase;
}

.state-neu .field-ribbon { right: calc(16 * var(--u)); width: auto; padding: 0 calc(10 * var(--u)); transform: none; color: #082f86; border-radius: calc(5 * var(--u)); }
.state-challenge { border-color: #b5cc18; box-shadow: 0 0 0 1px #b5cc18, 0 calc(14 * var(--u)) calc(36 * var(--u)) rgba(181,204,24,0.16); }

.field-icon {
  width: calc(58 * var(--u));
  height: calc(58 * var(--u));
  margin-top: calc(12 * var(--u));
}

.field-card strong {
  max-width: 92%;
  font-family: var(--font-display);
  font-size: calc(20 * var(--u));
  line-height: 1.08;
}

.field-card small {
  margin-top: calc(7 * var(--u));
  min-height: calc(30 * var(--u));
  color: #4b5563;
  font-size: calc(12 * var(--u));
  line-height: 1.15;
}

.field-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(8 * var(--u));
  padding-top: calc(10 * var(--u));
  border-top: 1px solid rgba(8,47,134,0.1);
  font-size: calc(13 * var(--u));
}
.field-footer span,
.field-footer b { display: inline-flex; align-items: center; gap: calc(5 * var(--u)); }
.field-footer span { color: #8aa300; font-weight: 800; }
.field-footer b {
  min-height: calc(30 * var(--u));
  padding: 0 calc(10 * var(--u));
  border-radius: calc(5 * var(--u));
  color: #fff;
  background: #082f86;
  font-size: calc(12 * var(--u));
}
.state-challenge .field-footer b { color: #082f86; background: #b5cc18; }

.action-row {
  display: grid;
  grid-template-columns: 1.55fr 0.9fr 1.3fr;
  gap: calc(22 * var(--u));
  margin-top: calc(22 * var(--u));
}

.challenge-banner,
.rocket-card,
.fact-card {
  min-height: calc(118 * var(--u));
  border: 0;
  border-radius: calc(12 * var(--u));
  cursor: pointer;
}

.challenge-banner,
.rocket-card {
  position: relative;
  display: grid;
  grid-template-columns: calc(78 * var(--u)) 1fr auto;
  align-items: center;
  gap: calc(20 * var(--u));
  padding: calc(18 * var(--u)) calc(20 * var(--u));
  color: #fff;
  background: linear-gradient(135deg, #082f86, #001e64);
  overflow: hidden;
}

.banner-label {
  position: absolute;
  top: 0;
  left: calc(18 * var(--u));
  min-width: calc(190 * var(--u));
  height: calc(28 * var(--u));
  display: grid;
  place-items: center;
  border-radius: 0 0 calc(5 * var(--u)) calc(5 * var(--u));
  background: #b5cc18;
  color: #082f86;
  font-size: calc(13 * var(--u));
  font-weight: 900;
  text-transform: uppercase;
}

.banner-icon,
.rocket-card > svg,
.fact-card > svg {
  width: calc(58 * var(--u));
  height: calc(58 * var(--u));
  color: #b5cc18;
}
.challenge-banner strong,
.rocket-card strong,
.fact-card strong { display: block; font-family: var(--font-display); font-size: calc(25 * var(--u)); line-height: 1.05; }
.challenge-banner small,
.rocket-card small,
.fact-card small { display: block; margin-top: calc(6 * var(--u)); font-size: calc(14 * var(--u)); color: rgba(255,255,255,0.82); }
.challenge-banner b,
.rocket-card b {
  display: inline-flex;
  align-items: center;
  gap: calc(8 * var(--u));
  min-height: calc(48 * var(--u));
  padding: 0 calc(18 * var(--u));
  border-radius: calc(8 * var(--u));
  color: #082f86;
  background: #fff;
  font-size: calc(16 * var(--u));
}

.fact-card {
  display: grid;
  grid-template-columns: calc(72 * var(--u)) 1fr;
  align-items: center;
  gap: calc(18 * var(--u));
  padding: calc(18 * var(--u));
  color: #082f86;
}
.fact-card > svg { border-radius: 50%; padding: calc(11 * var(--u)); background: #b5cc18; color: #fff; }
.fact-card small { color: #082f86; }

.rocket-card b {
  width: calc(68 * var(--u));
  height: calc(68 * var(--u));
  justify-content: center;
  border-radius: 50%;
  background: #b5cc18;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: calc(8 * var(--u));
  min-height: calc(38 * var(--u));
  margin-bottom: calc(10 * var(--u));
  padding: 0 calc(16 * var(--u));
  border: 1px solid rgba(8,47,134,0.16);
  border-radius: calc(8 * var(--u));
  background: #fff;
  color: #082f86;
  font-weight: 900;
  cursor: pointer;
}

.detail-card,
.quiz-card {
  height: calc(100% - 50 * var(--u));
  border-radius: calc(16 * var(--u));
  border: 1px solid rgba(8,47,134,0.12);
  background: rgba(255,255,255,0.9);
  box-shadow: 0 calc(16 * var(--u)) calc(42 * var(--u)) rgba(8,35,92,0.12);
  backdrop-filter: blur(12px);
}

.detail-card {
  display: grid;
  grid-template-columns: calc(520 * var(--u)) 1fr;
  grid-template-rows: 1fr auto;
  overflow: hidden;
}

.detail-main {
  position: relative;
  padding: calc(56 * var(--u));
  color: #fff;
  background:
    linear-gradient(135deg, rgba(8,47,134,0.94), rgba(0,30,100,0.88)),
    url('/content/karriere/blickle-produktion.jpg') center / cover no-repeat;
}

.detail-number {
  width: calc(58 * var(--u));
  height: calc(58 * var(--u));
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #b5cc18;
  color: #082f86;
  font-size: calc(28 * var(--u));
  font-weight: 900;
}
.detail-icon { width: calc(112 * var(--u)); height: calc(112 * var(--u)); margin: calc(52 * var(--u)) 0 calc(18 * var(--u)); color: #b5cc18; }
.detail-main .eyebrow { color: #b5cc18; font-size: calc(16 * var(--u)); }
.detail-main h2 { margin: 0; font-family: var(--font-display); font-size: calc(48 * var(--u)); line-height: 1.02; color: #fff; }
.detail-teaser { font-size: calc(22 * var(--u)); line-height: 1.35; color: rgba(255,255,255,0.88); }

.detail-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(22 * var(--u));
  align-content: center;
  padding: calc(46 * var(--u));
}
.detail-columns section {
  min-height: calc(280 * var(--u));
  padding: calc(26 * var(--u));
  border: 1px solid rgba(8,47,134,0.12);
  border-radius: calc(12 * var(--u));
  background: #fff;
}
.detail-columns h3 { display: flex; align-items: center; gap: calc(8 * var(--u)); margin: 0 0 calc(18 * var(--u)); font-size: calc(20 * var(--u)); }
.detail-columns svg { color: #b5cc18; }
.detail-columns ul { margin: 0; padding-left: calc(22 * var(--u)); }
.detail-columns li,
.detail-columns p { margin-bottom: calc(10 * var(--u)); font-size: calc(18 * var(--u)); line-height: 1.32; color: #14213d; }
.detail-columns .avoid svg { color: #f59e0b; }

.detail-footer {
  grid-column: 1 / 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(22 * var(--u)) calc(46 * var(--u));
  color: #fff;
  background: #082f86;
}
.detail-footer div,
.detail-footer button,
.quiz-result div,
.quiz-result button { display: inline-flex; align-items: center; gap: calc(10 * var(--u)); }
.detail-footer button,
.quiz-result button {
  min-height: calc(48 * var(--u));
  padding: 0 calc(20 * var(--u));
  border: 0;
  border-radius: calc(8 * var(--u));
  background: #b5cc18;
  color: #082f86;
  font-weight: 900;
  cursor: pointer;
}

.detail-card-rich {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  gap: calc(10 * var(--u));
  overflow: hidden;
  padding: calc(12 * var(--u)) calc(22 * var(--u)) calc(12 * var(--u));
  background:
    linear-gradient(180deg, rgba(255,255,255,0.94), rgba(246,249,252,0.94)),
    url('/content/karriere/blickle-produktion.jpg') center bottom / cover no-repeat;
}

.detail-rich-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) calc(650 * var(--u));
  gap: calc(20 * var(--u));
  align-items: center;
}

.detail-title-block {
  display: grid;
  grid-template-columns: calc(96 * var(--u)) minmax(0, 1fr);
  gap: calc(16 * var(--u));
  align-items: center;
}

.detail-title-icon {
  width: calc(78 * var(--u));
  height: calc(78 * var(--u));
  color: #082f86;
}

.detail-title-block h2 {
  margin: 0 0 calc(6 * var(--u));
  font-family: var(--font-display);
  font-size: calc(46 * var(--u));
  line-height: 0.98;
  color: #082f86;
  letter-spacing: 0;
}

.detail-title-block p {
  margin: 0;
  font-size: calc(19 * var(--u));
  font-weight: 900;
  color: #082f86;
}

.detail-title-block p::after,
.goal-panel h3::after,
.anchor-panel h3::after,
.daily-panel h3::after,
.metrics-panel h3::after,
.impulse-panel h3::after,
.next-panel > span::after {
  content: '';
  display: block;
  width: calc(74 * var(--u));
  height: calc(4 * var(--u));
  margin-top: calc(8 * var(--u));
  border-radius: calc(4 * var(--u));
  background: #b5cc18;
}

.detail-progress-card {
  display: grid;
  grid-template-columns: calc(80 * var(--u)) minmax(0, 1fr) calc(88 * var(--u)) calc(132 * var(--u));
  gap: calc(14 * var(--u));
  align-items: center;
  min-height: calc(92 * var(--u));
  padding: calc(10 * var(--u)) calc(16 * var(--u));
  border: 1px solid rgba(8,47,134,0.14);
  border-radius: calc(12 * var(--u));
  background: rgba(255,255,255,0.84);
  box-shadow: 0 calc(10 * var(--u)) calc(26 * var(--u)) rgba(8,35,92,0.1);
}

.progress-ring.compact {
  width: calc(70 * var(--u));
}
.progress-ring.compact::before {
  width: calc(48 * var(--u));
}
.progress-ring.compact span {
  font-size: calc(19 * var(--u));
}

.detail-progress-copy {
  min-width: 0;
}
.detail-progress-copy strong {
  display: block;
  margin-bottom: calc(8 * var(--u));
  font-size: calc(19 * var(--u));
}
.detail-progress-copy .progress-cells i {
  height: calc(14 * var(--u));
}

.detail-score {
  display: grid;
  grid-template-columns: calc(34 * var(--u)) 1fr;
  column-gap: calc(8 * var(--u));
  align-items: center;
  border-left: 1px solid rgba(8,47,134,0.14);
  padding-left: calc(16 * var(--u));
}
.detail-score svg {
  grid-row: 1 / 3;
  width: calc(30 * var(--u));
  height: calc(30 * var(--u));
  color: #b5cc18;
}
.detail-score strong {
  font-size: calc(17 * var(--u));
  line-height: 1;
}
.detail-score span {
  font-size: calc(12 * var(--u));
  color: #082f86;
}

.detail-rich-grid {
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1.18fr calc(340 * var(--u));
  grid-template-rows:
    calc(132 * var(--u))
    calc(166 * var(--u))
    calc(92 * var(--u))
    minmax(calc(18 * var(--u)), 1fr)
    calc(66 * var(--u));
  grid-template-areas:
    'goal goal goal next'
    'anchor daily metrics next'
    'impulse impulse impulse next'
    '. . . next'
    'cta cta cta cta';
  gap: calc(10 * var(--u));
}

.goal-panel,
.anchor-panel,
.daily-panel,
.metrics-panel,
.impulse-panel,
.next-panel {
  border: 1px solid rgba(8,47,134,0.13);
  border-radius: calc(10 * var(--u));
  background: rgba(255,255,255,0.9);
  box-shadow: 0 calc(7 * var(--u)) calc(20 * var(--u)) rgba(8,35,92,0.07);
}

.goal-panel {
  grid-area: goal;
  display: grid;
  grid-template-columns: calc(210 * var(--u)) 1fr;
  gap: calc(24 * var(--u));
  align-items: center;
  padding: calc(16 * var(--u)) calc(24 * var(--u));
}
.goal-icon {
  display: grid;
  place-items: center;
  height: 100%;
  border-right: 1px solid rgba(8,47,134,0.16);
}
.goal-icon svg {
  width: calc(82 * var(--u));
  height: calc(82 * var(--u));
  color: #082f86;
}
.goal-panel h3,
.anchor-panel h3,
.daily-panel h3,
.metrics-panel h3,
.impulse-panel h3,
.next-panel > span {
  display: flex;
  align-items: center;
  gap: calc(9 * var(--u));
  margin: 0 0 calc(9 * var(--u));
  font-family: var(--font-display);
  font-size: calc(19 * var(--u));
  font-weight: 900;
  color: #082f86;
}
.goal-panel h3::after,
.anchor-panel h3::after,
.daily-panel h3::after,
.metrics-panel h3::after,
.impulse-panel h3::after,
.next-panel > span::after {
  width: calc(52 * var(--u));
}
.goal-panel p {
  margin: 0;
  max-width: calc(760 * var(--u));
  font-size: calc(16 * var(--u));
  line-height: 1.28;
  color: #14213d;
}

.anchor-panel { grid-area: anchor; }
.daily-panel { grid-area: daily; }
.metrics-panel { grid-area: metrics; }
.impulse-panel { grid-area: impulse; }
.anchor-panel,
.daily-panel,
.metrics-panel,
.impulse-panel {
  padding: calc(14 * var(--u)) calc(18 * var(--u));
}

.anchor-panel ul,
.daily-panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: calc(7 * var(--u));
}
.anchor-panel li,
.daily-panel li {
  display: grid;
  grid-template-columns: calc(21 * var(--u)) 1fr;
  gap: calc(10 * var(--u));
  align-items: start;
  font-size: calc(14 * var(--u));
  line-height: 1.18;
  color: #14213d;
}
.anchor-panel li svg,
.daily-panel li svg,
.anchor-panel h3 svg,
.daily-panel h3 svg,
.metrics-panel h3 svg {
  color: #b5cc18;
}

.metric-tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(8 * var(--u));
}
.metric-tiles article {
  min-height: calc(82 * var(--u));
  display: grid;
  align-content: center;
  justify-items: center;
  gap: calc(8 * var(--u));
  padding: calc(10 * var(--u));
  border: 1px solid rgba(8,47,134,0.14);
  border-radius: calc(8 * var(--u));
  text-align: center;
}
.metric-tiles svg {
  width: calc(34 * var(--u));
  height: calc(34 * var(--u));
  color: #082f86;
}
.metric-tiles strong {
  font-size: calc(12 * var(--u));
  line-height: 1.1;
  color: #082f86;
}

.impulse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(10 * var(--u));
}
.impulse-grid article {
  display: grid;
  grid-template-columns: calc(38 * var(--u)) 1fr calc(26 * var(--u));
  align-items: center;
  gap: calc(9 * var(--u));
  min-height: calc(50 * var(--u));
  padding: calc(7 * var(--u)) calc(10 * var(--u));
  border: 1px solid rgba(8,47,134,0.12);
  border-radius: calc(9 * var(--u));
  background: #fff;
}
.impulse-grid svg {
  width: calc(32 * var(--u));
  height: calc(32 * var(--u));
  color: #082f86;
}
.impulse-grid strong {
  display: block;
  font-size: calc(13 * var(--u));
  color: #082f86;
}
.impulse-grid p {
  margin: calc(3 * var(--u)) 0 0;
  font-size: calc(10 * var(--u));
  line-height: 1.15;
  color: #14213d;
}
.impulse-arrow {
  justify-self: end;
  padding: calc(5 * var(--u));
  border: 1px solid rgba(181,204,24,0.7);
  border-radius: 50%;
  color: #b5cc18 !important;
}

.next-panel {
  grid-area: next;
  display: flex;
  flex-direction: column;
  padding: calc(22 * var(--u));
}
.next-panel > span {
  display: block;
  font-size: calc(21 * var(--u));
}
.next-icon {
  width: calc(86 * var(--u));
  height: calc(86 * var(--u));
  margin: calc(18 * var(--u)) auto calc(18 * var(--u));
  color: #082f86;
}
.next-panel small {
  margin-bottom: calc(8 * var(--u));
  color: #8aa300;
  font-weight: 900;
  font-size: calc(14 * var(--u));
}
.next-panel h3 {
  margin: 0 0 calc(12 * var(--u));
  font-family: var(--font-display);
  font-size: calc(21 * var(--u));
  line-height: 1.04;
  color: #082f86;
}
.next-panel p {
  margin: 0;
  font-size: calc(13 * var(--u));
  line-height: 1.24;
  color: #14213d;
}
.next-panel button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(14 * var(--u));
  min-height: calc(52 * var(--u));
  margin-top: auto;
  padding: 0 calc(20 * var(--u));
  border: 0;
  border-radius: calc(8 * var(--u));
  background: #082f86;
  color: #fff;
  font-weight: 900;
  font-size: calc(14 * var(--u));
  text-align: left;
  cursor: pointer;
}

.detail-cta {
  grid-area: cta;
  display: grid;
  grid-template-columns: calc(62 * var(--u)) 1fr calc(58 * var(--u));
  align-items: center;
  gap: calc(14 * var(--u));
  min-height: calc(62 * var(--u));
  border: 0;
  border-radius: calc(10 * var(--u));
  padding: 0 calc(22 * var(--u));
  color: #fff;
  background: linear-gradient(135deg, #082f86, #001e64);
  cursor: pointer;
  box-shadow: 0 calc(12 * var(--u)) calc(28 * var(--u)) rgba(8,35,92,0.18);
}
.detail-cta > svg {
  width: calc(40 * var(--u));
  height: calc(40 * var(--u));
  color: #b5cc18;
}
.detail-cta strong {
  display: block;
  font-family: var(--font-display);
  font-size: calc(21 * var(--u));
  line-height: 1;
}
.detail-cta small {
  display: block;
  margin-top: calc(5 * var(--u));
  font-size: calc(12 * var(--u));
  color: rgba(255,255,255,0.86);
}
.detail-cta b {
  display: grid;
  place-items: center;
  width: calc(48 * var(--u));
  aspect-ratio: 1;
  justify-self: end;
  border-radius: 50%;
  color: #082f86;
  background: #b5cc18;
}

.quiz-card {
  display: grid;
  grid-template-columns: calc(560 * var(--u)) 1fr;
  grid-template-rows: 1fr auto;
  overflow: hidden;
}
.quiz-intro {
  padding: calc(58 * var(--u));
  color: #fff;
  background: linear-gradient(135deg, #082f86, #001e64);
}
.quiz-intro > span { display: inline-flex; padding: calc(8 * var(--u)) calc(16 * var(--u)); border-radius: calc(7 * var(--u)); background: #b5cc18; color: #082f86; font-weight: 900; text-transform: uppercase; }
.quiz-intro svg { display: block; width: calc(110 * var(--u)); height: calc(110 * var(--u)); margin: calc(72 * var(--u)) 0 calc(24 * var(--u)); color: #b5cc18; }
.quiz-intro h2 { margin: 0; font-family: var(--font-display); font-size: calc(48 * var(--u)); line-height: 1; color: #fff; }
.quiz-intro p { font-size: calc(26 * var(--u)); line-height: 1.25; color: rgba(255,255,255,0.9); }
.quiz-options { display: grid; align-content: center; gap: calc(20 * var(--u)); padding: calc(56 * var(--u)); }
.quiz-options button {
  min-height: calc(92 * var(--u));
  padding: calc(18 * var(--u)) calc(26 * var(--u));
  border: 2px solid rgba(8,47,134,0.12);
  border-radius: calc(12 * var(--u));
  background: #fff;
  color: #082f86;
  font-size: calc(22 * var(--u));
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}
.quiz-options button.selected { border-color: #b5cc18; box-shadow: 0 0 0 3px rgba(181,204,24,0.2); }
.quiz-options button.correct { background: rgba(181,204,24,0.16); }
.quiz-options button.wrong { border-color: #f59e0b; background: rgba(245,158,11,0.1); }
.quiz-result {
  grid-column: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(24 * var(--u)) calc(56 * var(--u));
  background: #f4f7fb;
  font-size: calc(20 * var(--u));
  font-weight: 900;
}
.quiz-result svg { color: #b5cc18; }
</style>
