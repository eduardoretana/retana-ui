export type Copy = { es: string; en: string }

export type IsoFixture = {
  title: Copy
  description: Copy
  caption: Copy
  periods: { id: string; es: string; en: string; points: { key: string; es: string; en: string; axis: string; value: number }[] }[]
  emphasisKey?: string
}

const months = [
  ["jan", "Ene", "Jan", 12],
  ["feb", "Feb", "Feb", 18],
  ["mar", "Mar", "Mar", 9],
  ["apr", "Abr", "Apr", 27],
  ["may", "May", "May", 22],
  ["jun", "Jun", "Jun", 15],
] as const

function points(count: number, scale = 1) {
  return months.slice(0, count).map(([key, es, en, value]) => ({ key, es, en, axis: es, value: Math.round(value * scale) }))
}

export const filled: IsoFixture = {
  title: { es: "Cosecha del taller", en: "Workshop harvest" },
  description: { es: "Kilos por mes", en: "Kilograms by month" },
  caption: { es: "Abril concentra la cosecha de jitomate.", en: "April holds most of the tomato harvest." },
  emphasisKey: "apr",
  periods: [
    { id: "3", es: "3 meses", en: "3 months", points: points(3) },
    { id: "6", es: "6 meses", en: "6 months", points: points(6) },
    { id: "12", es: "12 meses", en: "12 months", points: [...points(6), { key: "jul", es: "Jul", en: "Jul", axis: "Jul", value: 11 }, { key: "aug", es: "Ago", en: "Aug", axis: "Ago", value: 8 }, { key: "sep", es: "Sep", en: "Sep", axis: "Sep", value: 14 }, { key: "oct", es: "Oct", en: "Oct", axis: "Oct", value: 19 }, { key: "nov", es: "Nov", en: "Nov", axis: "Nov", value: 7 }, { key: "dec", es: "Dic", en: "Dec", axis: "Dic", value: 4 }] },
  ],
}

export const empty: IsoFixture = { ...filled, title: { es: "Sin cosecha", en: "No harvest" }, periods: [{ id: "3", es: "3 meses", en: "3 months", points: [] }] }
export const loading: IsoFixture = filled
export const error: IsoFixture = filled
export const single: IsoFixture = { ...filled, title: { es: "Un mes", en: "One month" }, periods: [{ id: "1", es: "1 mes", en: "1 month", points: points(1) }], emphasisKey: "jan" }
export const dense: IsoFixture = { ...filled, periods: filled.periods.filter((period) => period.id === "12") }
export const negative: IsoFixture = {
  ...filled,
  title: { es: "Con merma", en: "With a loss" },
  periods: [{ id: "6", es: "6 meses", en: "6 months", points: points(6).map((point, index) => (index === 2 ? { ...point, value: -8 } : point)) }],
}
export const highlight: IsoFixture = filled
