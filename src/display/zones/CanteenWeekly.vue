<script setup>
import { getSeedCanteenData } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'Speiseplan der Woche' },
  zoneId: String
})

const data = getSeedCanteenData()
const todayIndex = Math.max(0, Math.min(new Date().getDay() - 1, 4))
</script>

<template>
  <div class="zone-canteen-weekly">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
    </div>
    <div class="zone-body">
      <table>
        <thead>
          <tr>
            <th></th>
            <th v-for="(tag, i) in data.tage" :key="tag" :class="{ 'is-today': i === todayIndex }">{{ tag }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="row-label">&#127858; Gericht 1</td>
            <td
              v-for="(gericht, i) in data.gerichte"
              :key="'g1-' + i"
              :class="{ 'is-today': i === todayIndex }"
            >
              {{ gericht.gericht1 }}
            </td>
          </tr>
          <tr>
            <td class="row-label">&#127793; Vegetarisch</td>
            <td
              v-for="(gericht, i) in data.gerichte"
              :key="'g2-' + i"
              :class="{ 'is-today': i === todayIndex }"
            >
              {{ gericht.gericht2 }}
            </td>
          </tr>
          <tr>
            <td class="row-label">Beilage</td>
            <td
              v-for="(gericht, i) in data.gerichte"
              :key="'b-' + i"
              :class="{ 'is-today': i === todayIndex }"
            >
              {{ gericht.beilage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.zone-canteen-weekly {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.zone-header {
  padding: 18px 32px;
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
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--d-text);
  margin: 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.zone-body {
  flex: 1;
  padding: 24px 28px;
  display: flex;
}

table {
  width: 100%;
  height: 100%;
  font-size: 1.1rem;
  border-collapse: separate;
  border-spacing: 0;
}

thead {
  background: var(--d-zone-header-bg);
}

th {
  padding: 16px 18px;
  text-align: center;
  color: var(--d-accent-muted);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: none;
}

th.is-today {
  color: var(--d-accent);
}

td {
  padding: 22px 20px;
  border-bottom: none;
  text-align: center;
  vertical-align: middle;
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  color: var(--d-text-body);
}

tbody tr:nth-child(even) {
  background: var(--d-surface-content);
}

.row-label {
  text-align: left;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: var(--d-text);
  white-space: nowrap;
  width: 160px;
  font-size: 1rem;
}

.is-today {
  background: var(--d-surface-active);
  color: var(--d-text);
  font-weight: 600;
}
</style>
