export type Copy = { es: string; en: string }

export type StackFixture = {
  title: Copy
  description: Copy
  note: { title: Copy; body: Copy; action: Copy }
  series: (Copy & { id: string })[]
  periods: { id: string; es: string; en: string; points: { key: string; es: string; en: string; axis: string; values: Record<string, number> }[] }[]
}

const series = [
  { id: "leaf", es: "Hoja", en: "Leaf" },
  { id: "fruit", es: "Fruto", en: "Fruit" },
  { id: "root", es: "Raíz", en: "Root" },
]

function week() {
  return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((axis, index) => ({
    key: `d${index}`,
    es: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index]!,
    en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index]!,
    axis,
    values: { leaf: 4 + index, fruit: index % 3, root: 2 },
  }))
}

export const filled: StackFixture = {
  title: { es: "Cosecha por tipo", en: "Harvest by type" },
  description: { es: "Huerto Norte", en: "Huerto Norte" },
  note: {
    title: { es: "La hoja va adelante", en: "Leaves are ahead" },
    body: { es: "Esta semana la hoja supera al fruto.", en: "Leaves are ahead of fruit this week." },
    action: { es: "Ver detalle", en: "See detail" },
  },
  series,
  periods: [
    { id: "week", es: "Semana", en: "Week", points: week() },
    {
      id: "month",
      es: "Mes",
      en: "Month",
      points: ["S1", "S2", "S3", "S4"].map((axis, index) => ({
        key: `w${index}`,
        es: `Semana ${index + 1}`,
        en: `Week ${index + 1}`,
        axis,
        values: { leaf: 20 + index * 4, fruit: 8 + index, root: 6 },
      })),
    },
    {
      id: "year",
      es: "Año",
      en: "Year",
      points: ["E", "F", "M", "A", "M", "J"].map((axis, index) => ({
        key: `m${index}`,
        es: axis,
        en: axis,
        axis,
        values: { leaf: 30 + index * 3, fruit: 12 + index * 2, root: 9 },
      })),
    },
  ],
}

export const empty: StackFixture = { ...filled, title: { es: "Sin columnas", en: "No columns" }, periods: [{ id: "week", es: "Semana", en: "Week", points: [] }] }
export const loading: StackFixture = filled
export const error: StackFixture = filled
export const single: StackFixture = {
  ...filled,
  title: { es: "Una serie", en: "One series" },
  series: series.slice(0, 1),
  periods: [{ id: "week", es: "Semana", en: "Week", points: week().slice(0, 1) }],
}
export const dense: StackFixture = { ...filled, periods: filled.periods.filter((period) => period.id === "year") }
export const negative: StackFixture = {
  ...filled,
  title: { es: "Con merma", en: "With a loss" },
  periods: [
    {
      id: "week",
      es: "Semana",
      en: "Week",
      points: week().map((point, index) => (index === 2 ? { ...point, values: { ...point.values, fruit: -3 } } : point)),
    },
  ],
}
export const highlight: StackFixture = filled
