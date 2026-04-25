<script setup>
import { ref, computed } from 'vue'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import { getTemplateById } from '../../shared/templates/registry.js'
import { validateContentForPublication } from '../../shared/templates/templateValidation.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'
import ReviewTimeline from '../components/ReviewTimeline.vue'

const contentStore = useContentStore()
const auditStore = useAuditStore()
const userStore = useUserStore()
const toast = useToastStore()

const showConfirm = ref(null) // { id, action, comment }
const canApprove = computed(() => userStore.can(PERMISSIONS.CONTENT_APPROVE))

const pendingItems = computed(() => contentStore.inReview)

function getUserName(userId) {
  const u = userStore.getById(userId)
  return u ? u.name : userId || 'Unbekannt'
}

function publicationIssues(item) {
  const template = item?.templateId ? getTemplateById(item.templateId) : null
  return validateContentForPublication(item, template)
}

function isPublishable(item) {
  return publicationIssues(item).length === 0
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('de-DE')
  } catch {
    return value
  }
}

function formatDateTime(value) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function latestSubmission(item) {
  return [...(item.reviewEvents || [])].reverse().find(event => event.type === 'submitted')
}

function reviewNoteFor(item) {
  return item.reviewNote || latestSubmission(item)?.comment || ''
}

function reviewFacts(item) {
  const context = item.reviewContext || {}
  return [
    { label: 'Zielgruppe', value: context.locationLabel },
    { label: 'Zeitraum', value: context.validityLabel },
    { label: 'Vorschau', value: context.previewLocationLabel },
    { label: 'Display geprüft', value: formatDateTime(context.previewCheckedAt) },
  ].filter(fact => fact.value)
}

function confirmApprove(id) {
  if (!canApprove.value) return
  const item = contentStore.getById(id)
  const issues = publicationIssues(item)
  if (issues.length) {
    toast.error('Dieser Inhalt ist noch nicht freigabefähig')
    return
  }
  showConfirm.value = { id, action: 'approve', comment: '' }
}

function confirmReject(id) {
  if (!canApprove.value) return
  showConfirm.value = { id, action: 'reject', comment: '' }
}

function logAudit(action, entityType, entityId, userId, details) {
  safeAuditLog(auditStore, action, entityType, entityId, userId, details, { toast })
}

function executeAction() {
  if (!showConfirm.value || !canApprove.value) return
  const { id, action, comment } = showConfirm.value
  const cleanComment = comment.trim()

  if (action === 'reject' && !cleanComment) {
    toast.error('Bitte einen Änderungswunsch oder Ablehnungsgrund eintragen')
    return
  }

  if (action === 'approve') {
    try {
      contentStore.approve(id, userStore.currentUser, cleanComment)
    } catch (error) {
      toast.error(error?.issues?.[0]?.message || error?.message || 'Inhalt konnte nicht freigegeben werden')
      return
    }
    logAudit('content.approved', 'content', id, userStore.currentUser.id, {
      approvedBy: userStore.currentUser.name,
      comment: cleanComment
    })
    toast.success('Inhalt freigegeben')
  } else {
    try {
      contentStore.reject(id, userStore.currentUser, cleanComment)
    } catch (error) {
      toast.error(error?.message || 'Inhalt konnte nicht abgelehnt werden')
      return
    }
    logAudit('content.rejected', 'content', id, userStore.currentUser.id, {
      rejectedBy: userStore.currentUser.name,
      comment: cleanComment
    })
    toast.info('Änderungswunsch wurde gespeichert')
  }
  showConfirm.value = null
}

function cancelAction() {
  showConfirm.value = null
}
</script>

<template>
  <div class="approval-page">
    <div class="page-toolbar">
      <h2 class="page-title">Freigabe-Warteschlange</h2>
      <span class="badge-count">{{ pendingItems.length }} ausstehend</span>
    </div>

    <div class="approval-list">
      <div v-for="item in pendingItems" :key="item.id" class="approval-card">
        <div class="card-info">
          <h4 class="card-title">{{ item.title }}</h4>
          <p class="card-desc">{{ item.description || 'Keine Beschreibung' }}</p>
          <div class="card-meta">
            <span class="meta-item">Erstellt von: <strong>{{ getUserName(item.createdBy) }}</strong></span>
            <span class="meta-item">Eingereicht: {{ formatDate(item.submittedAt || item.updatedAt || item.createdAt) }}</span>
            <span v-if="item.reviewVersion" class="meta-item">Version: {{ item.reviewVersion }}</span>
            <span class="meta-item">Typ: {{ item.type }}</span>
          </div>
          <div class="card-tags" v-if="item.tags && item.tags.length">
            <span v-for="tag in item.tags" :key="tag" class="tag-badge">{{ tag }}</span>
          </div>
          <section v-if="reviewNoteFor(item) || reviewFacts(item).length" class="review-brief">
            <div class="review-brief-head">
              <strong>Prüfauftrag</strong>
              <span v-if="latestSubmission(item)?.userName">{{ latestSubmission(item).userName }}</span>
            </div>
            <p v-if="reviewNoteFor(item)">{{ reviewNoteFor(item) }}</p>
            <dl v-if="reviewFacts(item).length">
              <div v-for="fact in reviewFacts(item)" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
          </section>
          <div v-if="publicationIssues(item).length" class="validation-block">
            <strong>Nicht freigabefähig</strong>
            <ul>
              <li v-for="issue in publicationIssues(item)" :key="issue.key">{{ issue.message }}</li>
            </ul>
          </div>
          <ReviewTimeline v-if="item.reviewEvents?.length" :events="item.reviewEvents" compact class="card-timeline" />
        </div>
        <div class="card-actions">
          <router-link class="btn-outline" :to="{ name: 'admin-content-detail', params: { id: item.id } }">Prüfen</router-link>
          <button class="btn-approve" :disabled="!isPublishable(item)" @click="confirmApprove(item.id)">Freigeben</button>
          <button class="btn-reject" @click="confirmReject(item.id)">Ablehnen</button>
        </div>
      </div>
      <div v-if="!pendingItems.length" class="empty-state">
        <div class="empty-icon">&#10003;</div>
        <p class="empty-title">Alles erledigt!</p>
        <p class="empty-text">Keine Inhalte warten auf Freigabe.</p>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="cancelAction">
      <div class="modal">
        <div class="modal-header" :class="showConfirm.action === 'approve' ? 'modal-header-success' : 'modal-header-danger'">
          <h3>{{ showConfirm.action === 'approve' ? 'Inhalt freigeben' : 'Inhalt ablehnen' }}</h3>
          <button class="modal-close" @click="cancelAction">&times;</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            {{ showConfirm.action === 'approve'
              ? 'Sind Sie sicher, dass Sie diesen Inhalt freigeben möchten?'
              : 'Sind Sie sicher, dass Sie diesen Inhalt ablehnen möchten?' }}
          </p>
          <div v-if="showConfirm.action === 'approve' && publicationIssues(contentStore.getById(showConfirm.id)).length" class="validation-block modal-validation">
            <strong>Nicht freigabefähig</strong>
            <ul>
              <li v-for="issue in publicationIssues(contentStore.getById(showConfirm.id))" :key="issue.key">{{ issue.message }}</li>
            </ul>
          </div>
          <div class="form-group">
            <label>{{ showConfirm.action === 'approve' ? 'Kommentar (optional)' : 'Änderungswunsch / Ablehnungsgrund' }}</label>
            <textarea
              v-model="showConfirm.comment"
              class="form-input"
              rows="4"
              :placeholder="showConfirm.action === 'approve' ? 'Optionaler Hinweis zur Freigabe...' : 'Was muss geändert werden, bevor der Inhalt freigegeben werden kann?'"
            ></textarea>
            <p v-if="showConfirm.action === 'reject'" class="field-hint">Der Kommentar wird für den Redakteur im Inhalt sichtbar.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelAction">Abbrechen</button>
          <button
            :class="showConfirm.action === 'approve' ? 'btn-approve-solid' : 'btn-danger-solid'"
            :disabled="showConfirm.action === 'reject' && !showConfirm.comment.trim()"
            @click="executeAction"
          >
            {{ showConfirm.action === 'approve' ? 'Freigeben' : 'Ablehnen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approval-page { max-width: 900px; }

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--blickle-navy);
}
.badge-count {
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--color-warning-light);
  color: #92400E;
}

.approval-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.approval-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  border-left: 4px solid var(--color-warning);
}

	.card-info { flex: 1; min-width: 0; }

.card-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 4px;
}
.card-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
.card-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.meta-item {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tag-badge {
  font-size: 0.6rem;
  padding: 1px 6px;
  background: var(--gray-100);
  color: var(--gray-600);
  border-radius: 4px;
}

.review-brief {
  display: grid;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(22, 58, 108, 0.12);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(22, 58, 108, 0.04), rgba(181, 204, 24, 0.07));
}

.review-brief-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.review-brief-head strong {
  color: var(--blickle-navy);
  font-size: 0.82rem;
}

.review-brief-head span {
  color: var(--gray-500);
  font-size: 0.72rem;
  font-weight: 700;
}

.review-brief p {
  margin: 0;
  color: var(--gray-700);
  font-size: 0.84rem;
  line-height: 1.45;
  white-space: pre-wrap;
}

.review-brief dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  margin: 0;
}

.review-brief dl div {
  display: grid;
  gap: 2px;
}

.review-brief dt {
  color: var(--gray-500);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
}

.review-brief dd {
  margin: 0;
  color: var(--gray-800);
  font-size: 0.78rem;
  line-height: 1.35;
}

.validation-block {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 8px;
  background: rgba(220, 38, 38, 0.045);
}

.validation-block strong {
  display: block;
  color: #991b1b;
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.validation-block ul {
  margin: 0;
  padding-left: 18px;
  color: var(--gray-600);
  font-size: 0.76rem;
  line-height: 1.45;
}

.modal-validation {
  margin: 0 0 14px;
}

	.card-actions {
	  display: flex;
	  flex-direction: column;
	  gap: 8px;
	  flex-shrink: 0;
    min-width: 128px;
	}

  .card-timeline { margin-top: 12px; }

  .btn-outline {
    padding: 8px 20px;
    background: #fff;
    color: var(--blickle-navy);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--font-size-sm);
    border: 1px solid var(--color-border);
    text-align: center;
    text-decoration: none;
  }

.btn-approve {
  padding: 8px 20px;
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
}
.btn-approve:hover { opacity: 0.9; }
.btn-approve:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-reject {
  padding: 8px 20px;
  background: var(--gray-100);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-danger);
}
.btn-reject:hover { background: var(--color-danger-light); }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.empty-icon {
  font-size: 3rem;
  color: var(--color-success);
  margin-bottom: 12px;
}
.empty-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--blickle-navy);
  margin-bottom: 4px;
}
.empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.btn-secondary {
  padding: 8px 20px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
}
.btn-approve-solid {
  padding: 8px 20px;
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
}
	.btn-danger-solid {
  padding: 8px 20px;
  background: var(--color-danger);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
	}
  .btn-danger-solid:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
	.form-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1);
	}
  .field-hint {
    margin: 6px 0 0;
    color: var(--gray-500);
    font-size: var(--font-size-xs);
  }

.confirm-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  width: 480px;
  box-shadow: var(--shadow-lg);
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header-success { background: #F0FDF4; }
.modal-header-success h3 { color: var(--color-success); }
.modal-header-danger { background: #FEF2F2; }
.modal-header-danger h3 { color: var(--color-danger); }
.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}
.modal-close { font-size: 1.5rem; color: var(--gray-400); padding: 4px; }
.modal-body { padding: 24px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
