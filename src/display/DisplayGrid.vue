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

const props = defineProps({
  page: { type: Object, required: true }
})

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
      v-for="zone in page.zones"
      :key="zone.id"
      class="grid-zone"
      :style="getZoneStyle(zone)"
    >
      <component
        :is="componentMap[zone.type]"
        :title="zone.title"
        :zoneId="zone.id"
        :contentId="zone.contentId || null"
        :contentIndex="zone.contentIndex ?? null"
      />
    </div>
  </div>
</template>

<style scoped>
.display-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 14px;
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

/* Custom grid: columns/rows set via inline style */
.grid-custom {
  /* Base styles - template set by customGridStyle */
}

.grid-zone {
  background: var(--d-surface);
  border: 1px solid var(--d-border);
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(6px);
  box-shadow: var(--d-zone-shadow);
  transition: background 0.4s ease, border-color 0.3s ease, box-shadow 0.4s ease;
}

.grid-zone:hover {
  border-color: var(--d-border-accent);
}
</style>
