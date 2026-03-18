<script setup>
import { computed } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] }
})

const tickerText = computed(() => props.messages.join('   +++   '))
</script>

<template>
  <div class="display-ticker">
    <div class="ticker-track-wrap">
      <div class="ticker-track">
        <span class="ticker-text">{{ tickerText }}&nbsp;&nbsp;&nbsp;+++&nbsp;&nbsp;&nbsp;{{ tickerText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.display-ticker {
  height: 48px;
  background: var(--d-accent, #B5CC18);
  overflow: hidden;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.ticker-track-wrap {
  flex: 1;
  overflow: hidden;
}

.ticker-track {
  white-space: nowrap;
  animation: ticker-scroll 50s linear infinite;
}

.ticker-text {
  font-family: 'DM Sans', sans-serif;
  color: #181e00;
  font-size: 0.95rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
