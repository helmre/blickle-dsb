import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from '../../test/localStorage.js'
import { cleanupExpiredDisplayPreviews, loadDisplayPreview, saveDisplayPreview } from './displayPreview.js'

describe('displayPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-25T10:00:00.000Z'))
    installMemoryStorage()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('cleans expired preview payloads before saving a new one', () => {
    const expired = {
      content: { id: 'old' },
      expiresAt: Date.now() - 1,
    }
    localStorage.setItem('dsb_display_preview_old', JSON.stringify(expired))

    const token = saveDisplayPreview({ id: 'new' })

    expect(localStorage.getItem('dsb_display_preview_old')).toBeNull()
    expect(loadDisplayPreview(token)?.content.id).toBe('new')
  })

  it('removes malformed preview entries during cleanup', () => {
    localStorage.setItem('dsb_display_preview_bad', '{not-json')

    expect(cleanupExpiredDisplayPreviews()).toBe(1)
    expect(localStorage.getItem('dsb_display_preview_bad')).toBeNull()
  })
})
