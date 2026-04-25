import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { installMemoryStorage } from '../../test/localStorage.js'
import { useDisplayPageStore } from './displayPageStore.js'

describe('displayPageStore', () => {
  beforeEach(() => {
    installMemoryStorage()
    setActivePinia(createPinia())
  })

  it('loads the default HOME page when no config is persisted', () => {
    const store = useDisplayPageStore()
    const home = store.getPageConfig('home')

    expect(home.id).toBe('home')
    expect(home.slots.map(slot => slot.id)).toEqual([
      'home-karriere',
      'home-kantine',
      'home-wetter',
      'home-news',
    ])
  })

  it('prefers a location-specific page over the global page', () => {
    const store = useDisplayPageStore()
    store.savePageConfig({
      id: 'home-hall-1',
      pageId: 'home',
      label: 'HALLE 1',
      locationId: 'loc-hall-1',
      layout: { type: 'custom', columns: 2, rows: 1 },
      slots: [],
    })

    expect(store.getPageConfig('home', 'loc-hall-1').label).toBe('HALLE 1')
    expect(store.getPageConfig('home', 'loc-hall-2').label).toBe('HOME')
  })

  it('resets a location override back to the global fallback', () => {
    const store = useDisplayPageStore()
    store.savePageConfig({
      id: 'home-hall-1',
      pageId: 'home',
      label: 'HALLE 1',
      locationId: 'loc-hall-1',
      layout: { type: 'custom', columns: 2, rows: 1 },
      slots: [],
    })

    store.resetPageConfig('home', 'loc-hall-1')

    expect(store.getPageConfig('home', 'loc-hall-1').label).toBe('HOME')
  })
})
