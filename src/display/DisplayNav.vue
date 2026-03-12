<script setup>
defineProps({
  pages: { type: Array, required: true },
  activeIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['select'])
</script>

<template>
  <nav class="display-nav">
    <button
      v-for="(page, index) in pages"
      :key="page.id"
      :class="['nav-btn', { active: index === activeIndex }]"
      @click="emit('select', index)"
    >
      <span class="nav-icon" v-html="page.icon"></span>
      <span class="nav-label">{{ page.label }}</span>
      <span class="nav-active-bar" v-if="index === activeIndex"></span>
    </button>
  </nav>
</template>

<style scoped>
.display-nav {
  width: 140px;
  background: var(--d-nav-bg);
  backdrop-filter: var(--d-nav-backdrop);
  border-left: 1px solid var(--d-nav-border);
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 6px;
  flex-shrink: 0;
  transition: background 0.4s ease;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  border-radius: 10px;
  color: var(--d-nav-text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid transparent;
}

.nav-btn:hover {
  background: var(--d-surface-hover);
  color: var(--d-nav-text-hover);
  border-color: var(--d-border);
}

.nav-btn.active {
  background: var(--d-nav-active-bg);
  color: var(--d-accent);
  border-color: var(--d-nav-active-border);
  box-shadow: 0 0 20px var(--d-nav-active-shadow);
}

.nav-icon {
  font-size: 1.35rem;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
}

.nav-btn.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-active-bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--d-accent);
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 8px rgba(181, 204, 24, 0.5);
}
</style>
