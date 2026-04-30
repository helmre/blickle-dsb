export const NAV_GROUP_OVERRIDES = {
  preview: { label: 'VORSCHAU', iconName: 'monitor' },
  kantine: { label: 'S\'RÄDLE', iconName: 'utensils' },
  playlist: { label: 'PLAYLIST', iconName: 'video' },
  infos: { label: 'INFOS', iconName: 'info' },
  produktion: { label: 'P 2030', iconName: 'rocket' },
  medien: { label: 'MEDIEN', iconName: 'image' },
  layouts: { label: 'LAYOUTS', iconName: 'layout' },
}

export function buildPlaylistContentPage(entry) {
  const { content, item, index } = entry
  const duration = Number(item.duration) || 15
  const pageId = `playlist-${item.id || index}-${content.id}`
  const base = {
    id: pageId,
    navGroupId: 'playlist',
    label: content.title || 'Playlist-Inhalt',
    icon: '&#9654;',
    iconName: 'video',
    duration,
    transition: item.transition || 'fade',
  }

  if (content.type === 'pdf' && content.fileUrl) {
    return {
      ...base,
      layout: 'fullscreen',
      zones: [
        { id: `${pageId}-pdf`, type: 'pdf', title: content.title, pdfUrl: content.fileUrl, fit: 'cover-width' },
      ],
    }
  }

  return {
    ...base,
    layout: 'full',
    noZoneChrome: true,
    zones: [
      { id: `${pageId}-content`, type: 'template', title: '', contentId: content.id },
    ],
  }
}

export function buildPreviewPage(content) {
  return {
    id: `preview-${content.id || 'draft'}`,
    navGroupId: 'preview',
    label: 'VORSCHAU',
    icon: '&#128065;',
    iconName: 'monitor',
    layout: 'full',
    noZoneChrome: true,
    duration: 60,
    zones: [
      {
        id: `preview-zone-${content.id || 'draft'}`,
        type: 'template',
        title: '',
        contentId: content.id || null,
        content,
      },
    ],
  }
}

export function buildNavGroups(displayPages = []) {
  const groups = []
  const seen = new Map()

  displayPages.forEach((page, idx) => {
    const gid = page.navGroupId || page.id
    if (seen.has(gid)) return

    const override = NAV_GROUP_OVERRIDES[gid] || {}
    const group = {
      id: gid,
      label: override.label || page.label,
      iconName: override.iconName || page.iconName,
      icon: page.icon,
      firstPageIndex: idx,
    }

    seen.set(gid, group)
    groups.push(group)
  })

  return groups
}
