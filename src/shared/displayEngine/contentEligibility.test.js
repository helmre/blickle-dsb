import { describe, expect, it } from 'vitest'
import {
  filterLocationContent,
  filterVisibleContent,
  getLocationScopeIds,
  isEmergencyTargetedForDisplay,
  mapTagToCategory,
  splitDisplayContent,
} from './contentEligibility.js'

const approvedContent = [
  {
    id: 'global-info',
    title: 'Global',
    status: 'approved',
    type: 'text',
    createdAt: '2026-04-24T09:00:00.000Z',
    locationIds: [],
  },
  {
    id: 'fb1-info',
    title: 'FB1',
    status: 'approved',
    type: 'text',
    createdAt: '2026-04-24T09:00:00.000Z',
    locationIds: ['loc-fb1'],
  },
]

describe('contentEligibility', () => {
  it('derives location scope from child to parent', () => {
    const scope = getLocationScopeIds('loc-fb1', [
      { id: 'loc-global', parentId: null },
      { id: 'loc-production', parentId: 'loc-global' },
      { id: 'loc-fb1', parentId: 'loc-production' },
    ])

    expect(scope).toEqual(['loc-fb1', 'loc-production', 'loc-global'])
  })

  it('targets emergencies through the full location ancestor chain', () => {
    const locations = [
      { id: 'loc-global', parentId: null },
      { id: 'loc-production', parentId: 'loc-global' },
      { id: 'loc-hall-1', parentId: 'loc-production' },
    ]

    expect(isEmergencyTargetedForDisplay(
      { targetLocationIds: ['loc-production'] },
      'loc-hall-1',
      locations
    )).toBe(true)
    expect(isEmergencyTargetedForDisplay(
      { targetLocationIds: ['loc-admin'] },
      'loc-hall-1',
      locations
    )).toBe(false)
  })

  it('keeps date-only content valid through the selected day', () => {
    const visible = filterVisibleContent({
      approvedContent: [
        {
          id: 'today',
          title: 'Heute',
          status: 'approved',
          type: 'text',
          validFrom: '2026-04-24',
          validUntil: '2026-04-24',
        },
      ],
      now: new Date('2026-04-24T20:00:00+02:00'),
    })

    expect(visible.map(content => content.id)).toEqual(['today'])
  })

  it('requires scheduled content to be active for the simulated location', () => {
    const visible = filterVisibleContent({
      approvedContent,
      locationScopeIds: ['loc-fb1', 'loc-production', 'loc-global'],
      schedules: [
        {
          id: 'inactive-content-schedule',
          targetType: 'content',
          targetId: 'fb1-info',
          startDate: '2026-04-25',
          endDate: '2026-04-25',
          locationIds: ['loc-fb1'],
          isActive: true,
        },
      ],
      now: new Date('2026-04-24T10:00:00+02:00'),
    })

    expect(visible.map(content => content.id)).toEqual(['global-info'])
  })

  it('keeps global content and matching location content together', () => {
    const scoped = filterLocationContent({
      visibleContent: approvedContent,
      locationId: 'loc-fb1',
      locationScopeIds: ['loc-fb1', 'loc-production', 'loc-global'],
    })

    expect(scoped.map(content => content.id)).toEqual(['global-info', 'fb1-info'])
  })

  it('splits fullscreen designer content from tile-safe content', () => {
    const { designerContent, tileContent } = splitDisplayContent([
      { id: 'designer', templateId: 'designer-demo', type: 'template' },
      { id: 'pdf', type: 'pdf' },
      { id: 'tile', type: 'text' },
    ])

    expect(designerContent.map(content => content.id)).toEqual(['designer'])
    expect(tileContent.map(content => content.id)).toEqual(['tile'])
  })

  it('maps known tags to business categories', () => {
    expect(mapTagToCategory(['sicherheit-psa'])).toBe('Sicherheit')
    expect(mapTagToCategory(['organisation'])).toBe('Organisation')
    expect(mapTagToCategory([])).toBe('Allgemein')
  })
})
