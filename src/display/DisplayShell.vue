<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useEmergencyStore } from '../shared/stores/emergencyStore.js'
import { useLocationStore } from '../shared/stores/locationStore.js'
import { useDisplayTheme } from '../shared/composables/useDisplayTheme.js'
import { useDisplayContent } from '../shared/composables/useDisplayContent.js'
import { calculateDisplayScale } from './displayScale.js'
import { isEmergencyTargetedForDisplay } from '../shared/displayEngine/contentEligibility.js'
import { loadDisplayPreview } from '../shared/utils/displayPreview.js'
import DisplayHeader from './DisplayHeader.vue'
import DisplayNav from './DisplayNav.vue'
import DisplayTicker from './DisplayTicker.vue'
import DisplayGrid from './DisplayGrid.vue'
import DisplayEmergency from './DisplayEmergency.vue'
import './display-themes.css'

const route = useRoute()
const locationId = computed(() => route.params.locationId || route.query.location || null)
const previewPayload = ref(null)
const previewToken = computed(() => {
  const token = route.query.preview
  if (Array.isArray(token)) return token[0] || ''
  return token || ''
})
const previewContent = computed(() => previewPayload.value?.content || null)

const emergencyStore = useEmergencyStore()
const locationStore = useLocationStore()
const { theme, toggleTheme, navPosition, toggleNavPosition } = useDisplayTheme()
const { displayPages: pages, navGroups, tickerMessages, activePlaylist } = useDisplayContent(locationId, { previewContent })
const isPreviewMode = computed(() => !!previewContent.value)

const isEmergencyTargeted = computed(() => {
  return isEmergencyTargetedForDisplay(emergencyStore.activeEmergency, locationId.value, locationStore.items)
})

const currentPageIndex = ref(0)
const currentPage = computed(() => pages.value[currentPageIndex.value] || pages.value[0])
const activeGroupId = computed(() => currentPage.value?.navGroupId || '')
const transitioning = ref(false)
const isFullscreen = computed(() => currentPage.value?.layout === 'fullscreen')
const currentPrimaryZone = computed(() => currentPage.value?.zones?.[0] || null)
const isDocumentFullscreen = computed(() => isFullscreen.value && currentPrimaryZone.value?.type === 'pdf')
const isImmersiveFullscreen = computed(() => isFullscreen.value && !isDocumentFullscreen.value)
const pageTransition = computed(() => currentPage.value?.transition || 'fade')
const isFullscreenVideo = computed(() => {
  if (!isFullscreen.value) return false
  return currentPrimaryZone.value?.mediaType === 'video'
})

const scale = ref(1)
const progressDuration = ref(15) // seconds for progress bar animation
const progressActive = ref(false)
const progressKey = ref(0) // increment to restart animation
let cycleTimer = null
let transitionTimer = null
let resumeTimer = null

// Offline detection
const canReadOnlineState = typeof navigator !== 'undefined' && 'onLine' in navigator
const isOffline = ref(canReadOnlineState ? !navigator.onLine : false)
function onOnline() { isOffline.value = false }
function onOffline() { isOffline.value = true }

// Fullscreen overlay: tap to show header/nav over video/poster
const showFullscreenOverlay = ref(false)
let overlayTimer = null

// Swipe gesture tracking
const touchStartX = ref(0)
const touchStartY = ref(0)
const swipeOffset = ref(0)
const isSwiping = ref(false)

function onTouchStart(e) {
  if (showFullscreenOverlay.value) return
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  isSwiping.value = false
  swipeOffset.value = 0
}

function onTouchMove(e) {
  if (showFullscreenOverlay.value) return
  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value
  // Only horizontal swipe (ignore vertical scroll)
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
    isSwiping.value = true
    swipeOffset.value = dx * 0.3 // Damped offset for visual feedback
  }
}

function onTouchEnd(e) {
  if (showFullscreenOverlay.value) return
  const touch = e.changedTouches[0]
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value
  swipeOffset.value = 0

  // Minimum 80px horizontal swipe, mostly horizontal
  if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    if (dx < 0) {
      // Swipe left → next page
      nextPage()
    } else {
      // Swipe right → previous page
      const prev = (currentPageIndex.value - 1 + pages.value.length) % pages.value.length
      setPage(prev)
    }
  }
  isSwiping.value = false
}

function toggleFullscreenOverlay() {
  if (!isImmersiveFullscreen.value) return
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
  const pageCount = pages.value.length
  if (pageCount === 0) return
  const safeIndex = ((index % pageCount) + pageCount) % pageCount
  if (safeIndex === currentPageIndex.value) return
  clearTimeout(transitionTimer)
  clearTimeout(resumeTimer)
  stopCycle()
  transitioning.value = true
  transitionTimer = setTimeout(() => {
    currentPageIndex.value = safeIndex
    resumeTimer = setTimeout(() => {
      transitioning.value = false
      startCycle()
    }, 50)
  }, 300)
}

function nextPage() {
  if (pages.value.length <= 1) return
  const next = (currentPageIndex.value + 1) % pages.value.length
  setPage(next)
}

function prevPage() {
  if (pages.value.length <= 1) return
  const prev = (currentPageIndex.value - 1 + pages.value.length) % pages.value.length
  setPage(prev)
}

function calculateScale() {
  scale.value = calculateDisplayScale(window.innerWidth, window.innerHeight)
}

function startCycle() {
  stopCycle()
  if (pages.value.length <= 1) return
  const duration = getPageDuration()
  // Start progress bar (not for fullscreen video – those end on video-ended)
  if (!isFullscreenVideo.value) {
    progressDuration.value = duration / 1000
    progressKey.value++
    progressActive.value = true
  } else {
    progressActive.value = false
  }
  cycleTimer = setTimeout(() => {
    nextPage()
  }, duration)
}

function stopCycle() {
  if (cycleTimer) {
    clearTimeout(cycleTimer)
    cycleTimer = null
  }
}

function dismissEmergency(id) {
  if (!id) return
  emergencyStore.dismiss(id)
}

onMounted(() => {
  calculateScale()
  window.addEventListener('resize', calculateScale)
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  startCycle()
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateScale)
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
  stopCycle()
  clearTimeout(transitionTimer)
  clearTimeout(resumeTimer)
  clearTimeout(overlayTimer)
})

watch(() => pages.value.map(page => `${page.id}:${page.duration || 15}`).join('|'), () => {
  if (currentPageIndex.value >= pages.value.length) currentPageIndex.value = 0
  startCycle()
})

watch(previewToken, (token) => {
  previewPayload.value = loadDisplayPreview(token)
  currentPageIndex.value = 0
  startCycle()
}, { immediate: true })
</script>

<template>
  <div class="display-viewport">
    <div class="display-root" :data-theme="theme" :class="{ 'fullscreen-overlay-active': showFullscreenOverlay }" :style="{ transform: `scale(${scale})` }">
      <!-- Offline Banner -->
      <transition name="offline-banner">
        <div v-if="isOffline" class="offline-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
          <span>Offline-Modus &ndash; Letzte gespeicherte Inhalte</span>
        </div>
      </transition>

      <!-- Animated background layers -->
      <div class="bg-gradient"></div>
      <div class="bg-grid"></div>

      <div v-if="isPreviewMode" class="preview-ribbon">Entwurfs-Vorschau</div>

      <DisplayHeader
        v-if="!isImmersiveFullscreen || showFullscreenOverlay"
        :pageTitle="currentPage.label"
        @toggle-theme="toggleTheme"
        @toggle-nav="toggleNavPosition"
        :navPosition="navPosition"
        :class="{ 'overlay-header': isImmersiveFullscreen && showFullscreenOverlay }"
      />

      <!-- Page progress bar -->
      <div v-if="progressActive && !isFullscreen" class="page-progress-track">
        <div
          :key="progressKey"
          class="page-progress-bar"
          :style="{ animationDuration: `${progressDuration}s` }"
        />
      </div>

      <div :class="['display-body', `display-body--${navPosition}`, { 'display-body--fullscreen': isImmersiveFullscreen, 'display-body--document': isDocumentFullscreen }]">
        <div
          :class="['display-content', `transition-${pageTransition}`, { 'is-transitioning': transitioning, 'is-fullscreen': isImmersiveFullscreen, 'is-document': isDocumentFullscreen }]"
          :style="swipeOffset ? { transform: `translateX(${swipeOffset}px)` } : null"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend.passive="onTouchEnd"
        >
          <DisplayGrid :page="currentPage" :mediaPaused="showFullscreenOverlay" @media-ended="onMediaEnded" />

          <!-- Page hint arrows: tap/click to skip to prev/next page -->
          <button
            v-if="!isImmersiveFullscreen"
            class="page-arrow page-arrow--prev"
            :class="{ 'page-arrow--sidebar': navPosition === 'sidebar' }"
            aria-label="Vorherige Seite"
            @click.stop="prevPage"
          >
            <ChevronLeft :size="32" :stroke-width="2.25" />
          </button>
          <button
            v-if="!isImmersiveFullscreen"
            class="page-arrow page-arrow--next"
            :class="{ 'page-arrow--sidebar': navPosition === 'sidebar' }"
            aria-label="Nächste Seite"
            @click.stop="nextPage"
          >
            <ChevronRight :size="32" :stroke-width="2.25" />
          </button>
        </div>
        <DisplayNav
          v-if="navPosition === 'sidebar' && !isImmersiveFullscreen"
          :navGroups="navGroups"
          :activeGroupId="activeGroupId"
          position="sidebar"
          @select="setPage" />
      </div>

      <!-- Fullscreen tap zone: click anywhere to show overlay nav -->
      <div
        v-if="isImmersiveFullscreen && !showFullscreenOverlay"
        class="fullscreen-tap-zone"
        @click="toggleFullscreenOverlay"
      />

      <DisplayNav
        v-if="(navPosition === 'bottom' && !isImmersiveFullscreen) || showFullscreenOverlay"
        :navGroups="navGroups"
        :activeGroupId="activeGroupId"
        position="bottom"
        :class="{ 'overlay-nav': isImmersiveFullscreen && showFullscreenOverlay }"
        @select="onOverlayNavSelect" />

      <DisplayTicker v-if="!isFullscreen" :messages="tickerMessages" />

      <DisplayEmergency
        v-if="emergencyStore.activeEmergency && isEmergencyTargeted"
        :emergency="emergencyStore.activeEmergency"
        @dismiss="dismissEmergency"
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
  align-items: center;
  justify-content: center;
}

.display-root {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: center center;
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

.preview-ribbon {
  position: absolute;
  top: 18px;
  left: 50%;
  z-index: 20;
  transform: translateX(-50%);
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--d-accent, #B5CC18);
  color: var(--d-accent-text, #181e00);
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
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
  padding: 20px 28px;
  position: relative;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Page skip arrows — float over content, tap to skip prev/next */
.page-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 1px solid var(--d-ghost-border, rgba(255,255,255,0.15));
  background: var(--d-surface-hover, rgba(22, 58, 108, 0.35));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--d-text, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.35;
  transition: opacity 0.25s ease, transform 0.2s ease, background 0.25s ease;
  padding: 0;
}

.page-arrow:hover,
.page-arrow:focus-visible {
  opacity: 1;
  background: var(--d-accent, #B5CC18);
  color: var(--d-accent-text, #181e00);
  outline: none;
}

.page-arrow:active {
  transform: translateY(-50%) scale(0.94);
}

.page-arrow--prev { left: 16px; }
.page-arrow--next { right: 16px; }

/* When sidebar nav is active on the right, nudge the right arrow left */
.page-arrow--sidebar.page-arrow--next { right: 24px; }

.display-content.is-transitioning {
  opacity: 0;
  transform: translateY(10px);
}

.display-content.transition-slide.is-transitioning {
  transform: translateX(-20px);
}

.display-content.transition-none.is-transitioning {
  opacity: 1;
  transform: none;
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
  background: rgba(8, 12, 24, 0.70) !important;
  backdrop-filter: var(--d-glass-blur);
  animation: overlay-fade-in 0.3s ease;
}

/* Overlay nav: floats over fullscreen content */
.overlay-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(8, 12, 24, 0.70) !important;
  backdrop-filter: var(--d-glass-blur);
  animation: overlay-fade-in 0.3s ease;
}

@keyframes overlay-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page progress bar */
.page-progress-track {
  width: 100%;
  height: 3px;
  background: transparent;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.page-progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, var(--d-accent), var(--d-accent-light, var(--d-accent)));
  border-radius: 0 2px 2px 0;
  animation: progress-fill linear forwards;
  box-shadow: 0 0 8px rgba(181, 204, 24, 0.4);
}

@keyframes progress-fill {
  from { width: 0%; }
  to { width: 100%; }
}

/* Offline banner */
.offline-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.offline-banner-enter-active {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}
.offline-banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.offline-banner-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.offline-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
