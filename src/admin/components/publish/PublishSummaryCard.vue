<script setup>
import { CheckCircle2, Circle } from 'lucide-vue-next'

defineProps({
  checklist: { type: Array, default: () => [] },
  locationLabel: { type: String, required: true },
  templateName: { type: String, default: '' },
  validityLabel: { type: String, required: true },
})
</script>

<template>
  <aside class="summary-card">
    <div class="summary-top">
      <span class="summary-kicker">Aktueller Stand</span>
      <strong>{{ templateName || 'Noch keine Vorlage' }}</strong>
    </div>
    <ul class="summary-list">
      <li v-for="item in checklist" :key="item.label" :class="{ done: item.done }">
        <component :is="item.done ? CheckCircle2 : Circle" :size="16" />
        <span>{{ item.label }}</span>
      </li>
    </ul>
    <div class="summary-meta">
      <div>
        <span>Standorte</span>
        <strong>{{ locationLabel }}</strong>
      </div>
      <div>
        <span>Zeitraum</span>
        <strong>{{ validityLabel }}</strong>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.summary-card {
  position: sticky;
  top: 72px;
  padding: 16px;
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.summary-top {
  display: grid;
  gap: 5px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--color-border);
}

.summary-kicker {
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.summary-top strong {
  color: var(--blickle-navy);
  font-size: 1rem;
  line-height: 1.25;
}

.summary-list {
  list-style: none;
  padding: 14px 0;
  margin: 0;
  display: grid;
  gap: 9px;
}

.summary-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-500);
  font-size: 0.82rem;
}

.summary-list li svg {
  color: var(--gray-400);
}

.summary-list li.done {
  color: var(--blickle-navy);
}

.summary-list li.done svg {
  color: var(--blickle-green);
}

.summary-meta {
  display: grid;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px dashed var(--color-border);
}

.summary-meta div {
  display: grid;
  gap: 3px;
}

.summary-meta span {
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.summary-meta strong {
  color: var(--gray-800);
  font-size: 0.84rem;
  line-height: 1.35;
}

@media (max-width: 1180px) {
  .summary-card {
    position: static;
  }
}
</style>
