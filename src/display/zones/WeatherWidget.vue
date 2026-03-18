<script setup>
import { CloudSun, Sun, Cloud, CloudRain } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'Wetter' },
  zoneId: String
})

const weather = {
  location: 'Rosenfeld',
  date: new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }),
  temp: '21',
  condition: 'Leicht bewoelkt',
  forecast: [
    { tag: 'Do', icon: 'sun', temp: '24' },
    { tag: 'Fr', icon: 'cloud', temp: '19' },
    { tag: 'Sa', icon: 'rain', temp: '17' },
  ]
}

const iconMap = { sun: Sun, cloud: Cloud, rain: CloudRain, cloudsun: CloudSun }
</script>

<template>
  <div class="weather-block">
    <!-- Decorative blur -->
    <div class="weather-blur"></div>

    <!-- Top: Location + Icon -->
    <div class="weather-top">
      <div>
        <h2 class="weather-location">{{ weather.location }}</h2>
        <p class="weather-date">{{ weather.date }}</p>
      </div>
      <CloudSun :size="52" :stroke-width="1.5" class="weather-main-icon" />
    </div>

    <!-- Center: Temperature -->
    <div class="weather-center">
      <span class="weather-temp">{{ weather.temp }}&deg;</span>
      <span class="weather-condition">{{ weather.condition }}</span>
    </div>

    <!-- Forecast -->
    <div class="weather-forecast">
      <div v-for="day in weather.forecast" :key="day.tag" class="forecast-day">
        <p class="forecast-tag">{{ day.tag }}</p>
        <component :is="iconMap[day.icon]" :size="28" :stroke-width="1.5" class="forecast-icon" :class="{ 'forecast-icon--accent': day.icon === 'sun' || day.icon === 'rain' }" />
        <p class="forecast-temp">{{ day.temp }}&deg;</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-block {
  height: 100%;
  background: var(--blickle-navy, #163A6C);
  border-radius: 16px;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
}

.weather-blur {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 220px;
  height: 220px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.weather-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.weather-location {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}

.weather-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: rgba(175, 198, 255, 0.7);
  margin: 4px 0 0;
}

.weather-main-icon {
  color: var(--blickle-green, #B5CC18);
}

.weather-center {
  display: flex;
  align-items: baseline;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.weather-temp {
  font-family: 'Outfit', sans-serif;
  font-size: 5.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
}

.weather-condition {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 500;
  color: rgba(175, 198, 255, 0.7);
}

.weather-forecast {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.forecast-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.forecast-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(175, 198, 255, 0.6);
  margin: 0;
}

.forecast-icon {
  color: rgba(200, 210, 230, 0.6);
}

.forecast-icon--accent {
  color: var(--blickle-green, #B5CC18);
}

.forecast-temp {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}
</style>
