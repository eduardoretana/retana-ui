import type { AgendaEvent, AgendaResource } from "@/registry/lib/agenda"

export type Copy = { es: string; en: string }

export type FixtureEvent = {
  id: string
  title: Copy
  startsAt: string
  endsAt: string
  resourceId?: string
  allDay?: boolean
  categoryId?: string
}

export type FixtureResource = {
  id: string
  label: Copy
  capacityHours?: number
}

export type AgendaFixture = {
  resources: FixtureResource[]
  events: FixtureEvent[]
  error: Copy
}

/** Wednesday 8 April 2026, 10:28 in Mexico City. The clock does not move. */
export const now = "2026-04-08T16:28:00.000Z"
export const anchor = "2026-04-08"
export const timeZone = "America/Mexico_City"

function at(day: number, hour: number, minute = 0) {
  const utcHour = hour + 6
  const extra = utcHour >= 24 ? 1 : 0
  return new Date(Date.UTC(2026, 3, day + extra, utcHour % 24, minute)).toISOString()
}

const rooms: FixtureResource[] = [
  { id: "horno", label: { es: "Horno norte", en: "North kiln" }, capacityHours: 8 },
  { id: "mesa", label: { es: "Mesa larga", en: "Long table" }, capacityHours: 4 },
  { id: "sala", label: { es: "Sala de crítica", en: "Critique room" }, capacityHours: 6 },
]

const quiet: FixtureEvent[] = [
  {
    id: "corte",
    title: { es: "Corte de papel", en: "Paper cutting" },
    resourceId: "mesa",
    startsAt: at(8, 9),
    endsAt: at(8, 10),
    categoryId: "taller",
  },
  {
    id: "quema",
    title: { es: "Quema del lote", en: "Batch firing" },
    resourceId: "horno",
    startsAt: at(8, 10),
    endsAt: at(8, 12),
    categoryId: "taller",
  },
  {
    id: "critica",
    title: { es: "Crítica del miércoles", en: "Wednesday critique" },
    resourceId: "sala",
    startsAt: at(8, 12),
    endsAt: at(8, 13, 30),
    categoryId: "diseno",
  },
]

/** Three rooms, no overlap, every room inside its daily budget. */
export const filled: AgendaFixture = {
  resources: rooms,
  events: quiet,
  error: { es: "No se pudo cargar la agenda del taller.", en: "The workshop agenda could not be loaded." },
}

/** The rooms exist. Nothing is booked. */
export const empty: AgendaFixture = { ...filled, events: [] }

/** Same bookings. The scene starts before they arrive. */
export const loading: AgendaFixture = filled

/** What a retry would show. The scene starts on the failure. */
export const error: AgendaFixture = filled

/** Same axis as filled. Kept so the deck can open the columns on their own. */
export const resources: AgendaFixture = filled

/** Horno norte is booked twice between 11:00 and 12:00. The budget still holds. */
export const conflicts: AgendaFixture = {
  ...filled,
  events: [
    ...quiet,
    {
      id: "esmalte",
      title: { es: "Esmalte húmedo", en: "Wet glaze" },
      resourceId: "horno",
      startsAt: at(8, 11),
      endsAt: at(8, 13),
      categoryId: "taller",
    },
  ],
}

/** One six-hour firing on a kiln that only has four hours. No second booking. */
export const over: AgendaFixture = {
  ...filled,
  resources: rooms.map((resource) => (resource.id === "horno" ? { ...resource, capacityHours: 4 } : resource)),
  events: [
    {
      id: "jornada",
      title: { es: "Jornada del horno", en: "Kiln shift" },
      resourceId: "horno",
      startsAt: at(8, 9),
      endsAt: at(8, 15),
      categoryId: "taller",
    },
  ],
}

const manyResources: FixtureResource[] = Array.from({ length: 30 }, (_, index) => ({
  id: `banco-${index + 1}`,
  label: {
    es: index === 0 ? `Banco${"Norte".repeat(8)}` : `Banco ${index + 1}`,
    en: index === 0 ? `Bench${"North".repeat(8)}` : `Bench ${index + 1}`,
  },
  capacityHours: 8,
}))

const manyEvents: FixtureEvent[] = Array.from({ length: 200 }, (_, index) => ({
  id: `nota-${index + 1}`,
  title: {
    es: index === 0 ? `Nota${"Larga".repeat(10)}` : `Nota ${index + 1}`,
    en: index === 0 ? `Note${"Long".repeat(10)}` : `Note ${index + 1}`,
  },
  resourceId: `banco-${(index % 30) + 1}`,
  startsAt: at(8, 9 + (index % 6)),
  endsAt: at(8, 10 + (index % 6)),
  categoryId: "taller",
}))

/** Thirty benches and two hundred notes. Names on the first of each run long. */
export const many: AgendaFixture = {
  ...filled,
  resources: manyResources,
  events: manyEvents,
}

export function resourcesOf(fixture: AgendaFixture, locale: "es" | "en"): AgendaResource[] {
  return fixture.resources.map((resource) => ({
    id: resource.id,
    label: resource.label[locale],
    ...(resource.capacityHours == null ? {} : { capacityHours: resource.capacityHours }),
  }))
}

export function eventsOf(fixture: AgendaFixture, locale: "es" | "en"): AgendaEvent[] {
  return fixture.events.map((event) => ({
    id: event.id,
    title: event.title[locale],
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    ...(event.resourceId ? { resourceId: event.resourceId } : {}),
    ...(event.allDay ? { allDay: true } : {}),
    ...(event.categoryId ? { categoryId: event.categoryId } : {}),
  }))
}
