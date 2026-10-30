import { chartVar, type ChartTone } from "@/registry/retana/lib/chart-tone"

/** Host series palette. Charts cycle `--chart-1` … `--chart-5`. */
export const SERIES_COUNT = 5

export function seriesTone(index: number): ChartTone {
  const tone = (Math.abs(index) % SERIES_COUNT) + 1
  return tone as ChartTone
}

export function seriesColor(index: number): string {
  return chartVar(seriesTone(index))
}

/**
 * Non-color cue so a series is not identified by hue alone.
 * 0 solid, 1 diagonal, 2 dots, 3 horizontal, 4 cross.
 */
export function seriesMark(index: number): number {
  return Math.abs(index) % SERIES_COUNT
}

export function seriesPatternId(prefix: string, index: number): string {
  return `${prefix}-mark-${seriesMark(index)}`
}
