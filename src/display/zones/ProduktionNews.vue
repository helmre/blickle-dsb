<script setup>
import { getSeedProduktionNews } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'Produktionsnews' },
  zoneId: String
})

const news = getSeedProduktionNews()

const kategorieColors = {
  'Strategie': '#B5CC18',
  'Investition': '#3B82F6',
  'Optimierung': '#F59E0B',
  'Automatisierung': '#8B5CF6',
  'Nachhaltigkeit': '#10B981',
}
</script>

<template>
  <div class="zone-produktion-news">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
    </div>
    <div class="zone-body">
      <div v-for="item in news" :key="item.id" :class="['pn-item', { 'pn-wichtig': item.wichtig }]">
        <div class="pn-meta">
          <span
            class="pn-kategorie"
            :style="{ background: (kategorieColors[item.kategorie] || '#6B7280') + '22', color: kategorieColors[item.kategorie] || '#6B7280' }"
          >{{ item.kategorie }}</span>
          <span class="pn-datum">{{ item.datum }}</span>
        </div>
        <div class="pn-title">{{ item.title }}</div>
        <div class="pn-text">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zone-produktion-news {
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

.pn-item {
  padding: 16px 18px;
  background: var(--d-surface-content);
  border: none;
  border-radius: 8px;
  flex: 1;
  transition: background 0.2s ease;
}

.pn-item.pn-wichtig {
  border-left: 4px solid var(--d-card-accent-strip, var(--d-accent));
}

.pn-item:hover {
  background: var(--d-surface-content-hover);
}

.pn-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.pn-kategorie {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pn-datum {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  color: var(--d-text-faint);
}

.pn-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.0rem;
  font-weight: 700;
  color: var(--d-text);
  margin-bottom: 3px;
}

.pn-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--d-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
