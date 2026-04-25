import { describe, expect, it, vi } from 'vitest'
import { safeAuditLog } from './auditLog.js'

describe('safeAuditLog', () => {
  it('returns the audit entry when logging succeeds', () => {
    const entry = { id: 'audit-1' }
    const auditStore = { log: vi.fn(() => entry) }

    expect(safeAuditLog(auditStore, 'content.updated', 'content', 'c1', 'u1', { title: 'A' })).toBe(entry)
    expect(auditStore.log).toHaveBeenCalledWith('content.updated', 'content', 'c1', 'u1', { title: 'A' })
  })

  it('does not throw when audit persistence fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const toast = { warning: vi.fn() }
    const auditStore = { log: vi.fn(() => { throw new Error('quota') }) }

    expect(safeAuditLog(auditStore, 'content.updated', 'content', 'c1', 'u1', {}, { toast })).toBeNull()
    expect(toast.warning).toHaveBeenCalledWith('Aktion gespeichert, aber Audit-Log konnte nicht geschrieben werden')

    warn.mockRestore()
  })
})
