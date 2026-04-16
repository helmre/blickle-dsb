<script setup>
import { computed } from 'vue'

const props = defineProps({
  values: { type: Array, default: () => [] },
  target: { type: Number, default: 100 },
})

const viewBox = { w: 200, h: 64 }

const domain = computed(() => {
  const all = props.values.concat([props.target])
  const min = Math.min(...all) - 2
  const max = Math.max(...all) + 2
  return { min, max }
})

function x(i) {
  const n = props.values.length
  if (n <= 1) return viewBox.w / 2
  return (i / (n - 1)) * viewBox.w
}
function y(v) {
  const { min, max } = domain.value
  const range = max - min
  const pct = (v - min) / range
  return viewBox.h - pct * viewBox.h
}
const targetY = computed(() => y(props.target))
const polyPoints = computed(() =>
  props.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
)
</script>

<template>
  <div class="sparkline">
    <div class="sp-title">Leistung (%)</div>
    <svg :viewBox="`0 0 ${viewBox.w} ${viewBox.h}`" preserveAspectRatio="none" class="sp-svg">
      <line
        :x1="0" :x2="viewBox.w" :y1="targetY" :y2="targetY"
        stroke="rgba(255,255,255,0.25)"
        stroke-dasharray="3,3"
      />
      <polyline
        :points="polyPoints"
        fill="none"
        stroke="#B5CC18"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle
        v-for="(v, i) in values"
        :key="i"
        :cx="x(i)"
        :cy="y(v)"
        r="2.5"
        :fill="v >= target ? '#B5CC18' : '#EF4444'"
      />
    </svg>
    <div class="sp-meta">
      <span class="sp-target">Ziel: {{ target }} %</span>
      <span class="sp-days">{{ values.length }} T</span>
    </div>
  </div>
</template>

<style scoped>
.sparkline {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.sp-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 6px;
}
.sp-svg {
  width: 100%;
  height: 56px;
  display: block;
}
.sp-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}
.sp-target { color: rgba(181, 204, 24, 0.85); }
</style>
