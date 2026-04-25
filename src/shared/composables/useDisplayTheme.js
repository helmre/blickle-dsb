import { ref, watch } from 'vue'

const THEME_KEY = 'dsb_display_theme'
const NAV_KEY = 'dsb_nav_position'

const THEMES = new Set(['dark', 'light'])
const NAV_POSITIONS = new Set(['bottom', 'sidebar'])

function readPreference(key, fallback, allowedValues) {
  try {
    const value = globalThis.localStorage?.getItem(key)
    return allowedValues.has(value) ? value : fallback
  } catch {
    return fallback
  }
}

function writePreference(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value)
  } catch (error) {
    console.warn('[DisplayTheme] Einstellung konnte nicht gespeichert werden:', error)
  }
}

const theme = ref(readPreference(THEME_KEY, 'dark', THEMES))
const navPosition = ref(readPreference(NAV_KEY, 'bottom', NAV_POSITIONS))

watch(theme, (val) => {
  writePreference(THEME_KEY, val)
})

watch(navPosition, (val) => {
  writePreference(NAV_KEY, val)
})

export function useDisplayTheme() {
  function setTheme(t) {
    theme.value = THEMES.has(t) ? t : 'dark'
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setNavPosition(pos) {
    navPosition.value = NAV_POSITIONS.has(pos) ? pos : 'bottom'
  }

  function toggleNavPosition() {
    navPosition.value = navPosition.value === 'bottom' ? 'sidebar' : 'bottom'
  }

  return { theme, setTheme, toggleTheme, navPosition, setNavPosition, toggleNavPosition }
}
