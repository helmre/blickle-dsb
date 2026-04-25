import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { installMemoryStorage } from '../../test/localStorage.js'
import { useLocationStore } from './locationStore.js'

describe('locationStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    installMemoryStorage({
      dsb_locations: JSON.stringify([
        { id: 'loc-global', name: 'Blickle Global', parentId: null },
        { id: 'loc-halle1', name: 'Produktionshalle 1', parentId: 'loc-global' },
        { id: 'loc-halle2', name: 'Produktionshalle 2', parentId: 'loc-global' },
      ]),
    })
    setActivePinia(createPinia())
  })

  it('normalizes prototype locations to Blickle display location names', () => {
    const store = useLocationStore()

    expect(store.displayLocations.map(location => location.name)).toEqual([
      'FB1',
      'FB2',
      'FB3',
      'FB4',
      'FB5',
      'Logistikzentrum',
      'H30',
      'Verwaltung',
      's\'Rädle',
      'Zentrale',
    ])
    expect(store.displayLocations.some(location => location.id === 'loc-global')).toBe(false)
  })

  it('keeps real admin edits on seed locations across normalization', () => {
    installMemoryStorage({
      dsb_locations: JSON.stringify([
        { id: 'loc-global', name: 'Alle Standorte', parentId: null },
        { id: 'loc-halle1', name: 'Werk Nord', parentId: 'loc-fb3', layoutId: 'layout-custom' },
      ]),
    })
    setActivePinia(createPinia())

    const store = useLocationStore()

    expect(store.getById('loc-halle1')).toMatchObject({
      name: 'Werk Nord',
      parentId: 'loc-fb3',
      layoutId: 'layout-custom',
    })
  })

  it('does not crash when initial migration cannot be persisted', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = installMemoryStorage({
      dsb_locations: JSON.stringify([{ id: 'loc-halle1', name: 'FB1', parentId: 'loc-global' }]),
    })
    storage.failWrites(true)
    setActivePinia(createPinia())

    expect(() => useLocationStore()).not.toThrow()
    expect(warn).toHaveBeenCalled()
  })

  it('blocks deleting locations with children', () => {
    installMemoryStorage({
      dsb_locations: JSON.stringify([
        { id: 'loc-parent', name: 'Parent', parentId: 'loc-global' },
        { id: 'loc-child', name: 'Child', parentId: 'loc-parent' },
      ]),
    })
    setActivePinia(createPinia())

    const store = useLocationStore()

    expect(() => store.remove('loc-parent')).toThrow(/untergeordnete Standorte/)
    expect(store.getById('loc-child')).toBeTruthy()
  })
})
