import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let counter = 0

  function show(message, type = 'success', duration = 3000) {
    const id = ++counter
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message) { show(message, 'success') }
  function error(message) { show(message, 'error', 5000) }
  function info(message) { show(message, 'info') }
  function warning(message) { show(message, 'warning', 4000) }

  return { toasts, show, success, error, info, warning }
})
