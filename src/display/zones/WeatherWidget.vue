<script setup>
defineProps({
  title: { type: String, default: 'Wetter' },
  zoneId: String
})

const weather = {
  location: 'Rosenfeld',
  temp: '12',
  condition: 'Bewoelkt',
  icon: '&#9729;',
  humidity: '65%',
  wind: '12 km/h',
  forecast: [
    { tag: 'Do', icon: '&#9728;', high: '14', low: '5' },
    { tag: 'Fr', icon: '&#127782;', high: '11', low: '4' },
    { tag: 'Sa', icon: '&#127783;', high: '9', low: '3' },
  ]
}
</script>

<template>
  <div class="zone-weather">
    <div class="zone-header">
      <div class="zone-header-accent"></div>
      <h3>{{ title }}</h3>
      <span class="zone-header-location">{{ weather.location }}</span>
    </div>
    <div class="zone-body">
      <div class="weather-main">
        <span class="weather-icon" v-html="weather.icon"></span>
        <div class="weather-temp">
          <span class="temp-value">{{ weather.temp }}<span class="temp-unit">°C</span></span>
          <span class="temp-condition">{{ weather.condition }}</span>
        </div>
      </div>
      <div class="weather-details">
        <div class="detail">
          <span class="detail-label">Luftfeuchte</span>
          <span class="detail-value">{{ weather.humidity }}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Wind</span>
          <span class="detail-value">{{ weather.wind }}</span>
        </div>
      </div>
      <div class="weather-forecast">
        <div v-for="day in weather.forecast" :key="day.tag" class="forecast-day">
          <span class="forecast-tag">{{ day.tag }}</span>
          <span class="forecast-icon" v-html="day.icon"></span>
          <span class="forecast-temps">{{ day.high }}° / {{ day.low }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zone-weather {
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

.zone-header-location {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: var(--d-text-muted);
  font-weight: 500;
}

.zone-body {
  flex: 1;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.weather-icon {
  font-size: 3.2rem;
  line-height: 1;
}

.temp-value {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  color: var(--d-text);
  line-height: 1;
}

.temp-unit {
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--d-text-muted);
}

.temp-condition {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--d-text-muted);
  margin-top: 4px;
}

.weather-details {
  display: flex;
  gap: 24px;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  color: var(--d-accent-faint);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.detail-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--d-text-body);
}

.weather-forecast {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.forecast-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: var(--d-zone-surface);
  border: 1px solid var(--d-zone-surface-border);
  border-radius: 8px;
  gap: 4px;
}

.forecast-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--d-text-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.forecast-icon {
  font-size: 1.3rem;
}

.forecast-temps {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: var(--d-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
