<script setup>
import ShopfloorBoard from '../../shared/shopfloor/ShopfloorBoard.vue'
import { useShopfloorStore } from '../../shared/stores/shopfloorStore.js'

const store = useShopfloorStore()
</script>

<template>
  <div class="zone-shopfloor">
    <ShopfloorBoard :board="store.board" :is-running="false" />
  </div>
</template>

<style scoped>
.zone-shopfloor {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}
</style>
