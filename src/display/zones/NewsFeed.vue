<script setup>
import { useDisplayContent } from '../../shared/composables/useDisplayContent.js'

defineProps({
  title: { type: String, default: 'News' },
  zoneId: String
})

const { newsItems } = useDisplayContent()

const categoryColors = {
  'Messen': '#3B82F6',
  'Mitarbeiter': '#B5CC18',
  'Organisation': '#F59E0B',
  'Nachhaltigkeit': '#10B981',
  'Produktion': '#8B5CF6',
  'Sicherheit': '#EF4444',
  'Stellenanzeige': '#EC4899',
  'Neuheiten': '#06B6D4',
  'Events': '#F97316',
  'Allgemein': '#6B7280',
}
</script>

<template>
  <div class="zone-news">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
    </div>
    <div class="zone-body">
      <div v-if="newsItems.length === 0" class="news-empty">
        Keine freigegebenen Inhalte vorhanden.
      </div>
      <div v-for="item in newsItems.slice(0, 4)" :key="item.id" class="news-item">
        <div class="news-meta">
          <span
            class="news-category"
            :style="{ background: (categoryColors[item.kategorie] || '#6B7280') + '22', color: categoryColors[item.kategorie] || '#6B7280' }"
          >{{ item.kategorie }}</span>
          <span class="news-date">{{ item.datum }}</span>
        </div>
        <div class="news-title">{{ item.title }}</div>
        <div class="news-text">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zone-news {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.zone-header {
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: none;
  background: var(--d-zone-header-bg);
}

.zone-header-accent {
  width: 4px;
  height: 22px;
  background: var(--d-accent);
  border-radius: 3px;
  flex-shrink: 0;
}

.zone-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--d-text);
  margin: 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.zone-body {
  flex: 1;
  padding: 16px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--d-text-faint);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
}

.news-item {
  padding: 16px 18px;
  background: var(--d-surface-content);
  border: none;
  border-radius: 8px;
  flex: 1;
  transition: background 0.2s ease;
}

.news-item:hover {
  background: var(--d-surface-content-hover);
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.news-category {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.news-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  color: var(--d-text-faint);
}

.news-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.0rem;
  font-weight: 700;
  color: var(--d-text);
  margin-bottom: 3px;
}

.news-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--d-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
