<script setup>
import PdcaBadge from './PdcaBadge.vue'
import RoleBorderCard from './RoleBorderCard.vue'
import { STATUS_COLORS, MAGNET_LABELS, MAGNET_COLORS } from '../utils/shopfloorSeed.js'

defineProps({
  theme: { type: Object, required: true },
})
</script>

<template>
  <RoleBorderCard :role="theme.role || 'meister'">
    <div class="theme-row">
      <PdcaBadge
        v-if="theme.pdca"
        :phase="theme.pdca"
        :size="30"
      />
      <div
        v-else-if="theme.status"
        class="status-dot"
        :style="{ background: STATUS_COLORS[theme.status] }"
      ></div>
      <div class="theme-body">
        <div class="theme-title">{{ theme.title }}</div>
        <div class="theme-meta" v-if="theme.owner || theme.dueDate || theme.kind === 'entscheidung'">
          <span v-if="theme.owner">{{ theme.owner }}</span>
          <span v-if="theme.owner && theme.dueDate"> &middot; </span>
          <span v-if="theme.dueDate">Ziel {{ theme.dueDate }}</span>
          <span v-if="theme.kind === 'entscheidung'" class="kind-badge">Entscheidung</span>
        </div>
        <div v-if="theme.magnet" class="magnet-row">
          <span
            class="magnet"
            :style="{ background: MAGNET_COLORS[theme.magnet], color: '#fff' }"
          >
            {{ MAGNET_LABELS[theme.magnet] }}
          </span>
        </div>
      </div>
    </div>
  </RoleBorderCard>
</template>

<style scoped>
.theme-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 10px currentColor;
}
.theme-body { flex: 1; min-width: 0; }
.theme-title {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.35;
}
.theme-meta {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
}
.kind-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  background: rgba(59, 130, 246, 0.22);
  color: #93C5FD;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.magnet-row {
  margin-top: 6px;
}
.magnet {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
</style>
