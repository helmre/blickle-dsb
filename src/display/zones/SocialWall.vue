<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  title: { type: String, default: 'Social Media' },
  zoneId: String
})

const facebookUrl = 'https://widgets.sociablekit.com/facebook-page-posts/iframe/25614094'
const linkedinUrl = 'https://widgets.sociablekit.com/linkedin-page-posts/iframe/25614053'

// Auto-refresh iframes every 5 minutes to keep feeds current
const refreshKey = ref(0)
let refreshTimer = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    refreshKey.value++
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div class="social-wall">
    <!-- Header -->
    <div class="sw-header">
      <div class="sw-header-accent"></div>
      <h3 class="sw-title">{{ title }}</h3>
      <span class="sw-subtitle">Blickle auf Social Media</span>
    </div>

    <!-- Feed Grid -->
    <div class="sw-feeds">
      <!-- Facebook -->
      <div class="sw-feed">
        <div class="sw-feed-header">
          <div class="sw-feed-icon sw-feed-icon-fb">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <span class="sw-feed-name">Facebook</span>
          <span class="sw-feed-badge">Live</span>
        </div>
        <div class="sw-feed-content">
          <iframe
            :key="'fb-' + refreshKey"
            :src="facebookUrl"
            frameborder="0"
            loading="lazy"
            allow="encrypted-media"
            class="sw-iframe"
          ></iframe>
        </div>
      </div>

      <!-- LinkedIn -->
      <div class="sw-feed">
        <div class="sw-feed-header">
          <div class="sw-feed-icon sw-feed-icon-li">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <span class="sw-feed-name">LinkedIn</span>
          <span class="sw-feed-badge">Live</span>
        </div>
        <div class="sw-feed-content">
          <iframe
            :key="'li-' + refreshKey"
            :src="linkedinUrl"
            frameborder="0"
            loading="lazy"
            allow="encrypted-media"
            class="sw-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-wall {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
}

/* ── Header ── */
.sw-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.sw-header-accent {
  width: 4px;
  height: 28px;
  border-radius: 2px;
  background: var(--d-accent, #B5CC18);
  flex-shrink: 0;
}

.sw-title {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--d-text, rgba(255,255,255,0.95));
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sw-subtitle {
  font-size: 0.75rem;
  color: var(--d-text-secondary, rgba(255,255,255,0.4));
  font-weight: 400;
}

/* ── Feed Grid ── */
.sw-feeds {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 0;
}

/* ── Individual Feed ── */
.sw-feed {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  min-height: 0;
}

.sw-feed-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.sw-feed-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sw-feed-icon-fb {
  background: rgba(24, 119, 242, 0.15);
  color: #1877F2;
}

.sw-feed-icon-li {
  background: rgba(10, 102, 194, 0.15);
  color: #0A66C2;
}

.sw-feed-name {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--d-text, rgba(255,255,255,0.9));
  flex: 1;
}

.sw-feed-badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(181, 204, 24, 0.15);
  color: var(--d-accent, #B5CC18);
  animation: pulse-badge 2.5s ease-in-out infinite;
}

/* ── iframe Container ── */
.sw-feed-content {
  flex: 1;
  min-height: 0;
  position: relative;
  background: #FFFFFF;
}

.sw-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
