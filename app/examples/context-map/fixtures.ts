import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ContextBlock, ContextMapLabels, MapKind, MapView } from "@/registry/ui/context-map"

export type OrderMeta = { pedido: string }

export type MapSeed = {
  id: string
  kind: MapKind
  tokens: number
  meta?: OrderMeta
  es: { label: string; detail?: string }
  en: { label: string; detail?: string }
}

export type MapFixture = {
  blocks: readonly MapSeed[]
  before?: readonly MapSeed[]
  limit: number
  view?: MapView
  compare?: boolean
  selectedId?: string | null
  loading?: boolean
  banner?: { es: string; en: string }
  note?: { es: string; en: string }
  status?: { es: string; en: string }
}

export const MAP_LIMIT = 24_000

const sistema: MapSeed = {
  id: "sistema",
  kind: "system",
  tokens: 1800,
  es: { label: "Cómo habla el taller", detail: "El tono de Cerámica del Bajío." },
  en: { label: "How the workshop speaks", detail: "The voice of Cerámica del Bajío." },
}

const herramientas: MapSeed = {
  id: "herramientas",
  kind: "tools",
  tokens: 2400,
  es: { label: "Expediente y correo", detail: "Las dos herramientas abiertas." },
  en: { label: "Order file and mail", detail: "The two open tools." },
}

const memoria: MapSeed = {
  id: "memoria",
  kind: "memory",
  tokens: 900,
  es: { label: "Mariana Ruiz", detail: "Vive en León y espera el viernes." },
  en: { label: "Mariana Ruiz", detail: "She lives in León and expects Friday." },
}

const cotizacion: MapSeed = {
  id: "cotizacion",
  kind: "file",
  tokens: 4200,
  meta: { pedido: "PED-1048" },
  es: { label: "Cotización PED-1048", detail: "Esmalte cobalto, anticipo de $18,400.00 MXN." },
  en: { label: "Quote PED-1048", detail: "Cobalt glaze, deposit of $18,400.00 MXN." },
}

const nota: MapSeed = {
  id: "nota",
  kind: "file",
  tokens: 2600,
  es: { label: "Nota del viernes", detail: "30 de octubre, entrega en León." },
  en: { label: "Friday note", detail: "30 October, delivery in León." },
}

const horno: MapSeed = {
  id: "horno",
  kind: "result",
  tokens: 1600,
  es: { label: "Bitácora del horno 2", detail: "No enciende." },
  en: { label: "Kiln 2 log", detail: "It will not light." },
}

const charla: MapSeed = {
  id: "charla",
  kind: "chat",
  tokens: 2200,
  es: { label: "La entrega y el anticipo", detail: "Lo que quedó después de resumir." },
  en: { label: "The delivery and the deposit", detail: "What remained after the summary." },
}

const resumen: MapSeed = {
  id: "resumen",
  kind: "summary",
  tokens: 1400,
  es: { label: "Resumen de la charla", detail: "El viernes se mueve y el anticipo queda en $18,400.00 MXN." },
  en: { label: "Chat summary", detail: "Friday moves and the deposit stays at $18,400.00 MXN." },
}

const charlaLarga: MapSeed = {
  ...charla,
  kind: "chat",
  tokens: 6400,
  es: { label: "Charla sin resumir", detail: "Todavía trae los turnos viejos." },
  en: { label: "Chat before the summary", detail: "The old turns are still here." },
}

const celaya: MapSeed = {
  id: "celaya",
  kind: "result",
  tokens: 2200,
  meta: { pedido: "PED-990" },
  es: { label: "Correo a Celaya", detail: "El pedido PED-990 no salió." },
  en: { label: "Mail to Celaya", detail: "Order PED-990 did not go out." },
}

const after = [sistema, herramientas, memoria, cotizacion, nota, charla, resumen, horno]
const before = [sistema, herramientas, memoria, cotizacion, nota, charlaLarga, celaya, horno]

const compared = {
  es: "La charla larga y el correo a Celaya quedaron en un resumen.",
  en: "The long chat and the Celaya mail became a summary.",
}

export const filled: MapFixture = {
  blocks: after,
  before,
  limit: MAP_LIMIT,
  view: "after",
  compare: true,
  note: compared,
}

export const empty: MapFixture = { blocks: [], limit: MAP_LIMIT }

export const loading: MapFixture = { ...filled, loading: true }

export const error: MapFixture = {
  blocks: [],
  limit: MAP_LIMIT,
  banner: {
    es: "No pudimos leer el contexto. Intenta de nuevo en un momento.",
    en: "The context could not be read. Try again in a moment.",
  },
}

export const earlier: MapFixture = { ...filled, view: "before" }

export const open: MapFixture = { ...filled, selectedId: "cotizacion" }

export function mapLabels(locale: SceneLocale): Partial<ContextMapLabels> {
  if (locale === "en") return {}
  return {
    title: "Contexto",
    kind: { system: "Sistema", tools: "Herramientas", memory: "Memoria", file: "Archivo", chat: "Charla", result: "Resultado", summary: "Resumen" },
    tokens: (count) => `${count.toLocaleString("es-MX")} tokens`,
    used: (used, limit) => `${used.toLocaleString("es-MX")} de ${limit.toLocaleString("es-MX")}`,
    over: "Pasa de la ventana",
    free: "Libre",
    freeNamed: (tokens) => `Espacio libre, ${tokens.toLocaleString("es-MX")} tokens`,
    before: "Antes",
    after: "Después",
    select: (label, kind, tokens) => `${label}, ${kind}, ${tokens.toLocaleString("es-MX")} tokens`,
    empty: "No hay nada en la ventana.",
    loading: "Cargando el contexto",
    none: "Todavía no se ha resumido",
  }
}

export function blocksFrom(seeds: readonly MapSeed[], locale: SceneLocale): ContextBlock<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    label: seed[locale].label,
    kind: seed.kind,
    tokens: seed.tokens,
    detail: seed[locale].detail,
    meta: seed.meta,
  }))
}
