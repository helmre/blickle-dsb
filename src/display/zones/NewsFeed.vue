<script setup>
import { getSeedNewsData } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'News' },
  zoneId: String
})

const newsItems = getSeedNewsData()

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
  <div class="news-card">
    <!-- Header -->
    <div class="news-header">
      <h2 class="news-title">Aktuelles &amp; Mitteilungen</h2>
      <div class="news-dots">
        <span class="dot dot--active"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>

    <!-- Image Card Grid -->
    <div class="news-grid">
      <div v-for="item in newsItems.slice(0, 2)" :key="item.id" class="news-item group">
        <div class="news-image-wrap">
          <img :src="item.imageUrl" :alt="item.imageAlt || item.title" class="news-image" />
        </div>
        <div class="news-content">
          <span
            class="news-category"
            :style="{ color: categoryColors[item.kategorie] || '#6B7280' }"
          >{{ item.kategorie }}</span>
          <h3 class="news-item-title">{{ item.title }}</h3>
          <p class="news-text">{{ item.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-card {
  height: 100%;
  background: var(--d-surface-structural, #FFFFFF);
  border-radius: 16px;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.news-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--blickle-navy, #163A6C);
  margin: 0;
}

.news-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--d-surface-content, #e2e8f0);
}

.dot--active {
  background: var(--d-accent, #B5CC18);
}

.news-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.news-item {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.news-image-wrap {
  height: 192px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: var(--d-surface-content, #f1f5f9);
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.group:hover .news-image {
  transform: scale(1.05);
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.news-category {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.news-item-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--blickle-navy, #163A6C);
  margin: 2px 0 0;
  line-height: 1.3;
}

.news-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--d-text-muted, #6B6C68);
  line-height: 1.5;
  margin: 4px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
