<script setup>
defineProps({
  canCreateRevision: { type: Boolean, default: false },
  content: { type: Object, required: true },
  isPublishable: { type: Boolean, default: false },
  isReadOnly: { type: Boolean, default: false },
  latestRejection: { type: Object, default: null },
  lockText: { type: String, default: '' },
  lockTitle: { type: String, default: '' },
  publicationIssues: { type: Array, default: () => [] },
})

defineEmits(['create-revision'])
</script>

<template>
  <div class="content-editor-alerts">
    <section v-if="content.status === 'rejected' && latestRejection" class="review-alert">
      <div>
        <strong>Änderungswunsch vom Review</strong>
        <p>{{ latestRejection.comment }}</p>
      </div>
      <span>{{ latestRejection.userName || latestRejection.userId }}</span>
    </section>

    <section v-if="isReadOnly" class="revision-lock">
      <div>
        <strong>{{ lockTitle }}</strong>
        <p>{{ lockText }}</p>
        <span v-if="content.basedOnContentId">
          Basis: {{ content.basedOnContentId }} · Version {{ content.basedOnReviewVersion || 0 }}
        </span>
      </div>
      <button v-if="canCreateRevision" class="btn-primary" type="button" @click="$emit('create-revision')">
        Neue Revision erstellen
      </button>
    </section>

    <section v-if="!isReadOnly" :class="['publication-check', { complete: isPublishable }]">
      <strong>{{ isPublishable ? 'Bereit für die Prüfung' : 'Noch nicht einreichbar' }}</strong>
      <ul v-if="!isPublishable">
        <li v-for="issue in publicationIssues" :key="issue.key">{{ issue.message }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.content-editor-alerts {
  display: contents;
}

.review-alert,
.publication-check,
.revision-lock {
  margin: -4px 0 16px;
  border-radius: 8px;
}

.review-alert {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 4px solid var(--color-danger);
  background: var(--color-danger-light);
}

.review-alert strong {
  display: block;
  color: #991b1b;
  font-size: 0.86rem;
  margin-bottom: 4px;
}

.review-alert p {
  margin: 0;
  color: #7f1d1d;
  font-size: 0.86rem;
  line-height: 1.45;
  white-space: pre-wrap;
}

.review-alert span {
  flex-shrink: 0;
  color: #991b1b;
  font-size: 0.76rem;
  font-weight: 700;
}

.publication-check {
  padding: 13px 16px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-left: 4px solid var(--color-danger);
  background: rgba(220, 38, 38, 0.045);
  color: var(--gray-700);
}

.publication-check.complete {
  border-color: rgba(181, 204, 24, 0.34);
  border-left-color: var(--blickle-green);
  background: rgba(181, 204, 24, 0.08);
}

.publication-check strong {
  display: block;
  color: var(--blickle-navy);
  font-size: 0.86rem;
  margin-bottom: 6px;
}

.publication-check.complete strong {
  margin-bottom: 0;
}

.publication-check ul {
  margin: 0;
  padding-left: 18px;
  color: var(--gray-600);
  font-size: 0.8rem;
  line-height: 1.45;
}

.revision-lock {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  padding: 15px 16px;
  border: 1px solid rgba(22, 58, 108, 0.14);
  border-left: 4px solid var(--blickle-navy);
  background: linear-gradient(135deg, rgba(22, 58, 108, 0.06), rgba(181, 204, 24, 0.08));
}

.revision-lock strong {
  display: block;
  color: var(--blickle-navy);
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.revision-lock p {
  margin: 0;
  color: var(--gray-700);
  font-size: 0.86rem;
  line-height: 1.45;
}

.revision-lock span {
  display: block;
  margin-top: 6px;
  color: var(--gray-500);
  font-size: 0.74rem;
  font-weight: 700;
}

.btn-primary {
  min-height: 36px;
  padding: 8px 18px;
  background: var(--blickle-navy);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover {
  background: #122E54;
}
</style>
