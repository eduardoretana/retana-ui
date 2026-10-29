export type Copy = { es: string; en: string }

export type PolarFixture = {
  title: Copy
  description: Copy
  series: { id: string; es: string; en: string; value: number; wedges: { id: string; es: string; en: string; value: number }[] }[]
  activeId?: string
}

function wedges(seed: number) {
  return ["L", "M", "M", "J", "V", "S", "D"].map((axis, index) => ({
    id: `w${index}`,
    es: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index]!,
    en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index]!,
    value: 4 + ((seed + index * 3) % 9),
    axis,
  }))
}

export const filled: PolarFixture = {
  title: { es: "Cosecha por cama", en: "Harvest by bed" },
  description: { es: "El centro sigue la serie activa", en: "The center follows the active series" },
  series: [
    { id: "north", es: "Norte", en: "North", value: 42, wedges: wedges(1) },
    { id: "south", es: "Sur", en: "South", value: 28, wedges: wedges(4) },
    { id: "pots", es: "Macetas", en: "Pots", value: 15, wedges: wedges(2) },
  ],
}

export const empty: PolarFixture = { ...filled, title: { es: "Sin series", en: "No series" }, series: [] }
export const loading: PolarFixture = filled
export const error: PolarFixture = filled
export const single: PolarFixture = { ...filled, title: { es: "Una cama", en: "One bed" }, series: filled.series.slice(0, 1) }
export const dense: PolarFixture = {
  ...filled,
  title: { es: "Muchos gajos", en: "Many wedges" },
  series: [
    {
      id: "year",
      es: "Año",
      en: "Year",
      value: 120,
      wedges: Array.from({ length: 12 }, (_, index) => ({ id: `m${index}`, es: `Mes ${index + 1}`, en: `Month ${index + 1}`, value: 5 + (index % 6) })),
    },
  ],
}
export const negative: PolarFixture = {
  ...filled,
  title: { es: "Gajo negativo", en: "Negative wedge" },
  series: filled.series.map((item, index) => (index === 0 ? { ...item, wedges: item.wedges.map((wedge, wedgeIndex) => (wedgeIndex === 1 ? { ...wedge, value: -3 } : wedge)) } : item)),
}
export const highlight: PolarFixture = { ...filled, activeId: "south" }
