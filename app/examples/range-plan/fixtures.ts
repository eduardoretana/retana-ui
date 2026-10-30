export type Copy = { es: string; en: string }

export type PlanFixture = {
  title: Copy
  description: Copy
  step: Copy
  min: number
  max: number
  value: number
  suffix: string
}

export const filled: PlanFixture = {
  title: { es: "Horas de riego", en: "Watering hours" },
  description: { es: "Paso 2 de 2", en: "Step 2 of 2" },
  step: { es: "Plan de la semana", en: "Week plan" },
  min: 0,
  max: 40,
  value: 12,
  suffix: "h",
}

export const empty: PlanFixture = { ...filled, title: { es: "Sin rango", en: "No range" }, min: 0, max: 0, value: 0 }
export const loading: PlanFixture = filled
export const error: PlanFixture = filled
export const single: PlanFixture = { ...filled, title: { es: "Un paso", en: "One step" }, max: 1, value: 1 }
export const dense: PlanFixture = { ...filled, title: { es: "Rango amplio", en: "Wide range" }, max: 400, value: 180 }
export const negative: PlanFixture = { ...filled, title: { es: "Por debajo de cero", en: "Below zero" }, min: -10, value: -4, max: 20 }
export const highlight: PlanFixture = { ...filled, value: 28 }
