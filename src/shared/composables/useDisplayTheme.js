import { ref, watch } from 'vue'

const THEME_KEY = 'dsb_display_theme'
const NAV_KEY = 'dsb_nav_position'

const theme = ref(localStorage.getItem(THEME_KEY) || 'dark')
const navPosition = ref(localStorage.getItem(NAV_KEY) || 'bottom')

watch(theme, (val) => {
  localStorage.setItem(THEME_KEY, val)
})

watch(navPosition, (val) => {
  localStorage.setItem(NAV_KEY, val)
})

export function useDisplayTheme() {
  function setTheme(t) {
    theme.value = t
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setNavPosition(pos) {
    navPosition.value = pos
  }

  function toggleNavPosition() {
    navPosition.value = navPosition.value === 'bottom' ? 'sidebar' : 'bottom'
  }

  return { theme, setTheme, toggleTheme, navPosition, setNavPosition, toggleNavPosition }
}
