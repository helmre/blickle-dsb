const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function canFocus(element) {
  return element && typeof element.focus === 'function'
}

export function getDialogFocusableElements(dialog) {
  if (!dialog?.querySelectorAll) return []
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(canFocus)
}

export function focusInitialDialogControl({ cancelButton, confirmButton, dialog } = {}) {
  const target = cancelButton || dialog || confirmButton
  if (canFocus(target)) target.focus()
}

export function restoreDialogFocus(previousElement) {
  if (canFocus(previousElement)) previousElement.focus()
}

export function trapDialogTab(event, focusableElements = [], activeElement = globalThis.document?.activeElement) {
  if (event.key !== 'Tab' || focusableElements.length === 0) return

  const first = focusableElements[0]
  const last = focusableElements[focusableElements.length - 1]
  const shouldWrapBackward = event.shiftKey && activeElement === first
  const shouldWrapForward = !event.shiftKey && activeElement === last

  if (!shouldWrapBackward && !shouldWrapForward) return

  event.preventDefault()
  ;(shouldWrapBackward ? last : first).focus()
}
