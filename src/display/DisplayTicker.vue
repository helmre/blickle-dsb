<script setup>
import { computed } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] }
})

const tickerText = computed(() => props.messages.join('   \u2022   '))
</script>

<template>
  <div class="display-ticker">
    <div class="ticker-label">INFO</div>
    <div class="ticker-track-wrap">
      <div class="ticker-track">
        <span class="ticker-text">{{ tickerText }}&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;{{ tickerText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.display-ticker {
  height: 48px;
  background: var(--d-ticker-bg);
  backdrop-filter: var(--d-backdrop-blur);
  border-top: none;
  box-shadow: 0 -1px 0 var(--d-ghost-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: background 0.4s ease;
}

.ticker-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: var(--d-accent-text);
  background: var(--d-accent);
  padding: 6px 16px;
  margin-left: 16px;
  margin-right: 16px;
  border-radius: 20px;
  flex-shrink: 0;
}

.ticker-track-wrap {
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, black 40px, black calc(100% - 40px), transparent);
}

.ticker-track {
  white-space: nowrap;
  animation: ticker-scroll 50s linear infinite;
}

.ticker-text {
  font-family: 'DM Sans', sans-serif;
  color: var(--d-ticker-text);
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0.02em;
}

@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
