import { describe, expect, it, vi } from 'vitest'
import {
  focusInitialDialogControl,
  restoreDialogFocus,
  trapDialogTab,
} from './confirmDialogFocus.js'

function button(name) {
  return {
    name,
    focus: vi.fn(),
  }
}

describe('confirmDialogFocus', () => {
  it('focuses the cancel control first instead of the destructive confirm action', () => {
    const cancelButton = button('cancel')
    const confirmButton = button('confirm')
    const dialog = button('dialog')

    focusInitialDialogControl({ cancelButton, confirmButton, dialog })

    expect(cancelButton.focus).toHaveBeenCalled()
    expect(confirmButton.focus).not.toHaveBeenCalled()
    expect(dialog.focus).not.toHaveBeenCalled()
  })

  it('restores focus to the element active before the dialog opened', () => {
    const previous = button('previous')

    restoreDialogFocus(previous)

    expect(previous.focus).toHaveBeenCalled()
  })

  it('traps tab navigation inside the dialog', () => {
    const first = button('first')
    const last = button('last')
    const event = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: vi.fn(),
    }

    trapDialogTab(event, [first, last], first)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(last.focus).toHaveBeenCalled()
  })
})
