<script setup>
import { CheckCircle2, Search, Sparkles } from 'lucide-vue-next'
import { buildTemplateCardMeta } from '../../../shared/templates/registry.js'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  categoryLabel: { type: Function, required: true },
  filteredTemplates: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  selectedCategory: { type: String, default: 'all' },
  selectedTemplateId: { type: String, default: '' },
})

defineEmits(['select-template', 'update:searchQuery', 'update:selectedCategory'])

function cardMeta(template) {
  return buildTemplateCardMeta(template, props.categoryLabel)
}
</script>

<template>
  <section class="wizard-panel">
    <div class="panel-head">
      <div>
        <h2>Vorlage wählen</h2>
        <p>Starte mit einer geführten Vorlage, damit Textmenge, Layout und Display-Wirkung zusammenpassen.</p>
      </div>
      <span class="template-count">{{ filteredTemplates.length }} Vorlagen</span>
    </div>

    <div class="template-tools">
      <label class="search-box">
        <Search :size="16" />
        <input
          :value="searchQuery"
          type="search"
          placeholder="Vorlage suchen..."
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </label>
      <div class="category-row" aria-label="Kategorien">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="['category-chip', { active: selectedCategory === category }]"
          @click="$emit('update:selectedCategory', category)"
        >
          {{ categoryLabel(category) }}
        </button>
      </div>
    </div>

    <div v-if="filteredTemplates.length" class="template-grid">
      <button
        v-for="template in filteredTemplates"
        :key="template.id"
        :class="['template-card', { selected: selectedTemplateId === template.id }]"
        type="button"
        :aria-pressed="selectedTemplateId === template.id"
        @click="$emit('select-template', template)"
      >
        <div
          :class="['template-preview', `theme-${cardMeta(template).theme}`]"
          :style="{ '--accent': cardMeta(template).accent, '--preview-bg': cardMeta(template).background }"
        >
          <span class="preview-kicker">{{ cardMeta(template).kicker }}</span>
          <strong>{{ cardMeta(template).title }}</strong>
          <small>{{ cardMeta(template).recommendedFor }}</small>
          <CheckCircle2 v-if="selectedTemplateId === template.id" class="selected-icon" :size="20" />
        </div>
        <div class="template-copy">
          <div class="template-title-row">
            <h3>{{ template.name }}</h3>
            <span v-if="template.recommendedFor" class="recommended-badge">
              <Sparkles :size="12" />
              Empfohlen
            </span>
          </div>
          <p>{{ cardMeta(template).description }}</p>
          <div class="template-tags">
            <span>{{ categoryLabel(template.category) }}</span>
            <span>{{ cardMeta(template).rendererLabel }}</span>
          </div>
        </div>
      </button>
    </div>

    <div v-else class="empty-state">
      <strong>Keine Vorlage gefunden</strong>
      <p>Suchbegriff oder Kategorie anpassen, um wieder passende Display-Formate zu sehen.</p>
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

.template-count {
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgba(181, 204, 24, 0.16);
  color: var(--blickle-navy);
  padding: 7px 11px;
  font-size: 0.72rem;
  font-weight: 850;
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

.template-tools {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  width: min(460px, 100%);
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--gray-500);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.category-chip {
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--blickle-white);
  color: var(--gray-600);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.category-chip.active {
  border-color: var(--blickle-navy);
  background: var(--blickle-navy);
  color: #fff;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
  gap: 14px;
}

.template-card {
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100%;
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;
  padding: 0;
  transition: transform 160ms ease-out, box-shadow 160ms ease-out, border-color 160ms ease-out;
}

.template-card:hover {
  transform: translateY(-2px);
  border-color: rgba(22, 58, 108, 0.18);
  box-shadow: 0 12px 28px rgba(11, 31, 58, 0.11);
}

.template-card.selected {
  border-color: var(--blickle-green);
  box-shadow: 0 0 0 3px rgba(181, 204, 24, 0.18);
}

.template-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 7px;
  padding: 16px;
  background: var(--preview-bg);
  color: #fff;
  border-bottom: 4px solid var(--accent);
  overflow: hidden;
}

.template-preview::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 31, 58, 0.02) 0%, rgba(11, 31, 58, 0.62) 100%);
}

.template-preview.theme-light {
  color: var(--blickle-navy);
}

.template-preview.theme-light::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.78) 100%);
}

.preview-kicker,
.template-preview strong,
.template-preview small,
.selected-icon {
  position: relative;
  z-index: 1;
}

.preview-kicker {
  width: fit-content;
  max-width: 100%;
  border-radius: 999px;
  background: var(--accent);
  color: var(--blickle-navy);
  padding: 4px 8px;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-preview strong {
  font-family: var(--font-display);
  font-size: 1.22rem;
  line-height: 1.1;
  color: inherit;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-preview small {
  color: currentColor;
  opacity: 0.82;
  font-size: 0.75rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.selected-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--accent);
  filter: drop-shadow(0 1px 2px rgba(11, 31, 58, 0.22));
}

.template-copy {
  display: grid;
  gap: 9px;
  padding: 14px;
}

.template-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.template-copy h3 {
  margin: 0;
  font-size: 0.94rem;
  color: var(--blickle-navy);
  line-height: 1.22;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommended-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  background: rgba(181, 204, 24, 0.18);
  color: var(--blickle-navy);
  padding: 4px 7px;
  font-size: 0.64rem;
  font-weight: 850;
}

.template-copy p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.78rem;
  line-height: 1.4;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.template-tags span {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px 7px;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--gray-500);
  background: var(--gray-50);
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 42px 16px;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background: var(--gray-50);
  text-align: center;
}

.empty-state strong {
  color: var(--blickle-navy);
}

.empty-state p {
  max-width: 420px;
  margin: 0;
  color: var(--gray-600);
  font-size: 0.84rem;
  line-height: 1.45;
}

@media (max-width: 820px) {
  .panel-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
