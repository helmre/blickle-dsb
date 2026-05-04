import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  CATALOG_TEMPLATE_ORDER,
  DESIGNER_TEMPLATES,
  buildTemplateCardMeta,
  filterCatalogTemplates,
  getCatalogTemplates,
  sortTemplatesForCatalog,
} from './registry.js'
import { installMemoryStorage } from '../../test/localStorage.js'

describe('template registry catalog curation', () => {
  beforeEach(() => {
    installMemoryStorage({ dsb_templates: '[]' })
    setActivePinia(createPinia())
  })

  it('exposes the curated business templates in the configured order', () => {
    const visibleIds = filterCatalogTemplates(DESIGNER_TEMPLATES).map(template => template.id)

    expect(visibleIds).toEqual(CATALOG_TEMPLATE_ORDER)
    expect(visibleIds).not.toContain('designer-video-news')
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

  it('shows the project showcase as a reusable catalog template', () => {
    const projectTemplate = getCatalogTemplates().find(template => template.id === 'designer-project-showcase')

    expect(projectTemplate).toMatchObject({
      name: 'Projekt-Showcase',
      category: 'kommunikation',
      renderer: 'component',
      editorComponent: 'ProjectShowcaseEditor',
    })
  })

  it('derives rich card metadata for curated designer templates', () => {
    const projectTemplate = DESIGNER_TEMPLATES.find(template => template.id === 'designer-project-showcase')
    const meta = buildTemplateCardMeta(projectTemplate, category => ({ kommunikation: 'Kommunikation' })[category] || category)

    expect(meta).toMatchObject({
      title: 'Frida Hochbeet',
      kicker: 'PROJEKT-SHOWCASE',
      recommendedFor: 'Projekt-Erfolge, Nachhaltigkeit und interne Success-Stories',
      theme: 'dark',
    })
  })

  it('falls back to safe card metadata for templates without optional catalog fields', () => {
    const meta = buildTemplateCardMeta({
      id: 'legacy-custom',
      name: 'Eigene Vorlage',
      description: 'Kurze Beschreibung',
      category: 'sonstiges',
      renderer: 'html-params',
      thumbnailAccent: '#123456',
    }, category => ({ sonstiges: 'Sonstiges' })[category] || category)

    expect(meta).toMatchObject({
      title: 'Eigene Vorlage',
      kicker: 'Sonstiges',
      recommendedFor: 'Kurze Beschreibung',
      accent: '#123456',
      theme: 'dark',
    })
  })
})
