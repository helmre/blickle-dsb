<script setup>
import { computed } from 'vue'

const props = defineProps({
  days: { type: Array, default: () => [] },
  total: { type: Number, default: 20 },
})

const categories = [
  { key: 'anwesend',    color: '#10B981', label: 'Anwesend' },
  { key: 'urlaub',      color: '#F59E0B', label: 'Urlaub' },
  { key: 'krank',       color: '#EF4444', label: 'Krank' },
  { key: 'ausgeliehen', color: '#3B82F6', label: 'Ausgeliehen' },
]

function segHeight(count) {
  return (count / props.total) * 100
}
</script>

<template>
  <div class="anw-chart">
    <div class="title-row">
      <span class="title">Anwesenheit</span>
      <span class="title-sub">{{ total }} MA gesamt</span>
    </div>
    <div class="bars">
      <div v-for="day in days" :key="day.d" class="day-col">
        <div class="stack">
          <div
            v-for="cat in categories"
            :key="cat.key"
            class="seg"
            :style="{ height: segHeight(day[cat.key]) + '%', background: cat.color }"
            :title="`${cat.label}: ${day[cat.key]}`"
          ></div>
        </div>
        <div class="day-label">{{ day.d }}</div>
      </div>
    </div>
    <div class="legend">
      <span v-for="cat in categories" :key="cat.key" class="leg">
        <span class="leg-dot" :style="{ background: cat.color }"></span>
        {{ cat.label.charAt(0) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.anw-chart {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.title-sub {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  letter-spacing: 0.02em;
}
.bars {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 5px;
  height: 58px;
  align-items: stretch;
}
.day-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stack {
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 3px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
}
.seg + .seg { border-top: 1px solid rgba(0, 0, 0, 0.25); }
.day-label {
  text-align: center;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}
.legend {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  justify-content: space-between;
}
.leg {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
</style>
