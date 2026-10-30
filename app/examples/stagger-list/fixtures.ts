export type AgendaCopy = { es: string; en: string }

export type AgendaItem = {
  id: string
  time: string
  title: AgendaCopy
  place: AgendaCopy
  now?: boolean
}

export type AgendaFixture = {
  day: AgendaCopy
  items: AgendaItem[]
}

/** A fictional kiln day. The people are invented. */
export const filled: AgendaFixture = {
  day: { es: "Jueves", en: "Thursday" },
  items: [
    { id: "kiln", time: "9:00", title: { es: "Horneada", en: "Firing" }, place: { es: "Horno 2", en: "Kiln 2" }, now: true },
    { id: "glaze", time: "11:30", title: { es: "Revisión de esmalte", en: "Glaze review" }, place: { es: "Mesa norte", en: "North bench" } },
    { id: "handoff", time: "16:00", title: { es: "Entrega con Nora", en: "Handoff with Nora" }, place: { es: "Mostrador", en: "Counter" } },
  ],
}

export const friday: AgendaFixture = {
  day: { es: "Viernes", en: "Friday" },
  items: [
    { id: "clay", time: "10:00", title: { es: "Amasar el barro", en: "Clay wedging" }, place: { es: "Taller", en: "Studio" }, now: true },
    { id: "shelf", time: "13:00", title: { es: "Inventario de estantes", en: "Shelf count" }, place: { es: "Bodega", en: "Store" } },
  ],
}

export const empty: AgendaFixture = {
  day: { es: "Domingo", en: "Sunday" },
  items: [],
}

export const loading: AgendaFixture = {
  day: { es: "Jueves", en: "Thursday" },
  items: [],
}

/** What a retry would reveal. The scene starts before this arrives. */
export const error: AgendaFixture = filled
