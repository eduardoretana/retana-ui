export type Copy = { es: string; en: string }

const months = [
  ["jan", "Enero", "January", "Ene"],
  ["feb", "Febrero", "February", "Feb"],
  ["mar", "Marzo", "March", "Mar"],
  ["apr", "Abril", "April", "Abr"],
  ["may", "Mayo", "May", "May"],
  ["jun", "Junio", "June", "Jun"],
  ["jul", "Julio", "July", "Jul"],
  ["aug", "Agosto", "August", "Ago"],
] as const

function points(scale: number) {
  return months.map(([key, es, en, axis], index) => ({ key, es, en, axis, value: Math.round((12 + index * 4 + (index % 3) * 2) * scale) }))
}

export type ScrubFixture = {
  title: Copy
  description: Copy
  periods: { id: string; es: string; en: string; points: { key: string; es: string; en: string; axis: string; value: number }[] }[]
}

export const filled: ScrubFixture = {
  title: { es: "Cosecha acumulada", en: "Running harvest" },
  description: { es: "Kilos por mes", en: "Kilograms by month" },
  periods: [
    { id: "2025", es: "2025", en: "2025", points: points(1) },
    { id: "2026", es: "2026", en: "2026", points: points(1.3) },
  ],
}

export const empty: ScrubFixture = { title: { es: "Sin serie", en: "No series" }, description: filled.description, periods: [{ id: "2026", es: "2026", en: "2026", points: [] }] }
export const loading: ScrubFixture = filled
export const error: ScrubFixture = filled
export const single: ScrubFixture = { ...filled, title: { es: "Un mes", en: "One month" }, periods: [{ id: "2026", es: "2026", en: "2026", points: points(1).slice(0, 1) }] }
export const dense: ScrubFixture = {
  ...filled,
  title: { es: "Muchos puntos", en: "Many points" },
  periods: [
    {
      id: "days",
      es: "30 días",
      en: "30 days",
      points: Array.from({ length: 30 }, (_, index) => ({ key: `d${index}`, es: `Día ${index + 1}`, en: `Day ${index + 1}`, axis: String(index + 1), value: 8 + index })),
    },
  ],
}
export const negative: ScrubFixture = {
  ...filled,
  title: { es: "Con merma", en: "With a loss" },
  periods: [{ id: "2026", es: "2026", en: "2026", points: points(1).map((point, index) => (index === 2 ? { ...point, value: -6 } : point)) }],
}
export const highlight: ScrubFixture = filled
