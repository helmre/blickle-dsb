import { ref, watch } from 'vue'

const STORAGE_KEY = 'dsb_display_theme'

const theme = ref(localStorage.getItem(STORAGE_KEY) || 'dark')

watch(theme, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
})

export function useDisplayTheme() {
  function setTheme(t) {
    theme.value = t
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, setTheme, toggleTheme }
}
