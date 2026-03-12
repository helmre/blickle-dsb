<script setup>
import { computed } from 'vue'
import { getSeedCanteenData } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'Heute in der Kantine' },
  zoneId: String
})

const data = getSeedCanteenData()
const todayIndex = Math.min(new Date().getDay() - 1, 4)
const today = computed(() => data.gerichte[Math.max(0, todayIndex)])
</script>

<template>
  <div class="zone-canteen">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
    </div>
    <div class="zone-body">
      <div class="menu-item">
        <div class="menu-icon">&#127858;</div>
        <div class="menu-content">
          <div class="menu-label">Gericht 1</div>
          <div class="menu-name">{{ today.gericht1 }}</div>
        </div>
      </div>
      <div class="menu-item">
        <div class="menu-icon">&#127793;</div>
        <div class="menu-content">
          <div class="menu-label">Gericht 2 (vegetarisch)</div>
          <div class="menu-name">{{ today.gericht2 }}</div>
        </div>
      </div>
      <div class="menu-beilage">
        <span class="beilage-label">Beilage:</span> {{ today.beilage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.zone-canteen {
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
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--d-zone-surface);
  border: 1px solid var(--d-zone-surface-border);
  border-radius: 10px;
  padding: 16px 18px;
  flex: 1;
  transition: border-color 0.2s ease;
}

.menu-item:hover {
  border-color: var(--d-border-accent);
}

.menu-icon {
  font-size: 1.8rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.menu-content {
  flex: 1;
}

.menu-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  color: var(--d-accent-faint);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.menu-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--d-text);
  line-height: 1.3;
}

.menu-beilage {
  font-family: 'DM Sans', sans-serif;
  color: var(--d-text-muted);
  font-size: 0.9rem;
  padding: 0 4px;
  margin-top: auto;
}

.beilage-label {
  color: var(--d-text-faint);
  font-weight: 600;
}
</style>
