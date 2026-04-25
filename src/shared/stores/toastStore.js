import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let counter = 0
  const timers = new Map()

  function show(message, type = 'success', duration = 3000) {
    const id = ++counter
    toasts.value.push({ id, message, type })
    const timer = setTimeout(() => remove(id), duration)
    timers.set(id, timer)
    return id
  }

  function remove(id) {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function clearAll() {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    toasts.value = []
  }

  function success(message) { show(message, 'success') }
  function error(message) { show(message, 'error', 5000) }
  function info(message) { show(message, 'info') }
  function warning(message) { show(message, 'warning', 4000) }

  if (import.meta.hot) {
    import.meta.hot.dispose(clearAll)
  }

  return { toasts, show, remove, clearAll, success, error, info, warning }
})
