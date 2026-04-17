<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ShopfloorBoard from '../../shared/shopfloor/ShopfloorBoard.vue'
import { useShopfloorStore } from '../../shared/stores/shopfloorStore.js'

const store = useShopfloorStore()

// The ShopfloorBoard is laid out for a fixed 1920x1080 canvas. The display
// zone can be shorter (header + nav + ticker eat into vertical space),
// which clips the themes at the bottom. We scale the canvas to fit the
// zone using min(w/1920, h/1080) — same pattern as the designer editors.
const wrap = ref(null)
const scale = ref(1)
function recomputeScale() {
  if (!wrap.value) return
  const w = wrap.value.clientWidth
  const h = wrap.value.clientHeight
  if (!w || !h) return
  scale.value = Math.min(w / 1920, h / 1080)
}
let ro = null
onMounted(() => {
  recomputeScale()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(recomputeScale)
    if (wrap.value) ro.observe(wrap.value)
  }
})
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div class="zone-shopfloor" ref="wrap">
    <div class="sfm-canvas" :style="{ transform: `scale(${scale})` }">
      <ShopfloorBoard :board="store.board" :is-running="false" />
    </div>
  </div>
</template>

<style scoped>
.zone-shopfloor {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  position: relative;
  background: #0A1A33;
}

.sfm-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1920px;
  height: 1080px;
  margin: -540px 0 0 -960px;
  transform-origin: center center;
}
</style>
