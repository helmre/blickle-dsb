import { describe, expect, it } from 'vitest'
import {
  canAddContentToPlaylist,
  filterContentForPlaylist,
  getPlaylistItemIssue,
  isPlaylistLooping,
  movePlaylistItem,
  playlistDurationSummary,
  playlistIssueCount,
  sortPlaylistItems,
  updatePlaylistItem,
} from './playlistRules.js'

describe('playlistRules', () => {
  it('supports legacy isLoop and current loop fields', () => {
    expect(isPlaylistLooping({ isLoop: true })).toBe(true)
    expect(isPlaylistLooping({ loop: false, isLoop: true })).toBe(false)
    expect(isPlaylistLooping({})).toBe(true)
  })

  it('sorts, moves, and updates playlist items deterministically', () => {
    const items = sortPlaylistItems({
      items: [
        { id: 'b', order: 2, duration: 20 },
        { id: 'a', order: 1, duration: 10 },
      ],
    })

    expect(items.map(item => item.id)).toEqual(['a', 'b'])
    expect(movePlaylistItem(items, 0, 1).map(item => item.id)).toEqual(['b', 'a'])
    expect(updatePlaylistItem(items, 'a', { duration: 30 })[0].duration).toBe(30)
  })

  it('summarizes duration and blocks duplicate or unapproved content', () => {
    const playlist = { items: [{ contentId: 'content-a', duration: 15 }] }

    expect(playlistDurationSummary(playlist.items)).toEqual({
      itemCount: 1,
      totalSeconds: 15,
      label: '1 Elemente - 15s Zyklus',
    })
    expect(canAddContentToPlaylist({ id: 'content-a', status: 'approved' }, playlist)).toMatchObject({
      allowed: false,
      reason: 'Bereits in der Playlist',
    })
    expect(canAddContentToPlaylist({ id: 'content-b', status: 'draft' }, playlist)).toMatchObject({
      allowed: false,
      reason: 'Nur freigegebene Inhalte sind displayfähig',
    })
    expect(canAddContentToPlaylist({ id: 'content-c', status: 'approved' }, playlist)).toMatchObject({
      allowed: true,
    })
  })

  it('filters content by title', () => {
    expect(filterContentForPlaylist([
      { id: 'a', title: 'Sicherheit' },
      { id: 'b', title: 'Kantine' },
    ], 'sich').map(content => content.id)).toEqual(['a'])
  })

  it('flags missing or non-approved playlist items', () => {
    expect(getPlaylistItemIssue({ contentId: 'missing' }, null)).toMatchObject({
      level: 'error',
      message: 'Inhalt fehlt',
    })
    expect(getPlaylistItemIssue({ contentId: 'draft' }, { id: 'draft', status: 'draft' })).toMatchObject({
      level: 'warning',
      message: 'Nicht freigegeben',
    })
    expect(getPlaylistItemIssue({ contentId: 'ok' }, { id: 'ok', status: 'approved' })).toBeNull()

    const contents = new Map([
      ['a', { id: 'a', status: 'approved' }],
      ['b', { id: 'b', status: 'draft' }],
    ])
    expect(playlistIssueCount([{ contentId: 'a' }, { contentId: 'b' }, { contentId: 'c' }], id => contents.get(id))).toBe(2)
  })
})
