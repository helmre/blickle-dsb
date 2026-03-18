<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getSeedKarriereData } from '../../shared/utils/seedData.js'

defineProps({
  title: { type: String, default: 'Karriere bei Blickle' },
  zoneId: String
})

const data = getSeedKarriereData()
const jobs = data.jobs
const referral = data.referral
const batchSize = 4
const currentBatch = ref(0)
const transitioning = ref(false)

const totalBatches = computed(() => Math.ceil(jobs.length / batchSize))
const visibleJobs = computed(() => {
  const start = currentBatch.value * batchSize
  return jobs.slice(start, start + batchSize)
})

let rotateTimer = null

function nextBatch() {
  transitioning.value = true
  setTimeout(() => {
    currentBatch.value = (currentBatch.value + 1) % totalBatches.value
    setTimeout(() => { transitioning.value = false }, 50)
  }, 300)
}

onMounted(() => {
  rotateTimer = setInterval(nextBatch, 6000)
})

onUnmounted(() => {
  if (rotateTimer) clearInterval(rotateTimer)
})

const abteilungColors = {
  'Fertigung/Logistik': '#8B5CF6',
  'IT': '#3B82F6',
  'Aussendienst/Export/Verkauf': '#F59E0B',
  'Controlling/Rechnungswesen': '#10B981',
  'Konstruktion/Entwicklung': '#06B6D4',
  'Personal': '#EC4899',
  'Einkauf': '#F97316',
  'Operational Excellence': '#14B8A6',
  'alle Funktionsbereiche': '#6B7280',
}
</script>

<template>
  <div class="zone-karriere">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
      <span class="zone-header-badge">{{ jobs.length }} Stellen</span>
    </div>
    <div class="zone-body">
      <div :class="['jobs-list', { 'is-transitioning': transitioning }]">
        <div v-for="job in visibleJobs" :key="job.id" class="job-card">
          <div class="job-title">{{ job.title }}</div>
          <div class="job-meta">
            <span
              class="job-abteilung"
              :style="{ background: (abteilungColors[job.abteilung] || '#6B7280') + '22', color: abteilungColors[job.abteilung] || '#6B7280' }"
            >{{ job.abteilung }}</span>
            <span class="job-standort">{{ job.standort }}</span>
          </div>
        </div>
      </div>
      <div class="referral-banner">
        <div class="referral-icon">&#129309;</div>
        <div class="referral-content">
          <div class="referral-title">{{ referral.title }}</div>
          <div class="referral-bonus">{{ referral.bonus }} &euro; Praemie</div>
        </div>
      </div>
    </div>
    <div class="batch-dots">
      <span
        v-for="i in totalBatches"
        :key="i"
        :class="['dot', { active: i - 1 === currentBatch }]"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.zone-karriere {
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
  flex: 1;
}

.zone-header-badge {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--d-accent);
  background: var(--d-accent-subtle);
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.zone-body {
  flex: 1;
  padding: 16px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jobs-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.jobs-list.is-transitioning {
  opacity: 0;
  transform: translateY(6px);
}

.job-card {
  padding: 14px 18px;
  background: var(--d-surface-content);
  border: none;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: background 0.2s ease;
}

.job-card:hover {
  background: var(--d-surface-content-hover);
}

.job-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--d-text);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-abteilung {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.job-standort {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  color: var(--d-text-faint);
}

.referral-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--d-accent-subtle);
  border: none;
  border-left: 4px solid var(--d-card-accent-strip, var(--d-accent));
  border-radius: 8px;
  flex-shrink: 0;
}

.referral-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.referral-content {
  flex: 1;
}

.referral-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--d-accent);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.referral-bonus {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: var(--d-text);
}

.batch-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 6px 0 10px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--d-text-faint);
  transition: background 0.3s ease, transform 0.3s ease;
}

.dot.active {
  background: var(--d-accent);
  transform: scale(1.3);
}
</style>
