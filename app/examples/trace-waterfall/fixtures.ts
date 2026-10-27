import type { SceneLocale } from "@/app/catalog/scene-types"
import type { TraceKind, TraceSpan, TraceStatus, TraceWaterfallLabels } from "@/registry/ui/trace-waterfall"

export type OrderMeta = { pedido: string }

export type TraceSeed = {
  id: string
  parentId?: string
  agent: string
  kind: TraceKind
  startMs: number
  durationMs: number
  tokens?: number
  costCents?: number
  status: TraceStatus
  meta?: OrderMeta
  es: { title: string }
  en: { title: string }
}

export type TraceFixture = {
  seeds: readonly TraceSeed[]
  collapsed: readonly string[]
  loading?: boolean
  banner?: { es: string; en: string }
}

const root: TraceSeed = {
  id: "corrida",
  agent: "Bruma",
  kind: "run",
  startMs: 0,
  durationMs: 4800,
  status: "ok",
  meta: { pedido: "PED-1048" },
  es: { title: "Cotización PED-1048" },
  en: { title: "Quote PED-1048" },
}

const leer: TraceSeed = {
  id: "leer",
  parentId: "corrida",
  agent: "Bruma",
  kind: "tool",
  startMs: 200,
  durationMs: 600,
  tokens: 420,
  costCents: 8,
  status: "ok",
  es: { title: "Leer el pedido del cobalto" },
  en: { title: "Read the cobalt order" },
}

const precio: TraceSeed = {
  id: "precio",
  parentId: "corrida",
  agent: "Bruma",
  kind: "note",
  startMs: 900,
  durationMs: 2200,
  tokens: 1800,
  costCents: 64,
  status: "slow",
  es: { title: "Precio del esmalte cobalto" },
  en: { title: "Price the cobalt glaze" },
}

const redactar: TraceSeed = {
  id: "redactar",
  parentId: "corrida",
  agent: "Bruma",
  kind: "note",
  startMs: 3200,
  durationMs: 900,
  tokens: 740,
  costCents: 22,
  status: "ok",
  es: { title: "Redactar la cotización" },
  en: { title: "Write the quote" },
}

const correo: TraceSeed = {
  id: "correo",
  parentId: "corrida",
  agent: "Caja",
  kind: "tool",
  startMs: 4200,
  durationMs: 500,
  tokens: 160,
  costCents: 6,
  status: "ok",
  es: { title: "Dejar la cotización en el expediente" },
  en: { title: "File the quote" },
}

export const filled: TraceFixture = {
  seeds: [root, leer, precio, redactar, correo],
  collapsed: [],
}

export const empty: TraceFixture = { seeds: [], collapsed: [] }

export const loading: TraceFixture = { ...filled, loading: true }

export const error: TraceFixture = {
  seeds: [],
  collapsed: [],
  banner: {
    es: "No pudimos leer el trazo de la cotización. Intenta de nuevo en un momento.",
    en: "The quote trace could not be read. Try again in a moment.",
  },
}

export const failed: TraceFixture = {
  seeds: [root, leer, precio, { ...correo, status: "error", es: { title: "El correo a Celaya no salió" }, en: { title: "The Celaya mail did not go out" } }],
  collapsed: [],
}

export const folded: TraceFixture = {
  seeds: filled.seeds,
  collapsed: ["corrida"],
}

export function traceLabels(locale: SceneLocale): Partial<TraceWaterfallLabels> {
  if (locale === "en") return {}
  return {
    title: "Trazo de la corrida",
    duration: (seconds) => `${seconds} s`,
    tokens: (count) => `${count} tokens`,
    cost: (cents) => {
      const abs = Math.abs(Math.round(cents))
      return `$${Math.floor(abs / 100)}.${(abs % 100).toString().padStart(2, "0")} MXN`
    },
    errors: (count) => (count === 1 ? "1 error" : `${count} errores`),
    kind: { run: "Corrida", note: "Nota", tool: "Herramienta" },
    status: { ok: "Bien", slow: "Lento", error: "Error", running: "En curso" },
    slowest: "El paso más lento",
    fold: (title, open) => (open ? `Plegar “${title}”` : `Desplegar “${title}”`),
    open: (title) => `Abrir “${title}”`,
    empty: "Esta corrida todavía no tiene tramos.",
    loading: "Cargando el trazo",
    axis: (seconds) => seconds,
  }
}

export function spansFrom(seeds: readonly TraceSeed[], locale: SceneLocale): TraceSpan<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    parentId: seed.parentId,
    title: seed[locale].title,
    agent: seed.agent,
    kind: seed.kind,
    startMs: seed.startMs,
    durationMs: seed.durationMs,
    tokens: seed.tokens,
    costCents: seed.costCents,
    status: seed.status,
    meta: seed.meta,
  }))
}
