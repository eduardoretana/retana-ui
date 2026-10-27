import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentInboxLabels, InboxStatus, InboxStep, InboxTask } from "@/registry/ui/agent-inbox"

export type OrderMeta = { pedido: string }

export const INBOX_NOW = Date.parse("2026-10-27T17:40:00.000Z")

type Copy = { title: string; summary: string; steps: { id: string; label: string; at: number }[] }

export type InboxSeed = {
  id: string
  agent: string
  status: InboxStatus
  startedAt: number
  meta?: OrderMeta
  es: Copy
  en: Copy
}

export type InboxFixture = {
  seeds: readonly InboxSeed[]
  openIds: readonly string[]
  loading?: boolean
  banner?: { es: string; en: string }
  retryError?: { es: string; en: string }
}

const minute = 60_000

const anticipo: InboxSeed = {
  id: "anticipo",
  agent: "Bruma",
  status: "needs-you",
  startedAt: INBOX_NOW - 11 * minute,
  meta: { pedido: "PED-1048" },
  es: {
    title: "Anticipo de Cerámica del Bajío",
    summary: "Transferencia de $18,400.00 MXN del pedido PED-1048. Mariana Ruiz la espera antes de las 14:00.",
    steps: [
      { id: "leer", label: "Leyó el pedido PED-1048", at: INBOX_NOW - 11 * minute },
      { id: "armar", label: "Armó la transferencia SPEI", at: INBOX_NOW - 8 * minute },
      { id: "freno", label: "Se detuvo antes de mandarla", at: INBOX_NOW - 2 * minute },
    ],
  },
  en: {
    title: "Deposit for Cerámica del Bajío",
    summary: "Transfer of $18,400.00 MXN on order PED-1048. Mariana Ruiz expects it before 14:00.",
    steps: [
      { id: "leer", label: "Read order PED-1048", at: INBOX_NOW - 11 * minute },
      { id: "armar", label: "Prepared the SPEI transfer", at: INBOX_NOW - 8 * minute },
      { id: "freno", label: "Stopped before sending it", at: INBOX_NOW - 2 * minute },
    ],
  },
}

const foto: InboxSeed = {
  id: "foto",
  agent: "Horno",
  status: "running",
  startedAt: INBOX_NOW - 6 * minute,
  meta: { pedido: "PED-1048" },
  es: {
    title: "Foto del horno 2",
    summary: "Para la nota de entrega del viernes 30 de octubre.",
    steps: [
      { id: "buscar", label: "Buscó el horno 2", at: INBOX_NOW - 6 * minute },
      { id: "encuadre", label: "Está encuadrando la pieza de cobalto", at: INBOX_NOW - minute },
    ],
  },
  en: {
    title: "Photo of kiln 2",
    summary: "For the delivery note on Friday 30 October.",
    steps: [
      { id: "buscar", label: "Found kiln 2", at: INBOX_NOW - 6 * minute },
      { id: "encuadre", label: "Framing the cobalt piece", at: INBOX_NOW - minute },
    ],
  },
}

const celaya: InboxSeed = {
  id: "celaya",
  agent: "Caja",
  status: "failed",
  startedAt: INBOX_NOW - 40 * minute,
  meta: { pedido: "PED-990" },
  es: {
    title: "Aviso al cliente de Celaya",
    summary: "El correo del pedido PED-990 no salió.",
    steps: [
      { id: "redactar", label: "Redactó el aviso", at: INBOX_NOW - 40 * minute },
      { id: "fallo", label: "El correo no salió", at: INBOX_NOW - 38 * minute },
    ],
  },
  en: {
    title: "Note to the Celaya client",
    summary: "The mail for order PED-990 did not go out.",
    steps: [
      { id: "redactar", label: "Drafted the note", at: INBOX_NOW - 40 * minute },
      { id: "fallo", label: "The mail did not go out", at: INBOX_NOW - 38 * minute },
    ],
  },
}

const nota: InboxSeed = {
  id: "nota",
  agent: "Bruma",
  status: "done",
  startedAt: INBOX_NOW - 2 * 60 * minute,
  meta: { pedido: "PED-1033" },
  es: {
    title: "Nota de entrega del viernes",
    summary: "Quedó en el expediente de Mariana Ruiz en León.",
    steps: [
      { id: "nota", label: "Redactó la nota del viernes 30 de octubre", at: INBOX_NOW - 2 * 60 * minute },
      { id: "archivo", label: "Quedó en el expediente", at: INBOX_NOW - 60 * minute },
    ],
  },
  en: {
    title: "Friday delivery note",
    summary: "Filed for Mariana Ruiz in León.",
    steps: [
      { id: "nota", label: "Drafted the Friday 30 October note", at: INBOX_NOW - 2 * 60 * minute },
      { id: "archivo", label: "Filed with the order", at: INBOX_NOW - 60 * minute },
    ],
  },
}

export const filled: InboxFixture = {
  seeds: [anticipo, foto, celaya, nota],
  openIds: ["anticipo"],
}

export const empty: InboxFixture = { seeds: [], openIds: [] }

export const loading: InboxFixture = { ...filled, loading: true }

export const error: InboxFixture = {
  seeds: [],
  openIds: [],
  banner: {
    es: "No pudimos leer la bandeja del taller. Intenta de nuevo en un momento.",
    en: "The workshop inbox could not be read. Try again in a moment.",
  },
}

export const failed: InboxFixture = {
  seeds: [celaya],
  openIds: ["celaya"],
  retryError: {
    es: "El aviso a Celaya volvió a fallar. Sigue en la bandeja.",
    en: "The Celaya note failed again. It is still in the inbox.",
  },
}

export const quiet: InboxFixture = {
  seeds: [{ ...nota }, { ...foto, status: "done" }],
  openIds: [],
}

export function inboxLabels(locale: SceneLocale): Partial<AgentInboxLabels> {
  if (locale === "en") return {}
  return {
    title: "Bandeja del taller",
    waiting: (count) => (count === 1 ? "1 te espera" : `${count} te esperan`),
    filters: {
      all: "Todas",
      "needs-you": "Te esperan",
      running: "En curso",
      failed: "Fallaron",
      done: "Archivadas",
    },
    count: (label, count) => `${label} ${count}`,
    status: {
      "needs-you": "Te espera",
      running: "En curso",
      failed: "Falló",
      done: "Archivada",
    },
    age: (minutes) => {
      if (minutes < 1) return "ahora"
      if (minutes < 60) return `hace ${minutes} min`
      const hours = Math.floor(minutes / 60)
      return hours === 1 ? "hace 1 h" : `hace ${hours} h`
    },
    steps: "Últimos pasos",
    toggle: (title, open) => (open ? `Plegar “${title}”` : `Desplegar “${title}”`),
    open: "Abrir",
    approve: "Aprobar",
    approveNamed: (title) => `Aprobar “${title}”`,
    sendBack: "Devolver",
    sendBackNamed: (title) => `Devolver “${title}”`,
    retry: "Reintentar",
    retryNamed: (title) => `Reintentar “${title}”`,
    from: (agent) => `Con ${agent}`,
    empty: "La bandeja del taller está despejada.",
    noneInFilter: "Nada en este grupo.",
    loading: "Cargando la bandeja",
    approved: (title) => `Aprobaste “${title}”`,
    sentBack: (title) => `Devolviste “${title}”`,
    retried: (title) => `Reintentando “${title}”`,
  }
}

export function tasksFrom(seeds: readonly InboxSeed[], locale: SceneLocale, status: Record<string, InboxStatus> = {}): InboxTask<OrderMeta>[] {
  return seeds.map((seed) => {
    const copy = seed[locale]
    const steps: InboxStep[] = copy.steps.map((step) => ({ id: step.id, label: step.label, at: step.at }))
    return {
      id: seed.id,
      title: copy.title,
      summary: copy.summary,
      agent: seed.agent,
      status: status[seed.id] ?? seed.status,
      startedAt: seed.startedAt,
      steps,
      meta: seed.meta,
    }
  })
}
