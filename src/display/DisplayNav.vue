<script setup>
defineProps({
  pages: { type: Array, required: true },
  activeIndex: { type: Number, default: 0 },
  position: { type: String, default: 'bottom' } // 'bottom' | 'sidebar'
})

const emit = defineEmits(['select'])
</script>

<template>
  <nav :class="['display-nav', `display-nav--${position}`]">
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
/* ===== SHARED BASE ===== */
.display-nav {
  background: var(--d-nav-bg);
  backdrop-filter: var(--d-nav-backdrop);
  display: flex;
  flex-shrink: 0;
  transition: background 0.4s ease;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--d-nav-text);
  font-family: 'DM Sans', sans-serif;
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
  margin-bottom: 3px;
  transition: transform 0.2s ease;
}

.nav-btn.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ===== SIDEBAR VARIANT (rechts, vertikal) ===== */
.display-nav--sidebar {
  width: 140px;
  flex-direction: column;
  border-left: 1px solid var(--d-nav-border);
  padding: 12px 8px;
  gap: 6px;
}

.display-nav--sidebar .nav-btn {
  padding: 14px 8px;
  font-size: 0.8rem;
}

.display-nav--sidebar .nav-icon {
  font-size: 1.35rem;
}

.display-nav--sidebar .nav-label {
  font-size: 0.65rem;
}

.display-nav--sidebar .nav-active-bar {
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

/* ===== BOTTOM VARIANT (unten, horizontal) ===== */
.display-nav--bottom {
  height: 64px;
  flex-direction: row;
  border-top: 1px solid var(--d-nav-border);
  padding: 4px 12px;
  gap: 4px;
  justify-content: space-evenly;
}

.display-nav--bottom .nav-btn {
  flex: 1;
  max-width: 180px;
  min-width: 0;
  padding: 6px 4px;
  font-size: 0.75rem;
  border-radius: 8px;
}

.display-nav--bottom .nav-icon {
  font-size: 1.3rem;
}

.display-nav--bottom .nav-label {
  font-size: 0.58rem;
}

.display-nav--bottom .nav-active-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 28px;
  background: var(--d-accent);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 0 8px rgba(181, 204, 24, 0.5);
}
</style>
