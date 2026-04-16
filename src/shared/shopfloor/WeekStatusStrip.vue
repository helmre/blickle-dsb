<script setup>
import { WEEKDAY_LABELS, STATUS_COLORS } from '../utils/shopfloorSeed.js'

const props = defineProps({
  weekLabel: { type: String, default: 'KW' },
  statuses:  { type: Array, required: true },
  reportingDayIdx: { type: Number, default: 0 },
})
</script>

<template>
  <div class="week-strip">
    <div class="week-label">{{ weekLabel }}</div>
    <div class="days">
      <div
        v-for="(status, i) in statuses"
        :key="i"
        class="day"
        :class="{ 'is-today': i === reportingDayIdx }"
      >
        <div class="day-label">{{ WEEKDAY_LABELS[i] }}</div>
        <div
          class="day-cell"
          :style="{
            background: status ? STATUS_COLORS[status] : 'transparent',
            borderColor: status ? STATUS_COLORS[status] : 'rgba(255,255,255,0.15)'
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-strip {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.week-label {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.days {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.day-label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.02em;
}
.day.is-today .day-label {
  color: #fff;
  font-weight: 700;
}
.day-cell {
  width: 100%;
  height: 34px;
  border-radius: 6px;
  border: 2px solid;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.15);
  transition: transform 140ms;
}
.day.is-today .day-cell {
  transform: scale(1.06);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.25);
}
</style>
