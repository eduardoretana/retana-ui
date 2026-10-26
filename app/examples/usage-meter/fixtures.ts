export type MeterSegment = {
  id: string
  es: string
  en: string
  value: number
}

export type MeterCopy = { es: string; en: string }

export type MeterFixture = {
  label: MeterCopy
  unit: string
  limit: number
  free: MeterCopy
  over: MeterCopy
  segments: MeterSegment[]
}

const labels = {
  label: { es: "Almacén · Taller Ladrillo", en: "Storage · Taller Ladrillo" },
  free: { es: "Libre", en: "Free" },
  over: { es: "Sobre el límite", en: "Over limit" },
}

const stock: MeterSegment[] = [
  { id: "glaze", es: "Esmalte", en: "Glaze", value: 36.5 },
  { id: "clay", es: "Barro", en: "Clay", value: 22 },
  { id: "photos", es: "Fotos", en: "Photos", value: 8.4 },
]

/** 66.9 GB of a 100 GB plan. The workshop still has room. */
export const filled: MeterFixture = {
  ...labels,
  unit: "GB",
  limit: 100,
  segments: stock,
}

/** The plan exists. Nothing has been stored yet. */
export const empty: MeterFixture = {
  ...filled,
  label: { es: "Almacén sin movimientos", en: "Storage with no files" },
  segments: [],
}

/** The inventory request is in flight. Values stay at zero until it settles. */
export const loading: MeterFixture = {
  ...filled,
  segments: stock.map((segment) => ({ ...segment, value: 0 })),
}

/** What the retry would have shown. The scene starts before this data arrives. */
export const error: MeterFixture = filled

/** 92 GB. Past the 90% warning, still under the plan. */
export const near: MeterFixture = {
  ...filled,
  segments: [
    { id: "glaze", es: "Esmalte", en: "Glaze", value: 48 },
    { id: "clay", es: "Barro", en: "Clay", value: 31.5 },
    { id: "photos", es: "Fotos", en: "Photos", value: 12.5 },
  ],
}

/** 112 GB. The hatch marks everything past the plan. */
export const over: MeterFixture = {
  ...filled,
  segments: [
    { id: "glaze", es: "Esmalte", en: "Glaze", value: 54 },
    { id: "clay", es: "Barro", en: "Clay", value: 38 },
    { id: "photos", es: "Fotos", en: "Photos", value: 20 },
  ],
}

export function bump(fixture: MeterFixture, id: string, delta: number): MeterFixture {
  return {
    ...fixture,
    segments: fixture.segments.map((segment) =>
      segment.id === id ? { ...segment, value: Math.round((segment.value + delta) * 10) / 10 } : segment,
    ),
  }
}
