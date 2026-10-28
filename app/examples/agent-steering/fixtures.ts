import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentSteeringLabels, SteerNote, SteerRunStatus, SteerStep, SteerStepStatus } from "@/registry/ui/agent-steering"

export type SteerMeta = { pedido: string }

export type SteerNoteSeed = {
  id: string
  es: string
  en: string
  text?: string
}

export type SteerStepSeed = {
  id: string
  status: SteerStepStatus
  es: string
  en: string
  notes?: readonly SteerNoteSeed[]
}

export type SteerFixture = {
  title: { es: string; en: string }
  agent: { es: string; en: string }
  steps: readonly SteerStepSeed[]
  queue: readonly SteerNoteSeed[]
  status: SteerRunStatus
  loading?: boolean
  banner?: { es: string; en: string }
  interruptError?: { es: string; en: string }
}

const steps: SteerStepSeed[] = [
  { id: "leer", status: "done", es: "Leer el pedido PED-1048", en: "Read order PED-1048" },
  {
    id: "cotizar",
    status: "active",
    es: "Armar la cotización del esmalte",
    en: "Draft the glaze quote",
    notes: [{ id: "base", es: "El cliente pidió cobalto, no verde.", en: "The client asked for cobalt, not green." }],
  },
  { id: "anticipo", status: "pending", es: "Pedir el anticipo de $18,400.00 MXN", en: "Ask for the $18,400.00 MXN deposit" },
  { id: "avisar", status: "pending", es: "Avisar a Mariana Ruiz en León", en: "Tell Mariana Ruiz in León" },
]

const queue: SteerNoteSeed[] = [
  { id: "viernes", es: "La entrega es el viernes 30 de octubre.", en: "Delivery is Friday, October 30." },
  { id: "horno", es: "No prometas el horno 2: está en mantenimiento.", en: "Do not promise kiln 2: it is down for maintenance." },
]

const title = { es: "Cotización para Cerámica del Bajío", en: "Quote for Cerámica del Bajío" }
const agent = { es: "Bruma · taller", en: "Bruma · workshop" }

export const filled: SteerFixture = { title, agent, steps, queue, status: "running" }

export const empty: SteerFixture = {
  title: { es: "Turno sin plan", en: "Shift with no plan" },
  agent,
  steps: [],
  queue: [],
  status: "running",
}

export const loading: SteerFixture = { ...filled, loading: true }

export const error: SteerFixture = {
  ...filled,
  banner: {
    es: "La nota no llegó al paso en curso. Bruma sigue con la cotización anterior.",
    en: "The note did not reach the current step. Bruma is still on the previous quote.",
  },
  interruptError: {
    es: "La nota no llegó al paso en curso. Bruma sigue con la cotización anterior.",
    en: "The note did not reach the current step. Bruma is still on the previous quote.",
  },
}

export const paused: SteerFixture = { ...filled, status: "paused" }

export const done: SteerFixture = {
  ...filled,
  status: "done",
  steps: steps.map((step) => ({ ...step, status: "done" as const })),
  queue: [],
}

export function steeringLabels(locale: SceneLocale): Partial<AgentSteeringLabels> {
  if (locale === "en") return {}
  return {
    plan: "Plan",
    queue: "Espera al siguiente paso",
    field: "Nota para el agente",
    hint: "Enter la deja en espera. Ctrl o Cmd Enter la aplica ahora. Shift Enter agrega una línea.",
    placeholder: "Escribe una nota para el siguiente paso",
    queueAction: "Dejar para el siguiente paso",
    interrupt: "Aplicar ahora",
    pause: "Pausar",
    resume: "Reanudar",
    remove: (text) => `Quitar “${text}”`,
    now: "Ahora",
    emptyPlan: "Este turno todavía no tiene pasos.",
    loading: "Cargando el plan",
    done: "El turno ya cerró.",
    paused: "En pausa",
    running: "Trabajando",
    active: "Paso actual",
    pending: "Después",
    stepDone: "Listo",
    queuedLive: (text) => `“${text}” quedó para el siguiente paso`,
    interruptLive: (text) => `“${text}” entró al paso actual`,
    removedLive: (text) => `Se quitó “${text}”`,
  }
}

export function noteText(note: SteerNoteSeed, locale: SceneLocale) {
  if (note.text) return note.text
  return note[locale]
}

export function stepsFrom(
  seeds: readonly SteerStepSeed[],
  locale: SceneLocale,
  extra: Record<string, readonly SteerNoteSeed[]> = {},
): SteerStep<SteerMeta>[] {
  return seeds.map((step) => ({
    id: step.id,
    title: step[locale],
    status: step.status,
    meta: { pedido: "PED-1048" },
    notes: [...(step.notes ?? []), ...(extra[step.id] ?? [])].map(
      (note): SteerNote<SteerMeta> => ({ id: note.id, text: noteText(note, locale), meta: { pedido: "PED-1048" } }),
    ),
  }))
}

export function queueFrom(seeds: readonly SteerNoteSeed[], locale: SceneLocale): SteerNote<SteerMeta>[] {
  return seeds.map((note) => ({ id: note.id, text: noteText(note, locale), meta: { pedido: "PED-1048" } }))
}
