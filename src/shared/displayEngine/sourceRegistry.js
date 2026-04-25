export const DISPLAY_SOURCE_TYPES = {
  WIDGET: 'widget',
  CONTENT: 'content',
  QUERY: 'query',
  PLAYLIST: 'playlist',
  MEDIA: 'media',
  TEMPLATE: 'template',
  EMBED: 'embed',
}

export const DISPLAY_WIDGETS = [
  {
    id: 'karriere',
    label: 'Karriere',
    componentType: 'karriere',
    iconName: 'briefcase-business',
  },
  {
    id: 'canteen-today',
    label: 'Kantine heute',
    componentType: 'canteen-menu',
    iconName: 'utensils',
  },
  {
    id: 'weather',
    label: 'Wetter',
    componentType: 'weather',
    iconName: 'cloud-sun',
  },
  {
    id: 'news-feed',
    label: 'News',
    componentType: 'news-feed',
    iconName: 'newspaper',
  },
  {
    id: 'schedule-table',
    label: 'Schichtplan',
    componentType: 'schedule-table',
    iconName: 'calendar-days',
  },
  {
    id: 'production-news',
    label: 'Produktionsnews',
    componentType: 'produktion-news',
    iconName: 'factory',
  },
  {
    id: 'social-wall',
    label: 'Social Wall',
    componentType: 'social-wall',
    iconName: 'share',
  },
  {
    id: 'shop-floor-board',
    label: 'Shopfloor Board',
    componentType: 'shop-floor-board',
    iconName: 'layout-dashboard',
  },
]

const widgetById = new Map(DISPLAY_WIDGETS.map(widget => [widget.id, widget]))

export function getDisplayWidget(id) {
  return widgetById.get(id) || null
}

export function isKnownWidget(id) {
  return widgetById.has(id)
}

