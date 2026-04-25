<script setup>
import { Search } from 'lucide-vue-next'

defineProps({
  categories: { type: Array, default: () => [] },
  categoryLabel: { type: Function, required: true },
  filteredTemplates: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  selectedCategory: { type: String, default: 'all' },
  selectedTemplateId: { type: String, default: '' },
})

defineEmits(['select-template', 'update:searchQuery', 'update:selectedCategory'])
</script>

<template>
  <section class="wizard-panel">
    <div class="panel-head">
      <div>
        <h2>Vorlage wählen</h2>
        <p>Starte mit einer geführten Vorlage, damit Textmenge, Layout und Display-Wirkung zusammenpassen.</p>
      </div>
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

    <div class="template-grid">
      <article
        v-for="template in filteredTemplates"
        :key="template.id"
        :class="['template-card', { selected: selectedTemplateId === template.id }]"
        @click="$emit('select-template', template)"
      >
        <div class="template-swatch" :style="{ '--accent': template.thumbnailAccent || '#B5CC18' }">
          <span>{{ categoryLabel(template.category) }}</span>
          <strong>{{ template.name }}</strong>
        </div>
        <div class="template-copy">
          <h3>{{ template.name }}</h3>
          <p>{{ template.description || 'Vorlage ohne Beschreibung' }}</p>
          <span class="template-type">{{ template.renderer === 'component' ? 'Designer-Vorlage' : 'Klassische Vorlage' }}</span>
        </div>
      </article>
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
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
}

.template-card {
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
}

.template-card.selected {
  border-color: var(--blickle-green);
  box-shadow: 0 0 0 3px rgba(181, 204, 24, 0.18);
}

.template-swatch {
  min-height: 118px;
  display: grid;
  align-content: end;
  gap: 8px;
  padding: 14px;
  background: #102d54;
  color: #fff;
  border-bottom: 4px solid var(--accent);
}

.template-swatch span {
  font-size: 0.64rem;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--accent);
}

.template-swatch strong {
  font-family: var(--font-display);
  font-size: 1.08rem;
  line-height: 1.1;
}

.template-copy {
  padding: 13px;
}

.template-copy h3 {
  margin: 0 0 6px;
  font-size: 0.94rem;
  color: var(--blickle-navy);
}

.template-copy p {
  margin: 0 0 10px;
  color: var(--gray-600);
  font-size: 0.78rem;
  line-height: 1.4;
  min-height: 44px;
}

.template-type {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--gray-500);
  text-transform: uppercase;
}

@media (max-width: 820px) {
  .panel-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
