<script setup>
import { STATUS_COLORS } from '../utils/shopfloorSeed.js'

defineProps({
  value:    { type: [String, Number], required: true },
  label:    { type: String, required: true },
  status:   { type: String, default: 'green' },
  unit:     { type: String, default: '' },
  subValue: { type: String, default: '' },
})
</script>

<template>
  <div class="kpi-card" :style="{ '--status': STATUS_COLORS[status] || STATUS_COLORS.green }">
    <div class="kpi-value-row">
      <span class="kpi-value">{{ value }}</span>
      <span v-if="unit" class="kpi-unit">{{ unit }}</span>
    </div>
    <div class="kpi-label">{{ label }}</div>
    <div v-if="subValue" class="kpi-sub">{{ subValue }}</div>
    <div class="status-dot"></div>
  </div>
</template>

<style scoped>
.kpi-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border-radius: 14px;
  padding: 18px 20px 16px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 22px rgba(0,0,0,0.18);
}
.kpi-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--status);
  box-shadow: 0 0 18px var(--status);
}
.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}
.kpi-value {
  font-family: var(--font-display);
  font-size: 54px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #fff;
}
.kpi-unit {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}
.kpi-label {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.3;
}
.kpi-sub {
  margin-top: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}
.status-dot {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--status);
  box-shadow: 0 0 14px var(--status);
  animation: pulse 2.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.92); }
}
</style>
