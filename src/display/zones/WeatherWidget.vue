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
  condition: 'Leicht bewölkt',
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
    <div class="weather-top">
      <div>
        <h2 class="weather-location">{{ weather.location }}</h2>
        <p class="weather-date">{{ weather.date }}</p>
      </div>
      <CloudSun :size="52" :stroke-width="1.5" class="weather-main-icon" />
    </div>

    <div class="weather-center">
      <span class="weather-temp">{{ weather.temp }}&deg;</span>
      <span class="weather-condition">{{ weather.condition }}</span>
    </div>

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
  background:
    linear-gradient(135deg, rgba(255,255,255,0.08) 0 12%, transparent 12% 26%, rgba(255,255,255,0.04) 26% 38%, transparent 38%),
    #0B3272;
  border-radius: 8px;
  padding: 30px 34px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 14px 30px rgba(22, 58, 108, 0.16);
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
  font-size: 1.52rem;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: 0;
}

.weather-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.78);
  margin: 4px 0 0;
}

.weather-main-icon {
  color: #D4E83B;
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
  font-size: 5.45rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.weather-condition {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
}

.weather-forecast {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  position: relative;
  z-index: 1;
}

.forecast-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.forecast-day + .forecast-day {
  border-left: 1px solid rgba(255, 255, 255, 0.18);
}

.forecast-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.84);
  margin: 0;
}

.forecast-icon {
  color: rgba(255, 255, 255, 0.72);
}

.forecast-icon--accent {
  color: #D4E83B;
}

.forecast-temp {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}
</style>
