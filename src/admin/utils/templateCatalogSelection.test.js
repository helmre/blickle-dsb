import { describe, expect, it } from 'vitest'
import {
  resolveTemplateQuerySelection,
  resolveTemplateSelection,
} from './templateCatalogSelection.js'

const templates = [
  { id: 'tpl-a', name: 'A' },
  { id: 'tpl-b', name: 'B' },
]

describe('templateCatalogSelection', () => {
  it('uses a valid route query template id as the selected template', () => {
    expect(resolveTemplateQuerySelection({ template: 'tpl-b' }, templates)).toBe('tpl-b')
  })

  it('ignores array query values and unknown templates', () => {
    expect(resolveTemplateQuerySelection({ template: ['tpl-b'] }, templates)).toBe('')
    expect(resolveTemplateQuerySelection({ template: 'missing' }, templates)).toBe('')
  })

  it('keeps an existing selection or falls back to the first available template', () => {
    expect(resolveTemplateSelection({
      currentSelectionId: 'tpl-b',
      query: {},
      templates,
    })).toBe('tpl-b')

    expect(resolveTemplateSelection({
      currentSelectionId: '',
      query: {},
      templates,
    })).toBe('tpl-a')
  })
})
