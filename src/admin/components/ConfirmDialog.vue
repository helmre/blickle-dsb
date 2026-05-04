<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  focusInitialDialogControl,
  getDialogFocusableElements,
  restoreDialogFocus,
  trapDialogTab,
} from './confirmDialogFocus.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Löschen' },
  confirmVariant: {
    type: String,
    default: 'danger',
    validator: value => ['danger', 'primary'].includes(value),
  },
  cancelLabel: { type: String, default: 'Abbrechen' },
})

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

const cancelButton = ref(null)
const confirmButton = ref(null)
const dialog = ref(null)
const dialogId = `confirm-dialog-${Math.random().toString(36).slice(2)}`
let previousFocus = null

function removeEscapeListener() {
  window.removeEventListener('keydown', onKeydown)
}

function cancel() {
  emit('update:open', false)
  emit('cancel')
}

function accept() {
  emit('update:open', false)
  emit('confirm')
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
    return
  }
  trapDialogTab(event, getDialogFocusableElements(dialog.value))
}

watch(() => props.open, open => {
  removeEscapeListener()
  if (open) {
    previousFocus = document.activeElement
    window.addEventListener('keydown', onKeydown)
    nextTick(() => focusInitialDialogControl({
      cancelButton: cancelButton.value,
      confirmButton: confirmButton.value,
      dialog: dialog.value,
    }))
  } else if (previousFocus) {
    const target = previousFocus
    previousFocus = null
    nextTick(() => restoreDialogFocus(target))
  }
}, { immediate: true })

onBeforeUnmount(removeEscapeListener)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-overlay" @click.self="cancel">
      <section
        ref="dialog"
        class="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="`${dialogId}-title`"
        :aria-describedby="`${dialogId}-message`"
        tabindex="-1"
      >
        <header class="confirm-header">
          <h3 :id="`${dialogId}-title`">{{ title }}</h3>
          <button class="confirm-close" type="button" aria-label="Dialog schließen" @click="cancel">&times;</button>
        </header>
        <div class="confirm-body">
          <p :id="`${dialogId}-message`">{{ message }}</p>
        </div>
        <footer class="confirm-footer">
          <button ref="cancelButton" class="btn-secondary" type="button" @click="cancel">{{ cancelLabel }}</button>
          <button
            ref="confirmButton"
            :class="['btn-confirm', `btn-confirm-${confirmVariant}`]"
            type="button"
            @click="accept"
          >
            {{ confirmLabel }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.5);
}

.confirm-dialog {
  width: min(440px, 100%);
  overflow: hidden;
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
}

.confirm-header h3 {
  margin: 0;
  color: var(--blickle-navy);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.confirm-close {
  padding: 4px;
  color: var(--gray-400);
  font-size: 1.5rem;
  line-height: 1;
}

.confirm-close:hover {
  color: var(--gray-600);
}

.confirm-body {
  padding: 24px;
}

.confirm-body p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

.btn-secondary,
.btn-confirm {
  min-height: 36px;
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

.btn-confirm-danger {
  background: var(--color-danger);
  color: white;
}

.btn-confirm-danger:hover {
  background: #DC2626;
}

.btn-confirm-primary {
  background: var(--blickle-navy);
  color: white;
}

.btn-confirm-primary:hover {
  background: var(--blickle-navy-light);
}
</style>
