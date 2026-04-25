export function safeAuditLog(auditStore, action, entityType, entityId, userId, details = {}, options = {}) {
  try {
    return auditStore.log(action, entityType, entityId, userId, details)
  } catch (error) {
    console.warn('[Audit] Audit-Log konnte nicht geschrieben werden:', error)
    options.toast?.warning?.(options.warningMessage || 'Aktion gespeichert, aber Audit-Log konnte nicht geschrieben werden')
    return null
  }
}
