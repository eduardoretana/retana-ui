import type { ActivityChatEntry } from "@/registry/lib/activity-chat"
import type { GanttItem, GanttStatus } from "@/registry/lib/timeline-gantt"

export const demoNow = "2026-10-25T18:00:00.000Z"
export const demoLocale = "es-MX"
export const demoTimeZone = "America/Mexico_City"

export const demoPeople = [
  { id: "mina", name: "Mina Soler" },
  { id: "ana", name: "Ana Rueda" },
  { id: "leo", name: "Leo Marín" },
  { id: "noa", name: "Noa Vidal" },
]

export const demoWorkstreams = [
  { id: "impresion", label: "Impresión" },
  { id: "encuadernacion", label: "Encuadernación" },
  { id: "tienda", label: "Tienda" },
  { id: "archivo", label: "Archivo" },
]

const statuses: GanttStatus[] = ["planned", "active", "blocked", "done", "at-risk"]

export const demoItems: GanttItem<{ taller: string }>[] = [
  {
    id: "pruebas",
    workstream: "impresion",
    label: "Pruebas de tinta",
    start: "2026-10-20",
    end: "2026-10-24",
    status: "done",
    description: "Cuatro pasadas sobre el papel de algodón.",
    assignees: [demoPeople[1]!, demoPeople[2]!],
    metrics: [{ id: "pliegos", label: "Pliegos", value: "120" }],
    meta: { taller: "bruma" },
  },
  {
    id: "catalogo",
    workstream: "impresion",
    label: "Catálogo de feria",
    start: "2026-10-13",
    end: "2026-10-28",
    status: "active",
    deps: ["pruebas"],
    description: "32 páginas, tinta plana y un pliego de guardas.",
    assignees: [demoPeople[0]!, demoPeople[1]!, demoPeople[3]!],
    meta: { taller: "bruma" },
  },
  {
    id: "fichas",
    workstream: "encuadernacion",
    label: "Fichas de horno",
    start: "2026-10-22",
    end: "2026-11-06",
    status: "at-risk",
    deps: ["pruebas"],
    description: "La cola de lino llega el lunes.",
    assignees: [demoPeople[2]!],
    meta: { taller: "bruma" },
  },
  {
    id: "tapas",
    workstream: "encuadernacion",
    label: "Tapas de lino",
    start: "2026-10-27",
    end: "2026-11-08",
    status: "planned",
    deps: ["fichas"],
    assignees: [demoPeople[2]!, demoPeople[3]!],
    meta: { taller: "bruma" },
  },
  {
    id: "mostrador",
    workstream: "tienda",
    label: "Mostrador de octubre",
    start: "2026-10-18",
    end: "2026-10-31",
    status: "active",
    deps: ["catalogo"],
    description: "La mesa del frente cambia cada viernes.",
    assignees: [demoPeople[0]!],
    meta: { taller: "bruma" },
  },
  {
    id: "etiquetas",
    workstream: "tienda",
    label: "Etiquetas de envío",
    start: "2026-10-25",
    end: "2026-11-02",
    status: "blocked",
    deps: ["mostrador"],
    description: "Falta el lote de papel adhesivo.",
    assignees: [demoPeople[3]!],
    meta: { taller: "bruma" },
  },
  {
    id: "archivo",
    workstream: "archivo",
    label: "Archivo de pruebas",
    start: "2026-10-15",
    end: "2026-11-12",
    status: "planned",
    deps: ["pruebas"],
    assignees: [demoPeople[1]!],
    meta: { taller: "bruma" },
  },
]

export type DeskRow = {
  id: string
  name: string
  hours: number
  progress: number
  trend: "up" | "down" | "flat"
  trendLabel: string
  series: number[]
  owner: string
  note: string
  meta?: { taller: string }
}

export const demoRows: DeskRow[] = [
  { id: "catalogo", name: "Catálogo de feria", hours: 46, progress: 64, trend: "up", trendLabel: "+8 h", series: [4, 6, 5, 9, 8, 14], owner: "Mina Soler", note: "Faltan las guardas.", meta: { taller: "bruma" } },
  { id: "pruebas", name: "Pruebas de tinta", hours: 18, progress: 100, trend: "flat", trendLabel: "0 h", series: [6, 5, 4, 2, 1, 0], owner: "Ana Rueda", note: "Cerrada el viernes.", meta: { taller: "bruma" } },
  { id: "fichas", name: "Fichas de horno", hours: 27, progress: 41, trend: "down", trendLabel: "−3 h", series: [8, 7, 6, 4, 3, 2], owner: "Leo Marín", note: "La cola no ha llegado.", meta: { taller: "bruma" } },
  { id: "mostrador", name: "Mostrador de octubre", hours: 22, progress: 73, trend: "up", trendLabel: "+4 h", series: [2, 3, 3, 4, 5, 5], owner: "Mina Soler", note: "La mesa del frente ya tiene precio.", meta: { taller: "bruma" } },
  { id: "etiquetas", name: "Etiquetas de envío", hours: 9, progress: 12, trend: "down", trendLabel: "−1 h", series: [3, 2, 2, 1, 1, 0], owner: "Noa Vidal", note: "Sin papel adhesivo.", meta: { taller: "bruma" } },
  { id: "archivo", name: "Archivo de pruebas", hours: 14, progress: 28, trend: "flat", trendLabel: "0 h", series: [1, 2, 2, 3, 3, 3], owner: "Ana Rueda", note: "Cajas sin rotular.", meta: { taller: "bruma" } },
]

export const demoMessages: ActivityChatEntry<{ sala: string }>[] = [
  {
    id: "m1",
    kind: "message",
    authorId: "ana",
    createdAt: "2026-10-25T15:10:00.000Z",
    body: "La tinta plana quedó pareja en el tercer pliego.",
    meta: { sala: "taller" },
  },
  {
    id: "e1",
    kind: "event",
    authorId: "mina",
    createdAt: "2026-10-25T15:20:00.000Z",
    event: {
      title: "Revisión de color",
      startsAt: "2026-10-27T22:00:00.000Z",
      endsAt: "2026-10-27T23:00:00.000Z",
      location: "Mesa norte, Taller Bruma",
    },
    meta: { sala: "taller" },
  },
  {
    id: "v1",
    kind: "voice",
    authorId: "leo",
    createdAt: "2026-10-25T16:05:00.000Z",
    voice: {
      durationMs: 4200,
      peaks: [0.15, 0.4, 0.85, 0.55, 0.3, 0.7, 0.95, 0.4, 0.25, 0.6, 0.8, 0.35, 0.2],
      transcript: "Dejo las tapas en el estante alto.",
    },
    meta: { sala: "taller" },
  },
  {
    id: "m2",
    kind: "message",
    authorId: "mina",
    createdAt: "2026-10-25T16:40:00.000Z",
    body: "Mañana vemos el mostrador antes de abrir.",
    meta: { sala: "taller" },
  },
]

export function manyGanttItems(count: number): GanttItem[] {
  return Array.from({ length: count }, (_, index) => {
    const startDay = 10 + (index % 18)
    const span = 2 + (index % 5)
    const endDay = startDay + span
    const start = `2026-10-${String(startDay).padStart(2, "0")}`
    const end = endDay > 31 ? `2026-11-${String(endDay - 31).padStart(2, "0")}` : `2026-10-${String(endDay).padStart(2, "0")}`
    return {
      id: `tarea-${index + 1}`,
      workstream: demoWorkstreams[index % demoWorkstreams.length]!.id,
      label: `Tarea ${index + 1}`,
      start,
      end,
      status: statuses[index % statuses.length]!,
      deps: index > 0 && index % 3 === 0 ? [`tarea-${index}`] : undefined,
    }
  })
}

export function manyRows(count: number): DeskRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `fila-${index + 1}`,
    name: `Pieza ${index + 1}`,
    hours: (index * 3) % 40,
    progress: (index * 17) % 101,
    trend: index % 3 === 0 ? "up" : index % 3 === 1 ? "down" : "flat",
    trendLabel: index % 2 === 0 ? "+1 h" : "−1 h",
    series: [1, 2, 3, 2, 4, index % 7],
    owner: demoPeople[index % demoPeople.length]!.name,
    note: "Nota de demostración.",
  }))
}

export function manyMessages(count: number): ActivityChatEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `nota-${index + 1}`,
    kind: "message" as const,
    authorId: demoPeople[index % demoPeople.length]!.id,
    createdAt: new Date(Date.parse("2026-10-25T12:00:00.000Z") + index * 60_000).toISOString(),
    body: `Nota ${index + 1}`,
  }))
}
