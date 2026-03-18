<script setup>
import { computed } from 'vue'
import ScheduleTable from './zones/ScheduleTable.vue'
import CanteenMenu from './zones/CanteenMenu.vue'
import CanteenWeekly from './zones/CanteenWeekly.vue'
import WeatherWidget from './zones/WeatherWidget.vue'
import NewsFeed from './zones/NewsFeed.vue'
import AnnouncementCard from './zones/AnnouncementCard.vue'
import ScheduleWeekly from './zones/ScheduleWeekly.vue'
import TemplateRenderer from './zones/TemplateRenderer.vue'
import SocialWall from './zones/SocialWall.vue'
import KarriereZone from './zones/KarriereZone.vue'
import ProduktionNews from './zones/ProduktionNews.vue'
import FullscreenMedia from './zones/FullscreenMedia.vue'

const props = defineProps({
  page: { type: Object, required: true },
  mediaPaused: { type: Boolean, default: false }
})

const emit = defineEmits(['media-ended'])

const componentMap = {
  'schedule-table': ScheduleTable,
  'canteen-menu': CanteenMenu,
  'canteen-weekly': CanteenWeekly,
  'weather': WeatherWidget,
  'news-feed': NewsFeed,
  'announcement': AnnouncementCard,
  'schedule-weekly': ScheduleWeekly,
  'template': TemplateRenderer,
  'media': TemplateRenderer,
  'embed': TemplateRenderer,
  'social-wall': SocialWall,
  'karriere': KarriereZone,
  'produktion-news': ProduktionNews,
  'fullscreen-media': FullscreenMedia,
}

const isCustomLayout = computed(() => props.page.layout === 'custom' && props.page.customGrid)

const gridClass = computed(() => {
  if (isCustomLayout.value) return 'grid-custom'
  return `grid-${props.page.layout}`
})

const customGridStyle = computed(() => {
  if (!isCustomLayout.value) return null
  const { columns, rows } = props.page.customGrid
  return {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  }
})

function getZoneStyle(zone) {
  if (!isCustomLayout.value || !zone.gridColumn) return null
  return {
    gridColumn: zone.gridColumn,
    gridRow: zone.gridRow,
  }
}
</script>

<template>
  <div :class="['display-grid', gridClass]" :style="customGridStyle">
    <div
      v-for="(zone, index) in page.zones"
      :key="zone.id"
      class="grid-zone"
      :style="{ ...getZoneStyle(zone), '--zone-index': index }"
    >
      <component
        :is="componentMap[zone.type]"
        :title="zone.title"
        :zoneId="zone.id"
        :contentId="zone.contentId || null"
        :contentIndex="zone.contentIndex ?? null"
        :mediaUrl="zone.mediaUrl || null"
        :mediaType="zone.mediaType || null"
        :paused="mediaPaused"
        @media-ended="emit('media-ended')"
      />
    </div>
  </div>
</template>

<style scoped>
.display-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 20px;
}

.grid-2x2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-2x1 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

.grid-3x2 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-full {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-fullscreen {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  gap: 0;
}

.grid-fullscreen .grid-zone {
  border-radius: 0;
  border: none;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
}

/* Custom grid: columns/rows set via inline style */
.grid-custom {
  /* Base styles - template set by customGridStyle */
}

.grid-zone {
  background: var(--d-surface-structural);
  border: 1px solid var(--d-ghost-border);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(16px);
  box-shadow: var(--d-zone-shadow);
  transition: background 0.4s ease, border-color 0.3s ease, box-shadow 0.4s ease, transform 0.25s ease;
  /* Staggered entry animation */
  animation: zone-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--zone-index, 0) * 80ms);
}

.grid-zone:hover {
  border-color: var(--d-ghost-border-accent);
  transform: scale(1.005);
  box-shadow: var(--d-editorial-shadow);
}

@keyframes zone-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
