import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { installMemoryStorage } from '../../test/localStorage.js'
import { useUserStore } from './userStore.js'

const users = [
  { id: 'user-admin', name: 'Admin', role: 'admin', locationAccess: [] },
  { id: 'user-viewer', name: 'Viewer', role: 'viewer', locationAccess: [] },
]

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not fall back to admin when the persisted user id is invalid', () => {
    installMemoryStorage({
      dsb_users: JSON.stringify(users),
      dsb_currentUser: JSON.stringify('user-missing'),
    })

    const store = useUserStore()

    expect(store.currentUser).toBeNull()
    expect(store.isAdmin).toBe(false)
  })

  it('rejects switching to unknown users and keeps the previous user', () => {
    const storage = installMemoryStorage({
      dsb_users: JSON.stringify(users),
      dsb_currentUser: JSON.stringify('user-viewer'),
    })

    const store = useUserStore()

    expect(store.switchUser('user-missing')).toBe(false)
    expect(store.currentUserId).toBe('user-viewer')
    expect(JSON.parse(storage.getItem('dsb_currentUser'))).toBe('user-viewer')
  })
})
