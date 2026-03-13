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
const isFullscreen = computed(() => currentPage.value?.layout === 'fullscreen')
const isFullscreenVideo = computed(() => {
  if (!isFullscreen.value) return false
  const zone = currentPage.value?.zones?.[0]
  return zone?.mediaType === 'video'
})

const scale = ref(1)
let cycleTimer = null

// Fullscreen overlay: tap to show header/nav over video/poster
const showFullscreenOverlay = ref(false)
let overlayTimer = null

function toggleFullscreenOverlay() {
  if (!isFullscreen.value) return
  showFullscreenOverlay.value = !showFullscreenOverlay.value
  if (showFullscreenOverlay.value) {
    stopCycle()
    clearTimeout(overlayTimer)
    overlayTimer = setTimeout(() => {
      showFullscreenOverlay.value = false
      startCycle()
    }, 5000)
  } else {
    clearTimeout(overlayTimer)
    startCycle()
  }
}

function onOverlayNavSelect(index) {
  showFullscreenOverlay.value = false
  clearTimeout(overlayTimer)
  setPage(index)
}

// Called by FullscreenMedia when video ends
function onMediaEnded() {
  nextPage()
}

// Get duration for current page: from playlist or page default or global fallback
function getPageDuration() {
  const page = currentPage.value
  // For fullscreen video pages, use a long safety timeout (video ended event triggers nextPage)
  if (isFullscreenVideo.value) {
    return 300 * 1000 // 5 min safety timeout
  }
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
  clearTimeout(overlayTimer)
})
</script>

<template>
  <div class="display-viewport">
    <div class="display-root" :data-theme="theme" :class="{ 'fullscreen-overlay-active': showFullscreenOverlay }" :style="{ transform: `scale(${scale})` }">
      <!-- Animated background layers -->
      <div class="bg-gradient"></div>
      <div class="bg-grid"></div>

      <DisplayHeader
        v-if="!isFullscreen || showFullscreenOverlay"
        :pageTitle="currentPage.label"
        @toggle-theme="toggleTheme"
        @toggle-nav="toggleNavPosition"
        :navPosition="navPosition"
        :class="{ 'overlay-header': isFullscreen && showFullscreenOverlay }"
      />

      <div :class="['display-body', `display-body--${navPosition}`, { 'display-body--fullscreen': isFullscreen }]">
        <div :class="['display-content', { 'is-transitioning': transitioning, 'is-fullscreen': isFullscreen }]">
          <DisplayGrid :page="currentPage" @media-ended="onMediaEnded" />
        </div>
        <DisplayNav
          v-if="navPosition === 'sidebar' && !isFullscreen"
          :pages="pages"
          :activeIndex="currentPageIndex"
          position="sidebar"
          @select="setPage" />
      </div>

      <!-- Fullscreen tap zone: click anywhere to show overlay nav -->
      <div
        v-if="isFullscreen && !showFullscreenOverlay"
        class="fullscreen-tap-zone"
        @click="toggleFullscreenOverlay"
      />

      <DisplayNav
        v-if="(navPosition === 'bottom' && !isFullscreen) || showFullscreenOverlay"
        :pages="pages"
        :activeIndex="currentPageIndex"
        position="bottom"
        :class="{ 'overlay-nav': isFullscreen && showFullscreenOverlay }"
        @select="onOverlayNavSelect" />

      <DisplayTicker v-if="!isFullscreen" :messages="tickerMessages" />

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

.display-content.is-fullscreen {
  padding: 0;
}

.display-body--fullscreen {
  flex: 1;
}

/* Fullscreen tap zone: invisible overlay to capture clicks */
.fullscreen-tap-zone {
  position: absolute;
  inset: 0;
  z-index: 5;
  cursor: pointer;
}

/* Overlay header: floats over fullscreen content */
.overlay-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(10px);
  animation: overlay-fade-in 0.3s ease;
}

/* Overlay nav: floats over fullscreen content */
.overlay-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(10px);
  animation: overlay-fade-in 0.3s ease;
}

@keyframes overlay-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
