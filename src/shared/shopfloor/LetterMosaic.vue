<script setup>
import { computed } from 'vue'
import { STATUS_COLORS } from '../utils/shopfloorSeed.js'

const props = defineProps({
  letter: { type: String, required: true },
  monthStatuses: { type: Array, default: () => [] },
  todayDate: { type: Number, default: 0 },
  accent: { type: String, default: '#B5CC18' },
})

// Letter shapes: each entry is one row, 'X' = cell, '.' = empty.
// Grids are sized per letter so the shape reads clearly.
const SHAPES = {
  S: [
    'XXXXXXXXX',
    'X........',
    'X........',
    'XXXXXXXXX',
    '........X',
    '........X',
    'XXXXXXXXX',
  ],
  Q: [
    '.XXXXXXX.',
    'X.......X',
    'X.......X',
    'X.......X',
    'X....X..X',
    'X.....X.X',
    '.XXXXXXX.',
    '........X',
  ],
  K: [
    'XX......X',
    'XX.....X.',
    'XX....X..',
    'XXXXXXX..',
    'XX....X..',
    'XX.....X.',
    'XX......X',
  ],
  T: [
    'XXXXXXXXX',
    'XXXXXXXXX',
    '...XXX...',
    '...XXX...',
    '...XXX...',
    '...XXX...',
    '...XXX...',
  ],
  P: [
    'XXXXXXXX.',
    'XX......X',
    'XX......X',
    'XXXXXXXX.',
    'XX.......',
    'XX.......',
    'XX.......',
  ],
  O: [
    '.XXXXXXX.',
    'X.......X',
    'X.......X',
    'X.......X',
    'X.......X',
    'X.......X',
    '.XXXXXXX.',
  ],
}

// Build cells: array of { row, col, day } in reading order
const cells = computed(() => {
  const shape = SHAPES[props.letter] || SHAPES.O
  const result = []
  let day = 1
  shape.forEach((row, rIdx) => {
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      if (row[cIdx] === 'X') {
        result.push({ row: rIdx, col: cIdx, day })
        day++
      }
    }
  })
  return result
})

const gridRows = computed(() => (SHAPES[props.letter] || SHAPES.O).length)
const gridCols = computed(() => (SHAPES[props.letter] || SHAPES.O)[0].length)

function cellStatus(day) {
  return props.monthStatuses[day - 1] || null
}
function cellBg(status) {
  if (!status) return 'rgba(255,255,255,0.06)'
  return STATUS_COLORS[status]
}
function cellBorder(status) {
  if (!status) return 'rgba(255,255,255,0.1)'
  return STATUS_COLORS[status]
}
</script>

<template>
  <div
    class="mosaic"
    :style="{
      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      gridTemplateRows: `repeat(${gridRows}, 1fr)`,
      aspectRatio: `${gridCols} / ${gridRows}`
    }"
  >
    <div
      v-for="cell in cells"
      :key="cell.day"
      class="cell"
      :class="{ 'is-today': cell.day === todayDate, 'is-empty': !cellStatus(cell.day) }"
      :style="{
        gridRowStart: cell.row + 1,
        gridColumnStart: cell.col + 1,
        background: cellBg(cellStatus(cell.day)),
        borderColor: cellBorder(cellStatus(cell.day))
      }"
    >
      <span class="day">{{ cell.day }}</span>
    </div>
  </div>
</template>

<style scoped>
.mosaic {
  display: grid;
  gap: 3px;
  width: 100%;
}
.cell {
  border-radius: 5px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.18);
  color: #fff;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  transition: transform 140ms;
  min-height: 24px;
}
.cell.is-empty {
  color: rgba(255, 255, 255, 0.35);
  text-shadow: none;
  box-shadow: none;
}
.cell.is-today {
  transform: scale(1.12);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9), 0 0 16px rgba(255, 255, 255, 0.5);
  z-index: 2;
}
.day {
  font-size: 0.78em;
  letter-spacing: -0.02em;
  opacity: 0.9;
}
</style>
