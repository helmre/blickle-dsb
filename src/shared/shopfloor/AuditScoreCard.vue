<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  overall: { type: Number, default: 0 },
  topMeasures: { type: Array, default: () => [] },
})

function barColor(pct) {
  if (pct >= 90) return '#10B981'
  if (pct >= 75) return '#F59E0B'
  return '#EF4444'
}
</script>

<template>
  <div class="audit-card">
    <div class="title-row">
      <span class="title">5S / KVP-Audit</span>
      <span class="overall" :style="{ color: barColor(overall) }">{{ overall }} %</span>
    </div>
    <div class="categories">
      <div v-for="cat in categories" :key="cat.key" class="cat-row">
        <span class="cat-label">{{ cat.key }}</span>
        <div class="cat-bar">
          <div class="cat-fill" :style="{ width: cat.value + '%', background: barColor(cat.value) }"></div>
        </div>
        <span class="cat-value">{{ cat.value }} %</span>
      </div>
    </div>
    <div v-if="topMeasures?.length" class="measures">
      <div class="measures-title">Top-Massnahmen</div>
      <div v-for="(m, i) in topMeasures" :key="i" class="measure">
        <span class="m-num">{{ i + 1 }}</span>
        <span class="m-text" :class="{ done: m.done }">{{ m.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audit-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.overall {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}
.cat-row {
  display: grid;
  grid-template-columns: 38px 1fr 42px;
  align-items: center;
  gap: 6px;
}
.cat-label {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.04em;
}
.cat-bar {
  height: 7px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  overflow: hidden;
}
.cat-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 400ms;
}
.cat-value {
  font-family: var(--font-body);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-align: right;
}

.measures {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
}
.measures-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 5px;
}
.measure {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.35;
  margin-bottom: 3px;
}
.m-num {
  font-family: var(--font-display);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  min-width: 14px;
}
.m-text.done {
  color: #B5CC18;
  text-decoration: line-through;
  text-decoration-color: rgba(181, 204, 24, 0.4);
}
</style>
