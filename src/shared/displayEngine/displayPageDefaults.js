import { DISPLAY_SOURCE_TYPES } from './sourceRegistry.js'

export function buildDefaultHomeDisplayPage() {
  return {
    id: 'home',
    navGroupId: 'home',
    label: 'HOME',
    icon: '&#9750;',
    iconName: 'home',
    status: 'active',
    duration: 15,
    noZoneChrome: true,
    layout: {
      type: 'custom',
      columns: 12,
      rows: 2,
    },
    slots: [
      {
        id: 'home-karriere',
        label: 'Karriere',
        gridColumn: '1 / 8',
        gridRow: '1 / 2',
        chrome: 'none',
        source: {
          type: DISPLAY_SOURCE_TYPES.WIDGET,
          id: 'karriere',
          title: 'Karriere bei Blickle',
          settings: {},
        },
      },
      {
        id: 'home-kantine',
        label: 'Kantine',
        gridColumn: '8 / 13',
        gridRow: '1 / 2',
        chrome: 'none',
        source: {
          type: DISPLAY_SOURCE_TYPES.WIDGET,
          id: 'canteen-today',
          title: 'Heute im s\'Rädle',
          settings: {},
        },
      },
      {
        id: 'home-wetter',
        label: 'Wetter',
        gridColumn: '1 / 5',
        gridRow: '2 / 3',
        chrome: 'none',
        source: {
          type: DISPLAY_SOURCE_TYPES.WIDGET,
          id: 'weather',
          title: 'Wetter',
          settings: {},
        },
      },
      {
        id: 'home-news',
        label: 'News',
        gridColumn: '5 / 13',
        gridRow: '2 / 3',
        chrome: 'none',
        source: {
          type: DISPLAY_SOURCE_TYPES.WIDGET,
          id: 'news-feed',
          title: 'News',
          settings: {},
        },
      },
    ],
  }
}

export function getDefaultDisplayPages() {
  return [
    buildDefaultHomeDisplayPage(),
  ]
}
