<script setup>
import { computed } from 'vue'
import { CheckCircle2, Circle, Monitor, Sparkles } from 'lucide-vue-next'
import LegacyTemplatePreview from '../LegacyTemplatePreview.vue'
import { CATEGORY_LABELS, buildTemplateCardMeta } from '../../../shared/templates/registry.js'

const props = defineProps({
  canSubmitForReview: { type: Boolean, default: false },
  draft: { type: Object, required: true },
  editorComponent: { type: [Object, Function, String], default: null },
  finalChecklist: { type: Array, default: () => [] },
  htmlPreview: { type: String, default: '' },
  locationLabel: { type: String, required: true },
  previewLocationId: { type: String, default: '' },
  previewLocationLabel: { type: String, required: true },
  previewLocationOptions: { type: Array, default: () => [] },
  previewCheckedLabel: { type: String, default: '' },
  previewOpened: { type: Boolean, default: false },
  readyForSubmission: { type: Boolean, default: false },
  reviewNote: { type: String, default: '' },
  scheduleLabel: { type: String, default: '' },
  selectedTemplate: { type: Object, default: null },
  targetMode: { type: String, default: 'all' },
  templateParams: { type: Object, default: () => ({}) },
  validityLabel: { type: String, required: true },
})

defineEmits(['open-display-preview', 'update:previewLocationId', 'update:reviewNote'])

const templateMeta = computed(() => props.selectedTemplate
  ? buildTemplateCardMeta(props.selectedTemplate, category => CATEGORY_LABELS[category] || category)
  : null)
</script>

<template>
  <section class="wizard-panel">
    <div class="panel-head">
      <div>
        <h2>Vorschau und Einreichen</h2>
        <p>Letzter Check: Inhalt, Zielgruppe und Zeitraum stimmen, bevor der Entwurf in den Workflow geht.</p>
      </div>
      <select
        :value="previewLocationId"
        class="preview-location"
        @change="$emit('update:previewLocationId', $event.target.value)"
      >
        <option v-if="targetMode === 'all'" value="">
          Display: Global / ungefiltert
        </option>
        <option v-for="location in previewLocationOptions" :key="location.id" :value="location.id">
          Display: {{ location.name }}
        </option>
      </select>
    </div>

    <div class="preview-grid">
      <div class="display-preview">
        <div class="display-preview-head">
          <div>
            <span>Display-Wirkung</span>
            <strong>{{ templateMeta?.title || draft.title || 'Vorschau' }}</strong>
          </div>
          <em>{{ previewLocationLabel }}</em>
        </div>
        <div class="display-frame">
          <component
            v-if="editorComponent"
            :is="editorComponent"
            :params="templateParams"
            :displayMode="true"
            :readonly="true"
          />
          <LegacyTemplatePreview v-else-if="selectedTemplate" :template="selectedTemplate" :html="htmlPreview" />
        </div>
      </div>
      <div class="review-card">
        <div
          v-if="selectedTemplate && templateMeta"
          class="review-template"
          :style="{ '--accent': templateMeta.accent, '--preview-bg': templateMeta.background }"
        >
          <div :class="['review-template-preview', `theme-${templateMeta.theme}`]">
            <span>{{ templateMeta.kicker }}</span>
            <strong>{{ templateMeta.title }}</strong>
          </div>
          <div>
            <span>Einreichung</span>
            <h3>{{ selectedTemplate.name }}</h3>
            <p>{{ templateMeta.recommendedFor }}</p>
          </div>
          <Sparkles v-if="selectedTemplate.recommendedFor" :size="18" />
        </div>
        <dl>
          <div><dt>Titel</dt><dd>{{ draft.title || 'Noch kein Titel' }}</dd></div>
          <div><dt>Vorlage</dt><dd>{{ selectedTemplate?.name || '-' }}</dd></div>
          <div><dt>Standorte</dt><dd>{{ locationLabel }}</dd></div>
          <div><dt>Gültigkeit</dt><dd>{{ validityLabel }}</dd></div>
          <div><dt>Zeitplanung</dt><dd>{{ scheduleLabel }}</dd></div>
          <div><dt>Vorschau-Display</dt><dd>{{ previewLocationLabel }}</dd></div>
        </dl>
        <label class="review-note-field">
          <span>Hinweis für Review</span>
          <textarea
            :value="reviewNote"
            rows="4"
            maxlength="700"
            placeholder="Was soll beim Prüfen besonders beachtet werden?"
            @input="$emit('update:reviewNote', $event.target.value)"
          ></textarea>
        </label>
        <button
          type="button"
          :class="['display-link', { checked: previewOpened }]"
          :disabled="!selectedTemplate || !draft.title.trim()"
          @click="$emit('open-display-preview')"
        >
          <Monitor :size="16" />
          <span>{{ previewOpened ? 'Display-Vorschau erneut prüfen' : 'Display-Vorschau prüfen' }}</span>
        </button>
        <p :class="['preview-check-note', { checked: previewOpened }]">
          <CheckCircle2 v-if="previewOpened" :size="15" />
          <Circle v-else :size="15" />
          <span>
            {{ previewOpened ? `Vorschau geprüft${previewCheckedLabel ? ` um ${previewCheckedLabel} Uhr` : ''}.` : 'Pflicht vor dem Einreichen: einmal die echte Display-Ansicht öffnen.' }}
          </span>
        </p>
        <div class="submission-check">
          <strong>Einreichungs-Check</strong>
          <ul>
            <li v-for="item in finalChecklist" :key="item.label" :class="{ done: item.done }">
              <component :is="item.done ? CheckCircle2 : Circle" :size="15" />
              <span>{{ item.label }}</span>
            </li>
          </ul>
          <p v-if="canSubmitForReview && !readyForSubmission" class="submit-hint">
            Öffne die Display-Ansicht einmal für den gewählten Standort, bevor der Inhalt in die Prüfung geht.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wizard-panel {
  min-height: 570px;
  padding: 20px;
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-head h2 {
  margin: 0 0 5px;
  font-family: var(--font-display);
  color: var(--blickle-navy);
  font-size: 1.18rem;
}

.panel-head p {
  margin: 0;
  max-width: 720px;
  color: var(--gray-600);
  font-size: 0.9rem;
  line-height: 1.45;
}

.preview-location {
  width: 100%;
  max-width: 280px;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 9px 10px;
  font: inherit;
  font-size: 0.86rem;
  background: #fff;
}

.preview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.65fr);
  gap: 16px;
}

.display-preview {
  min-width: 0;
}

.display-preview-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 10px;
}

.display-preview-head span {
  display: block;
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 850;
  text-transform: uppercase;
}

.display-preview-head strong {
  display: block;
  margin-top: 2px;
  color: var(--blickle-navy);
  font-size: 1rem;
  line-height: 1.25;
}

.display-preview-head em {
  color: var(--gray-600);
  font-size: 0.78rem;
  font-style: normal;
  font-weight: 750;
  text-align: right;
}

.display-frame {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  background: #07182d;
  box-shadow: 0 18px 36px rgba(11, 31, 58, 0.2);
  container-type: size;
}

.review-card {
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.review-template {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.review-template-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  overflow: hidden;
  border-radius: 6px;
  border-bottom: 3px solid var(--accent);
  padding: 9px;
  background: var(--preview-bg);
  color: #fff;
}

.review-template-preview::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 31, 58, 0.02), rgba(11, 31, 58, 0.68));
}

.review-template-preview.theme-light {
  color: var(--blickle-navy);
}

.review-template-preview.theme-light::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.78));
}

.review-template-preview span,
.review-template-preview strong {
  position: relative;
  z-index: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.review-template-preview span {
  width: fit-content;
  max-width: 100%;
  -webkit-line-clamp: 1;
  border-radius: 999px;
  background: var(--accent);
  color: var(--blickle-navy);
  padding: 2px 6px;
  font-size: 0.54rem;
  font-weight: 850;
  text-transform: uppercase;
}

.review-template-preview strong {
  -webkit-line-clamp: 2;
  color: inherit;
  font-family: var(--font-display);
  font-size: 0.82rem;
  line-height: 1.08;
}

.review-template > div:nth-child(2) {
  min-width: 0;
}

.review-template > div:nth-child(2) > span {
  display: block;
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 850;
  text-transform: uppercase;
}

.review-card h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--blickle-navy);
}

.review-template p {
  margin: 3px 0 0;
  color: var(--gray-600);
  font-size: 0.76rem;
  line-height: 1.35;
}

.review-template svg {
  color: var(--blickle-green);
}

.review-card dl {
  display: grid;
  gap: 12px;
  margin: 16px 0;
}

.review-card dl div {
  display: grid;
  gap: 3px;
}

.review-card dt {
  font-size: 0.68rem;
  color: var(--gray-500);
  font-weight: 800;
  text-transform: uppercase;
}

.review-card dd {
  margin: 0;
  color: var(--gray-800);
  font-size: 0.9rem;
  line-height: 1.35;
}

.review-note-field {
  display: grid;
  gap: 6px;
  margin: 0 0 14px;
}

.review-note-field span {
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.review-note-field textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 92px;
  resize: vertical;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 11px;
  color: var(--gray-800);
  font: inherit;
  font-size: 0.82rem;
  line-height: 1.45;
}

.review-note-field textarea:focus {
  outline: none;
  border-color: rgba(22, 58, 108, 0.5);
  box-shadow: 0 0 0 3px rgba(22, 58, 108, 0.08);
}

.display-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: rgba(22, 58, 108, 0.08);
  color: var(--blickle-navy);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.display-link.checked {
  background: rgba(181, 204, 24, 0.16);
}

.display-link:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.preview-check-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 9px 0 0;
  color: var(--gray-600);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.4;
}

.preview-check-note svg {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--gray-400);
}

.preview-check-note.checked {
  color: var(--blickle-navy);
}

.preview-check-note.checked svg {
  color: var(--blickle-green);
}

.submission-check {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  padding: 14px;
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
}

.submission-check strong {
  color: var(--blickle-navy);
  font-size: 0.84rem;
}

.submission-check ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.submission-check li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-500);
  font-size: 0.8rem;
  font-weight: 700;
}

.submission-check li svg {
  color: var(--gray-400);
}

.submission-check li.done {
  color: var(--blickle-navy);
}

.submission-check li.done svg {
  color: var(--blickle-green);
}

.submit-hint {
  margin: 2px 0 0;
  color: var(--gray-600);
  font-size: 0.76rem;
  line-height: 1.4;
}

@media (max-width: 820px) {
  .panel-head {
    flex-direction: column;
    align-items: stretch;
  }

  .preview-location {
    max-width: none;
  }

  .display-preview-head,
  .review-template {
    grid-template-columns: 1fr;
  }

  .display-preview-head {
    align-items: flex-start;
  }

  .display-preview-head em {
    text-align: left;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
