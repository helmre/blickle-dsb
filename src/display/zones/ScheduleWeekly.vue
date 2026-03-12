<script setup>
import { getSeedScheduleData } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'Schichtplan naechste Woche' },
  zoneId: String
})

const data = getSeedScheduleData()
const todayIndex = Math.max(0, Math.min(new Date().getDay() - 1, 4))
</script>

<template>
  <div class="zone-schedule-weekly">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
    </div>
    <div class="zone-body">
      <table>
        <thead>
          <tr>
            <th class="col-schicht">Schicht</th>
            <th
              v-for="(tag, i) in data.weekly.tage"
              :key="tag"
              :class="{ 'is-today': i === todayIndex }"
            >{{ tag }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(schicht, si) in data.weekly.schichten" :key="schicht">
            <td class="schicht-label">{{ schicht }}</td>
            <td
              v-for="(tag, ti) in data.weekly.tage"
              :key="tag"
              :class="{ 'is-today': ti === todayIndex }"
            >
              {{ data.weekly.plan[si][ti] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.zone-schedule-weekly {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.zone-header {
  padding: 16px 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--d-zone-header-border);
}

.zone-header-accent {
  width: 3px;
  height: 20px;
  background: var(--d-accent);
  border-radius: 2px;
  flex-shrink: 0;
}

.zone-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--d-text);
  margin: 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.zone-body {
  flex: 1;
  padding: 24px 28px;
}

table {
  width: 100%;
  height: 100%;
  font-size: 1.15rem;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  padding: 18px 20px;
  text-align: center;
  color: var(--d-accent-muted);
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--d-table-header-border);
}

th.col-schicht {
  text-align: left;
  width: 200px;
}

th.is-today {
  color: var(--d-accent);
}

td {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid var(--d-table-border);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: var(--d-text-body);
  font-size: 1.1rem;
}

.schicht-label {
  text-align: left;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: var(--d-text);
}

.is-today {
  background: var(--d-surface-active);
  color: var(--d-text);
  font-weight: 700;
}
</style>
