<script setup>
import { computed } from 'vue'

const props = defineProps({
  days: { type: Array, default: () => [] },
})

const maxTotal = computed(() => {
  return Math.max(3, ...props.days.map(d => (d.yellow || 0) + (d.red || 0)))
})
function h(count) {
  if (!count) return 0
  return (count / maxTotal.value) * 100
}
</script>

<template>
  <div class="backlog-trend">
    <div class="title">Rueckstaende (letzte {{ days.length }} Tage)</div>
    <div class="bars">
      <div v-for="(day, i) in days" :key="i" class="day-col">
        <div class="stack">
          <div class="bar bar-red" :style="{ height: h(day.red) + '%' }" v-if="day.red"></div>
          <div class="bar bar-yellow" :style="{ height: h(day.yellow) + '%' }" v-if="day.yellow"></div>
        </div>
        <div class="day-lbl" v-if="i % 2 === 0">{{ day.d }}</div>
      </div>
    </div>
    <div class="legend">
      <span class="leg"><span class="dot bg-yellow"></span>Nicht eingelagert</span>
      <span class="leg"><span class="dot bg-red"></span>Nicht erledigt</span>
    </div>
  </div>
</template>

<style scoped>
.backlog-trend {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 8px;
}
.bars {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;
  height: 52px;
  align-items: stretch;
  padding-bottom: 3px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.day-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
}
.stack {
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}
.bar { width: 100%; }
.bar-yellow { background: #F59E0B; }
.bar-red    { background: #EF4444; }
.day-lbl {
  font-family: var(--font-body);
  font-size: 8px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}
.legend {
  display: flex;
  gap: 10px;
  margin-top: 7px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}
.leg { display: inline-flex; align-items: center; gap: 4px; }
.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.bg-yellow { background: #F59E0B; }
.bg-red    { background: #EF4444; }
</style>
