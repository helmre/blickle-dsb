<script setup>
import { ref, computed } from 'vue'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const contentStore = useContentStore()
const auditStore = useAuditStore()
const userStore = useUserStore()

const showConfirm = ref(null) // { id, action, comment }
const rejectComment = ref('')

const pendingItems = computed(() => contentStore.inReview)

function getUserName(userId) {
  const u = userStore.getById(userId)
  return u ? u.name : userId || 'Unbekannt'
}

function confirmApprove(id) {
  showConfirm.value = { id, action: 'approve', comment: '' }
}

function confirmReject(id) {
  showConfirm.value = { id, action: 'reject', comment: '' }
  rejectComment.value = ''
}

function executeAction() {
  if (!showConfirm.value) return
  const { id, action } = showConfirm.value

  if (action === 'approve') {
    contentStore.setStatus(id, 'approved')
    auditStore.log('content.approved', 'content', id, userStore.currentUser.id, {
      approvedBy: userStore.currentUser.name
    })
  } else {
    contentStore.setStatus(id, 'rejected')
    auditStore.log('content.rejected', 'content', id, userStore.currentUser.id, {
      rejectedBy: userStore.currentUser.name,
      comment: rejectComment.value
    })
  }
  showConfirm.value = null
  rejectComment.value = ''
}

function cancelAction() {
  showConfirm.value = null
  rejectComment.value = ''
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
            <span class="meta-item">Eingereicht: {{ new Date(item.updatedAt || item.createdAt).toLocaleDateString('de-DE') }}</span>
            <span class="meta-item">Typ: {{ item.type }}</span>
          </div>
          <div class="card-tags" v-if="item.tags && item.tags.length">
            <span v-for="tag in item.tags" :key="tag" class="tag-badge">{{ tag }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-approve" @click="confirmApprove(item.id)">Freigeben</button>
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
              ? 'Sind Sie sicher, dass Sie diesen Inhalt freigeben moechten?'
              : 'Sind Sie sicher, dass Sie diesen Inhalt ablehnen moechten?' }}
          </p>
          <div v-if="showConfirm.action === 'reject'" class="form-group">
            <label>Kommentar (optional)</label>
            <textarea
              v-model="rejectComment"
              class="form-input"
              rows="3"
              placeholder="Grund fuer die Ablehnung..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelAction">Abbrechen</button>
          <button
            :class="showConfirm.action === 'approve' ? 'btn-approve-solid' : 'btn-danger-solid'"
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

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
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
