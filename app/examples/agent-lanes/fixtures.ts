import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentLanesLabels, LaneAgent, LaneBlock, LaneTone, LaneWindow } from "@/registry/ui/agent-lanes"

export type OrderMeta = { pedido: string }

export const LANE_WINDOW: LaneWindow = { startMin: 10 * 60 + 10, endMin: 11 * 60 + 40, nowMin: 11 * 60 + 40 }

export type LaneSeed = {
  id: string
  agentId: string
  startMin: number
  durationMin: number
  tone: LaneTone
  handoffTo?: string
  meta?: OrderMeta
  es: { title: string }
  en: { title: string }
}

export type LanesFixture = {
  agents: readonly LaneAgent<OrderMeta>[]
  seeds: readonly LaneSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
  approveError?: { es: string; en: string }
}

const agents: LaneAgent<OrderMeta>[] = [
  { id: "bruma", name: "Bruma", role: "Cotizaciones", meta: { pedido: "taller" } },
  { id: "horno", name: "Horno", role: "Producción", meta: { pedido: "taller" } },
  { id: "caja", name: "Caja", role: "Cobros", meta: { pedido: "taller" } },
]

const cotizacion: LaneSeed = {
  id: "cotizacion",
  agentId: "bruma",
  startMin: 10 * 60 + 20,
  durationMin: 35,
  tone: "work",
  handoffTo: "horno",
  meta: { pedido: "PED-1048" },
  es: { title: "Cotización del esmalte cobalto" },
  en: { title: "Cobalt glaze quote" },
}

const foto: LaneSeed = {
  id: "foto",
  agentId: "horno",
  startMin: 10 * 60 + 55,
  durationMin: 50,
  tone: "work",
  meta: { pedido: "PED-1048" },
  es: { title: "Foto del horno 2" },
  en: { title: "Photo of kiln 2" },
}

const anticipo: LaneSeed = {
  id: "anticipo",
  agentId: "caja",
  startMin: 11 * 60 + 20,
  durationMin: 30,
  tone: "ask",
  meta: { pedido: "PED-1048" },
  es: { title: "Anticipo de $18,400.00 MXN" },
  en: { title: "Deposit of $18,400.00 MXN" },
}

export const filled: LanesFixture = { agents, seeds: [cotizacion, foto, anticipo] }

export const empty: LanesFixture = { agents: [], seeds: [] }

export const loading: LanesFixture = { ...filled, loading: true }

export const error: LanesFixture = {
  agents,
  seeds: [anticipo],
  banner: {
    es: "No pudimos guardar el visto del anticipo. El piso sigue igual.",
    en: "The deposit approval could not be saved. The floor is unchanged.",
  },
  approveError: {
    es: "El anticipo no se aprobó. Caja sigue esperando.",
    en: "The deposit was not approved. Caja is still waiting.",
  },
}

export const ask: LanesFixture = { agents, seeds: [anticipo] }

export const idle: LanesFixture = { agents, seeds: [] }

export function laneLabels(locale: SceneLocale): Partial<AgentLanesLabels> {
  if (locale === "en") return {}
  return {
    title: "Quién está en el piso",
    working: (count) => (count === 1 ? "1 trabajando" : `${count} trabajando`),
    asking: (count) => (count === 1 ? "1 te espera" : `${count} te esperan`),
    tone: { work: "Trabajando", wait: "En espera", ask: "Te espera", idle: "Libre" },
    handoff: (name) => `Sigue ${name}`,
    open: (title) => `Abrir “${title}”`,
    approve: "Aprobar",
    approveNamed: (title) => `Aprobar “${title}”`,
    now: "Ahora",
    empty: "Nadie está en el piso.",
    quiet: "Libre en esta ventana.",
    loading: "Cargando el piso",
    clock: (minutes) => {
      const safe = ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60)
      return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`
    },
    approved: (title) => `Aprobaste “${title}”`,
  }
}

export function blocksFrom(seeds: readonly LaneSeed[], locale: SceneLocale, tone: Record<string, LaneTone> = {}): LaneBlock<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    agentId: seed.agentId,
    title: seed[locale].title,
    startMin: seed.startMin,
    durationMin: seed.durationMin,
    tone: tone[seed.id] ?? seed.tone,
    handoffTo: seed.handoffTo,
    meta: seed.meta,
  }))
}
