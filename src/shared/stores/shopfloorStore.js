import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getShopfloorSeed } from '../utils/shopfloorSeed.js'

export const useShopfloorStore = defineStore('shopfloor', () => {
  const board = ref(getShopfloorSeed())

  function reset() { board.value = getShopfloorSeed() }

  return { board, reset }
})
