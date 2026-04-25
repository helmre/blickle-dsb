const DEFAULT_GRID_SIZE = 1

function positiveInt(value, fallback = DEFAULT_GRID_SIZE) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 1) return fallback
  return Math.floor(number)
}

export function parseGridLine(value, fallbackStart = 1, fallbackEnd = fallbackStart + 1) {
  if (typeof value === 'string') {
    const match = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(value)
    if (match) {
      const start = positiveInt(match[1], fallbackStart)
      const end = positiveInt(match[2], fallbackEnd)
      return end > start ? { start, end } : { start, end: start + 1 }
    }
  }

  const start = positiveInt(fallbackStart, 1)
  const end = positiveInt(fallbackEnd, start + 1)
  return end > start ? { start, end } : { start, end: start + 1 }
}

export function formatGridLine(start, end) {
  return `${positiveInt(start)} / ${positiveInt(end, positiveInt(start) + 1)}`
}

export function getLayoutGridSize(layout = {}) {
  return {
    columns: positiveInt(layout.gridColumns ?? layout.columns, 1),
    rows: positiveInt(layout.gridRows ?? layout.rows, 1),
  }
}

export function normalizeZoneGrid(zone = {}) {
  const column = parseGridLine(zone.gridColumn, zone.gridColumnStart, zone.gridColumnEnd)
  const row = parseGridLine(zone.gridRow, zone.gridRowStart, zone.gridRowEnd)

  return {
    ...zone,
    gridColumnStart: column.start,
    gridColumnEnd: column.end,
    gridRowStart: row.start,
    gridRowEnd: row.end,
  }
}

export function normalizeLayout(layout = {}) {
  const { columns, rows } = getLayoutGridSize(layout)
  return {
    ...layout,
    gridColumns: columns,
    gridRows: rows,
    zones: (layout.zones || []).map(normalizeZoneGrid),
  }
}

export function zoneGridStyle(zone = {}) {
  const normalized = normalizeZoneGrid(zone)
  return {
    gridColumn: formatGridLine(normalized.gridColumnStart, normalized.gridColumnEnd),
    gridRow: formatGridLine(normalized.gridRowStart, normalized.gridRowEnd),
  }
}
