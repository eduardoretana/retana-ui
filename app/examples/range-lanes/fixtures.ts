export type Copy = { es: string; en: string }

export type LanesFixture = {
  title: Copy
  description: Copy
  lanes: { id: string; es: string; en: string; start: number; end: number }[]
  activeId?: string
}

export const filled: LanesFixture = {
  title: { es: "Temporada de cultivos", en: "Crop season" },
  description: { es: "Meses del año", en: "Months of the year" },
  lanes: [
    { id: "tomato", es: "Jitomate", en: "Tomato", start: 3, end: 8 },
    { id: "kale", es: "Col", en: "Kale", start: 1, end: 5 },
    { id: "squash", es: "Calabaza", en: "Squash", start: 6, end: 10 },
    { id: "herb", es: "Hierbas", en: "Herbs", start: 2, end: 11 },
  ],
}

export const empty: LanesFixture = { ...filled, title: { es: "Sin temporadas", en: "No seasons" }, lanes: [] }
export const loading: LanesFixture = filled
export const error: LanesFixture = filled
export const single: LanesFixture = { ...filled, title: { es: "Un cultivo", en: "One crop" }, lanes: filled.lanes.slice(0, 1) }
export const dense: LanesFixture = {
  ...filled,
  title: { es: "Diez cultivos", en: "Ten crops" },
  lanes: Array.from({ length: 10 }, (_, index) => ({
    id: `c${index}`,
    es: `Cultivo ${index + 1}`,
    en: `Crop ${index + 1}`,
    start: (index % 6) + 1,
    end: Math.min(12, (index % 6) + 4),
  })),
}
export const negative: LanesFixture = {
  ...filled,
  title: { es: "Fin antes del inicio", en: "End before the start" },
  lanes: [{ id: "swap", es: "Invertido", en: "Reversed", start: 9, end: 4 }, ...filled.lanes],
}
export const highlight: LanesFixture = { ...filled, activeId: "squash" }
