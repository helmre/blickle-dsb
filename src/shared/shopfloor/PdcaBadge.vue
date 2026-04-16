<script setup>
import { PDCA_COLORS } from '../utils/shopfloorSeed.js'

const props = defineProps({
  phase: { type: String, default: 'plan' },
  done: { type: Boolean, default: false },
  size: { type: Number, default: 34 },
})
</script>

<template>
  <div
    class="pdca-badge"
    :class="{ 'is-done': done }"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: PDCA_COLORS[phase]?.bg || '#6B7280',
      fontSize: (size * 0.42) + 'px'
    }"
    :title="phase.toUpperCase()"
  >
    <span v-if="done">&#10003;</span>
    <span v-else>{{ PDCA_COLORS[phase]?.label || '?' }}</span>
  </div>
</template>

<style scoped>
.pdca-badge {
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
}
.pdca-badge.is-done {
  background: #10B981 !important;
}
</style>
