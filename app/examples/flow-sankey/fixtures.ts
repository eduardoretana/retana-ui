export type Copy = { es: string; en: string }

export type FlowFixture = {
  title: Copy
  description: Copy
  nodes: { id: string; es: string; en: string; column: number }[]
  links: { id: string; source: string; target: string; value: number }[]
  activeId?: string
}

const title = { es: "Agua del huerto", en: "Garden water" }
const description = { es: "De la cisterna a la cosecha", en: "From the cistern to the harvest" }

export const filled: FlowFixture = {
  title,
  description,
  nodes: [
    { id: "cistern", es: "Cisterna", en: "Cistern", column: 0 },
    { id: "rain", es: "Lluvia", en: "Rain", column: 0 },
    { id: "beds", es: "Camas", en: "Beds", column: 1 },
    { id: "pots", es: "Macetas", en: "Pots", column: 1 },
    { id: "harvest", es: "Cosecha", en: "Harvest", column: 2 },
  ],
  links: [
    { id: "c-b", source: "cistern", target: "beds", value: 80 },
    { id: "c-p", source: "cistern", target: "pots", value: 24 },
    { id: "r-b", source: "rain", target: "beds", value: 36 },
    { id: "b-h", source: "beds", target: "harvest", value: 90 },
    { id: "p-h", source: "pots", target: "harvest", value: 18 },
  ],
}

export const empty: FlowFixture = { title: { es: "Sin flujo", en: "No flow" }, description, nodes: [], links: [] }
export const loading: FlowFixture = filled
export const error: FlowFixture = filled

export const single: FlowFixture = {
  title: { es: "Un solo tramo", en: "A single link" },
  description,
  nodes: [
    { id: "cistern", es: "Cisterna", en: "Cistern", column: 0 },
    { id: "beds", es: "Camas", en: "Beds", column: 1 },
  ],
  links: [{ id: "only", source: "cistern", target: "beds", value: 40 }],
}

export const negative: FlowFixture = {
  ...filled,
  title: { es: "Un enlace negativo", en: "A negative link" },
  links: [...filled.links, { id: "bad", source: "rain", target: "pots", value: -12 }],
}

export const highlight: FlowFixture = { ...filled, activeId: "beds" }

export const dense: FlowFixture = {
  title: { es: "Muchos nodos", en: "Many nodes" },
  description,
  nodes: Array.from({ length: 8 }, (_, index) => ({
    id: `n${index}`,
    es: `Nodo ${index + 1}`,
    en: `Node ${index + 1}`,
    column: index < 3 ? 0 : index < 6 ? 1 : 2,
  })),
  links: [
    { id: "a", source: "n0", target: "n3", value: 10 },
    { id: "b", source: "n1", target: "n4", value: 14 },
    { id: "c", source: "n2", target: "n5", value: 8 },
    { id: "d", source: "n3", target: "n6", value: 12 },
    { id: "e", source: "n4", target: "n6", value: 9 },
    { id: "f", source: "n5", target: "n7", value: 7 },
  ],
}
