<script setup>
import { CheckCircle2, XCircle } from 'lucide-vue-next'

defineProps({
  diagnostics: { type: Array, default: () => [] },
  summary: { type: Object, required: true },
})
</script>

<template>
  <section class="diagnostics-panel">
    <div class="diagnostics-head">
      <div>
        <h2>Warum erscheint welcher Inhalt?</h2>
        <p>Die Simulation nutzt Status, Gültigkeit, Standortvererbung und Zeitplanung.</p>
      </div>
      <div class="diagnostics-stats">
        <span>{{ summary.visible }} sichtbar</span>
        <span>{{ summary.scheduled }} geplant</span>
        <span>{{ summary.blockedBySchedule }} zeitlich blockiert</span>
      </div>
    </div>
    <div class="diagnostics-list">
      <article v-for="item in diagnostics" :key="item.id" :class="['diagnostic-row', { visible: item.visible }]">
        <span class="diagnostic-icon">
          <CheckCircle2 v-if="item.visible" :size="17" />
          <XCircle v-else :size="17" />
        </span>
        <span class="diagnostic-main">
          <strong>{{ item.title }}</strong>
          <small>{{ item.visible ? 'Displayfähig' : 'Nicht in aktueller Rotation' }}</small>
        </span>
        <span class="diagnostic-reason">{{ item.reason || 'Nicht sichtbar' }}</span>
        <span class="diagnostic-checks">
          <span
            v-for="check in item.checks"
            :key="check.key"
            :class="['check-pill', { passed: check.passed }]"
          >
            {{ check.label }}
          </span>
        </span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.diagnostics-panel {
  margin-top: 16px;
  padding: 16px;
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.diagnostics-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.diagnostics-head h2 {
  margin: 0;
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1.08rem;
}

.diagnostics-head p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.84rem;
}

.diagnostics-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}

.diagnostics-stats span {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  color: var(--gray-600);
  font-size: 0.72rem;
  font-weight: 800;
}

.diagnostics-list {
  display: grid;
  gap: 7px;
}

.diagnostic-row {
  display: grid;
  grid-template-columns: 30px minmax(180px, 1fr) minmax(220px, 1.2fr) minmax(250px, 1.1fr);
  gap: 10px;
  align-items: center;
  min-height: 52px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--gray-500);
}

.diagnostic-row.visible {
  color: var(--gray-900);
  border-color: rgba(16, 185, 129, 0.22);
  background: rgba(16, 185, 129, 0.04);
}

.diagnostic-icon {
  color: var(--color-danger);
}

.diagnostic-row.visible .diagnostic-icon {
  color: var(--color-success);
}

.diagnostic-main {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.diagnostic-main strong {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.86rem;
}

.diagnostic-main small {
  color: var(--gray-500);
  font-size: 0.72rem;
}

.diagnostic-reason {
  font-size: 0.82rem;
  line-height: 1.3;
}

.diagnostic-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.check-pill {
  min-height: 22px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
  font-size: 0.66rem;
  font-weight: 800;
}

.check-pill.passed {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
}

@media (max-width: 780px) {
  .diagnostics-head {
    flex-direction: column;
    align-items: stretch;
  }

  .diagnostic-row {
    grid-template-columns: 1fr;
  }

  .diagnostics-stats {
    justify-content: flex-start;
  }
}
</style>
