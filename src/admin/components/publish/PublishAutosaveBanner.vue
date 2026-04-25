<script setup>
defineProps({
  savedAtLabel: { type: String, default: '' },
})

defineEmits(['discard', 'restore'])
</script>

<template>
  <section class="autosave-banner" aria-live="polite">
    <div>
      <strong>Zwischenstand gefunden</strong>
      <span>
        {{ savedAtLabel ? `Automatisch gespeichert am ${savedAtLabel}` : 'Automatisch gespeichert' }}
      </span>
    </div>
    <div class="autosave-actions">
      <button type="button" class="btn-secondary" @click="$emit('discard')">Verwerfen</button>
      <button type="button" class="btn-primary" @click="$emit('restore')">Wiederherstellen</button>
    </div>
  </section>
</template>

<style scoped>
.autosave-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 0 0 16px;
  padding: 12px 14px;
  border: 1px solid rgba(181, 204, 24, 0.48);
  border-radius: 8px;
  background: rgba(181, 204, 24, 0.12);
  color: var(--blickle-navy);
}

.autosave-banner div:first-child {
  display: grid;
  gap: 3px;
}

.autosave-banner strong {
  font-size: 0.88rem;
}

.autosave-banner span {
  color: var(--gray-600);
  font-size: 0.8rem;
}

.autosave-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  border-radius: 8px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0 14px;
}

.btn-secondary {
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--blickle-navy);
}

.btn-primary {
  border: 1px solid var(--blickle-green);
  background: var(--blickle-green);
  color: var(--blickle-navy);
}

@media (max-width: 820px) {
  .autosave-banner {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
