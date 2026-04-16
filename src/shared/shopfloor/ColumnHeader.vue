<script setup>
defineProps({
  letter: { type: String, required: true },
  label:  { type: String, required: true },
  accent: { type: String, default: '#B5CC18' },
})
</script>

<template>
  <div class="col-header">
    <div class="letter" :style="{ color: accent, textShadow: `0 0 18px ${accent}55` }">{{ letter }}</div>
    <div class="label">{{ label }}</div>
    <div class="accent-bar" :style="{ background: accent }"></div>
  </div>
</template>

<style scoped>
.col-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  position: relative;
  padding-bottom: 12px;
}
.letter {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 58px;
  line-height: 1;
  letter-spacing: -0.02em;
}
.label {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.accent-bar {
  margin-top: 6px;
  width: 48px;
  height: 3px;
  border-radius: 2px;
}
</style>
