<script setup>
import { computed } from 'vue'
import { getSeedCanteenData } from '../../shared/utils/seedData.js'
import { Info, Leaf, UtensilsCrossed } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'Heute im s\'Raedle' },
  zoneId: String
})

const data = getSeedCanteenData()
const todayIndex = Math.min(Math.max(new Date().getDay() - 1, 0), 4)
const today = computed(() => data.gerichte[todayIndex])
</script>

<template>
  <div class="canteen-card">
    <!-- Header -->
    <div class="canteen-header">
      <h2 class="canteen-title">{{ title }}</h2>
      <span class="canteen-badge">Speiseplan</span>
    </div>

    <!-- Menu Items -->
    <div class="canteen-items">
      <!-- Gericht 1 -->
      <div class="menu-item">
        <div class="menu-image">
          <img :src="today.bild1" :alt="today.gericht1" />
        </div>
        <div class="menu-details">
          <div class="menu-top">
            <h3 class="menu-name">{{ today.gericht1 }}</h3>
            <span class="menu-price">{{ today.preis1 }} &euro;</span>
          </div>
          <p class="menu-desc">{{ today.beschreibung1 }}</p>
          <div class="menu-icons">
            <Info :size="18" :stroke-width="1.5" class="menu-icon" />
            <UtensilsCrossed :size="18" :stroke-width="1.5" class="menu-icon" />
          </div>
        </div>
      </div>

      <!-- Gericht 2 (vegetarisch) -->
      <div class="menu-item">
        <div class="menu-image">
          <img :src="today.bild2" :alt="today.gericht2" />
        </div>
        <div class="menu-details">
          <div class="menu-top">
            <h3 class="menu-name">{{ today.gericht2 }}</h3>
            <span class="menu-price">{{ today.preis2 }} &euro;</span>
          </div>
          <p class="menu-desc">{{ today.beschreibung2 }}</p>
          <div class="menu-icons">
            <Leaf :size="18" :stroke-width="1.5" class="menu-icon" />
            <UtensilsCrossed :size="18" :stroke-width="1.5" class="menu-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.canteen-card {
  height: 100%;
  background: var(--d-surface-structural, #FFFFFF);
  border-radius: 16px;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canteen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.canteen-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--blickle-navy, #163A6C);
  margin: 0;
}

.canteen-badge {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--d-accent-text, #181e00);
  background: var(--d-accent, #B5CC18);
  padding: 6px 16px;
  border-radius: 20px;
}

.canteen-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: var(--d-surface-content, #F7F7F5);
  border-radius: 16px;
  flex: 1;
}

.menu-image {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--d-surface-content, #e5e5e5);
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.menu-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--d-text, #1a1b20);
  margin: 0;
  line-height: 1.3;
}

.menu-price {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--blickle-navy, #163A6C);
  white-space: nowrap;
  margin-left: 12px;
}

.menu-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--d-text-muted, #6B6C68);
  margin: 0;
  line-height: 1.4;
}

.menu-icons {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.menu-icon {
  color: var(--d-accent, #B5CC18);
}
</style>
