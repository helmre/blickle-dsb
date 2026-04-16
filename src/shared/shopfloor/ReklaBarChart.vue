<script setup>
import { computed } from 'vue'

const props = defineProps({
  weeks: { type: Array, default: () => [] },
})

const maxTotal = computed(() => {
  return Math.max(3, ...props.weeks.map(w => (w.intern || 0) + (w.kunde || 0)))
})
function barHeight(count) {
  if (!count) return 0
  return (count / maxTotal.value) * 100
}
</script>

<template>
  <div class="rekla-chart">
    <div class="chart-title">Reklamationen</div>
    <div class="chart-area">
      <div v-for="w in weeks" :key="w.label" class="bar-col">
        <div class="bars">
          <div class="bar bar-kunde" :style="{ height: barHeight(w.kunde) + '%' }" v-if="w.kunde"></div>
          <div class="bar bar-intern" :style="{ height: barHeight(w.intern) + '%' }" v-if="w.intern"></div>
        </div>
        <div class="bar-label">{{ w.label }}</div>
      </div>
    </div>
    <div class="legend">
      <span class="leg-item"><span class="leg-dot bg-intern"></span>Intern</span>
      <span class="leg-item"><span class="leg-dot bg-kunde"></span>Kunde</span>
    </div>
  </div>
</template>

<style scoped>
.rekla-chart {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.chart-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 8px;
}
.chart-area {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 5px;
  height: 64px;
  align-items: end;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  height: 100%;
}
.bars {
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  gap: 1px;
}
.bar {
  width: 100%;
  border-radius: 2px 2px 0 0;
  min-height: 2px;
}
.bar-intern { background: #F59E0B; }
.bar-kunde  { background: #EF4444; }
.bar-label {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.02em;
  margin-top: 3px;
}
.legend {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}
.leg-item { display: inline-flex; align-items: center; gap: 4px; }
.leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.bg-intern { background: #F59E0B; }
.bg-kunde  { background: #EF4444; }
</style>
