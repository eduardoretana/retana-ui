export type Copy = { es: string; en: string }

export type LinesFixture = {
  title: Copy
  description: Copy
  categories: { key: string; es: string; en: string; axis: string }[]
  series: { id: string; es: string; en: string; values: number[] }[]
  activeId?: string
}

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((axis, index) => ({
  key: `d${index}`,
  es: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index]!,
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index]!,
  axis,
}))

export const filled: LinesFixture = {
  title: { es: "Humedad de las camas", en: "Bed moisture" },
  description: { es: "Porcentaje de humedad", en: "Moisture percent" },
  categories: days,
  series: [
    { id: "north", es: "Norte", en: "North", values: [40, 42, 38, 55, 48, 36, 33] },
    { id: "south", es: "Sur", en: "South", values: [28, 30, 26, 34, 31, 22, 20] },
    { id: "pots", es: "Macetas", en: "Pots", values: [18, 16, 21, 19, 24, 15, 14] },
  ],
}

export const empty: LinesFixture = { ...filled, title: { es: "Sin lecturas", en: "No readings" }, categories: [], series: [] }
export const loading: LinesFixture = filled
export const error: LinesFixture = filled
export const single: LinesFixture = { ...filled, title: { es: "Una serie", en: "One series" }, series: filled.series.slice(0, 1), categories: days.slice(0, 3) }
export const dense: LinesFixture = {
  ...filled,
  title: { es: "Muchos puntos", en: "Many points" },
  categories: Array.from({ length: 24 }, (_, index) => ({ key: `h${index}`, es: `${index} h`, en: `${index} h`, axis: String(index) })),
  series: filled.series.map((item) => ({ ...item, values: Array.from({ length: 24 }, (_, index) => 20 + ((index * 3 + item.values[0]!) % 17)) })),
}
export const negative: LinesFixture = {
  ...filled,
  title: { es: "Bajo cero", en: "Below zero" },
  description: { es: "Cambio de humedad", en: "Moisture change" },
  series: filled.series.map((item, index) => ({ ...item, values: item.values.map((value, day) => (index === 2 && day === 3 ? -8 : value - 30)) })),
}
export const highlight: LinesFixture = { ...filled, activeId: "south" }
