import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { installMemoryStorage } from '../../test/localStorage.js'
import { useScheduleStore } from './scheduleStore.js'

describe('scheduleStore', () => {
  beforeEach(() => {
    installMemoryStorage({
      dsb_schedules: JSON.stringify([
        { id: 'legacy', targetId: 'content-1' },
        { id: 'hall', targetId: 'content-2', locationIds: ['loc-hall-1'] },
      ]),
    })
    setActivePinia(createPinia())
  })

  it('ignores legacy schedules without locationIds in getForLocation', () => {
    const store = useScheduleStore()

    expect(store.getForLocation('loc-hall-1').map(schedule => schedule.id)).toEqual(['hall'])
  })

  it('removes schedules for a deleted target', () => {
    const store = useScheduleStore()
    store.add({ id: 'ignored', targetType: 'playlist', targetId: 'playlist-1', locationIds: [] })
    store.add({ id: 'ignored', targetType: 'content', targetId: 'content-1', locationIds: [] })

    expect(store.removeForTarget('playlist', 'playlist-1')).toBe(1)
    expect(store.items.some(schedule => schedule.targetType === 'playlist' && schedule.targetId === 'playlist-1')).toBe(false)
    expect(store.items.some(schedule => schedule.targetType === 'content' && schedule.targetId === 'content-1')).toBe(true)
  })
})
