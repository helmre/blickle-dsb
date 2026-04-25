import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEmergencyStore } from './emergencyStore.js'
import { installMemoryStorage } from '../../test/localStorage.js'

describe('emergencyStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-24T10:00:00.000Z'))
    installMemoryStorage()
    setActivePinia(createPinia())
  })

  it('restores an active emergency from persisted data', () => {
    installMemoryStorage({
      dsb_emergencies: JSON.stringify([
        {
          id: 'em-1',
          message: 'Testalarm',
          severity: 'critical',
          targetLocationIds: [],
          displayDuration: 60,
          triggeredBy: 'user-admin',
          triggeredAt: '2026-04-24T09:59:30.000Z',
          expiresAt: '2026-04-24T10:00:30.000Z',
          acknowledgedAt: null,
        },
      ]),
    })
    setActivePinia(createPinia())

    const store = useEmergencyStore()

    expect(store.activeEmergency?.id).toBe('em-1')
  })

  it('does not restore expired emergencies', () => {
    installMemoryStorage({
      dsb_emergencies: JSON.stringify([
        {
          id: 'em-1',
          message: 'Alter Testalarm',
          severity: 'warning',
          targetLocationIds: [],
          displayDuration: 60,
          triggeredBy: 'user-admin',
          triggeredAt: '2026-04-24T09:58:00.000Z',
          expiresAt: '2026-04-24T09:59:00.000Z',
          acknowledgedAt: null,
        },
      ]),
    })
    setActivePinia(createPinia())

    const store = useEmergencyStore()

    expect(store.activeEmergency).toBeNull()
  })

  it('persists expiresAt when triggering a new emergency', () => {
    const store = useEmergencyStore()

    const emergency = store.trigger({
      message: 'Neue Warnung',
      displayDuration: 90,
      triggeredBy: 'user-admin',
    })

    expect(emergency.expiresAt).toBe('2026-04-24T10:01:30.000Z')
    expect(store.activeEmergency?.id).toBe(emergency.id)
  })

  it('records who acknowledged a dismissed emergency', () => {
    const store = useEmergencyStore()
    const emergency = store.trigger({
      message: 'Neue Warnung',
      displayDuration: 90,
      triggeredBy: 'user-admin',
    })

    store.dismiss(emergency.id, 'user-reviewer')

    expect(store.activeEmergency).toBeNull()
    expect(store.items[0]).toMatchObject({
      acknowledgedAt: '2026-04-24T10:00:00.000Z',
      acknowledgedBy: 'user-reviewer',
    })
  })
})
