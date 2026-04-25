<script setup>
import { CheckCircle2, Circle, Monitor } from 'lucide-vue-next'
import LegacyTemplatePreview from '../LegacyTemplatePreview.vue'

defineProps({
  canSubmitForReview: { type: Boolean, default: false },
  draft: { type: Object, required: true },
  editorComponent: { type: [Object, Function, String], default: null },
  finalChecklist: { type: Array, default: () => [] },
  htmlPreview: { type: String, default: '' },
  locationLabel: { type: String, required: true },
  previewLocationId: { type: String, default: '' },
  previewLocationLabel: { type: String, required: true },
  previewLocationOptions: { type: Array, default: () => [] },
  readyForSubmission: { type: Boolean, default: false },
  reviewNote: { type: String, default: '' },
  scheduleLabel: { type: String, default: '' },
  selectedTemplate: { type: Object, default: null },
  targetMode: { type: String, default: 'all' },
  templateParams: { type: Object, default: () => ({}) },
  validityLabel: { type: String, required: true },
})

defineEmits(['open-display-preview', 'update:previewLocationId', 'update:reviewNote'])
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
        <h3>Einreichung</h3>
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
          class="display-link"
          :disabled="!selectedTemplate || !draft.title.trim()"
          @click="$emit('open-display-preview')"
        >
          <Monitor :size="16" />
          <span>Display-Ansicht öffnen</span>
        </button>
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
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.display-preview {
  min-width: 0;
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

.review-card h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--blickle-navy);
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

.display-link:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.submission-check {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--color-border);
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

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
