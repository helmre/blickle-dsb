<script setup>
import { Eye, ListChecks } from 'lucide-vue-next'

defineProps({
  diagnosticSummary: { type: Object, required: true },
  displayPages: { type: Array, default: () => [] },
  getPageContentLabel: { type: Function, required: true },
  locationScopeIds: { type: Array, default: () => [] },
  pageDecision: { type: Object, required: true },
  playlistDecision: { type: Object, required: true },
  selectedPageIndex: { type: Number, default: 0 },
})

defineEmits(['select-page'])
</script>

<template>
  <aside class="inspector">
    <section class="inspector-card">
      <div class="card-title-row">
        <Eye :size="17" />
        <h3>Aktive Rotation</h3>
      </div>
      <div class="page-list">
        <button
          v-for="(page, index) in displayPages"
          :key="page.id"
          type="button"
          :class="['page-row', { active: selectedPageIndex === index }]"
          @click="$emit('select-page', index)"
        >
          <span class="page-number">{{ index + 1 }}</span>
          <span class="page-copy">
            <strong>{{ page.label }}</strong>
            <small>{{ getPageContentLabel(page) }}</small>
          </span>
          <span class="duration">{{ page.duration || 15 }}s</span>
        </button>
      </div>
    </section>

    <section class="inspector-card">
      <div class="card-title-row">
        <ListChecks :size="17" />
        <h3>Entscheidung</h3>
      </div>
      <div class="decision-hero">
        <span :class="['decision-source', `mode-${playlistDecision.mode}`]">{{ pageDecision.source }}</span>
        <strong>{{ pageDecision.title }}</strong>
        <p>{{ playlistDecision.reason }}</p>
      </div>
      <dl class="decision-list">
        <div>
          <dt>Playlist</dt>
          <dd>{{ playlistDecision.label }}</dd>
        </div>
        <div v-if="playlistDecision.activeSchedule">
          <dt>Aktiver Zeitplan</dt>
          <dd>{{ playlistDecision.activeSchedule }}</dd>
        </div>
        <div>
          <dt>Sichtbare Inhalte</dt>
          <dd>{{ diagnosticSummary.visible }} sichtbar · {{ diagnosticSummary.hidden }} ausgeblendet</dd>
        </div>
        <div>
          <dt>Standort-Scope</dt>
          <dd>{{ locationScopeIds.join(' > ') || 'global' }}</dd>
        </div>
      </dl>
      <ul class="decision-facts">
        <li v-for="fact in pageDecision.facts" :key="fact">{{ fact }}</li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.inspector {
  display: grid;
  gap: 16px;
}

.inspector-card {
  padding: 14px;
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--blickle-navy);
}

.card-title-row h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
}

.page-list {
  display: grid;
  gap: 7px;
  max-height: 440px;
  overflow: auto;
}

.page-row {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.page-row.active {
  border-color: var(--blickle-green);
  box-shadow: 0 0 0 3px rgba(181, 204, 24, 0.16);
}

.page-number {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  color: var(--gray-600);
  font-weight: 800;
  font-size: 0.78rem;
}

.page-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.page-copy strong,
.page-copy small {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-copy strong {
  color: var(--gray-900);
  font-size: 0.84rem;
}

.page-copy small {
  color: var(--gray-500);
  font-size: 0.72rem;
}

.duration {
  color: var(--gray-500);
  font-size: 0.72rem;
  font-weight: 800;
}

.decision-hero {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid rgba(22, 58, 108, 0.12);
  border-radius: 8px;
  background: rgba(22, 58, 108, 0.035);
}

.decision-hero strong {
  color: var(--blickle-navy);
  font-family: var(--font-display);
  font-size: 1rem;
  line-height: 1.2;
}

.decision-hero p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.82rem;
  line-height: 1.45;
}

.decision-source {
  width: fit-content;
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(181, 204, 24, 0.18);
  color: var(--blickle-navy);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.decision-source.mode-empty {
  background: rgba(148, 163, 184, 0.18);
  color: var(--gray-600);
}

.decision-source.mode-scheduled {
  background: rgba(181, 204, 24, 0.22);
}

.decision-source.mode-fallback {
  background: rgba(245, 158, 11, 0.16);
  color: #92400e;
}

.decision-list {
  display: grid;
  gap: 10px;
  margin: 0;
}

.decision-list div {
  display: grid;
  gap: 3px;
}

.decision-list dt {
  color: var(--gray-500);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.decision-list dd {
  margin: 0;
  color: var(--gray-900);
  font-size: 0.86rem;
  line-height: 1.35;
}

.decision-facts {
  display: grid;
  gap: 7px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.decision-facts li {
  position: relative;
  padding-left: 16px;
  color: var(--gray-700);
  font-size: 0.8rem;
  line-height: 1.35;
}

.decision-facts li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.52em;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--blickle-green);
}
</style>
