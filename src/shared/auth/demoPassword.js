import { clientPasswordGateEnabled } from '../config/appMode.js'

const DEFAULT_DEMO_PASSWORD_HASH = '098785ba601c8040b7eb576204e8ae09febfc1f5253dca1383c39f4ceeda11c7'
const DEMO_AUTH_KEY = 'dsb_demo_auth'

function configuredHash() {
  return import.meta.env.VITE_DSB_DEMO_PASSWORD_SHA256 || DEFAULT_DEMO_PASSWORD_HASH
}

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hasDemoSession() {
  if (!clientPasswordGateEnabled) return true
  try {
    return globalThis.sessionStorage?.getItem(DEMO_AUTH_KEY) === 'true'
  } catch {
    return false
  }
}

export function markDemoAuthenticated() {
  try {
    globalThis.sessionStorage?.setItem(DEMO_AUTH_KEY, 'true')
  } catch (error) {
    console.warn('[DemoAuth] Sitzung konnte nicht gespeichert werden:', error)
  }
}

export async function verifyDemoPassword(password) {
  if (!clientPasswordGateEnabled) return true
  return await sha256(password) === configuredHash()
}
