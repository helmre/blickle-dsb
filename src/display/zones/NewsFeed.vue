<script setup>
import { getSeedNewsData } from '../../shared/utils/seedData.js'
import { ArrowRightCircle } from 'lucide-vue-next'

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
      <span class="news-action">Alle anzeigen <ArrowRightCircle :size="18" :stroke-width="1.8" /></span>
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
  border-radius: 8px;
  padding: 26px 34px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px var(--d-ghost-border, rgba(75, 76, 72, 0.05));
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.news-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--d-headline, #163A6C);
  margin: 0;
}

.news-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'DM Sans', sans-serif;
  color: var(--d-accent-muted, #8FA310);
  font-size: 0.78rem;
  font-weight: 800;
}

.news-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  min-height: 0;
}

.news-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.news-image-wrap {
  height: 146px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--d-surface-content, #f1f5f9);
  box-shadow: 0 8px 20px rgba(22, 58, 108, 0.09);
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  letter-spacing: 0;
}

.news-item-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--d-headline, #163A6C);
  margin: 1px 0 0;
  line-height: 1.22;
  letter-spacing: 0;
}

.news-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.86rem;
  color: var(--d-text-muted, #6B6C68);
  line-height: 1.4;
  margin: 2px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
