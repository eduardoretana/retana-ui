import type { ChartUnit } from "@/registry/retana/lib/chart-format"

export type Copy = { es: string; en: string }

export type ComboFixture = {
  title: Copy
  description: Copy
  points: { key: string; es: string; en: string; axis: string; bar: number; line: number; parts: { id: string; es: string; en: string; value: number }[] }[]
  units: ChartUnit[]
}

const units: ChartUnit[] = [
  { id: "kg", label: "kg", suffix: "kg", scale: 1 },
  { id: "lb", label: "lb", suffix: "lb", scale: 2.20462 },
]

function point(key: string, es: string, en: string, axis: string, bar: number, line: number) {
  return {
    key,
    es,
    en,
    axis,
    bar,
    line,
    parts: [
      { id: "leaf", es: "Hoja", en: "Leaf", value: bar * 0.5 },
      { id: "fruit", es: "Fruto", en: "Fruit", value: bar * 0.3 },
      { id: "root", es: "Raíz", en: "Root", value: bar * 0.2 },
    ],
  }
}

export const filled: ComboFixture = {
  title: { es: "Visitas y cosecha", en: "Visits and harvest" },
  description: { es: "Barras: visitas. Línea: kilos.", en: "Bars: visits. Line: kilograms." },
  units,
  points: [
    point("mon", "Lunes", "Monday", "Lun", 12, 8),
    point("tue", "Martes", "Tuesday", "Mar", 18, 11),
    point("wed", "Miércoles", "Wednesday", "Mié", 9, 7),
    point("thu", "Jueves", "Thursday", "Jue", 21, 14),
    point("fri", "Viernes", "Friday", "Vie", 16, 12),
  ],
}

export const empty: ComboFixture = { ...filled, title: { es: "Sin puntos", en: "No points" }, points: [] }
export const loading: ComboFixture = filled
export const error: ComboFixture = filled
export const single: ComboFixture = { ...filled, title: { es: "Un día", en: "One day" }, points: filled.points.slice(0, 1) }
export const dense: ComboFixture = {
  ...filled,
  title: { es: "Muchos días", en: "Many days" },
  points: Array.from({ length: 18 }, (_, index) => point(`d${index}`, `Día ${index + 1}`, `Day ${index + 1}`, String(index + 1), 8 + (index % 5) * 3, 6 + (index % 4))),
}
export const negative: ComboFixture = {
  ...filled,
  title: { es: "Con merma", en: "With a loss" },
  points: filled.points.map((item, index) => (index === 2 ? { ...item, bar: -6, line: -2 } : item)),
}
export const highlight: ComboFixture = filled
