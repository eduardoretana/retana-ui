import type { SceneLocale } from "@/app/catalog/scene-types"
import type { DelegateAgent, DelegateBoardLabels, DelegateMode, DelegateTask } from "@/registry/ui/delegate-board"

export type HandMeta = { pedido: string }

export type TaskSeed = {
  id: string
  minutes: number
  agentId?: string | null
  es: { title: string; detail: string }
  en: { title: string; detail: string }
}

export type BoardFixture = {
  tasks: readonly TaskSeed[]
  agents: readonly DelegateAgent<HandMeta>[]
  mode: DelegateMode
  clockMinutes: number
  loading?: boolean
  banner?: { es: string; en: string }
  assignError?: { es: string; en: string }
}

export const CLOCK = 11 * 60 + 40

const agents: DelegateAgent<HandMeta>[] = [
  { id: "bruma", name: "Bruma", role: "Cotizaciones", bookedMinutes: 20, meta: { pedido: "taller" } },
  { id: "horno", name: "Horno", role: "Producción", bookedMinutes: 90, meta: { pedido: "taller" } },
  { id: "caja", name: "Caja", role: "Pagos", bookedMinutes: 10, meta: { pedido: "taller" } },
]

const tasks: TaskSeed[] = [
  {
    id: "cotizacion",
    minutes: 25,
    es: { title: "Cotización del esmalte cobalto", detail: "Pedido PED-1048 · $18,400.00 MXN" },
    en: { title: "Cobalt glaze quote", detail: "Order PED-1048 · $18,400.00 MXN" },
  },
  {
    id: "muestras",
    minutes: 40,
    es: { title: "Empaque para Mariana Ruiz", detail: "Sale hoy hacia León" },
    en: { title: "Pack for Mariana Ruiz", detail: "Leaves for León today" },
  },
  {
    id: "factura",
    minutes: 15,
    agentId: "caja",
    es: { title: "Revisar FAC-220", detail: "Anticipo a Cerámica del Bajío" },
    en: { title: "Check FAC-220", detail: "Deposit to Cerámica del Bajío" },
  },
  {
    id: "foto",
    minutes: 20,
    agentId: "horno",
    es: { title: "Foto del horno 2", detail: "Para la nota del viernes" },
    en: { title: "Photo of kiln 2", detail: "For Friday's note" },
  },
]

export const filled: BoardFixture = { tasks, agents, mode: "manual", clockMinutes: CLOCK }

export const empty: BoardFixture = { tasks: [], agents, mode: "manual", clockMinutes: CLOCK }

export const loading: BoardFixture = { ...filled, loading: true }

export const error: BoardFixture = {
  ...filled,
  banner: {
    es: "No se guardó la entrega. La cotización sigue sin dueño.",
    en: "The hand-off was not saved. The quote is still unassigned.",
  },
  assignError: {
    es: "No se guardó la entrega. La cotización sigue sin dueño.",
    en: "The hand-off was not saved. The quote is still unassigned.",
  },
}

export const auto: BoardFixture = { ...filled, mode: "auto" }

export const crowded: BoardFixture = {
  ...filled,
  agents: agents.map((agent) => (agent.id === "horno" ? { ...agent, bookedMinutes: 240 } : agent)),
}

export function boardLabels(locale: SceneLocale): Partial<DelegateBoardLabels> {
  if (locale === "en") return {}
  return {
    title: "Entrega de trabajo",
    waiting: "Sin entregar",
    manual: "Elegir quién",
    auto: "Quien esté libre",
    place: "Entregar lo pendiente a quien esté libre",
    assign: (title) => `Entregar “${title}”`,
    unassigned: "Dejar sin dueño",
    drag: (title) => `Arrastrar “${title}”`,
    freeAt: (clock) => `Libre a las ${clock}`,
    previewAt: (clock) => `Quedaría libre a las ${clock}`,
    minutes: (count) => `${count} min`,
    empty: "No hay trabajo esperando entrega.",
    loading: "Cargando la entrega",
    noAgents: "No hay agentes disponibles.",
    picked: (title) => `Tomaste ${title}.`,
    moved: (title, agent) => `Moviste ${title} a ${agent}.`,
    cancelled: "Cancelado.",
  }
}

export function tasksFrom(
  seeds: readonly TaskSeed[],
  locale: SceneLocale,
  agentByTask: Record<string, string | null> = {},
): DelegateTask<HandMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    title: seed[locale].title,
    detail: seed[locale].detail,
    minutes: seed.minutes,
    agentId: agentByTask[seed.id] !== undefined ? agentByTask[seed.id] : (seed.agentId ?? null),
    meta: { pedido: seed.id === "factura" ? "FAC-220" : "PED-1048" },
  }))
}
