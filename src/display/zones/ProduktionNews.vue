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
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--d-zone-header-border);
}

.zone-header-accent {
  width: 3px;
  height: 18px;
  background: var(--d-accent);
  border-radius: 2px;
  flex-shrink: 0;
}

.zone-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--d-text);
  margin: 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.zone-body {
  flex: 1;
  padding: 10px 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pn-item {
  padding: 12px 14px;
  background: var(--d-zone-surface);
  border: 1px solid var(--d-zone-surface-border);
  border-radius: 8px;
  flex: 1;
  transition: border-color 0.2s ease;
}

.pn-item.pn-wichtig {
  border-left: 3px solid var(--d-accent);
}

.pn-item:hover {
  border-color: var(--d-border-accent);
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
  border-radius: 4px;
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
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--d-text);
  margin-bottom: 3px;
}

.pn-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: var(--d-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
