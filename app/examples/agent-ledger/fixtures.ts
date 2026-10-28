import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentLedgerLabels, LedgerChange } from "@/registry/ui/agent-ledger"

export type LedgerMeta = { pedido: string }

export const LEDGER_NOW = Date.parse("2026-10-27T17:40:00.000Z")

const minute = 60_000

export type LedgerFixture = {
  changes: readonly LedgerSeed[]
  undone: readonly string[]
  pointedId?: string
  loading?: boolean
  banner?: { es: string; en: string }
  undoError?: { es: string; en: string }
  agent: { es: string; en: string }
}

type LedgerSeed = {
  id: string
  system: { es: string; en: string }
  summary: { es: string; en: string }
  before?: { es: string; en: string }
  after?: { es: string; en: string }
  note?: { es: string; en: string }
  at: number
  reversible?: boolean
  follows?: readonly string[]
  meta?: LedgerMeta
}

const precio: LedgerSeed = {
  id: "precio",
  at: LEDGER_NOW - 70 * minute,
  system: { es: "Pedidos", en: "Orders" },
  summary: { es: "Precio del esmalte cobalto", en: "Cobalt glaze price" },
  before: { es: "$16,200.00 MXN", en: "$16,200.00 MXN" },
  after: { es: "$18,400.00 MXN", en: "$18,400.00 MXN" },
  meta: { pedido: "PED-1048" },
}

const factura: LedgerSeed = {
  id: "factura",
  at: LEDGER_NOW - 40 * minute,
  system: { es: "Facturas", en: "Invoices" },
  summary: { es: "Borrador FAC-220", en: "Draft FAC-220" },
  before: { es: "Sin folio", en: "No number" },
  after: { es: "FAC-220", en: "FAC-220" },
  follows: ["precio"],
  meta: { pedido: "PED-1048" },
}

const envio: LedgerSeed = {
  id: "envio",
  at: LEDGER_NOW - 20 * minute,
  system: { es: "Correo", en: "Mail" },
  summary: { es: "Factura enviada a Cerámica del Bajío", en: "Invoice sent to Cerámica del Bajío" },
  note: { es: "Un correo ya enviado no se puede recoger.", en: "A sent message cannot be pulled back." },
  reversible: false,
  follows: ["factura"],
  meta: { pedido: "PED-1048" },
}

const nota: LedgerSeed = {
  id: "nota",
  at: LEDGER_NOW - 2 * minute,
  system: { es: "Notas", en: "Notes" },
  summary: { es: "Nota interna sobre el envío", en: "Internal note about the send" },
  after: { es: "Mariana ya tiene la factura", en: "Mariana already has the invoice" },
  follows: ["envio"],
  meta: { pedido: "PED-1048" },
}

const agent = { es: "Bruma · hace un momento", en: "Bruma · a moment ago" }

export const filled: LedgerFixture = {
  changes: [precio, factura, envio, nota],
  undone: [],
  agent,
}

export const empty: LedgerFixture = {
  changes: [],
  undone: [],
  agent: { es: "Bruma", en: "Bruma" },
}

export const loading: LedgerFixture = {
  ...filled,
  loading: true,
}

export const error: LedgerFixture = {
  changes: [],
  undone: [],
  agent,
  banner: {
    es: "No pudimos abrir el libro de cambios del taller.",
    en: "The workshop change log could not be opened.",
  },
}

export const undone: LedgerFixture = {
  ...filled,
  undone: ["precio", "factura"],
}

export const chain: LedgerFixture = {
  ...filled,
  pointedId: "precio",
  undoError: {
    es: "El libro no aceptó el deshacer. El precio sigue como estaba.",
    en: "The log did not accept the undo. The price is unchanged.",
  },
}

export function ledgerLabels(locale: SceneLocale): Partial<AgentLedgerLabels> {
  if (locale === "en") return {}
  return {
    title: "Libro de cambios",
    undo: "Deshacer",
    redo: "Rehacer",
    undoNamed: (summary) => `Deshacer ${summary}`,
    redoNamed: (summary) => `Rehacer ${summary}`,
    also: (count) => (count === 1 ? "También revierte 1 cambio posterior" : `También revierte ${count} cambios posteriores`),
    stays: (count) => (count === 1 ? "1 cambio posterior se queda" : `${count} cambios posteriores se quedan`),
    staysFlag: "Se queda",
    empty: "Todavía no hay cambios.",
    loading: "Cargando el libro",
    to: "a",
    age: (minutes) => {
      if (minutes < 1) return "ahora"
      if (minutes < 60) return `hace ${minutes} min`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `hace ${hours} h`
      return `hace ${Math.floor(hours / 24)} d`
    },
  }
}

export function changesFrom(seeds: readonly LedgerSeed[], locale: SceneLocale): LedgerChange<LedgerMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    summary: seed.summary[locale],
    system: seed.system[locale],
    before: seed.before?.[locale],
    after: seed.after?.[locale],
    note: seed.note?.[locale],
    at: seed.at,
    reversible: seed.reversible,
    follows: seed.follows,
    meta: seed.meta,
  }))
}
