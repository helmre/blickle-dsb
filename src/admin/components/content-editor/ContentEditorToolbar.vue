<script setup>
import { ArrowLeft, CopyPlus, Save, Send, Trash2 } from 'lucide-vue-next'

defineProps({
  canCreateRevision: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canSubmit: { type: Boolean, default: false },
  content: { type: Object, required: true },
  isPublishable: { type: Boolean, default: false },
  isReadOnly: { type: Boolean, default: false },
  isDeleting: { type: Boolean, default: false },
  isSavingDraft: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  statusLabels: { type: Object, required: true },
  template: { type: Object, default: null },
})

defineEmits(['back', 'create-revision', 'remove', 'save-draft', 'submit'])
</script>

<template>
  <header class="editor-toolbar">
    <div class="tb-left">
      <button class="btn-back" type="button" @click="$emit('back')">
        <ArrowLeft :size="16" />
        <span>Katalog</span>
      </button>
      <div class="tb-divider"></div>
      <div class="tb-meta">
        <h1 class="tb-title">{{ content.title || template?.name || 'Neuer Inhalt' }}</h1>
        <div class="tb-sub">
          <span :class="['status-pill', `status-${content.status}`]">
            {{ statusLabels[content.status] || content.status }}
          </span>
          <span v-if="template" class="tpl-pill">{{ template.name }}</span>
        </div>
      </div>
    </div>

    <div class="tb-right">
      <button v-if="canCreateRevision" class="btn-primary" type="button" @click="$emit('create-revision')">
        <CopyPlus :size="16" />
        <span>Neue Revision erstellen</span>
      </button>
      <button
        v-if="canDelete && !isReadOnly"
        class="btn-ghost btn-danger"
        type="button"
        :disabled="isDeleting || isSavingDraft || isSubmitting"
        @click="$emit('remove')"
      >
        <Trash2 :size="16" />
        <span>{{ isDeleting ? 'Löscht...' : 'Löschen' }}</span>
      </button>
      <button
        v-if="!isReadOnly"
        class="btn-ghost"
        type="button"
        :disabled="isSavingDraft || isDeleting || isSubmitting"
        @click="$emit('save-draft')"
      >
        <Save :size="16" />
        <span>{{ isSavingDraft ? 'Speichert...' : 'Entwurf speichern' }}</span>
      </button>
      <button
        v-if="canSubmit && !isReadOnly"
        class="btn-primary"
        type="button"
        :disabled="content.status === 'in_review' || !isPublishable || isSubmitting || isSavingDraft || isDeleting"
        @click="$emit('submit')"
      >
        <Send :size="16" />
        <span>{{ isSubmitting ? 'Wird eingereicht...' : 'Zur Prüfung einreichen' }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.tb-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back,
.btn-ghost,
.btn-primary {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-back {
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 8px 14px;
  color: var(--gray-600);
}

.btn-back:hover {
  border-color: var(--blickle-navy);
  color: var(--blickle-navy);
}

.tb-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}

.tb-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--blickle-navy);
  margin: 0;
}

.tb-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.status-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.status-draft { background: rgba(148,163,184,0.2); color: #475569; }
.status-in_review { background: rgba(245,158,11,0.18); color: #b45309; }
.status-approved { background: rgba(16,185,129,0.18); color: #047857; }
.status-rejected { background: rgba(239,68,68,0.18); color: #b91c1c; }
.status-archived { background: rgba(100,116,139,0.18); color: #475569; }

.tpl-pill {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(22,58,108,0.08);
  color: var(--blickle-navy);
}

.tb-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-ghost {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--gray-600);
}

.btn-ghost:hover {
  border-color: var(--blickle-navy);
  color: var(--blickle-navy);
}

.btn-danger {
  border-color: rgba(239,68,68,0.3);
  color: #b91c1c;
}

.btn-danger:hover {
  background: rgba(239,68,68,0.08);
  border-color: #ef4444;
  color: #991b1b;
}

.btn-primary {
  padding: 8px 18px;
  background: var(--blickle-navy);
  color: #fff;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #122E54;
}

.btn-primary:disabled,
.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost:disabled:hover {
  border-color: var(--color-border);
  color: var(--gray-600);
  background: transparent;
}
</style>
