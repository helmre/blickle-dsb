<script setup>
import { STATUS_COLORS } from '../utils/shopfloorSeed.js'

defineProps({
  yellow: { type: Number, default: 0 },
  red:    { type: Number, default: 0 },
  label:  { type: String, default: 'Rueckstaende' },
})
</script>

<template>
  <div class="backlog">
    <div class="backlog-label">{{ label }}</div>
    <div class="backlog-row">
      <div class="chip" :style="{ '--c': STATUS_COLORS.yellow }">
        <span class="chip-num">{{ yellow }}</span>
        <span class="chip-txt">gelb</span>
      </div>
      <div class="chip" :style="{ '--c': STATUS_COLORS.red }">
        <span class="chip-num">{{ red }}</span>
        <span class="chip-txt">rot</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backlog { display: flex; flex-direction: column; gap: 8px; }
.backlog-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.backlog-row { display: flex; gap: 10px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--c) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
}
.chip-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--c);
  line-height: 1;
}
.chip-txt {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}
</style>
