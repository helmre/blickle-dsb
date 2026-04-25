import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, effectScope, ref } from 'vue'
import { useContentEditorDraft } from './useContentEditorDraft.js'

function setupDraft({ locked = false, canEdit = true } = {}) {
  const scope = effectScope()
  const result = scope.run(() => {
    const content = ref({
      id: 'content-1',
      title: 'Titel',
      description: '',
      status: 'draft',
      templateId: 'tpl-test',
      templateParams: { headline: 'Alt' },
      tags: [],
      locationIds: [],
    })
    const template = computed(() => ({
      id: 'tpl-test',
      renderer: 'html-params',
      htmlTemplate: '<h1>{{headline}}</h1>',
      parameters: [{ key: 'headline', label: 'Headline', required: true }],
    }))
    const contentStore = {
      isLocked: vi.fn(() => locked),
      update: vi.fn((id, patch) => {
        content.value = { ...content.value, ...patch }
        return content.value
      }),
    }
    const toast = {
      error: vi.fn(),
      info: vi.fn(),
    }
    const userStore = {
      can: vi.fn(() => canEdit),
    }

    return {
      content,
      contentStore,
      draft: useContentEditorDraft({ content, template, contentStore, toast, userStore }),
      scope,
      toast,
      userStore,
    }
  })

  return result
}

describe('useContentEditorDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps params local and persists them with debounce', () => {
    const { contentStore, draft, scope } = setupDraft()

    draft.onUpdateParams({ headline: 'Neu' })

    expect(draft.localParams.value).toEqual({ headline: 'Neu' })
    expect(contentStore.update).not.toHaveBeenCalled()

    vi.advanceTimersByTime(400)

    expect(contentStore.update).toHaveBeenCalledWith('content-1', {
      templateParams: { headline: 'Neu' },
    })

    scope.stop()
  })

  it('flushes pending params before workflow actions', () => {
    const { contentStore, draft, scope } = setupDraft()

    draft.onUpdateParams({ headline: 'Sofort' })
    const updated = draft.flushPendingParams()

    expect(updated.templateParams).toEqual({ headline: 'Sofort' })
    expect(contentStore.update).toHaveBeenCalledWith('content-1', {
      templateParams: { headline: 'Sofort' },
    })

    scope.stop()
  })

  it('prevents editing locked content', () => {
    const { contentStore, draft, scope, toast } = setupDraft({ locked: true })

    draft.updateField('title', 'Gesperrt')
    draft.onUpdateParams({ headline: 'Nicht speichern' })

    vi.advanceTimersByTime(400)

    expect(contentStore.update).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalledWith('Diese Version ist schreibgeschützt. Bitte eine neue Revision erstellen.')

    scope.stop()
  })

  it('keeps reviewer/read-only roles from editing draft content', () => {
    const { contentStore, draft, scope, toast } = setupDraft({ canEdit: false })

    draft.updateField('title', 'Nicht erlaubt')

    expect(draft.isReadOnly.value).toBe(true)
    expect(contentStore.update).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalledWith('Diese Ansicht ist schreibgeschützt. Deine Rolle darf Inhalte prüfen, aber nicht bearbeiten.')

    scope.stop()
  })

  it('surfaces debounced persistence errors as toast messages', () => {
    const { contentStore, draft, scope, toast } = setupDraft()
    contentStore.update.mockImplementation(() => {
      throw new Error('Speicher voll')
    })

    draft.onUpdateParams({ headline: 'Zu groß' })
    vi.advanceTimersByTime(400)

    expect(toast.error).toHaveBeenCalledWith('Speicher voll')

    scope.stop()
  })

  it('normalizes comma-separated tags before saving', () => {
    const { contentStore, draft, scope } = setupDraft()

    draft.updateTags('sicherheit, produktion,  , kantine')

    expect(contentStore.update).toHaveBeenCalledWith('content-1', {
      tags: ['sicherheit', 'produktion', 'kantine'],
    })

    scope.stop()
  })
})
