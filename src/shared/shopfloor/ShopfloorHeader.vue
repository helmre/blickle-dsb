<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  departmentName: { type: String, required: true },
  week: { type: String, default: '' },
  rundgangTime: { type: String, default: '' },
  moderator: { type: String, default: '' },
  timerSeconds: { type: Number, default: 300 },
  isRunning: { type: Boolean, default: false },
})

const remaining = ref(props.timerSeconds)
let interval = null

function start() { remaining.value = props.timerSeconds }
function tick() {
  if (remaining.value > 0) remaining.value--
}

onMounted(() => {
  if (props.isRunning) interval = setInterval(tick, 1000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })
watch(() => props.isRunning, (on) => {
  if (on && !interval) { start(); interval = setInterval(tick, 1000) }
  if (!on && interval) { clearInterval(interval); interval = null }
})

const display = computed(() => {
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})
</script>

<template>
  <header class="sfm-header">
    <div class="left">
      <img src="/Blicklelogo.png" alt="Blickle" class="logo" />
      <div class="titles">
        <div class="eyebrow">Shopfloor Management Board</div>
        <div class="dept">{{ departmentName }}</div>
      </div>
    </div>
    <div class="right">
      <div class="meta">
        <span class="meta-item" v-if="week"><span class="meta-label">Woche</span> {{ week }}</span>
        <span class="meta-item" v-if="rundgangTime"><span class="meta-label">Rundgang</span> {{ rundgangTime }}</span>
        <span class="meta-item" v-if="moderator"><span class="meta-label">Moderator</span> {{ moderator }}</span>
      </div>
      <div class="timer" :class="{ running: isRunning, warn: remaining < 60 }">
        <span class="timer-icon">&#9200;</span>
        <span class="timer-value">{{ display }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.sfm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 8px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.left { display: flex; align-items: center; gap: 18px; }
.logo {
  height: 44px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}
.titles { display: flex; flex-direction: column; gap: 2px; }
.eyebrow {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #B5CC18;
  text-shadow: 0 0 16px rgba(181, 204, 24, 0.4);
}
.dept {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.right { display: flex; align-items: center; gap: 28px; }
.meta {
  display: flex;
  gap: 22px;
}
.meta-item {
  font-family: var(--font-body);
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}
.meta-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.timer.running {
  background: rgba(181, 204, 24, 0.12);
  border-color: rgba(181, 204, 24, 0.45);
  box-shadow: 0 0 24px rgba(181, 204, 24, 0.25);
}
.timer.warn {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 28px rgba(239, 68, 68, 0.3);
}
.timer-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
}
.timer.running .timer-icon, .timer.warn .timer-icon {
  color: #fff;
}
.timer-value {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
</style>
