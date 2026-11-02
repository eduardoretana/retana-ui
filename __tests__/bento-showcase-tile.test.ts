import { describe, expect, it } from "vitest"

import { mixed, presets, type BentoCellCopy } from "@/app/examples/bento-grid/fixtures"

const SIZE_SPAN = {
  sm: { col: 1, row: 1 },
  wide: { col: 2, row: 1 },
  tall: { col: 1, row: 2 },
  lg: { col: 2, row: 2 },
} as const

type Band = "narrow" | "mid" | "desktop"

/** Span the track actually opens. Narrow is one column. Mid is two, from 30rem. Desktop is four, from 56rem. */
function openedSpan(cell: BentoCellCopy, band: Band) {
  const requested = cell.size ? SIZE_SPAN[cell.size] : cell.span
  if (band === "narrow") return { col: 1, row: 1 }
  if (band === "mid") return { col: Math.min(requested.col, 2), row: requested.row }
  return { col: Math.min(requested.col, 4), row: requested.row }
}

/**
 * CSS grid auto-flow row, sparse. The cursor never goes back, which is what
 * leaves a hole when a later span cannot sit in the gap it passed.
 */
function emptyCells(cells: readonly BentoCellCopy[], columns: number, band: Band) {
  const grid: boolean[][] = []
  const ensure = (rows: number) => {
    while (grid.length < rows) grid.push(Array.from({ length: columns }, () => false))
  }
  const fits = (row: number, col: number, rowSpan: number, colSpan: number) => {
    if (col + colSpan > columns) return false
    ensure(row + rowSpan)
    for (let r = row; r < row + rowSpan; r += 1) {
      for (let c = col; c < col + colSpan; c += 1) {
        if (grid[r]?.[c]) return false
      }
    }
    return true
  }
  let cursorRow = 0
  let cursorCol = 0
  for (const cell of cells) {
    const span = openedSpan(cell, band)
    let row = cursorRow
    let col = cursorCol
    while (!fits(row, col, span.row, span.col)) {
      col += 1
      if (col + span.col > columns) {
        col = 0
        row += 1
      }
    }
    ensure(row + span.row)
    for (let r = row; r < row + span.row; r += 1) {
      for (let c = col; c < col + span.col; c += 1) grid[r]![c] = true
    }
    cursorCol = col + span.col
    cursorRow = row
    if (cursorCol >= columns) {
      cursorCol = 0
      cursorRow = row + 1
    }
  }
  const holes: string[] = []
  grid.forEach((line, row) => {
    line.forEach((filled, col) => {
      if (!filled) holes.push(`${col + 1},${row + 1}`)
    })
  })
  return holes
}

describe("showcase walls tile without dense packing", () => {
  it("fills every cell of the presets wall at 1280 (4 columns) and on the 2-column track", () => {
    expect(emptyCells(presets.es.cells, 4, "desktop")).toEqual([])
    expect(emptyCells(presets.en.cells, 4, "desktop")).toEqual([])
    expect(emptyCells(presets.es.cells, 2, "mid")).toEqual([])
    expect(emptyCells(presets.es.cells, 1, "narrow")).toEqual([])
    expect(presets.es.cells.map((cell) => cell.size)).toEqual(["lg", "tall", "sm", "sm", "wide", "wide"])
  })

  it("fills every cell of the mixed wall at 1280 (4 columns) and on the 2-column track", () => {
    expect(emptyCells(mixed.es.cells, 4, "desktop")).toEqual([])
    expect(emptyCells(mixed.en.cells, 4, "desktop")).toEqual([])
    expect(emptyCells(mixed.es.cells, 2, "mid")).toEqual([])
    expect(emptyCells(mixed.es.cells, 1, "narrow")).toEqual([])
  })
})
