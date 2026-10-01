/** Adapted from Arc UI (MIT). */

/**
 * A small visual that proves the number beside it. Every kind is optional; a stat without one is just the number.
 * - `trend`: a sparkline of a series, oldest first, such as twelve monthly totals.
 * - `uptime`: one bar per day as a percentage. Full days are full height; a day with downtime is visibly shorter.
 * - `distribution`: a histogram of equal width bins across `0..max`, with the bars below `marker` inked.
 * - `map`: a dotted world with a dot lit for each [longitude, latitude] point.
 */
export type StatVisual =
  | { kind: "trend"; values: number[] }
  | { kind: "uptime"; days: number[] }
  | { kind: "distribution"; bins: number[]; max: number; marker: number }
  | { kind: "map"; points: [number, number][] }

export interface Stat {
  /** The final number. The band counts up to it. */
  value: number
  /** Text before the number, such as "$". */
  prefix?: string
  /** Text after the number, such as "%", "ms", or "+". */
  suffix?: string
  /** Digits after the decimal point. Defaults to 0. */
  decimals?: number
  /** `compact` shortens large numbers to 2.3M or 12K. The unit renders like a suffix. Defaults to `standard`. */
  notation?: "standard" | "compact"
  label: string
  /** One short supporting line under the number. */
  detail?: string
  /** One line of context that replaces the detail while the stat is hovered or focused. */
  context?: string
  /** A tiny chart that draws in after the number lands. */
  visual?: StatVisual
}

/** 90 days of uptime, oldest first: two short incidents, 11 minutes on day 52 and 1 minute on day 24. */
const uptimeDays = Array.from({ length: 90 }, (_, day) => (day === 51 ? 99.24 : day === 23 ? 99.93 : 100))

/** 35 edge regions as [longitude, latitude]. */
const regions: [number, number][] = [
  [-122.4, 37.8], [-118.2, 34], [-96.8, 32.8], [-87.6, 41.9], [-77.5, 39], [-74, 40.7], [-79.4, 43.7], [-99.1, 19.4],
  [-74.1, 4.7], [-77, -12], [-46.6, -23.5], [-70.7, -33.4], [-58.4, -34.6],
  [-0.1, 51.5], [-6.3, 53.3], [2.35, 48.9], [4.9, 52.4], [8.7, 50.1], [18, 59.3], [-3.7, 40.4], [9.2, 45.5], [21, 52.2],
  [3.4, 6.5], [28, -26.2], [36.8, -1.3], [55.3, 25.3], [34.8, 32.1],
  [72.9, 19.1], [103.8, 1.35], [114.2, 22.3], [139.7, 35.7], [127, 37.6], [106.8, -6.2], [151.2, -33.9], [174.8, -36.8],
]

export const stats: Stat[] = [
  {
    value: 2_334_000,
    notation: "compact",
    decimals: 1,
    label: "Deploys in the last 12 months",
    detail: "Across 12,400 teams",
    context: "Up from 1.4M the year before",
    visual: { kind: "trend", values: [141, 148, 139, 162, 171, 184, 196, 203, 221, 238, 257, 274] },
  },
  {
    value: 99.99,
    decimals: 2,
    suffix: "%",
    label: "API uptime over 90 days",
    detail: "Measured every 30 seconds",
    context: "12 minutes down, 11 of them on July 14",
    visual: { kind: "uptime", days: uptimeDays },
  },
  {
    value: 38,
    suffix: "ms",
    label: "Median response time",
    detail: "At the edge, worldwide",
    context: "p95 is 96 ms, down from 141 ms",
    visual: { kind: "distribution", bins: [2, 8, 18, 26, 15, 10, 7, 5, 3, 2, 1.5, 1, 0.8, 0.7, 0.5, 0.3], max: 160, marker: 38 },
  },
  {
    value: 35,
    label: "Edge regions on six continents",
    detail: "Most people are under 20 ms away",
    context: "Eight added this year, including Lagos",
    visual: { kind: "map", points: regions },
  },
]

/**
 * A coarse dotted world for the map visual: 80 columns by 30 rows, from 168° W to 192° E and 76° N to 56° S
 * (Antarctica left out). Each row is hex, four columns per digit, most significant bit first.
 */
const WORLD_ROWS = [
  "001f007f800020fc0000", "7fc0cc7f00781ffffff8", "7ffffe38c0dffffffff8", "7fff0e1003bfffffff60", "40ffcf0009bffffff0c0",
  "007fff801ffffffff880", "003fff0007fffffff000", "003ffc001c737fffec00", "003ff800181f7fff4800", "001ff0000f07ffff3000",
  "000f80001fff7fff0000", "000f00003ffb9fff0000", "000340003fffc7b80000", "0001c0003ffd82380000", "000020003ffe021c0000",
  "00001f001fff00100000", "00000fc001ff00010000", "00000fe001fe00028000", "00001ff800fc00080c00", "00000ff800fc00000200",
  "000007f800fc00003000", "000003f800fd0000fc00", "000003f000790001fe00", "000007e000780001fe00", "000007c000700001de00",
  "00000780000000000e00", "00000600000000000008", "00000600000000000020", "00000400000000000000", "00000400000000000000",
]

export const WORLD = { columns: 80, rows: 30, west: -168, east: 192, north: 76, south: -56 } as const

/** Land cells as a flat row-major array of booleans. */
export const worldLand: boolean[] = WORLD_ROWS.flatMap((row) =>
  [...row].flatMap((digit) => {
    const bits = parseInt(digit, 16)
    return [8, 4, 2, 1].map((bit) => (bits & bit) !== 0)
  }),
)
