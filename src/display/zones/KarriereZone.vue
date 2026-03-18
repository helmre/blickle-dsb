<script setup>
import { getSeedKarriereData } from '../../shared/utils/seedData.js'
import { Users } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'Karriere bei Blickle' },
  zoneId: String
})

const data = getSeedKarriereData()
const jobs = data.jobs
const referral = data.referral
const featuredJob = jobs.find(j => j.title.includes('Controller')) || jobs[0]
</script>

<template>
  <div class="karriere-hero">
    <!-- Background image overlay -->
    <div class="karriere-bg-image"></div>

    <!-- Content -->
    <div class="karriere-content">
      <div class="karriere-top">
        <span class="karriere-badge">Karriere</span>
        <h1 class="karriere-headline">Deine Zukunft bei Blickle</h1>
        <div class="karriere-stats">
          <span class="karriere-count">{{ jobs.length }}</span>
          <span class="karriere-count-label">Offene Stellen</span>
        </div>
      </div>

      <div class="karriere-bottom">
        <div class="karriere-featured">
          <p class="karriere-featured-label">Top-Position</p>
          <p class="karriere-featured-title">{{ featuredJob.title }}</p>
        </div>
        <div class="karriere-referral">
          <div class="karriere-referral-text">
            <p class="karriere-featured-label">Empfehlungsprogramm</p>
            <p class="karriere-featured-title">{{ referral.title }}</p>
          </div>
          <Users :size="32" :stroke-width="1.5" class="karriere-referral-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.karriere-hero {
  height: 100%;
  background: var(--d-surface-structural, #FFFFFF);
  border-radius: 16px;
  border-left: 8px solid var(--d-accent, #B5CC18);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.karriere-bg-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background: url('https://picsum.photos/seed/office/280/500') center/cover no-repeat;
  opacity: 0.08;
  pointer-events: none;
}

.karriere-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
}

.karriere-top {
  display: flex;
  flex-direction: column;
}

.karriere-badge {
  display: inline-block;
  width: fit-content;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--d-accent-text, #181e00);
  background: var(--d-accent, #B5CC18);
  padding: 5px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.karriere-headline {
  font-family: 'Outfit', sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--blickle-navy, #163A6C);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 28px;
}

.karriere-stats {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 32px;
}

.karriere-count {
  font-family: 'Outfit', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--d-accent, #B5CC18);
  line-height: 1;
}

.karriere-count-label {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--d-text-muted, #6B6C68);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.karriere-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.karriere-featured {
  background: var(--d-surface-content, #F7F7F5);
  padding: 24px;
  border-radius: 16px;
}

.karriere-featured-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--d-text-muted, #6B6C68);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
}

.karriere-featured-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--blickle-navy, #163A6C);
  margin: 0;
  line-height: 1.3;
}

.karriere-referral {
  background: rgba(181, 204, 24, 0.15);
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.karriere-referral-text {
  flex: 1;
}

.karriere-referral-icon {
  color: var(--blickle-navy, #163A6C);
  flex-shrink: 0;
}
</style>
