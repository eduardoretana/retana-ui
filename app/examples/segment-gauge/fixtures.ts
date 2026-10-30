export type Copy = { es: string; en: string }

export type GaugeFixture = {
  title: Copy
  description: Copy
  limit: number
  segments: (Copy & { id: string; value: number })[]
  activeId?: string
}

const segments = [
  { id: "beds", es: "Camas", en: "Beds", value: 46 },
  { id: "paths", es: "Senderos", en: "Paths", value: 13 },
  { id: "shed", es: "Bodega", en: "Shed", value: 8 },
]

export const filled: GaugeFixture = {
  title: { es: "Ocupación del huerto", en: "Garden occupancy" },
  description: { es: "De 100 parcelas", en: "Out of 100 plots" },
  limit: 100,
  segments,
}

export const empty: GaugeFixture = { title: { es: "Sin parcelas", en: "No plots" }, description: filled.description, limit: 0, segments: [] }
export const loading: GaugeFixture = filled
export const error: GaugeFixture = filled
export const single: GaugeFixture = { ...filled, title: { es: "Un tramo", en: "One segment" }, segments: segments.slice(0, 1) }
export const dense: GaugeFixture = {
  ...filled,
  title: { es: "Diez tramos", en: "Ten segments" },
  segments: Array.from({ length: 10 }, (_, index) => ({ id: `s${index}`, es: `Tramo ${index + 1}`, en: `Segment ${index + 1}`, value: index + 2 })),
  limit: 80,
}
export const negative: GaugeFixture = {
  ...filled,
  title: { es: "Tramo negativo", en: "Negative segment" },
  segments: [{ id: "beds", es: "Camas", en: "Beds", value: -6 }, ...segments.slice(1)],
}
export const highlight: GaugeFixture = { ...filled, activeId: "paths" }
