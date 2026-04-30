<script setup>
import { getSeedKarriereData } from '../../shared/utils/seedData.js'
import { UserRoundSearch, UsersRound } from 'lucide-vue-next'

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
    <div class="karriere-bg-image"></div>

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
          <div class="karriere-card-icon"><UserRoundSearch :size="32" :stroke-width="1.65" /></div>
          <div>
            <p class="karriere-featured-label">Top-Position</p>
            <p class="karriere-featured-title">{{ featuredJob.title }}</p>
          </div>
        </div>
        <div class="karriere-referral">
          <div class="karriere-card-icon karriere-card-icon--accent"><UsersRound :size="32" :stroke-width="1.65" /></div>
          <div class="karriere-referral-text">
            <p class="karriere-featured-label">Empfehlungsprogramm</p>
            <p class="karriere-featured-title">{{ referral.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.karriere-hero {
  height: 100%;
  background: var(--d-surface-structural, #FFFFFF);
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px var(--d-ghost-border, rgba(75, 76, 72, 0.05));
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.karriere-bg-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 51%;
  height: 66%;
  background: url('/content/karriere/blickle-team.jpg') right center/cover no-repeat;
  opacity: var(--d-home-hero-image-opacity, 0.72);
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 48%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 48%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0) 100%);
  pointer-events: none;
}

.karriere-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, rgba(255,255,255,0) 0 40%, rgba(255,255,255,0.7) 62%, rgba(255,255,255,0) 86%);
  opacity: var(--d-home-sheen-opacity, 0.55);
  pointer-events: none;
}

.karriere-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 34px 36px 26px;
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
  letter-spacing: 0;
  color: var(--d-accent-text, #181e00);
  background: var(--d-accent, #B5CC18);
  padding: 7px 18px;
  border-radius: 20px;
  margin-bottom: 18px;
}

.karriere-headline {
  font-family: 'Outfit', sans-serif;
  font-size: 2.95rem;
  font-weight: 800;
  color: var(--d-headline, #163A6C);
  line-height: 1.1;
  letter-spacing: 0;
  margin: 0 0 24px;
}

.karriere-stats {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 28px;
  max-width: 470px;
}

.karriere-count {
  font-family: 'Outfit', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--d-accent, #B5CC18);
  line-height: 1;
}

.karriere-count-label {
  position: relative;
  flex: 1;
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--d-text-muted, #6B6C68);
  text-transform: uppercase;
  letter-spacing: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.karriere-count-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--d-border-subtle, rgba(75, 76, 72, 0.08));
}

.karriere-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.karriere-featured,
.karriere-referral {
  min-height: 112px;
  background: color-mix(in srgb, var(--d-surface-structural, #FFFFFF) 88%, transparent);
  border: 1px solid var(--d-ghost-border, rgba(75, 76, 72, 0.06));
  box-shadow: 0 10px 28px rgba(22, 58, 108, 0.07);
  padding: 18px 22px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.karriere-featured-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--d-headline, #163A6C);
  text-transform: uppercase;
  letter-spacing: 0;
  margin: 0 0 6px;
}

.karriere-featured-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.38rem;
  font-weight: 800;
  color: var(--d-headline, #163A6C);
  margin: 0;
  line-height: 1.15;
  letter-spacing: 0;
}

.karriere-referral {
  background: color-mix(in srgb, var(--d-surface-structural, #FFFFFF) 76%, var(--d-accent, #B5CC18) 8%);
}

.karriere-referral-text {
  flex: 1;
  min-width: 0;
}

.karriere-card-icon {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--d-headline, #163A6C);
  background: var(--d-surface-content, #F7F7F5);
  flex: 0 0 62px;
}

.karriere-card-icon--accent {
  color: var(--d-headline, #163A6C);
  background: rgba(181, 204, 24, 0.14);
}
</style>
