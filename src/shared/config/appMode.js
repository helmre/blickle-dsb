function envFlag(name, fallback = false) {
  const value = import.meta.env[name]
  if (value === undefined || value === null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const defaultDemoMode = Boolean(import.meta.env.DEV)

export const isDemoMode = envFlag('VITE_DSB_DEMO_MODE', defaultDemoMode)
export const clientPasswordGateEnabled = isDemoMode && envFlag('VITE_DSB_CLIENT_PASSWORD_GATE', true)
export const allowDemoUserSwitch = isDemoMode && envFlag('VITE_DSB_ALLOW_USER_SWITCH', import.meta.env.DEV)
