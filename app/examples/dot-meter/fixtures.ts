export type Copy = { es: string; en: string }

export type DotFixture = {
  title: Copy
  description: Copy
  value: number
  limit: number
  cells: number
}

export const filled: DotFixture = {
  title: { es: "Camas sembradas", en: "Beds planted" },
  description: { es: "De la capacidad del huerto", en: "Of the garden capacity" },
  value: 18,
  limit: 40,
  cells: 40,
}

export const empty: DotFixture = { ...filled, title: { es: "Sin cupo", en: "No capacity" }, value: 0, limit: 0, cells: 1 }
export const loading: DotFixture = filled
export const error: DotFixture = filled
export const single: DotFixture = { ...filled, title: { es: "Una cama", en: "One bed" }, value: 1, limit: 1, cells: 1 }
export const dense: DotFixture = { ...filled, title: { es: "Muchos puntos", en: "Many dots" }, value: 64, limit: 100, cells: 100 }
export const negative: DotFixture = { ...filled, title: { es: "Valor negativo", en: "Negative value" }, value: -5, limit: 40 }
export const highlight: DotFixture = { ...filled, value: 33 }
