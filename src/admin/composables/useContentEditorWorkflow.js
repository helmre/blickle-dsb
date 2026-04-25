import { computed } from 'vue'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import { validateContentForPublication } from '../../shared/templates/templateValidation.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'

export const CONTENT_STATUS_LABELS = {
  draft: 'Entwurf',
  in_review: 'Zur Prüfung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
  archived: 'Archiviert',
}

export function useContentEditorWorkflow({
  auditStore,
  content,
  contentStore,
  flushPendingParams,
  router,
  scheduleStore,
  template,
  toast,
  userStore,
}) {
  const canDelete = computed(() => userStore.can(PERMISSIONS.CONTENT_DELETE))
  const canSubmit = computed(() => userStore.can(PERMISSIONS.CONTENT_SUBMIT))
  const canUpload = computed(() => userStore.can(PERMISSIONS.MEDIA_UPLOAD))
  const canCreateRevision = computed(() => {
    return userStore.can(PERMISSIONS.CONTENT_CREATE) &&
      ['approved', 'in_review'].includes(content.value?.status)
  })

  const lockTitle = computed(() => {
    if (content.value?.status === 'approved') return 'Freigegebene Version ist gesperrt'
    if (content.value?.status === 'in_review') return 'Eingereichte Version ist gesperrt'
    if (content.value?.status === 'archived') return 'Archivierte Version ist gesperrt'
    return ''
  })

  const lockText = computed(() => {
    if (content.value?.status === 'approved') {
      return 'Änderungen an live sichtbaren Inhalten laufen über eine neue Revision. Die aktuelle Version bleibt unverändert auf dem Display, bis die Revision freigegeben ist.'
    }
    if (content.value?.status === 'in_review') {
      return 'Diese Einreichung ist im Prüfprozess fixiert. Starte eine neue Revision, wenn du vor der Freigabe noch etwas ändern musst.'
    }
    if (content.value?.status === 'archived') {
      return 'Diese Version wurde durch eine neuere Revision ersetzt und bleibt nur als Verlauf sichtbar.'
    }
    return ''
  })

  const latestRejection = computed(() => {
    return [...(content.value?.reviewEvents || [])]
      .reverse()
      .find(event => event.type === 'rejected' && event.comment)
  })

  function currentUser() {
    return userStore.currentUser
  }

  function saveDraft(isReadOnly) {
    if (!content.value) return
    if (isReadOnly) {
      toast.info('Diese Version ist schreibgeschützt. Bitte eine neue Revision erstellen.')
      return
    }

    try {
      if (content.value.status === 'rejected') {
        contentStore.moveToDraft(content.value.id, currentUser(), 'Redaktion überarbeitet den Inhalt')
      } else {
        contentStore.update(content.value.id, { status: 'draft' })
      }
    } catch (error) {
      toast.error(error?.message || 'Entwurf konnte nicht gespeichert werden')
      return
    }

    safeAuditLog(auditStore, 'content.save_draft', 'content', content.value.id, currentUser()?.id, { title: content.value.title }, { toast })
    toast.success('Als Entwurf gespeichert')
  }

  function submitForReview() {
    if (!content.value) return

    const current = flushPendingParams()
    const issues = validateContentForPublication(current, template.value)
    if (issues.length) {
      toast.error('Bitte zuerst alle Pflichtangaben vervollständigen')
      return
    }

    try {
      contentStore.submitForReview(content.value.id, currentUser())
      safeAuditLog(auditStore, 'content.submit', 'content', content.value.id, currentUser()?.id, { title: content.value.title }, { toast })
      toast.success('Zur Prüfung eingereicht')
      router.push({ name: 'admin-content' })
    } catch (error) {
      toast.error(error?.issues?.[0]?.message || error?.message || 'Inhalt konnte nicht eingereicht werden')
    }
  }

  function remove(isReadOnly) {
    if (!content.value) return
    if (isReadOnly) {
      toast.info('Diese Version ist schreibgeschützt und kann nicht direkt gelöscht werden.')
      return
    }
    if (!confirm('Diesen Inhalt wirklich löschen?')) return

    const id = content.value.id
    const title = content.value.title
    let removedSchedules = 0
    try {
      contentStore.remove(id)
    } catch (error) {
      toast.error(error?.message || 'Inhalt konnte nicht gelöscht werden')
      return
    }
    try {
      removedSchedules = scheduleStore?.removeForTarget?.('content', id) || 0
    } catch (error) {
      console.warn('[ContentEditor] Zeitplan-Bereinigung fehlgeschlagen:', error)
      toast.warning('Inhalt gelöscht, aber abhängige Zeitpläne konnten nicht bereinigt werden')
    }

    safeAuditLog(auditStore, 'content.delete', 'content', id, currentUser()?.id, { title, removedSchedules }, { toast })
    toast.success('Inhalt gelöscht')
    router.push({ name: 'admin-templates' })
  }

  function createRevision() {
    if (!content.value || !canCreateRevision.value) return

    try {
      const revision = contentStore.createRevision(content.value.id, currentUser())
      if (!revision) throw new Error('Revision konnte nicht erstellt werden')
      safeAuditLog(auditStore, 'content.revision_created', 'content', revision.id, currentUser()?.id, {
        sourceId: content.value.id,
        sourceTitle: content.value.title,
      }, { toast })
      toast.success('Neue Revision wurde als Entwurf erstellt')
      router.push({ name: 'admin-content-detail', params: { id: revision.id } })
    } catch (error) {
      toast.error(error?.message || 'Revision konnte nicht erstellt werden')
    }
  }

  function replacePdfFile({ dataUrl, file }, isReadOnly) {
    if (!content.value || !canUpload.value || isReadOnly) return

    try {
      contentStore.update(content.value.id, {
        fileUrl: dataUrl,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: 'application/pdf',
      })
      safeAuditLog(auditStore, 'content.pdf_replace', 'content', content.value.id, currentUser()?.id, {
        fileName: file.name,
        fileSizeBytes: file.size,
      }, { toast })
      toast.success(`${file.name} hochgeladen`)
    } catch (error) {
      console.error('[ContentEditor] PDF-Upload fehlgeschlagen:', error)
      toast.error(error?.message || 'PDF konnte nicht gespeichert werden')
    }
  }

  return {
    canCreateRevision,
    canDelete,
    canSubmit,
    canUpload,
    createRevision,
    latestRejection,
    lockText,
    lockTitle,
    remove,
    replacePdfFile,
    saveDraft,
    statusLabels: CONTENT_STATUS_LABELS,
    submitForReview,
  }
}
