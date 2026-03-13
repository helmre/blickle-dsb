<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  zoneId: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: 'image' },
})

const emit = defineEmits(['media-ended'])

const videoRef = ref(null)

function onVideoEnded() {
  emit('media-ended')
}

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.play().catch(() => {})
  }
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<template>
  <div class="zone-fullscreen-media">
    <!-- Video -->
    <video
      v-if="mediaType === 'video' && mediaUrl"
      ref="videoRef"
      :src="mediaUrl"
      autoplay
      muted
      playsinline
      @ended="onVideoEnded"
      class="fs-video"
    ></video>

    <!-- Image -->
    <img
      v-else-if="mediaType === 'image' && mediaUrl"
      :src="mediaUrl"
      :alt="title"
      class="fs-image"
    />

    <!-- Fallback -->
    <div v-else class="fs-fallback">
      <span class="fs-fallback-icon">&#127909;</span>
      <span>Kein Medium verfuegbar</span>
    </div>

    <!-- Title overlay -->
    <div v-if="title" class="fs-overlay">
      <span class="fs-title">{{ title }}</span>
    </div>
  </div>
</template>

<style scoped>
.zone-fullscreen-media {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
}

.fs-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fs-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fs-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 3rem 2rem 1.5rem;
  pointer-events: none;
}

.fs-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #E8ECF4;
  letter-spacing: 0.02em;
}

.fs-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(232, 236, 244, 0.3);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
}

.fs-fallback-icon {
  font-size: 3rem;
  opacity: 0.5;
}
</style>
