<script setup>
import {
  Home, UtensilsCrossed, Info, Factory, Share2,
  CalendarDays, Video, Image, LayoutGrid, Briefcase
} from 'lucide-vue-next'

defineProps({
  navGroups: { type: Array, required: true },
  activeGroupId: { type: String, default: '' },
  position: { type: String, default: 'bottom' } // 'bottom' | 'sidebar'
})

const emit = defineEmits(['select'])

const iconMap = {
  'home': Home,
  'utensils': UtensilsCrossed,
  'info': Info,
  'factory': Factory,
  'share': Share2,
  'calendar': CalendarDays,
  'video': Video,
  'image': Image,
  'layout': LayoutGrid,
  'briefcase': Briefcase,
}

function getIcon(group) {
  if (group.iconName && iconMap[group.iconName]) {
    return iconMap[group.iconName]
  }
  return null
}
</script>

<template>
  <nav :class="['display-nav', `display-nav--${position}`]">
    <button
      v-for="group in navGroups"
      :key="group.id"
      :class="['nav-btn', { active: group.id === activeGroupId }]"
      @click="emit('select', group.firstPageIndex)"
    >
      <span class="nav-icon">
        <component
          v-if="getIcon(group)"
          :is="getIcon(group)"
          :size="position === 'sidebar' ? 22 : 20"
          :stroke-width="1.75"
        />
        <span v-else v-html="group.icon"></span>
      </span>
      <span class="nav-label">{{ group.label }}</span>
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
  border: none;
}

.nav-btn:hover {
  background: var(--d-surface-hover);
  color: var(--d-nav-text-hover);
}

.nav-btn.active {
  background: var(--d-accent, #B5CC18);
  color: var(--d-accent-text, #181e00);
  border-radius: 20px;
  transform: scale(1.1);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
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
  border-left: none;
  box-shadow: -1px 0 0 var(--d-ghost-border);
  padding: 16px 10px;
  gap: 6px;
}

.display-nav--sidebar .nav-btn {
  padding: 16px 10px;
  font-size: 0.8rem;
}

.display-nav--sidebar .nav-icon {
  font-size: 1.35rem;
}

.display-nav--sidebar .nav-label {
  font-size: 0.7rem;
}

/* ===== BOTTOM VARIANT (unten, horizontal) ===== */
.display-nav--bottom {
  height: 84px;
  flex-direction: row;
  border-top: none;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  padding: 8px 32px 16px;
  gap: 4px;
  justify-content: space-evenly;
}

.display-nav--bottom .nav-btn {
  flex: 1;
  max-width: 160px;
  min-width: 0;
  padding: 10px 8px;
  font-size: 0.75rem;
  border-radius: 16px;
}

.display-nav--bottom .nav-btn.active {
  border-radius: 20px;
  padding: 10px 16px;
}

.display-nav--bottom .nav-icon {
  font-size: 1.3rem;
}

.display-nav--bottom .nav-label {
  font-size: 0.65rem;
}
</style>
