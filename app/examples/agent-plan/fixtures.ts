import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentPlanLabels, PlanStep, PlanStepStatus } from "@/registry/ui/agent-plan"

export type OrderMeta = { pedido: string }

type Copy = { title: string; detail?: string }

export type PlanSeed = {
  id: string
  status: PlanStepStatus
  estimateMin: number
  elapsedMin?: number
  meta?: OrderMeta
  es: Copy
  en: Copy
}

export type PlanFixture = {
  goal: { es: string; en: string }
  seeds: readonly PlanSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
  retryError?: { es: string; en: string }
}

const cotizacion: PlanSeed = {
  id: "cotizacion",
  status: "done",
  estimateMin: 15,
  elapsedMin: 12,
  meta: { pedido: "PED-1048" },
  es: { title: "Cotización del esmalte cobalto", detail: "Pedido PED-1048 · $18,400.00 MXN" },
  en: { title: "Quote for the cobalt glaze", detail: "Order PED-1048 · $18,400.00 MXN" },
}

const anticipo: PlanSeed = {
  id: "anticipo",
  status: "running",
  estimateMin: 10,
  elapsedMin: 4,
  meta: { pedido: "PED-1048" },
  es: { title: "Preparar el anticipo", detail: "Transferencia a Cerámica del Bajío antes de las 14:00" },
  en: { title: "Prepare the deposit", detail: "Transfer to Cerámica del Bajío before 14:00" },
}

const foto: PlanSeed = {
  id: "foto",
  status: "pending",
  estimateMin: 20,
  meta: { pedido: "PED-1048" },
  es: { title: "Foto del horno 2", detail: "Para la nota del viernes 30 de octubre" },
  en: { title: "Photo of kiln 2", detail: "For the Friday 30 October note" },
}

const nota: PlanSeed = {
  id: "nota",
  status: "pending",
  estimateMin: 15,
  meta: { pedido: "PED-1033" },
  es: { title: "Nota de entrega para Mariana Ruiz", detail: "León, por la tarde" },
  en: { title: "Delivery note for Mariana Ruiz", detail: "León, in the afternoon" },
}

const celaya: PlanSeed = {
  id: "celaya",
  status: "failed",
  estimateMin: 10,
  elapsedMin: 8,
  meta: { pedido: "PED-990" },
  es: { title: "Aviso al cliente de Celaya", detail: "El correo no salió" },
  en: { title: "Note to the Celaya client", detail: "The mail did not go out" },
}

const goal = {
  es: "Dejar listo el viernes 30 de octubre: cobalto, anticipo y nota para León.",
  en: "Have Friday 30 October ready: cobalt, the deposit, and the note for León.",
}

export const filled: PlanFixture = {
  goal,
  seeds: [cotizacion, anticipo, foto, nota],
}

export const empty: PlanFixture = { goal: { es: "", en: "" }, seeds: [] }

export const loading: PlanFixture = { ...filled, loading: true }

export const error: PlanFixture = {
  goal: { es: "", en: "" },
  seeds: [],
  banner: {
    es: "No pudimos leer el plan del viernes. Intenta de nuevo en un momento.",
    en: "Friday's plan could not be read. Try again in a moment.",
  },
}

export const failed: PlanFixture = {
  goal,
  seeds: [cotizacion, celaya, foto],
  retryError: {
    es: "El aviso a Celaya volvió a fallar. El paso sigue caído.",
    en: "The Celaya note failed again. The step is still down.",
  },
}

export const trimmed: PlanFixture = {
  goal,
  seeds: [cotizacion, anticipo, { ...foto, status: "dropped" }, nota],
}

export function planLabels(locale: SceneLocale): Partial<AgentPlanLabels> {
  if (locale === "en") return {}
  return {
    title: "Plan antes de correr",
    remaining: (minutes) => (minutes === 1 ? "Falta 1 min" : `Faltan ${minutes} min`),
    status: {
      pending: "Sin empezar",
      running: "En curso",
      done: "Listo",
      failed: "Falló",
      dropped: "Fuera",
    },
    spent: (elapsed, estimate) => `${elapsed} de ${estimate} min`,
    rename: "Renombrar",
    renameNamed: (title) => `Renombrar “${title}”`,
    name: (title) => `Nombre de “${title}”`,
    moveUp: (title) => `Subir “${title}”`,
    moveDown: (title) => `Bajar “${title}”`,
    remove: "Quitar",
    removeNamed: (title) => `Quitar “${title}”`,
    retry: "Reintentar",
    retryNamed: (title) => `Reintentar “${title}”`,
    add: "Agregar un paso",
    addNamed: "Paso nuevo",
    hint: "Alt y las flechas mueven un paso. Supr lo quita.",
    empty: "Todavía no hay pasos. Agrega el primero.",
    loading: "Cargando el plan",
    renamed: (title) => `Renombrado a “${title}”`,
    moved: (title) => `Moviste “${title}”`,
    removed: (title) => `Quitaste “${title}”`,
    added: (title) => `Agregaste “${title}”`,
    retried: (title) => `Reintentando “${title}”`,
  }
}

export function stepsFrom(
  seeds: readonly PlanSeed[],
  locale: SceneLocale,
  status: Record<string, PlanStepStatus> = {},
  titles: Record<string, string> = {},
  order?: readonly string[],
): PlanStep<OrderMeta>[] {
  const byId = new Map(seeds.map((seed) => [seed.id, seed]))
  const ids = order ?? seeds.map((seed) => seed.id)
  const steps: PlanStep<OrderMeta>[] = []
  for (const id of ids) {
    const seed = byId.get(id)
    if (!seed) {
      const title = titles[id]
      if (!title) continue
      steps.push({ id, title, estimateMin: 10, status: status[id] ?? "pending", meta: { pedido: "taller" } })
      continue
    }
    const copy = seed[locale]
    steps.push({
      id,
      title: titles[id] ?? copy.title,
      detail: copy.detail,
      estimateMin: seed.estimateMin,
      elapsedMin: seed.elapsedMin,
      status: status[id] ?? seed.status,
      meta: seed.meta,
    })
  }
  return steps
}
