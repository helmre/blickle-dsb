import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useContentStore } from './contentStore.js'
import { installMemoryStorage } from '../../test/localStorage.js'

describe('contentStore persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-24T10:00:00.000Z'))
    setActivePinia(createPinia())
  })

  it('rolls back in-memory updates when persistence fails', () => {
    const storage = installMemoryStorage({
      dsb_content: JSON.stringify([
        {
          id: 'content-a',
          title: 'Original',
          description: '',
          type: 'text',
          status: 'draft',
          createdAt: '2026-04-24T09:00:00.000Z',
          updatedAt: '2026-04-24T09:00:00.000Z',
          tags: [],
          locationIds: [],
        },
      ]),
    })
    const store = useContentStore()

    storage.failWrites()

    expect(() => store.update('content-a', { title: 'Nicht gespeichert' })).toThrow(/Speicherplatz/)
    expect(store.getById('content-a').title).toBe('Original')
  })

  it('records review events when content moves through approval states', () => {
    installMemoryStorage({
      dsb_content: JSON.stringify([
        {
          id: 'content-a',
          title: 'Review Test',
          description: '',
          type: 'text',
          status: 'draft',
          createdAt: '2026-04-24T09:00:00.000Z',
          updatedAt: '2026-04-24T09:00:00.000Z',
          tags: [],
          locationIds: [],
          reviewEvents: [],
        },
      ]),
    })
    const store = useContentStore()
    const actor = { id: 'user-reviewer', name: 'Prüfer' }

    store.submitForReview('content-a', { id: 'user-editor', name: 'Redaktion' })
    store.reject('content-a', actor, 'Bitte Datum korrigieren')
    store.moveToDraft('content-a', { id: 'user-editor', name: 'Redaktion' }, 'Wird angepasst')

    const content = store.getById('content-a')
    expect(content.status).toBe('draft')
    expect(content.reviewEvents.map(event => event.type)).toEqual([
      'submitted',
      'rejected',
      'revision_started',
    ])
    expect(content.reviewEvents[1]).toMatchObject({
      userId: 'user-reviewer',
      userName: 'Prüfer',
      comment: 'Bitte Datum korrigieren',
    })
    expect(content.reviewVersion).toBe(1)
  })

  it('keeps review context and increments review versions on submission', () => {
    installMemoryStorage({ dsb_content: '[]' })
    const store = useContentStore()
    const content = store.createFromTemplate('designer-demo', {
      title: 'QR Info',
      templateParams: {
        headline: 'Wie geht es dir gerade?',
        body: 'Kurzer Hinweis',
        qr1Url: 'https://example.com/video',
        qr2Url: 'https://example.com/survey',
      },
      reviewContext: {
        locationLabel: 'FB1',
        previewLocationLabel: 'FB1',
        validityLabel: 'Sofort',
      },
      reviewNote: 'Bitte Standortwirkung prüfen',
    })

    store.submitForReview(content.id, { id: 'user-editor', name: 'Redaktion' }, 'Bitte Standortwirkung prüfen')

    const submitted = store.getById(content.id)
    expect(submitted.reviewVersion).toBe(1)
    expect(submitted.submittedBy).toBe('user-editor')
    expect(submitted.reviewNote).toBe('Bitte Standortwirkung prüfen')
    expect(submitted.reviewContext).toMatchObject({
      locationLabel: 'FB1',
      previewLocationLabel: 'FB1',
    })
    expect(submitted.reviewEvents[0]).toMatchObject({
      type: 'submitted',
      comment: 'Bitte Standortwirkung prüfen',
    })
  })

  it('blocks submission when template content is incomplete', () => {
    installMemoryStorage({
      dsb_content: JSON.stringify([
        {
          id: 'content-a',
          title: 'Unvollständige Video-News',
          description: '',
          type: 'template',
          templateId: 'designer-video-news',
          templateParams: { headline: 'Update', body: 'Text', videoUrl: '' },
          status: 'draft',
          createdAt: '2026-04-24T09:00:00.000Z',
          updatedAt: '2026-04-24T09:00:00.000Z',
          tags: [],
          locationIds: [],
          reviewEvents: [],
        },
      ]),
    })
    const store = useContentStore()

    expect(() => store.submitForReview('content-a', { id: 'user-editor', name: 'Redaktion' })).toThrow(/Video-URL/)
    expect(store.getById('content-a').status).toBe('draft')
  })

  it('locks approved content and publishes changes through a revision', () => {
    installMemoryStorage({ dsb_content: '[]' })
    const store = useContentStore()
    const actor = { id: 'user-editor', name: 'Redaktion' }
    const reviewer = { id: 'user-reviewer', name: 'Prüfer' }
    const original = store.createFromTemplate('designer-demo', {
      title: 'Motivation',
      templateParams: {
        headline: 'Wie geht es dir gerade?',
        body: 'Kurzer Hinweis',
        qr1Url: 'https://example.com/video',
        qr2Url: 'https://example.com/survey',
      },
    })

    store.submitForReview(original.id, actor)
    store.approve(original.id, reviewer)

    expect(() => store.update(original.id, { title: 'Ungeprüfte Änderung' })).toThrow(/schreibgeschützt/)
    expect(store.getById(original.id).title).toBe('Motivation')

    const revision = store.createRevision(original.id, actor)
    expect(revision).toMatchObject({
      status: 'draft',
      revisionOf: original.id,
      basedOnContentId: original.id,
      basedOnReviewVersion: 1,
      replacesContentId: original.id,
    })

    store.update(revision.id, { title: 'Motivation aktualisiert' })
    store.submitForReview(revision.id, actor)
    store.approve(revision.id, reviewer)

    expect(store.getById(original.id)).toMatchObject({
      status: 'archived',
      supersededBy: revision.id,
    })
    expect(store.getById(revision.id)).toMatchObject({
      status: 'approved',
      title: 'Motivation aktualisiert',
    })
    expect(store.approved.map(item => item.id)).toEqual([revision.id])
  })
})
