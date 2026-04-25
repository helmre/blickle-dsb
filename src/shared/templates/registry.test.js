import { describe, expect, it } from 'vitest'
import {
  CATALOG_TEMPLATE_ORDER,
  DESIGNER_TEMPLATES,
  filterCatalogTemplates,
  sortTemplatesForCatalog,
} from './registry.js'

describe('template registry catalog curation', () => {
  it('exposes the curated business templates in the configured order', () => {
    const visibleIds = filterCatalogTemplates(DESIGNER_TEMPLATES).map(template => template.id)

    expect(visibleIds).toEqual(CATALOG_TEMPLATE_ORDER)
    expect(visibleIds).not.toContain('designer-video-news')
    expect(visibleIds).not.toContain('designer-project-showcase')
  })

  it('keeps hidden templates addressable while removing them from catalog lists', () => {
    const hiddenTemplate = DESIGNER_TEMPLATES.find(template => template.id === 'designer-video-news')

    expect(hiddenTemplate).toMatchObject({ catalogHidden: true })
    expect(filterCatalogTemplates([hiddenTemplate]).length).toBe(0)
  })

  it('sorts unknown custom templates after curated templates by name', () => {
    const sorted = sortTemplatesForCatalog([
      { id: 'custom-z', name: 'Zebra' },
      { id: 'designer-kpi-dashboard', name: 'KPI / Produktionsstatus' },
      { id: 'custom-a', name: 'Anlage' },
    ])

    expect(sorted.map(template => template.id)).toEqual([
      'designer-kpi-dashboard',
      'custom-a',
      'custom-z',
    ])
  })
})
