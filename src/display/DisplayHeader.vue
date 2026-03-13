<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDisplayTheme } from '../shared/composables/useDisplayTheme.js'

defineProps({
  pageTitle: { type: String, default: 'HOME' },
  navPosition: { type: String, default: 'bottom' }
})

const emit = defineEmits(['toggle-theme', 'toggle-nav'])
const { theme } = useDisplayTheme()

const time = ref('')
const date = ref('')
let timer = null

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  date.value = now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <header class="display-header">
    <div class="header-left">
      <img src="/Blicklelogo.png" alt="Blickle" class="header-logo" />
      <div class="header-divider"></div>
      <span class="header-subtitle">Digitales Schwarzes Brett</span>
    </div>
    <div class="header-center">
      <span class="header-title">{{ pageTitle }}</span>
      <span class="header-title-glow">{{ pageTitle }}</span>
    </div>
    <div class="header-right">
      <div class="header-clock">{{ time }}</div>
      <div class="header-date">{{ date }}</div>
    </div>
    <button class="header-action-btn" @click="emit('toggle-nav')" :title="navPosition === 'bottom' ? 'Sidebar-Navigation' : 'Bottom-Navigation'">
      <span v-if="navPosition === 'bottom'">&#9776;</span>
      <span v-else>&#9866;</span>
    </button>
    <button class="header-action-btn" @click="emit('toggle-theme')" :title="theme === 'dark' ? 'Light Mode' : 'Dark Mode'">
      <span v-if="theme === 'dark'">&#9788;</span>
      <span v-else>&#9790;</span>
    </button>
  </header>
</template>

<style scoped>
.display-header {
  height: 72px;
  background: var(--d-header-bg);
  backdrop-filter: var(--d-backdrop-blur);
  border-bottom: 3px solid var(--d-header-border);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 24px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: background 0.4s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-logo {
  height: 34px;
  width: auto;
  filter: none;
}

.header-divider {
  width: 1px;
  height: 28px;
  background: var(--d-divider);
}

.header-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--d-subtitle);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-center {
  flex: 1;
  text-align: center;
  position: relative;
}

.header-title {
  font-family: 'Outfit', sans-serif;
  color: var(--d-clock);
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.header-title-glow {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: var(--d-accent-glow);
  filter: blur(8px);
  pointer-events: none;
  z-index: 0;
}

.header-right {
  text-align: right;
}

.header-clock {
  font-family: 'Outfit', sans-serif;
  color: var(--d-clock);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
}

.header-date {
  font-family: 'DM Sans', sans-serif;
  color: var(--d-date);
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 2px;
  letter-spacing: 0.02em;
}

.header-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--d-header-btn-bg);
  border: 1px solid var(--d-header-btn-border);
  color: var(--d-clock);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.header-action-btn:hover {
  background: rgba(181, 204, 24, 0.15);
}
</style>
