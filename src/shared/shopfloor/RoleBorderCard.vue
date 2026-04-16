<script setup>
import { ROLE_COLORS } from '../utils/shopfloorSeed.js'

const props = defineProps({
  role: { type: String, default: 'meister' },
})
</script>

<template>
  <div class="role-card" :style="{ borderLeftColor: ROLE_COLORS[role]?.border || '#6B7280' }">
    <slot />
  </div>
</template>

<style scoped>
.role-card {
  border-left: 5px solid;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px 10px 10px 4px;
  backdrop-filter: blur(4px);
}
</style>
