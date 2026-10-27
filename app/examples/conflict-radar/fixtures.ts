import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ConflictRadarLabels, RadarAgent, RadarClash } from "@/registry/ui/conflict-radar"

export type OrderMeta = { pedido: string }

export type ClashSeed = {
  id: string
  kept?: "left" | "right" | null
  leftAgent: string
  rightAgent: string
  es: { topic: string; left: string; right: string }
  en: { topic: string; left: string; right: string }
}

export type RadarFixture = {
  agents: readonly RadarAgent<OrderMeta>[]
  seeds: readonly ClashSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
}

const agents: RadarAgent<OrderMeta>[] = [
  { id: "bruma", name: "Bruma", detail: "Cotización", working: true, meta: { pedido: "PED-1048" } },
  { id: "caja", name: "Caja", detail: "Cobro", working: true, meta: { pedido: "PED-1048" } },
]

const precio: ClashSeed = {
  id: "precio",
  leftAgent: "bruma",
  rightAgent: "caja",
  es: {
    topic: "Anticipo",
    left: "Anticipo de $18,400.00 MXN, antes de las 14:00.",
    right: "Anticipo de $16,200.00 MXN, el de la cotización anterior.",
  },
  en: {
    topic: "Deposit",
    left: "Deposit of $18,400.00 MXN, before 14:00.",
    right: "Deposit of $16,200.00 MXN, the one from the earlier quote.",
  },
}

const entrega: ClashSeed = {
  id: "entrega",
  leftAgent: "bruma",
  rightAgent: "caja",
  es: {
    topic: "Entrega",
    left: "Viernes 30 de octubre, por la tarde, en León.",
    right: "Lunes 2 de noviembre, cuando cierre la caja.",
  },
  en: {
    topic: "Delivery",
    left: "Friday 30 October, in the afternoon, in León.",
    right: "Monday 2 November, once the till closes.",
  },
}

const horno: ClashSeed = {
  id: "horno",
  leftAgent: "bruma",
  rightAgent: "caja",
  es: {
    topic: "Horno 2",
    left: "Quemar el jueves en el horno 2, con el esmalte cobalto.",
    right: "No prender el horno 2. Avisar que la pieza se queda.",
  },
  en: {
    topic: "Kiln 2",
    left: "Fire on Thursday in kiln 2, with the cobalt glaze.",
    right: "Do not light kiln 2. Say the piece is staying.",
  },
}

export const filled: RadarFixture = { agents, seeds: [precio, entrega] }

export const empty: RadarFixture = { agents: [], seeds: [] }

export const loading: RadarFixture = { ...filled, loading: true }

export const error: RadarFixture = {
  ...filled,
  banner: {
    es: "No se guardó la redacción. El cruce sigue abierto.",
    en: "The wording was not saved. The clash is still open.",
  },
}

export const settled: RadarFixture = {
  agents: agents.map((agent) => ({ ...agent, working: false })),
  seeds: [
    { ...precio, kept: "left" },
    { ...entrega, kept: "left" },
  ],
}

export const kiln: RadarFixture = {
  agents: [...agents, { id: "horno", name: "Horno", detail: "Producción", working: false, meta: { pedido: "PED-1048" } }],
  seeds: [precio, entrega, { ...horno, leftAgent: "horno", rightAgent: "bruma" }],
}

export function radarLabels(locale: SceneLocale): Partial<ConflictRadarLabels> {
  if (locale === "en") return {}
  return {
    title: "Donde se cruzan",
    open: (count) => (count === 1 ? "1 cruce abierto" : `${count} cruces abiertos`),
    settled: "Resuelto",
    working: "Sigue escribiendo",
    quiet: "Ya cerró",
    keep: (name) => `Quedarme con ${name}`,
    kept: (name) => `Quedó ${name}`,
    file: "Archivar el pedido",
    fileNamed: "Archivar el pedido cuando cada cruce esté resuelto",
    empty: "En este pedido no hay cruces.",
    loading: "Cargando los cruces",
    keptLive: (topic, name) => `Quedó ${name} en “${topic}”`,
    filedLive: "Pedido archivado",
  }
}

export function clashesFrom(
  seeds: readonly ClashSeed[],
  locale: SceneLocale,
  kept: Record<string, "left" | "right" | null> = {},
): RadarClash<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    topic: seed[locale].topic,
    left: { agentId: seed.leftAgent, text: seed[locale].left },
    right: { agentId: seed.rightAgent, text: seed[locale].right },
    kept: kept[seed.id] ?? seed.kept ?? null,
    meta: { pedido: "PED-1048" },
  }))
}
