import type { SceneLocale } from "@/app/catalog/scene-types"
import type { GanttItem, GanttWorkstream } from "@/registry/lib/timeline-gantt"

import { demoItems, demoWorkstreams, manyGanttItems } from "../portfolio-desk/data"

export const workstreams: readonly GanttWorkstream[] = demoWorkstreams

export type GanttFixture = {
  items: readonly GanttItem[]
  workstreams?: readonly GanttWorkstream[]
  loading?: boolean
  error?: { es: string; en: string }
  editingId?: string | null
  scale?: "day" | "week" | "month"
}

const progressById: Record<string, number> = {
  pruebas: 1,
  catalogo: 0.64,
  fichas: 0.41,
  tapas: 0,
  mostrador: 0.73,
  etiquetas: 0.12,
  archivo: 0.28,
}

function withProgress(items: readonly GanttItem[], progress: (item: GanttItem) => number | undefined): GanttItem[] {
  return items.map((item) => {
    const value = progress(item)
    return value == null ? { ...item } : { ...item, progress: value }
  })
}

export const filled: GanttFixture = {
  items: withProgress(demoItems, (item) => progressById[item.id]),
  workstreams,
}

export const progress: GanttFixture = filled

export const empty: GanttFixture = { items: [], workstreams }

export const loading: GanttFixture = { ...filled, loading: true }

export const error: GanttFixture = {
  ...filled,
  error: {
    es: "El cronograma no cargó. Los datos de muestra siguen en el anfitrión.",
    en: "The schedule did not load. The sample data is still on the host.",
  },
}

export const plain: GanttFixture = { items: demoItems.map((item) => ({ ...item })), workstreams }

export const complete: GanttFixture = {
  workstreams,
  items: demoItems.map((item) => ({
    ...item,
    progress: item.workstream === "impresion" ? 1 : item.workstream === "tienda" ? 0.25 : 0.5,
  })),
}

const longToken = "EncuadernacionDeLinoSinEspaciosEnElNombreDelPedidoDeFeria"
const longName = "Revisión del catálogo de feria con guardas, tinta plana y un pliego que no cabe en la fila"

export const long: GanttFixture = {
  workstreams,
  items: [
    {
      id: "token",
      workstream: "impresion",
      label: longToken,
      start: "2026-10-13",
      end: "2026-10-24",
      status: "active",
      progress: 0.35,
      description: longName,
    },
    {
      id: "frase",
      workstream: "encuadernacion",
      label: longName,
      start: "2026-10-20",
      end: "2026-11-02",
      status: "at-risk",
      progress: 0.8,
      assignees: [{ id: "leo", name: "Leo Marín del taller de encuadernación de la colonia Americana" }],
    },
  ],
}

export const extremes: GanttFixture = {
  workstreams: [
    { id: "impresion", label: "Impresión" },
    { id: "vacio", label: "Frente sin tareas" },
  ],
  items: [
    { id: "cero", workstream: "impresion", label: "Sin empezar", start: "2026-10-20", end: "2026-10-24", status: "planned", progress: 0 },
    { id: "lleno", workstream: "impresion", label: "Cerrada", start: "2026-10-13", end: "2026-10-18", status: "done", progress: 100 },
    { id: "mas", workstream: "impresion", label: "Por encima", start: "2026-10-21", end: "2026-10-27", status: "active", progress: 150 },
    { id: "menos", workstream: "impresion", label: "Por debajo", start: "2026-10-22", end: "2026-10-26", status: "blocked", progress: -4 },
    { id: "nan", workstream: "impresion", label: "Sin número", start: "2026-10-19", end: "2026-10-23", status: "at-risk", progress: Number.NaN },
    { id: "hito", workstream: "impresion", label: "Entrega", start: "2026-10-25", end: "2026-10-25", status: "done", progress: 1, milestone: true },
    { id: "dia", workstream: "impresion", label: "Un día", start: "2026-10-22", end: "2026-10-22", status: "active", progress: 0.01 },
  ],
}

export const oneday: GanttFixture = {
  scale: "day",
  workstreams,
  items: [
    { id: "dia", workstream: "impresion", label: "Prueba de un día", start: "2026-10-22", end: "2026-10-22", status: "active", progress: 0.5, assignees: [{ id: "ana", name: "Ana Rueda" }] },
    { id: "otro", workstream: "impresion", label: "Cierre", start: "2026-10-23", end: "2026-10-23", status: "planned", progress: 0 },
  ],
}

export const many: GanttFixture = {
  workstreams,
  items: manyGanttItems(24).map((item, index) => ({ ...item, progress: (index * 17) % 101 })),
}

export const editor: GanttFixture = { ...filled, editingId: "catalogo" }

export function fixtureError(fixture: GanttFixture, locale: SceneLocale) {
  return fixture.error?.[locale] ?? null
}
