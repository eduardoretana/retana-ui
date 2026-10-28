import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentQueueLabels, QueueJob, QueueLane, QueueWorker } from "@/registry/ui/agent-queue"

export type OrderMeta = { pedido: string }

export type QueueSeed = {
  id: string
  lane: QueueLane
  workerId?: string
  progress?: number
  waitedMs?: number
  meta?: OrderMeta
  es: { title: string; detail?: string }
  en: { title: string; detail?: string }
}

export type QueueFixture = {
  seeds: readonly QueueSeed[]
  workers: readonly QueueWorker<OrderMeta>[]
  depth: readonly number[]
  paused: boolean
  loading?: boolean
  banner?: { es: string; en: string }
  retryError?: { es: string; en: string }
}

type QueueSeedWorker = QueueWorker<OrderMeta>

const workers: QueueSeedWorker[] = [
  { id: "bruma", name: "Bruma", slots: 1, meta: { pedido: "taller" } },
  { id: "horno", name: "Horno", slots: 1, meta: { pedido: "taller" } },
]

const cobalto: QueueSeed = {
  id: "cobalto",
  lane: "running",
  workerId: "bruma",
  progress: 0.62,
  meta: { pedido: "PED-1048" },
  es: { title: "Cotización del esmalte cobalto", detail: "Pedido PED-1048 · $18,400.00 MXN · Cerámica del Bajío" },
  en: { title: "Quote for the cobalt glaze", detail: "Order PED-1048 · $18,400.00 MXN · Cerámica del Bajío" },
}

const muestras: QueueSeed = {
  id: "muestras",
  lane: "queued",
  waitedMs: 18 * 60000,
  meta: { pedido: "PED-1051" },
  es: { title: "Empaque de muestras para León", detail: "Mariana Ruiz las espera hoy por la tarde" },
  en: { title: "Pack samples for León", detail: "Mariana Ruiz expects them this afternoon" },
}

const foto: QueueSeed = {
  id: "foto",
  lane: "queued",
  waitedMs: 6 * 60000,
  meta: { pedido: "PED-1048" },
  es: { title: "Foto del horno 2", detail: "Para la nota de entrega del viernes" },
  en: { title: "Photo of kiln 2", detail: "For Friday's delivery note" },
}

const nota: QueueSeed = {
  id: "nota",
  lane: "done",
  meta: { pedido: "PED-1033" },
  es: { title: "Nota de entrega del viernes", detail: "Quedó en el expediente" },
  en: { title: "Friday delivery note", detail: "Filed with the order" },
}

const aviso: QueueSeed = {
  id: "aviso",
  lane: "failed",
  meta: { pedido: "PED-990" },
  es: { title: "Aviso al cliente de Celaya", detail: "El correo no salió" },
  en: { title: "Note to the Celaya client", detail: "The mail did not go out" },
}

export const filled: QueueFixture = {
  seeds: [cobalto, muestras, foto, nota, aviso],
  workers,
  depth: [1, 1, 2, 3, 4, 3],
  paused: false,
}

export const empty: QueueFixture = {
  seeds: [],
  workers: [],
  depth: [],
  paused: false,
}

export const loading: QueueFixture = {
  ...filled,
  loading: true,
}

export const error: QueueFixture = {
  seeds: [],
  workers: [],
  depth: [],
  paused: false,
  banner: {
    es: "No pudimos leer la cola del taller. Intenta de nuevo en un momento.",
    en: "The workshop queue could not be read. Try again in a moment.",
  },
}

export const paused: QueueFixture = {
  seeds: [
    { ...cobalto, lane: "queued", workerId: undefined, progress: undefined, waitedMs: 40 * 60000 },
    muestras,
    foto,
    { ...aviso, lane: "queued", waitedMs: 55 * 60000 },
  ],
  workers,
  depth: [2, 3, 4, 6, 8, 9],
  paused: true,
}

export const failed: QueueFixture = {
  seeds: [aviso, muestras],
  workers,
  depth: [1, 1, 2],
  paused: false,
  retryError: {
    es: "El aviso a Celaya volvió a fallar. Sigue en la cola de errores.",
    en: "The Celaya note failed again. It is still in the failed lane.",
  },
}

export function queueLabels(locale: SceneLocale): Partial<AgentQueueLabels> {
  if (locale === "en") return {}
  return {
    title: "Cola del taller",
    waiting: (count) => (count === 1 ? "1 en espera" : `${count} en espera`),
    pause: "Detener agentes",
    resume: "Soltar agentes",
    backlog: (latest) => `Cola, última muestra ${latest}`,
    workers: "Agentes",
    slots: (used, total) => `${used} de ${total} lugares`,
    free: "Libre",
    held: "Detenido",
    queue: "En espera",
    settled: "Cerrado",
    moveUp: (title) => `Subir “${title}”`,
    retry: "Reintentar",
    open: "Abrir",
    done: "Listo",
    failed: "Falló",
    running: "En curso",
    queued: "En espera",
    wait: (ms) => {
      const minutes = Math.max(0, Math.round(ms / 60000))
      if (minutes < 1) return "<1 min"
      if (minutes < 60) return `${minutes} min`
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      return rest ? `${hours} h ${rest} min` : `${hours} h`
    },
    empty: "Nada espera a los agentes.",
    loading: "Cargando la cola",
    orphan: "Sin agente",
  }
}

export function jobsFrom(
  seeds: readonly QueueSeed[],
  locale: SceneLocale,
  lane: Record<string, QueueLane> = {},
  order?: readonly string[],
): QueueJob<OrderMeta>[] {
  const byId = new Map(seeds.map((seed) => [seed.id, seed]))
  const ids = order ?? seeds.map((seed) => seed.id)
  return ids.flatMap((id) => {
    const seed = byId.get(id)
    if (!seed) return []
    const copy = seed[locale]
    return [
      {
        id,
        title: copy.title,
        detail: copy.detail,
        lane: lane[id] ?? seed.lane,
        workerId: seed.workerId,
        progress: seed.progress,
        waitedMs: seed.waitedMs,
        meta: seed.meta,
      },
    ]
  })
}
