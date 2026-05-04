import { describe, expect, it } from 'vitest'
import { getLayoutDeletionBlockers } from './layoutRules.js'

describe('layoutRules', () => {
  it('blocks deleting layouts still assigned to locations', () => {
    const blockers = getLayoutDeletionBlockers('layout-default', [
      { id: 'loc-a', name: 'FB1', layoutId: 'layout-default' },
      { id: 'loc-b', name: 'FB2', layoutId: 'layout-default' },
      { id: 'loc-c', name: 'Zentrale', layoutId: 'layout-other' },
    ])

    expect(blockers).toEqual(['2 Standorte: FB1, FB2'])
  })

  it('allows deleting layouts with no active references', () => {
    expect(getLayoutDeletionBlockers('layout-unused', [
      { id: 'loc-a', name: 'FB1', layoutId: 'layout-default' },
    ])).toEqual([])
  })
})
