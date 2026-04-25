import { describe, expect, it } from 'vitest'
import { PERMISSIONS, can, canAny, requirePermission } from './policies.js'

const user = role => ({ id: `user-${role}`, role })

describe('role policies', () => {
  it('allows admins to do everything', () => {
    expect(can(user('admin'), PERMISSIONS.USERS_MANAGE)).toBe(true)
    expect(can(user('admin'), 'future:permission')).toBe(true)
  })

  it('allows editors to manage content but not approve it', () => {
    expect(can(user('editor'), PERMISSIONS.CONTENT_CREATE)).toBe(true)
    expect(can(user('editor'), PERMISSIONS.CONTENT_SUBMIT)).toBe(true)
    expect(can(user('editor'), PERMISSIONS.CONTENT_APPROVE)).toBe(false)
    expect(can(user('editor'), PERMISSIONS.USERS_MANAGE)).toBe(false)
  })

  it('allows reviewers to approve and read audit logs without content editing', () => {
    expect(can(user('reviewer'), PERMISSIONS.CONTENT_APPROVE)).toBe(true)
    expect(can(user('reviewer'), PERMISSIONS.AUDIT_READ)).toBe(true)
    expect(can(user('reviewer'), PERMISSIONS.CONTENT_EDIT)).toBe(false)
  })

  it('keeps viewers read-only', () => {
    expect(can(user('viewer'), PERMISSIONS.CONTENT_READ)).toBe(true)
    expect(can(user('viewer'), PERMISSIONS.CONTENT_CREATE)).toBe(false)
    expect(can(user('viewer'), PERMISSIONS.EMERGENCY_TRIGGER)).toBe(false)
  })

  it('supports any-permission checks and throws on required denials', () => {
    expect(canAny(user('reviewer'), [PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_APPROVE])).toBe(true)
    expect(() => requirePermission(user('viewer'), PERMISSIONS.USERS_MANAGE)).toThrow(/Permission denied/)
  })
})
