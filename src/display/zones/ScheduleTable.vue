<script setup>
import { getSeedScheduleData } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'Schichtplan' },
  zoneId: String
})

const data = getSeedScheduleData()
</script>

<template>
  <div class="zone-schedule">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
      <span class="zone-header-badge">Heute</span>
    </div>
    <div class="zone-body">
      <table>
        <thead>
          <tr>
            <th>Schicht</th>
            <th>Zeit</th>
            <th>Mitarbeiter</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schicht in data.today" :key="schicht.name">
            <td class="schicht-name">{{ schicht.name }}</td>
            <td class="schicht-zeit">{{ schicht.zeit }}</td>
            <td class="schicht-mitarbeiter">{{ schicht.mitarbeiter.join(', ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.zone-schedule {
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
  flex: 1;
}

.zone-header-badge {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--d-accent);
  background: var(--d-accent-subtle);
  padding: 2px 10px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.zone-body {
  flex: 1;
  padding: 10px 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

table {
  width: 100%;
  font-size: 1rem;
  border-collapse: collapse;
  flex: 1;
}

thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

th {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--d-table-header-border);
  color: var(--d-accent-muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--d-table-border);
  vertical-align: middle;
}

.schicht-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: var(--d-text);
  white-space: nowrap;
  font-size: 1.05rem;
}

.schicht-zeit {
  white-space: nowrap;
  color: var(--d-text-muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

.schicht-mitarbeiter {
  color: var(--d-text-body);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
}
</style>
