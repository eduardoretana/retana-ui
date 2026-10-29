import type { HexCell } from "@/registry/ui/hex-heatmap"

export type Copy = { es: string; en: string }

export type HexSeriesFixture = Copy & { id: string; value: number }
export type HexRowFixture = Copy & { id: string; value: number; seriesId?: string }

export type HexFixture = {
  title: Copy
  description: Copy
  series: HexSeriesFixture[]
  cells: HexCell[]
  rows?: HexRowFixture[]
  activeId?: string
}

function cluster(radius: number, seriesIds: string[]): HexCell[] {
  const cells: HexCell[] = []
  let n = 0
  for (let q = -radius; q <= radius; q += 1) {
    for (let r = -radius; r <= radius; r += 1) {
      const s = -q - r
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > radius) continue
      const dist = (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2
      const seriesId = seriesIds[Math.min(seriesIds.length - 1, Math.floor((dist / radius) * seriesIds.length))] ?? seriesIds[0]!
      cells.push({ id: `h${n}`, q, r, seriesId, weight: 1 - dist / (radius + 1) })
      n += 1
    }
  }
  return cells
}

const title = { es: "Sol en las camas", en: "Sun on the beds" }
const description = { es: "Huerto Norte · esta semana", en: "Huerto Norte · this week" }

const series: HexSeriesFixture[] = [
  { id: "sun", es: "Sol", en: "Sun", value: 18 },
  { id: "shade", es: "Sombra", en: "Shade", value: 27 },
  { id: "water", es: "Riego", en: "Water", value: 135 },
]

const rows: HexRowFixture[] = [
  { id: "tomatoes", es: "Jitomate", en: "Tomato", value: 42, seriesId: "sun" },
  { id: "kale", es: "Col rizada", en: "Kale", value: 28, seriesId: "shade" },
  { id: "herbs", es: "Hierbas", en: "Herbs", value: 16, seriesId: "water" },
]

export const filled: HexFixture = { title, description, series, cells: cluster(3, ["sun", "shade", "water"]), rows }

export const empty: HexFixture = {
  title: { es: "Sin lecturas", en: "No readings" },
  description,
  series: [],
  cells: [],
}

export const loading: HexFixture = filled
export const error: HexFixture = filled

export const single: HexFixture = {
  ...filled,
  title: { es: "Solo sol", en: "Sun only" },
  series: series.slice(0, 1),
  cells: cluster(2, ["sun"]),
  rows: rows.slice(0, 1),
}

export const dense: HexFixture = {
  ...filled,
  title: { es: "Muchas celdas", en: "Many cells" },
  cells: cluster(5, ["sun", "shade", "water"]),
}

export const negative: HexFixture = {
  ...filled,
  title: { es: "Con un valor negativo", en: "With a negative value" },
  series: [
    { id: "sun", es: "Sol", en: "Sun", value: -4 },
    ...series.slice(1),
  ],
}

export const highlight: HexFixture = { ...filled, activeId: "shade" }
