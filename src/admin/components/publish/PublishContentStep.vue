<script setup>
import { CheckCircle2, Circle } from 'lucide-vue-next'
import LegacyTemplatePreview from '../LegacyTemplatePreview.vue'

defineProps({
  contentValidationIssues: { type: Array, default: () => [] },
  draft: { type: Object, required: true },
  editorComponent: { type: [Object, Function, String], default: null },
  htmlPreview: { type: String, default: '' },
  isContentValid: { type: Boolean, default: false },
  isTitleMissing: { type: Boolean, default: false },
  missingFieldKeys: { type: Object, default: () => new Set() },
  selectedTemplate: { type: Object, default: null },
  templateParams: { type: Object, default: () => ({}) },
})

defineEmits(['update-draft-field', 'update-param', 'update:params'])

function paramKey(param) {
  return param.key || param.name
}
</script>

<template>
  <section class="wizard-panel">
    <div class="panel-head">
      <div>
        <h2>Inhalt ausfüllen</h2>
        <p>Titel und Kurzbeschreibung helfen Admin, Prüfung und Suche. Die Vorlage regelt die eigentliche Anzeige.</p>
      </div>
    </div>

    <div class="content-meta-grid">
      <label class="field">
        <span>Titel</span>
        <input
          :value="draft.title"
          :class="{ invalid: isTitleMissing }"
          type="text"
          placeholder="z.B. Neue Schichtregelung FB1"
          required
          @input="$emit('update-draft-field', 'title', $event.target.value)"
        />
      </label>
      <label class="field">
        <span>Tags</span>
        <input
          :value="draft.tags"
          type="text"
          placeholder="produktion, sicherheit"
          @input="$emit('update-draft-field', 'tags', $event.target.value)"
        />
      </label>
      <label class="field field-wide">
        <span>Kurzbeschreibung</span>
        <textarea
          :value="draft.description"
          rows="3"
          placeholder="Worum geht es, für wen ist es relevant?"
          @input="$emit('update-draft-field', 'description', $event.target.value)"
        ></textarea>
      </label>
    </div>

    <div :class="['validation-card', { complete: isContentValid }]">
      <div class="validation-head">
        <CheckCircle2 v-if="isContentValid" :size="17" />
        <Circle v-else :size="17" />
        <strong>{{ isContentValid ? 'Alle Pflichtangaben sind vollständig' : 'Noch offene Pflichtangaben' }}</strong>
      </div>
      <ul v-if="!isContentValid" class="validation-list">
        <li v-for="issue in contentValidationIssues" :key="issue.key">{{ issue.message }}</li>
      </ul>
    </div>

    <component
      v-if="editorComponent"
      :is="editorComponent"
      :params="templateParams"
      @update:params="$emit('update:params', $event)"
    />

    <div v-else-if="selectedTemplate" class="legacy-compose">
      <div class="legacy-fields">
        <label v-for="param in selectedTemplate.parameters || []" :key="paramKey(param)" class="field">
          <span>{{ param.label || paramKey(param) }}<small v-if="param.required">Pflicht</small></span>
          <textarea
            v-if="param.type === 'textarea' || param.type === 'code'"
            :value="templateParams[paramKey(param)]"
            :class="{ invalid: missingFieldKeys.has(paramKey(param)) }"
            rows="4"
            :required="param.required"
            @input="$emit('update-param', paramKey(param), $event.target.value)"
          ></textarea>
          <select
            v-else-if="param.type === 'select'"
            :value="templateParams[paramKey(param)]"
            :class="{ invalid: missingFieldKeys.has(paramKey(param)) }"
            :required="param.required"
            @change="$emit('update-param', paramKey(param), $event.target.value)"
          >
            <option v-for="option in param.options || []" :key="option" :value="option">{{ option }}</option>
          </select>
          <input
            v-else
            :value="templateParams[paramKey(param)]"
            :class="{ invalid: missingFieldKeys.has(paramKey(param)) }"
            :type="param.type === 'date' ? 'date' : 'text'"
            :required="param.required"
            @input="$emit('update-param', paramKey(param), $event.target.value)"
          />
        </label>
      </div>
      <LegacyTemplatePreview :template="selectedTemplate" :html="htmlPreview" />
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

.content-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

.field {
  display: grid;
  gap: 5px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.73rem;
  font-weight: 800;
  color: var(--gray-700);
}

.field span small {
  color: var(--color-danger);
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 9px 10px;
  font: inherit;
  font-size: 0.86rem;
  background: #fff;
}

.field textarea {
  resize: vertical;
}

.field input.invalid,
.field textarea.invalid,
.field select.invalid {
  border-color: rgba(220, 38, 38, 0.58);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}

.validation-card {
  display: grid;
  gap: 8px;
  margin: -4px 0 18px;
  padding: 12px 13px;
  border: 1px solid rgba(220, 38, 38, 0.22);
  border-radius: 8px;
  background: rgba(220, 38, 38, 0.045);
  color: var(--gray-700);
}

.validation-card.complete {
  border-color: rgba(181, 204, 24, 0.38);
  background: rgba(181, 204, 24, 0.09);
}

.validation-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--blickle-navy);
  font-size: 0.82rem;
}

.validation-card:not(.complete) .validation-head svg {
  color: var(--color-danger);
}

.validation-card.complete .validation-head svg {
  color: var(--blickle-green);
}

.validation-list {
  margin: 0;
  padding-left: 26px;
  color: var(--gray-600);
  font-size: 0.78rem;
  line-height: 1.45;
}

.legacy-compose {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.legacy-fields {
  display: grid;
  gap: 12px;
  max-height: 600px;
  overflow: auto;
  padding-right: 4px;
}

@media (max-width: 820px) {
  .panel-head {
    flex-direction: column;
    align-items: stretch;
  }

  .content-meta-grid,
  .legacy-compose {
    grid-template-columns: 1fr;
  }
}
</style>
