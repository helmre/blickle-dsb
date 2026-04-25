<script setup>
import { CalendarDays, MapPin } from 'lucide-vue-next'

defineProps({
  draft: { type: Object, required: true },
  hasDateError: { type: Boolean, default: false },
  scheduleLabel: { type: String, default: '' },
  selectableLocations: { type: Array, default: () => [] },
  targetMode: { type: String, default: 'all' },
  validityLabel: { type: String, required: true },
})

defineEmits(['set-target-mode', 'toggle-location', 'update-draft-field'])
</script>

<template>
  <section class="wizard-panel">
    <div class="panel-head">
      <div>
        <h2>Zielgruppe und Gültigkeit</h2>
        <p>Lege fest, für welche Standort-Displays der Inhalt gilt und in welchem Zeitraum er sichtbar sein darf.</p>
      </div>
    </div>

    <div class="target-grid">
      <section class="target-card">
        <div class="target-card-head">
          <MapPin :size="18" />
          <h3>Standorte</h3>
        </div>
        <div class="target-mode-row" role="group" aria-label="Standort-Zielgruppe">
          <button
            type="button"
            :class="['target-mode-button', { active: targetMode === 'all' }]"
            @click="$emit('set-target-mode', 'all')"
          >
            Alle Standorte
          </button>
          <button
            type="button"
            :class="['target-mode-button', { active: targetMode === 'specific' }]"
            @click="$emit('set-target-mode', 'specific')"
          >
            Bestimmte Standorte
          </button>
        </div>
        <p v-if="targetMode === 'all'" class="target-summary">
          Dieser Inhalt wird auf allen Standort-Displays berücksichtigt.
        </p>
        <div v-else class="location-list">
          <label v-for="location in selectableLocations" :key="location.id" class="location-option">
            <input
              type="checkbox"
              :checked="draft.locationIds.includes(location.id)"
              @change="$emit('toggle-location', location.id)"
            />
            <span>{{ location.name }}</span>
          </label>
        </div>
        <p v-if="targetMode === 'specific' && !draft.locationIds.length" class="field-error">
          Bitte mindestens einen Standort auswählen.
        </p>
      </section>

      <section class="target-card">
        <div class="target-card-head">
          <CalendarDays :size="18" />
          <h3>Gültigkeit</h3>
        </div>
        <div class="date-grid">
          <label class="field">
            <span>Start</span>
            <input :value="draft.validFrom" type="date" @input="$emit('update-draft-field', 'validFrom', $event.target.value)" />
          </label>
          <label class="field">
            <span>Ende</span>
            <input :value="draft.validUntil" type="date" @input="$emit('update-draft-field', 'validUntil', $event.target.value)" />
          </label>
        </div>
        <p v-if="hasDateError" class="field-error">Das Enddatum liegt vor dem Startdatum.</p>
        <p v-else class="target-hint">{{ validityLabel }}</p>
        <p class="schedule-hint">{{ scheduleLabel }}</p>
      </section>
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

.target-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.target-card {
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.target-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--blickle-navy);
}

.target-card-head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--blickle-navy);
}

.location-list {
  display: grid;
  gap: 8px;
  max-height: 360px;
  overflow: auto;
}

.target-mode-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.target-mode-button {
  min-height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  color: var(--gray-600);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.target-mode-button.active {
  border-color: var(--blickle-navy);
  background: var(--blickle-navy);
  color: #fff;
}

.target-summary {
  margin: 0;
  padding: 13px;
  border: 1px dashed rgba(22, 58, 108, 0.22);
  border-radius: 8px;
  background: rgba(22, 58, 108, 0.04);
  color: var(--gray-600);
  font-size: 0.84rem;
  line-height: 1.45;
}

.schedule-hint {
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(181, 204, 24, 0.12);
  color: var(--blickle-navy);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.4;
}

.location-option {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.85rem;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field {
  display: grid;
  gap: 5px;
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

.field input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 9px 10px;
  font: inherit;
  font-size: 0.86rem;
  background: #fff;
}

.field-error {
  margin: 12px 0 0;
  color: var(--color-danger);
  font-size: 0.82rem;
  font-weight: 700;
}

.target-hint {
  margin: 12px 0 0;
  color: var(--gray-600);
  font-size: 0.84rem;
}

@media (max-width: 820px) {
  .panel-head {
    flex-direction: column;
    align-items: stretch;
  }

  .target-grid,
  .date-grid,
  .target-mode-row {
    grid-template-columns: 1fr;
  }
}
</style>
