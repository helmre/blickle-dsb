<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useEmergencyStore } from '../shared/stores/emergencyStore.js'
import { useDisplayTheme } from '../shared/composables/useDisplayTheme.js'
import { useDisplayContent } from '../shared/composables/useDisplayContent.js'
import DisplayHeader from './DisplayHeader.vue'
import DisplayNav from './DisplayNav.vue'
import DisplayTicker from './DisplayTicker.vue'
import DisplayGrid from './DisplayGrid.vue'
import DisplayEmergency from './DisplayEmergency.vue'
import './display-themes.css'

const emergencyStore = useEmergencyStore()
const { theme, toggleTheme, navPosition, toggleNavPosition } = useDisplayTheme()
const { displayPages: pages, tickerMessages, activePlaylist } = useDisplayContent()

const currentPageIndex = ref(0)
const currentPage = computed(() => pages.value[currentPageIndex.value] || pages.value[0])
const transitioning = ref(false)

const scale = ref(1)
let cycleTimer = null

// Get duration for current page: from playlist or page default or global fallback
function getPageDuration() {
  const page = currentPage.value
  return (page?.duration || 15) * 1000
}

function setPage(index) {
  if (index === currentPageIndex.value) return
  transitioning.value = true
  setTimeout(() => {
    currentPageIndex.value = index
    setTimeout(() => { transitioning.value = false }, 50)
  }, 300)
  stopCycle()
  startCycle()
}

function nextPage() {
  const next = (currentPageIndex.value + 1) % pages.value.length
  setPage(next)
}

function calculateScale() {
  const sw = window.innerWidth / 1920
  const sh = window.innerHeight / 1080
  scale.value = Math.max(sw, sh)
}

function startCycle() {
  stopCycle()
  // Use per-page duration from playlist/page config
  cycleTimer = setTimeout(() => {
    nextPage()
  }, getPageDuration())
}

function stopCycle() {
  if (cycleTimer) {
    clearTimeout(cycleTimer)
    cycleTimer = null
  }
}

onMounted(() => {
  calculateScale()
  window.addEventListener('resize', calculateScale)
  startCycle()
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateScale)
  stopCycle()
})
</script>

<template>
  <div class="display-viewport">
    <div class="display-root" :data-theme="theme" :style="{ transform: `scale(${scale})` }">
      <!-- Animated background layers -->
      <div class="bg-gradient"></div>
      <div class="bg-grid"></div>

      <DisplayHeader
        :pageTitle="currentPage.label"
        @toggle-theme="toggleTheme"
        @toggle-nav="toggleNavPosition"
        :navPosition="navPosition"
      />

      <div :class="['display-body', `display-body--${navPosition}`]">
        <div :class="['display-content', { 'is-transitioning': transitioning }]">
          <DisplayGrid :page="currentPage" />
        </div>
        <DisplayNav
          v-if="navPosition === 'sidebar'"
          :pages="pages"
          :activeIndex="currentPageIndex"
          position="sidebar"
          @select="setPage" />
      </div>

      <DisplayNav
        v-if="navPosition === 'bottom'"
        :pages="pages"
        :activeIndex="currentPageIndex"
        position="bottom"
        @select="setPage" />

      <DisplayTicker :messages="tickerMessages" />

      <DisplayEmergency
        v-if="emergencyStore.activeEmergency"
        :emergency="emergencyStore.activeEmergency"
        @dismiss="emergencyStore.dismiss(emergencyStore.activeEmergency.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.display-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.display-root {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: top left;
  overflow: hidden;
  background: var(--d-bg);
  font-family: 'DM Sans', 'Outfit', sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  color: var(--d-text);
  transition: background 0.4s ease, color 0.4s ease;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 5% 95%, var(--d-bg-gradient-1) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 95% 5%, var(--d-bg-gradient-2) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 50% 50%, var(--d-bg-gradient-3) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
  transition: background 0.4s ease;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--d-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--d-grid-line) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

.display-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* Sidebar: Content + Nav nebeneinander (row) – Standard */
.display-body--sidebar {
  flex-direction: row;
}

/* Bottom: Content nimmt volle Breite */
.display-body--bottom {
  flex-direction: column;
}

.display-content {
  flex: 1;
  overflow: hidden;
  padding: 14px 20px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.display-content.is-transitioning {
  opacity: 0;
  transform: translateY(10px);
}
</style>
