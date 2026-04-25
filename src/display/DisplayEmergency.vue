<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  emergency: { type: Object, required: true }
})

const emit = defineEmits(['dismiss'])
const nowTs = ref(Date.now())
let timer = null
let autoDismissed = false

const expiresAt = computed(() => {
  const explicit = Date.parse(props.emergency.expiresAt || '')
  if (!Number.isNaN(explicit)) return explicit
  const triggeredAt = Date.parse(props.emergency.triggeredAt || '')
  if (Number.isNaN(triggeredAt)) return Date.now() + Number(props.emergency.displayDuration || 0) * 1000
  return triggeredAt + Number(props.emergency.displayDuration || 0) * 1000
})

const remainingSeconds = computed(() => {
  return Math.max(0, Math.ceil((expiresAt.value - nowTs.value) / 1000))
})

watch(() => props.emergency.id, () => {
  autoDismissed = false
  nowTs.value = Date.now()
}, { immediate: true })

onMounted(() => {
  timer = setInterval(() => {
    nowTs.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

watch(remainingSeconds, (seconds) => {
  if (seconds <= 0 && !autoDismissed) {
    autoDismissed = true
    emit('dismiss', props.emergency.id)
  }
})
</script>

<template>
  <div :class="['emergency-overlay', emergency.severity]">
    <div class="emergency-icon">&#9888;</div>
    <div class="emergency-label">NOTFALL</div>
    <div class="emergency-message">{{ emergency.message }}</div>
    <div class="emergency-timer">Automatische Ausblendung in {{ remainingSeconds }}s</div>
  </div>
</template>

<style scoped>
.emergency-overlay {
  position: absolute;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-emergency-bg);
  color: var(--color-emergency-text);
  animation: emergency-pulse 2s ease-in-out infinite;
}

.emergency-overlay.warning {
  background: #D97706;
}

.emergency-icon {
  font-size: 6rem;
  margin-bottom: 1rem;
}

.emergency-label {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  margin-bottom: 1.5rem;
}

.emergency-message {
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  max-width: 80%;
  line-height: 1.3;
}

.emergency-timer {
  position: absolute;
  bottom: 2rem;
  font-size: 1rem;
  opacity: 0.7;
}

@keyframes emergency-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
</style>
