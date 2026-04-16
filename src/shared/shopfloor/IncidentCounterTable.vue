<script setup>
defineProps({
  title: { type: String, default: 'Tage ohne' },
  entries: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="incident-table">
    <div class="table-title">{{ title }}</div>
    <div class="incident-cells">
      <div v-for="(entry, i) in entries" :key="i" class="cell">
        <div class="days">{{ entry.days }}</div>
        <div class="date">{{ entry.date }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.incident-table {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.table-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 8px;
}
.incident-cells {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.cell {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 4px 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.days {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.date {
  font-family: var(--font-body);
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
