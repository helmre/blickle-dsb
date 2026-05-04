import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useContentEditorWorkflow } from './useContentEditorWorkflow.js'

function setupWorkflow({ contentPatch = {} } = {}) {
  const content = ref({
    id: 'content-1',
    title: 'Sicherheitsinfo',
    status: 'draft',
    templateId: 'tpl-test',
    templateParams: { headline: 'Vollständig' },
    reviewEvents: [],
    ...contentPatch,
  })
  const template = computed(() => ({
    id: 'tpl-test',
    parameters: [{ key: 'headline', label: 'Headline', required: true }],
  }))
  const user = { id: 'user-1', name: 'Admin' }
  const userStore = {
    currentUser: user,
    can: vi.fn(() => true),
  }
  const contentStore = {
    createRevision: vi.fn(() => ({ id: 'content-2', title: 'Revision' })),
    moveToDraft: vi.fn(),
    remove: vi.fn(),
    submitForReview: vi.fn(),
    update: vi.fn(),
  }
  const scheduleStore = {
    removeForTarget: vi.fn(() => 2),
  }
  const auditStore = { log: vi.fn() }
  const router = { push: vi.fn() }
  const toast = {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  }
  const flushPendingParams = vi.fn(() => content.value)

  const workflow = useContentEditorWorkflow({
    auditStore,
    content,
    contentStore,
    flushPendingParams,
    router,
    scheduleStore,
    template,
    toast,
    userStore,
  })

  return {
    auditStore,
    content,
    contentStore,
    flushPendingParams,
    router,
    scheduleStore,
    toast,
    user,
    workflow,
  }
}

describe('useContentEditorWorkflow', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('submits valid content for review and navigates back to the content list', () => {
    const { auditStore, contentStore, flushPendingParams, router, toast, user, workflow } = setupWorkflow()

    workflow.submitForReview()

    expect(flushPendingParams).toHaveBeenCalled()
    expect(contentStore.submitForReview).toHaveBeenCalledWith('content-1', user)
    expect(auditStore.log).toHaveBeenCalledWith('content.submit', 'content', 'content-1', 'user-1', {
      title: 'Sicherheitsinfo',
    })
    expect(toast.success).toHaveBeenCalledWith('Zur Prüfung eingereicht')
    expect(router.push).toHaveBeenCalledWith({ name: 'admin-content' })
  })

  it('blocks submit while required publication fields are missing', () => {
    const { contentStore, router, toast, workflow } = setupWorkflow({
      contentPatch: { templateParams: { headline: '' } },
    })

    workflow.submitForReview()

    expect(contentStore.submitForReview).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Bitte zuerst alle Pflichtangaben vervollständigen')
  })

  it('moves rejected content back to draft with a review note', () => {
    const { contentStore, toast, user, workflow } = setupWorkflow({
      contentPatch: { status: 'rejected' },
    })

    workflow.saveDraft(false)

    expect(contentStore.moveToDraft).toHaveBeenCalledWith(
      'content-1',
      user,
      'Redaktion überarbeitet den Inhalt'
    )
    expect(toast.success).toHaveBeenCalledWith('Als Entwurf gespeichert')
  })

  it('creates a revision from locked reviewable content', () => {
    const { auditStore, contentStore, router, toast, user, workflow } = setupWorkflow({
      contentPatch: { status: 'approved' },
    })

    workflow.createRevision()

    expect(contentStore.createRevision).toHaveBeenCalledWith('content-1', user)
    expect(auditStore.log).toHaveBeenCalledWith('content.revision_created', 'content', 'content-2', 'user-1', {
      sourceId: 'content-1',
      sourceTitle: 'Sicherheitsinfo',
    })
    expect(toast.success).toHaveBeenCalledWith('Neue Revision wurde als Entwurf erstellt')
    expect(router.push).toHaveBeenCalledWith({
      name: 'admin-content-detail',
      params: { id: 'content-2' },
    })
  })

  it('opens the delete confirmation and cancels without removing content', async () => {
    const { contentStore, router, workflow } = setupWorkflow()

    const deletion = workflow.remove(false)

    expect(workflow.deleteConfirmOpen.value).toBe(true)
    expect(workflow.deleteConfirmMessage.value).toBe('Diesen Inhalt wirklich löschen?')

    workflow.cancelDeleteRequest()

    await expect(deletion).resolves.toBe(false)
    expect(workflow.deleteConfirmOpen.value).toBe(false)
    expect(contentStore.remove).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('removes content after the delete confirmation is accepted', async () => {
    vi.useFakeTimers()
    const { auditStore, contentStore, router, scheduleStore, toast, workflow } = setupWorkflow()

    const deletion = workflow.remove(false)
    workflow.confirmDeleteRequest()
    await Promise.resolve()

    expect(workflow.isDeleting.value).toBe(true)
    await vi.advanceTimersByTimeAsync(250)

    await expect(deletion).resolves.toBe(true)
    expect(contentStore.remove).toHaveBeenCalledWith('content-1')
    expect(scheduleStore.removeForTarget).toHaveBeenCalledWith('content', 'content-1')
    expect(auditStore.log).toHaveBeenCalledWith('content.delete', 'content', 'content-1', 'user-1', {
      title: 'Sicherheitsinfo',
      removedSchedules: 2,
    })
    expect(toast.success).toHaveBeenCalledWith('Inhalt gelöscht')
    expect(router.push).toHaveBeenCalledWith({ name: 'admin-templates' })
    expect(workflow.isDeleting.value).toBe(false)
  })

  it('does not open delete confirmation for read-only content', async () => {
    const { contentStore, toast, workflow } = setupWorkflow()

    await expect(workflow.remove(true)).resolves.toBe(false)

    expect(workflow.deleteConfirmOpen.value).toBe(false)
    expect(toast.info).toHaveBeenCalledWith('Diese Version ist schreibgeschützt und kann nicht direkt gelöscht werden.')
    expect(contentStore.remove).not.toHaveBeenCalled()
  })
})
